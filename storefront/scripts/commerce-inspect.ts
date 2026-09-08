import { db } from "../lib/commerce/db";
// Operator-only local CLI. Intentionally excludes customer addresses and tokens.
async function main() {
  try {
    const orders =
      await db()`SELECT o.id,o.provider,o.status,o.risk_status,o.create_state,f.state AS delivery,f.attempts,f.last_error,f.resend_id,f.first_send_at FROM commerce_orders o LEFT JOIN commerce_fulfillments f ON f.order_id=o.id WHERE o.status='attention' OR o.risk_status IS NOT NULL OR f.state IN ('attention','bounced') ORDER BY o.created_at DESC LIMIT 100`;
    console.log(JSON.stringify(orders, null, 2));
  } finally {
    if (process.env.DATABASE_URL) await db().end();
  }
}
void main().catch((error) => {
  console.error(
    error instanceof Error ? error.message : "Order inspection failed.",
  );
  process.exitCode = 1;
});
