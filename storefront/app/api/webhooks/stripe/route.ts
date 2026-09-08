import { after } from "next/server";
import Stripe from "stripe";
import { config, CommerceError } from "@/lib/commerce/config";
import { byCheckout, markRisk, markUnpaidTerminal } from "@/lib/commerce/db";
import { confirmPaymentAndDispatch } from "@/lib/commerce/queue";
import { apiError, json, rawBody } from "@/lib/commerce/http";
import { retrieveStripe, stripeClient } from "@/lib/commerce/providers/stripe";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: Request) {
  try {
    const c = config();
    if (c.mode === "preview" || !c.stripeKey || !c.stripeSecret)
      throw new CommerceError("Webhook is not configured.", 503);
    const stripe = stripeClient(c);
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        await rawBody(request),
        request.headers.get("stripe-signature") || "",
        c.stripeSecret,
      );
    } catch {
      throw new CommerceError("Invalid webhook signature.", 401);
    }
    if (event.livemode !== (c.mode === "live"))
      throw new CommerceError("Webhook mode mismatch.", 422);
    if (
      [
        "checkout.session.completed",
        "checkout.session.async_payment_succeeded",
      ].includes(event.type)
    ) {
      const session = event.data.object as Stripe.Checkout.Session;
      const order = await byCheckout("stripe", session.id);
      if (!order)
        throw new CommerceError("Order is not ready for this event.", 409);
      const verified = await retrieveStripe(order, c, event.id);
      if (verified) {
        await confirmPaymentAndDispatch(verified, after);
      }
    } else if (
      event.type === "checkout.session.expired" ||
      event.type === "checkout.session.async_payment_failed"
    ) {
      const session = await stripe.checkout.sessions.retrieve(
        (event.data.object as Stripe.Checkout.Session).id,
      );
      if (
        session.payment_status !== "paid" &&
        (session.status === "expired" ||
          event.type === "checkout.session.async_payment_failed")
      )
        await markUnpaidTerminal(
          "stripe",
          session.id,
          event.id,
          session.status === "expired" ? "expired" : "attention",
        );
    } else if (event.type === "charge.refunded") {
      const charge = await stripe.charges.retrieve(
        (event.data.object as Stripe.Charge).id,
      );
      const id =
        typeof charge.payment_intent === "string"
          ? charge.payment_intent
          : charge.payment_intent?.id;
      if (charge.refunded || charge.amount_refunded > 0) {
        if (id) await markRisk("stripe", id, event.id, "refund");
      }
    } else if (event.type === "charge.dispute.created") {
      const dispute = await stripe.disputes.retrieve(
        (event.data.object as Stripe.Dispute).id,
      );
      const chargeId =
        typeof dispute.charge === "string" ? dispute.charge : dispute.charge.id;
      const charge = await stripe.charges.retrieve(chargeId);
      const id =
        typeof charge.payment_intent === "string"
          ? charge.payment_intent
          : charge.payment_intent?.id;
      if (id) await markRisk("stripe", id, event.id, "dispute");
    }
    return json({ received: true });
  } catch (error) {
    return apiError(error);
  }
}
