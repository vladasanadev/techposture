import postgres from "postgres";
import { CommerceError } from "./config";
let connection: ReturnType<typeof postgres> | undefined;
export function db() {
  if (!process.env.DATABASE_URL)
    throw new CommerceError("Order storage is not configured.", 503);
  connection ??= postgres(process.env.DATABASE_URL, {
    max: 3,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
  });
  return connection;
}
export interface Order {
  id: string;
  public_token: string;
  email: string;
  provider: "paddle" | "stripe" | "paypal" | "crypto";
  crypto_token: string | null;
  amount: number;
  currency: string;
  bundle_version: string;
  pdf_sha256: string;
  archive_sha256?: string | null;
  mode: "live" | "sandbox";
  status: "pending" | "paid" | "expired" | "attention";
  risk_status: string | null;
  provider_checkout_id: string | null;
  provider_payment_id: string | null;
  checkout_url: string | null;
  create_state: "new" | "creating" | "ready" | "ambiguous";
  create_lease: Date | null;
  created_at: Date;
}
export interface VerifiedPayment {
  orderId: string;
  provider: Order["provider"];
  checkoutId: string;
  paymentId: string;
  eventId: string;
  mode: Order["mode"];
  amount: number;
  currency: string;
}
export async function getOrder(id: string): Promise<Order | undefined> {
  return (await db()<Order[]>`SELECT * FROM commerce_orders WHERE id=${id}`)[0];
}
export async function byCheckout(
  provider: Order["provider"],
  id: string,
): Promise<Order | undefined> {
  return (
    await db()<
      Order[]
    >`SELECT * FROM commerce_orders WHERE provider=${provider} AND provider_checkout_id=${id}`
  )[0];
}
export async function markPaid(payment: VerifiedPayment) {
  return db().begin(async (tx) => {
    await tx`SELECT pg_advisory_xact_lock(hashtext(${payment.provider}),hashtext(${payment.paymentId}))`;
    const [order] = await tx<
      Order[]
    >`SELECT * FROM commerce_orders WHERE id=${payment.orderId} FOR UPDATE`;
    if (
      !order ||
      order.provider !== payment.provider ||
      order.provider_checkout_id !== payment.checkoutId ||
      order.amount !== payment.amount ||
      order.currency !== payment.currency ||
      order.mode !== payment.mode
    )
      throw new CommerceError("Payment does not match the order.", 422);
    const [event] =
      await tx`INSERT INTO commerce_events (provider,event_id,order_id,event_type) VALUES (${payment.provider},${payment.eventId},${order.id},'paid') ON CONFLICT DO NOTHING RETURNING id`;
    if (!event) return false;
    const [risk] =
      await tx`SELECT event_type FROM commerce_events WHERE provider=${payment.provider} AND payment_id=${payment.paymentId} AND event_type IN ('refund','dispute') LIMIT 1`;
    if (order.risk_status || risk) {
      await tx`UPDATE commerce_orders SET status='attention',provider_payment_id=${payment.paymentId},risk_status=${order.risk_status || risk.event_type},updated_at=NOW() WHERE id=${order.id}`;
      return false;
    }
    if (
      order.provider_payment_id &&
      order.provider_payment_id !== payment.paymentId
    )
      throw new CommerceError("Payment identity changed.", 422);
    await tx`UPDATE commerce_orders SET status='paid',provider_payment_id=${payment.paymentId},paid_at=COALESCE(paid_at,NOW()),updated_at=NOW() WHERE id=${order.id}`;
    await tx`INSERT INTO commerce_fulfillments (order_id,bundle_version) VALUES (${order.id},${order.bundle_version}) ON CONFLICT (order_id,bundle_version) DO NOTHING`;
    return true;
  });
}
export async function markRisk(
  provider: Order["provider"],
  paymentId: string,
  eventId: string,
  type: string,
) {
  await db().begin(async (tx) => {
    await tx`SELECT pg_advisory_xact_lock(hashtext(${provider}),hashtext(${paymentId}))`;
    const [order] = await tx<
      Order[]
    >`SELECT * FROM commerce_orders WHERE provider=${provider} AND provider_payment_id=${paymentId} FOR UPDATE`;
    // Keep risk events even when their paid notification has not arrived yet.
    const [event] =
      await tx`INSERT INTO commerce_events (provider,event_id,order_id,event_type,payment_id) VALUES (${provider},${eventId},${order?.id || null},${type},${paymentId}) ON CONFLICT DO NOTHING RETURNING id`;
    if (!event || !order) return;
    await tx`UPDATE commerce_orders SET risk_status=${type},updated_at=NOW() WHERE id=${order.id}`;
    await tx`UPDATE commerce_fulfillments SET state='attention',last_error='Payment requires merchant review.',updated_at=NOW() WHERE order_id=${order.id} AND state NOT IN ('accepted','delivered','bounced')`;
  });
}
export async function markUnpaidTerminal(
  provider: Order["provider"],
  checkoutId: string,
  eventId: string,
  status: "expired" | "attention",
) {
  await db().begin(async (tx) => {
    const [order] = await tx<
      Order[]
    >`SELECT * FROM commerce_orders WHERE provider=${provider} AND provider_checkout_id=${checkoutId} FOR UPDATE`;
    if (!order) return;
    await tx`INSERT INTO commerce_events(provider,event_id,order_id,event_type) VALUES(${provider},${eventId},${order.id},${status}) ON CONFLICT DO NOTHING`;
    // Old failure/expiry notifications can never regress a paid order.
    await tx`UPDATE commerce_orders SET status=${status},updated_at=NOW() WHERE id=${order.id} AND status='pending'`;
  });
}
