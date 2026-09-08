import { z } from "zod";
import { CommerceConfig, CommerceError, PRODUCT } from "../config";
import { Order, VerifiedPayment } from "../db";
import { minorUnits } from "../security";
import { assertHostedUrl, gatewayFetch } from "./http";
const scalar = z.union([z.string(), z.number()]);
export const cryptoPaymentSchema = z.object({
  payment_id: scalar,
  invoice_id: scalar,
  order_id: z.string(),
  payment_status: z.string(),
  price_amount: scalar,
  price_currency: z.string(),
  pay_currency: z.string(),
  pay_amount: scalar,
  actually_paid: scalar,
});
export type CryptoPayment = z.infer<typeof cryptoPaymentSchema>;
const api = (path: string, c: CommerceConfig, body?: unknown) =>
  gatewayFetch(`https://api.nowpayments.io/v1${path}`, {
    method: body ? "POST" : "GET",
    headers: { "x-api-key": c.cryptoKey, "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
// GET requests only; shared by checkout and the operator's readiness probe.
export async function checkCryptoNetwork(
  token: string,
  c: CommerceConfig,
  amount: number = PRODUCT.amount,
) {
  if (!c.cryptoKey || !c.cryptoTokens.includes(token))
    throw new CommerceError("Choose a supported stablecoin network.");
  const coins = z
    .object({ selectedCurrencies: z.array(z.string()) })
    .parse(await api("/merchant/coins", c));
  if (
    !coins.selectedCurrencies.some(
      (currency) => currency.toLowerCase() === token,
    )
  )
    throw new CommerceError(
      "This stablecoin network is not currently available.",
      503,
    );
  const estimate = z
    .object({ estimated_amount: scalar })
    .parse(
      await api(
        `/estimate?amount=${amount / 100}&currency_from=usd&currency_to=${token}`,
        c,
      ),
    );
  const minimum = z
    .object({
      min_amount: scalar,
      fiat_equivalent: scalar.optional(),
      currency_to: z.string().optional(),
    })
    .parse(
      await api(
        `/min-amount?currency_from=${token}&fiat_equivalent=usd&is_fixed_rate=true&is_fee_paid_by_user=false`,
        c,
      ),
    );
  if (
    minorUnits(estimate.estimated_amount, 18) === 0n ||
    minorUnits(estimate.estimated_amount, 18) <
      minorUnits(minimum.min_amount, 18)
  )
    throw new CommerceError(
      "This network’s minimum payment is above the bundle price. Please choose another method.",
      422,
    );
  return {
    token,
    estimatedAmount: String(estimate.estimated_amount),
    minimumAmount: String(minimum.min_amount),
    ...(minimum.fiat_equivalent === undefined
      ? {}
      : { minimumUsd: String(minimum.fiat_equivalent) }),
    ...(minimum.currency_to === undefined
      ? {}
      : { outcomeCurrency: minimum.currency_to.toLowerCase() }),
  };
}
export async function createCrypto(order: Order, c: CommerceConfig) {
  if (!order.crypto_token || c.mode !== "live")
    throw new CommerceError("Choose a supported stablecoin network.");
  await checkCryptoNetwork(order.crypto_token, c, order.amount);
  const response = z.object({ id: scalar, invoice_url: z.string() }).parse(
    await api("/invoice", c, {
      price_amount: order.amount / 100,
      price_currency: "usd",
      pay_currency: order.crypto_token,
      order_id: order.id,
      order_description: PRODUCT.name,
      ipn_callback_url: `${c.siteUrl}/api/webhooks/crypto`,
      success_url: `${c.siteUrl}/success?order=${order.public_token}`,
      cancel_url: `${c.siteUrl}/?checkout=cancelled#buy`,
      is_fixed_rate: true,
      is_fee_paid_by_user: false,
    }),
  );
  return {
    id: String(response.id),
    url: assertHostedUrl(response.invoice_url, ["nowpayments.io"]),
  };
}
export function validateCryptoPayment(
  payment: CryptoPayment,
  order: Order,
  eventId: string,
): VerifiedPayment | null {
  if (payment.payment_status !== "finished") return null;
  if (
    order.mode !== "live" ||
    String(payment.invoice_id) !== order.provider_checkout_id ||
    payment.order_id !== order.id ||
    payment.price_currency.toUpperCase() !== order.currency ||
    minorUnits(payment.price_amount) !== BigInt(order.amount) ||
    payment.pay_currency.toLowerCase() !== order.crypto_token ||
    minorUnits(payment.pay_amount, 18) === 0n ||
    minorUnits(payment.actually_paid, 18) < minorUnits(payment.pay_amount, 18)
  )
    throw new CommerceError("Crypto payment does not match the order.", 422);
  return {
    orderId: order.id,
    provider: "crypto",
    checkoutId: String(payment.invoice_id),
    paymentId: String(payment.payment_id),
    eventId,
    mode: "live",
    amount: order.amount,
    currency: order.currency,
  };
}
export async function retrieveCrypto(
  order: Order,
  c: CommerceConfig,
  paymentId: string,
  eventId: string,
) {
  if (!/^\d+$/.test(paymentId))
    throw new CommerceError("Invalid crypto payment.", 422);
  const payment = cryptoPaymentSchema.parse(
    await api(`/payment/${paymentId}`, c),
  );
  if (
    String(payment.payment_id) !== paymentId ||
    String(payment.invoice_id) !== order.provider_checkout_id ||
    payment.order_id !== order.id ||
    payment.price_currency.toUpperCase() !== order.currency ||
    minorUnits(payment.price_amount) !== BigInt(order.amount) ||
    payment.pay_currency.toLowerCase() !== order.crypto_token
  )
    throw new CommerceError("Payment identity mismatch.", 422);
  return validateCryptoPayment(payment, order, eventId);
}
