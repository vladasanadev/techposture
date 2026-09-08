import { z } from "zod";
import { config } from "../lib/commerce/config";
import { db } from "../lib/commerce/db";
import { reconcileEmailEvents } from "../lib/commerce/fulfillment";
async function main() {
  const orderId = z.string().uuid().parse(process.argv[2]);
  const resendId = z.string().uuid().parse(process.argv[3]);
  const c = config();
  if (!c.resendKey) throw new Error("Set the storefront Resend API key.");
  const [job] =
    await db()`SELECT f.*,o.email FROM commerce_fulfillments f JOIN commerce_orders o ON o.id=f.order_id WHERE o.id=${orderId}`;
  if (!job?.payload)
    throw new Error("No prepared email exists for this order.");
  const response = await fetch(`https://api.resend.com/emails/${resendId}`, {
    headers: { Authorization: `Bearer ${c.resendKey}` },
    signal: AbortSignal.timeout(18000),
  });
  if (!response.ok) throw new Error("Resend could not verify that message.");
  const email = z
    .object({
      id: z.string(),
      to: z.array(z.string()),
      subject: z.string(),
      html: z.string(),
      last_event: z.string().optional(),
    })
    .parse(await response.json());
  if (
    email.id !== resendId ||
    email.to.length !== 1 ||
    email.to[0].toLowerCase() !== job.email ||
    email.subject !== job.payload.subject ||
    email.html !== job.payload.html
  )
    throw new Error(
      "The Resend message does not exactly match the intended order email.",
    );
  const state = ["bounced", "complained", "failed", "suppressed"].includes(
    email.last_event || "",
  )
    ? "bounced"
    : email.last_event === "delivered"
      ? "delivered"
      : "accepted";
  await db()`UPDATE commerce_fulfillments SET resend_id=${email.id},state=${state},lease_until=NULL,last_error=NULL,updated_at=NOW() WHERE id=${job.id}`;
  await reconcileEmailEvents();
  console.log(
    `Verified existing provider message. Delivery state: ${state}. No email was sent.`,
  );
}
void main()
  .catch((error) => {
    console.error(
      error instanceof Error ? error.message : "Email reconciliation failed.",
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    if (process.env.DATABASE_URL) await db().end();
  });
