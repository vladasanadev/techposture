import { config, CommerceError, PRODUCT } from "./config";
import { db, getOrder } from "./db";
import { renderBundleEmail } from "./email";
import { loadBundlePdf, loadBundleArchive } from "./pdf";
import { canonicalJson, signDownload } from "./security";
type EmailPayload = {
  from: string;
  to: string[];
  reply_to: string;
  subject: string;
  html: string;
  text: string;
  tags: { name: string; value: string }[];
  attachmentFilename: string;
  archiveFilename?: string;
};
interface Job {
  id: number;
  order_id: string;
  bundle_version: string;
  attempts: number;
  first_send_at: Date | null;
  payload: EmailPayload | null;
  resend_id: string | null;
}
export function retryDecision(
  firstSend: Date | null,
  attempts: number,
  now = Date.now(),
) {
  if (
    (firstSend && now - firstSend.getTime() >= 23 * 60 * 60 * 1000) ||
    attempts >= 12
  )
    return { state: "attention" as const, delaySeconds: 0 };
  return {
    state: "pending" as const,
    delaySeconds: Math.min(3600, 30 * 2 ** Math.min(attempts, 7)),
  };
}
async function deliver(job: Job) {
  const c = config();
  const order = await getOrder(job.order_id);
  if (c.mode === "preview" || (order && c.mode !== order.mode))
    throw new CommerceError(
      "Delivery is paused until the matching commerce mode is active.",
      422,
    );
  if (!order || order.status !== "paid" || order.risk_status)
    throw new CommerceError("Payment requires merchant review.", 422);
  if (
    order.bundle_version !== c.version ||
    job.bundle_version !== c.version ||
    order.pdf_sha256 !== c.pdfSha256 ||
    (!!order.archive_sha256 && order.archive_sha256 !== c.archiveSha256)
  )
    throw new CommerceError(
      "The purchased bundle version requires merchant attention.",
      422,
    );
  if (!c.resendKey || !c.emailFrom || !c.supportEmail)
    throw new CommerceError("Email delivery is not configured.", 503);
  if (retryDecision(job.first_send_at, job.attempts).state === "attention")
    throw new CommerceError(
      "Ambiguous email delivery requires provider reconciliation before retry.",
      422,
    );
  const bytes = await loadBundlePdf(c, order.pdf_sha256);
  const archive = order.archive_sha256
    ? await loadBundleArchive(c, order.archive_sha256)
    : null;
  let payload = job.payload;
  if (!payload) {
    const expires = Math.floor(Date.now() / 1000) + 7 * 24 * 3600;
    const downloadUrl = `${c.siteUrl}/api/download/${signDownload(order.id, order.bundle_version, expires, c.downloadSecret)}`;
    const content = renderBundleEmail({
      siteUrl: c.siteUrl,
      downloadUrl: archive ? `${downloadUrl}?asset=archive` : downloadUrl,
      productName: PRODUCT.name,
      orderReference: order.id.slice(0, 8).toUpperCase(),
      amountDisplay: `$${(order.amount / 100).toFixed(2)}`,
      currency: order.currency,
      files: [
        { name: c.filename, description: "The complete 281-page playbook" },
        ...(archive
          ? [
              {
                name: c.archiveFilename,
                description:
                  "12 individual guides, the start-here roadmap, and two CSV worksheets",
              },
            ]
          : []),
      ],
      supportEmail: c.supportEmail,
      hasAttachments: true,
    });
    payload = {
      from: c.emailFrom,
      to: [order.email],
      reply_to: c.supportEmail,
      subject: content.subject,
      html: content.html,
      text: content.text,
      tags: [{ name: "order_id", value: order.id }],
      attachmentFilename: c.filename,
      ...(archive ? { archiveFilename: c.archiveFilename } : {}),
    };
    await db()`UPDATE commerce_fulfillments SET payload=${db().json(payload)},updated_at=NOW() WHERE id=${job.id}`;
  }
  const { attachmentFilename, archiveFilename, ...email } = payload;
  const body = canonicalJson({
    ...email,
    attachments: [
      { filename: attachmentFilename, content: bytes.toString("base64") },
      ...(archive && archiveFilename
        ? [{ filename: archiveFilename, content: archive.toString("base64") }]
        : []),
    ],
  });
  if (Buffer.byteLength(body) > 39 * 1024 * 1024)
    throw new CommerceError(
      "Email exceeds the provider message size limit.",
      422,
    );
  const current = await getOrder(order.id);
  if (current?.risk_status)
    throw new CommerceError("Payment requires merchant review.", 422);
  // Persist BEFORE crossing the network. Unknown outcomes must retain the same idempotency key and payload.
  await db()`UPDATE commerce_fulfillments SET first_send_at=COALESCE(first_send_at,NOW()),updated_at=NOW() WHERE id=${job.id}`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${c.resendKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `bundle-${order.id}-${order.bundle_version}`,
    },
    body,
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok)
    throw new CommerceError(
      "Email provider request failed.",
      response.status >= 400 && response.status < 500 && response.status !== 429
        ? 422
        : 503,
    );
  const result = (await response.json()) as { id?: string };
  if (!result.id)
    throw new CommerceError("Email provider response is ambiguous.", 503);
  await db()`UPDATE commerce_fulfillments SET state=CASE WHEN state='sending' THEN 'accepted' ELSE state END,resend_id=${result.id},lease_until=NULL,last_error=NULL,updated_at=NOW() WHERE id=${job.id}`;
  await reconcileEmailEvents();
}
export async function reconcileEmailEvents() {
  // Bounces/complaints take precedence over delivered, independent of webhook arrival order.
  await db()`UPDATE commerce_fulfillments AS f SET state=CASE WHEN EXISTS(SELECT 1 FROM commerce_email_events e WHERE e.resend_id=f.resend_id AND e.event_type IN ('email.bounced','email.complained','email.failed','email.suppressed')) THEN 'bounced' ELSE 'delivered' END,updated_at=NOW() WHERE f.resend_id IS NOT NULL AND EXISTS(SELECT 1 FROM commerce_email_events e WHERE e.resend_id=f.resend_id AND e.event_type IN ('email.delivered','email.bounced','email.complained','email.failed','email.suppressed'))`;
}
export async function processFulfillments(limit = 3, orderId?: string) {
  let processed = 0;
  for (let i = 0; i < limit; i++) {
    const [job] = await db()<
      Job[]
    >`UPDATE commerce_fulfillments SET state='sending',lease_until=NOW()+INTERVAL '5 minutes',attempts=attempts+1,updated_at=NOW() WHERE id=(SELECT id FROM commerce_fulfillments WHERE state IN ('pending','sending') AND (${orderId || null}::uuid IS NULL OR order_id=${orderId || null}::uuid) AND next_attempt<=NOW() AND (lease_until IS NULL OR lease_until<NOW()) ORDER BY created_at FOR UPDATE SKIP LOCKED LIMIT 1) RETURNING *`;
    if (!job) break;
    try {
      await deliver(job);
    } catch (error) {
      const [fresh] = await db()<
        Job[]
      >`SELECT * FROM commerce_fulfillments WHERE id=${job.id}`;
      const retry =
        error instanceof CommerceError && error.status === 422
          ? { state: "attention", delaySeconds: 0 }
          : retryDecision(
              fresh?.first_send_at || job.first_send_at,
              job.attempts,
            );
      await db()`UPDATE commerce_fulfillments SET state=${retry.state},next_attempt=NOW()+${retry.delaySeconds}*INTERVAL '1 second',lease_until=NULL,last_error=${error instanceof CommerceError ? error.message : "Delivery attempt could not be confirmed."},updated_at=NOW() WHERE id=${job.id} AND state='sending'`;
    }
    processed++;
  }
  return processed;
}
