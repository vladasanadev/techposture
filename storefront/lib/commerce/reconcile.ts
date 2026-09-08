import { config } from "./config";
import { db, markPaid, Order } from "./db";
import { processFulfillments, reconcileEmailEvents } from "./fulfillment";
import { queuePendingFulfillments } from "./queue";
import { retrieveStripe } from "./providers/stripe";
import { retrievePayPal } from "./providers/paypal";
import { retrievePaddle } from "./providers/paddle";
import { retrieveCrypto } from "./providers/crypto";
export async function reconcileCommerce() {
  const c = config();
  if (c.mode === "preview" || !c.databaseUrl)
    return { mode: "preview", checked: 0, processed: 0, errors: 0 };
  const deadline = Date.now() + 170_000;
  // Recover confirmed purchases first; slow upstream polling cannot starve email retries.
  const processed = c.retryMode === "qstash" ? 0 : await processFulfillments(2);
  let queued = c.retryMode === "qstash" ? await queuePendingFulfillments() : 0;
  const orders = await db()<
    Order[]
  >`SELECT * FROM commerce_orders WHERE status='pending' AND mode=${c.mode} AND provider_checkout_id IS NOT NULL AND created_at>NOW()-INTERVAL '7 days' ORDER BY updated_at LIMIT 8`;
  let checked = 0,
    errors = 0;
  for (const order of orders) {
    if (Date.now() > deadline) break;
    try {
      const eventId = `reconcile-${order.provider_checkout_id}`;
      const verified =
        order.provider === "paddle"
          ? await retrievePaddle(order, c, eventId)
          : order.provider === "stripe"
            ? await retrieveStripe(order, c, eventId)
            : order.provider === "paypal"
              ? await retrievePayPal(order, c, eventId, true)
              : order.provider_payment_id
                ? await retrieveCrypto(
                    order,
                    c,
                    order.provider_payment_id,
                    eventId,
                  )
                : null;
      if (verified) await markPaid(verified);
      checked++;
    } catch {
      errors++;
    }
    // Advance both success and failure attempts so broken old rows cannot occupy every batch.
    await db()`UPDATE commerce_orders SET updated_at=NOW() WHERE id=${order.id}`;
  }
  await db()`UPDATE commerce_orders SET create_state='ambiguous',status='attention',updated_at=NOW() WHERE provider IN ('crypto','paddle') AND create_state='creating' AND create_lease<NOW()`;
  await db()`DELETE FROM commerce_rate_limits WHERE bucket<NOW()-INTERVAL '2 days'`;
  if (c.retryMode === "qstash") queued += await queuePendingFulfillments();
  await reconcileEmailEvents();
  return { mode: c.mode, checked, processed, queued, errors };
}
