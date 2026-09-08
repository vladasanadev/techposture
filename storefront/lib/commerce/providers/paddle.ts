import { CommerceConfig, CommerceError } from "../config";
import { Order, VerifiedPayment, markRisk } from "../db";
import { gatewayFetch } from "./http";

export type PaddlePrice = {
  id: string;
  product_id: string;
  status: string;
  billing_cycle: unknown;
  trial_period: unknown;
  tax_mode: string;
  unit_price: { amount: string; currency_code: string };
  unit_price_overrides: unknown[];
  quantity: { minimum: number; maximum: number };
};
export type PaddleAdjustment = {
  id: string;
  transaction_id: string;
  action: string;
  status: string;
};
export type PaddleTransaction = {
  id: string;
  status: string;
  collection_mode: string;
  currency_code: string;
  custom_data: Record<string, unknown> | null;
  subscription_id: string | null;
  discount_id: string | null;
  items: { price: PaddlePrice; quantity: number }[];
  details: {
    totals: {
      grand_total: string;
      currency_code: string;
      discount: string;
      credit: string;
      balance: string;
    };
  };
  customer?: { email: string };
  payments: { status: string; amount: string }[];
  adjustments?: PaddleAdjustment[];
};
function endpoint(c: CommerceConfig) {
  if (c.mode === "preview" || !c.paddleKey)
    throw new CommerceError("Paddle is not configured.", 503);
  return c.mode === "live"
    ? "https://api.paddle.com"
    : "https://sandbox-api.paddle.com";
}
async function api<T>(
  c: CommerceConfig,
  path: string,
  body?: unknown,
): Promise<T> {
  const result = await gatewayFetch(`${endpoint(c)}${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${c.paddleKey}`,
      "Content-Type": "application/json",
      "Paddle-Version": "1",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    redirect: "error",
  });
  if (!result?.data)
    throw new CommerceError("Paddle returned an incomplete response.", 502);
  return result.data as T;
}
export function validatePaddlePrice(
  price: PaddlePrice,
  order: Order,
  c: CommerceConfig,
) {
  if (
    price.id !== c.paddlePrice ||
    price.product_id !== c.paddleProduct ||
    price.status !== "active" ||
    price.billing_cycle !== null ||
    price.trial_period !== null ||
    price.tax_mode !== "internal" ||
    price.unit_price?.amount !== String(order.amount) ||
    price.unit_price?.currency_code !== order.currency ||
    !Array.isArray(price.unit_price_overrides) ||
    price.unit_price_overrides.length !== 0 ||
    price.quantity?.minimum !== 1 ||
    price.quantity?.maximum !== 1
  )
    throw new CommerceError(
      "The Paddle price must match the one-time, tax-inclusive bundle offer.",
      422,
    );
}
function metadata(order: Order) {
  return {
    order_id: order.id,
    bundle_version: order.bundle_version,
    pdf_sha256: order.pdf_sha256,
    archive_sha256: order.archive_sha256 || null,
    mode: order.mode,
  };
}
export function validatePaddleTransaction(
  transaction: PaddleTransaction,
  order: Order,
  c: CommerceConfig,
) {
  if (
    order.provider !== "paddle" ||
    order.mode !== c.mode ||
    transaction.id !== order.provider_checkout_id ||
    transaction.currency_code !== order.currency ||
    transaction.collection_mode !== "automatic" ||
    transaction.subscription_id !== null ||
    transaction.discount_id !== null ||
    !transaction.custom_data ||
    Object.entries(metadata(order)).some(
      ([key, value]) => transaction.custom_data?.[key] !== value,
    ) ||
    transaction.items?.length !== 1 ||
    transaction.items[0].quantity !== 1
  )
    throw new CommerceError(
      "Paddle transaction does not match the order.",
      422,
    );
  validatePaddlePrice(transaction.items[0].price, order, c);
}
export async function createPaddle(order: Order, c: CommerceConfig) {
  // No undocumented provider idempotency assumptions: an unknown POST result is never automatically repeated.
  const price = await api<PaddlePrice>(
    c,
    `/prices/${encodeURIComponent(c.paddlePrice)}`,
  );
  validatePaddlePrice(price, order, c);
  const url = `${c.siteUrl}/pay?order=${order.public_token}`;
  const transaction = await api<PaddleTransaction>(c, "/transactions", {
    items: [{ price_id: c.paddlePrice, quantity: 1 }],
    currency_code: order.currency,
    collection_mode: "automatic",
    custom_data: metadata(order),
    checkout: { url },
  });
  if (!/^txn_[a-z0-9]{26}$/.test(transaction.id))
    throw new CommerceError("Paddle checkout response is ambiguous.", 502);
  validatePaddleTransaction(
    transaction,
    { ...order, provider_checkout_id: transaction.id },
    c,
  );
  return { id: transaction.id, url };
}
export async function getPaddleTransaction(id: string, c: CommerceConfig) {
  if (!/^txn_[a-z0-9]{26}$/.test(id))
    throw new CommerceError("Invalid Paddle transaction.", 422);
  return api<PaddleTransaction>(
    c,
    `/transactions/${id}?include=customer,adjustments`,
  );
}
export async function recordPaddleAdjustments(
  transaction: PaddleTransaction,
  eventId: string,
) {
  for (const adjustment of transaction.adjustments || []) {
    if (adjustment.transaction_id !== transaction.id)
      throw new CommerceError("Adjustment identity mismatch.", 422);
    const risk = ["chargeback", "chargeback_warning"].includes(
      adjustment.action,
    )
      ? "dispute"
      : ["refund", "credit"].includes(adjustment.action) &&
          adjustment.status === "approved"
        ? "refund"
        : null;
    if (risk)
      await markRisk(
        "paddle",
        transaction.id,
        `${eventId}-${adjustment.id}`,
        risk,
      );
  }
}
export async function retrievePaddle(
  order: Order,
  c: CommerceConfig,
  eventId: string,
): Promise<VerifiedPayment | null> {
  const transaction = await getPaddleTransaction(
    order.provider_checkout_id || "",
    c,
  );
  validatePaddleTransaction(transaction, order, c);
  await recordPaddleAdjustments(transaction, eventId);
  if (transaction.status !== "completed") return null;
  const totals = transaction.details?.totals;
  if (
    totals?.grand_total !== String(order.amount) ||
    totals.currency_code !== order.currency ||
    totals.discount !== "0" ||
    totals.credit !== "0" ||
    totals.balance !== "0" ||
    transaction.customer?.email.toLowerCase() !== order.email.toLowerCase() ||
    !Array.isArray(transaction.payments) ||
    transaction.payments
      .filter((p) => p.status === "captured")
      .reduce(
        (sum, p) =>
          sum + (/^\d+$/.test(p.amount) ? BigInt(p.amount) : -999999n),
        0n,
      ) !== BigInt(order.amount)
  )
    throw new CommerceError(
      "Paddle payment does not match the purchased bundle.",
      422,
    );
  return {
    orderId: order.id,
    provider: "paddle",
    checkoutId: transaction.id,
    paymentId: transaction.id,
    eventId,
    mode: order.mode,
    amount: order.amount,
    currency: order.currency,
  };
}
