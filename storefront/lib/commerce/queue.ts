import { Client, Receiver } from "@upstash/qstash";
import { config, CommerceError } from "./config";
import { db, markPaid, type VerifiedPayment } from "./db";
import { processFulfillments } from "./fulfillment";
export async function kickoffFulfillment(orderId: string) {
  const c = config();
  if (c.mode === "preview") return;
  if (c.retryMode !== "qstash") {
    await processFulfillments(1, orderId);
    return;
  }
  if (!c.qstashToken)
    throw new CommerceError("The delivery queue is not configured.", 503);
  const [job] =
    await db()`UPDATE commerce_fulfillments SET queue_lease=NOW()+INTERVAL '2 minutes' WHERE order_id=${orderId} AND state IN ('pending','sending') AND (queued_at IS NULL OR queued_at<NOW()-INTERVAL '6 hours') AND (queue_lease IS NULL OR queue_lease<NOW()) RETURNING id,bundle_version`;
  if (!job) {
    const [existing] =
      await db()`SELECT state,queued_at,queue_message_id FROM commerce_fulfillments WHERE order_id=${orderId}`;
    if (
      existing &&
      ["pending", "sending"].includes(existing.state) &&
      (!existing.queue_message_id ||
        !existing.queued_at ||
        new Date(existing.queued_at).getTime() < Date.now() - 6 * 3600_000)
    ) {
      throw new CommerceError(
        "The delivery queue publication is still pending.",
        503,
      );
    }
    return;
  }
  try {
    const client = new Client({ token: c.qstashToken, baseUrl: c.qstashUrl });
    const result = await client.publishJSON({
      url: `${c.siteUrl}/api/queue/fulfill`,
      body: { orderId },
      retries: 8,
      retryDelay: "min(3600000,pow(2,retried)*300000)",
      deduplicationId: `bundle-${orderId}-${job.bundle_version}`,
    });
    await db()`UPDATE commerce_fulfillments SET queued_at=NOW(),queue_lease=NULL,queue_message_id=${result.messageId},updated_at=NOW() WHERE id=${job.id}`;
  } catch (error) {
    await db()`UPDATE commerce_fulfillments SET queue_lease=NULL,updated_at=NOW() WHERE id=${job.id}`;
    throw error;
  }
}
export async function queuePendingFulfillments(limit = 5) {
  const jobs =
    await db()`SELECT order_id FROM commerce_fulfillments WHERE state IN ('pending','sending') AND (queued_at IS NULL OR queued_at<NOW()-INTERVAL '6 hours') ORDER BY created_at LIMIT ${limit}`;
  let queued = 0;
  for (const job of jobs) {
    try {
      await kickoffFulfillment(job.order_id);
      queued++;
    } catch {
      console.error("Commerce queue publish requires retry.");
    }
  }
  return queued;
}
export async function verifyQueueRequest(raw: string, signature: string) {
  const c = config();
  if (!c.qstashCurrentKey || !c.qstashNextKey || !signature)
    throw new CommerceError("Invalid queue signature.", 401);
  const receiver = new Receiver({
    currentSigningKey: c.qstashCurrentKey,
    nextSigningKey: c.qstashNextKey,
  });
  try {
    const valid = await receiver.verify({
      signature,
      body: raw,
      url: `${c.siteUrl}/api/queue/fulfill`,
    });
    if (!valid) throw new Error("Invalid");
  } catch {
    throw new CommerceError("Invalid queue signature.", 401);
  }
}

// A provider must not receive success until durable broker publication succeeds.
// Direct cron-mode email I/O remains after the response, backed by its approved scheduler.
export async function dispatchConfirmedFulfillment(
  orderId: string,
  afterResponse: (callback: () => Promise<void>) => void,
) {
  if (config().retryMode === "qstash") await kickoffFulfillment(orderId);
  else afterResponse(() => kickoffFulfillment(orderId));
}
export async function confirmPaymentAndDispatch(
  payment: VerifiedPayment,
  afterResponse: (callback: () => Promise<void>) => void,
) {
  await markPaid(payment);
  // Even a duplicate paid event must recover a missing queue publication.
  await dispatchConfirmedFulfillment(payment.orderId, afterResponse);
}
