import Stripe from "stripe";
import { CommerceConfig, CommerceError, PRODUCT } from "../config";
import { Order, VerifiedPayment } from "../db";
import { assertHostedUrl } from "./http";
export const stripeClient = (c: CommerceConfig) =>
  new Stripe(c.stripeKey, { maxNetworkRetries: 2, timeout: 18_000 });
async function verifyAccount(client: Stripe, c: CommerceConfig) {
  const account = await client.accounts.retrieve();
  if (account.id !== c.stripeAccount || !account.charges_enabled)
    throw new CommerceError("Merchant account is not ready.", 503);
}
export async function createStripe(order: Order, c: CommerceConfig) {
  const stripe = stripeClient(c);
  await verifyAccount(stripe, c);
  const session = await stripe.checkout.sessions.create(
    {
      mode: "payment",
      payment_method_types: ["card"],
      client_reference_id: order.id,
      customer_email: order.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: order.currency.toLowerCase(),
            unit_amount: order.amount,
            product_data: {
              name: PRODUCT.name,
              description:
                "Digital PDF bundle · email delivery after confirmed payment",
            },
          },
        },
      ],
      metadata: { order_id: order.id, bundle_version: order.bundle_version },
      payment_intent_data: { metadata: { order_id: order.id } },
      success_url: `${c.siteUrl}/success?order=${order.public_token}`,
      cancel_url: `${c.siteUrl}/?checkout=cancelled#buy`,
      expires_at:
        Math.floor(new Date(order.created_at).getTime() / 1000) + 60 * 60,
    },
    { idempotencyKey: `checkout-${order.id}` },
  );
  if (!session.url)
    throw new CommerceError("Checkout is temporarily unavailable.", 502);
  return {
    id: session.id,
    url: assertHostedUrl(session.url, ["checkout.stripe.com"]),
  };
}
export function validateStripePayment(
  session: Stripe.Checkout.Session,
  intent: Stripe.PaymentIntent,
  order: Order,
  eventId: string,
): VerifiedPayment | null {
  if (
    session.payment_status !== "paid" ||
    session.status !== "complete" ||
    intent.status !== "succeeded"
  )
    return null;
  if (
    session.mode !== "payment" ||
    session.id !== order.provider_checkout_id ||
    session.client_reference_id !== order.id ||
    session.metadata?.order_id !== order.id ||
    session.metadata?.bundle_version !== order.bundle_version ||
    intent.metadata.order_id !== order.id ||
    session.livemode !== (order.mode === "live") ||
    intent.livemode !== (order.mode === "live") ||
    session.amount_total !== order.amount ||
    intent.amount_received !== order.amount ||
    session.currency?.toUpperCase() !== order.currency ||
    intent.currency.toUpperCase() !== order.currency ||
    intent.id !==
      (typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id)
  )
    throw new CommerceError("Stripe payment does not match the order.", 422);
  return {
    orderId: order.id,
    provider: "stripe",
    checkoutId: session.id,
    paymentId: intent.id,
    eventId,
    mode: order.mode,
    amount: order.amount,
    currency: order.currency,
  };
}
export async function retrieveStripe(
  order: Order,
  c: CommerceConfig,
  eventId: string,
) {
  if (!order.provider_checkout_id) return null;
  const stripe = stripeClient(c);
  await verifyAccount(stripe, c);
  const session = await stripe.checkout.sessions.retrieve(
    order.provider_checkout_id,
  );
  if (!session.payment_intent) return null;
  const intentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent.id;
  const intent = await stripe.paymentIntents.retrieve(intentId);
  if (intent.status === "succeeded") {
    const chargeId =
      typeof intent.latest_charge === "string"
        ? intent.latest_charge
        : intent.latest_charge?.id;
    if (!chargeId)
      throw new CommerceError(
        "Payment charge verification is incomplete.",
        422,
      );
    const charge = await stripe.charges.retrieve(chargeId);
    if (
      charge.refunded ||
      charge.amount_refunded > 0 ||
      charge.disputed ||
      !charge.paid
    )
      throw new CommerceError("Payment requires merchant review.", 422);
  }
  return validateStripePayment(session, intent, order, eventId);
}
