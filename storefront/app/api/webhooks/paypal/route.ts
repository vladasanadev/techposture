import { after } from "next/server";
import { z } from "zod";
import { config, CommerceError } from "@/lib/commerce/config";
import { byCheckout, markRisk } from "@/lib/commerce/db";
import { confirmPaymentAndDispatch } from "@/lib/commerce/queue";
import { apiError, json, rawBody } from "@/lib/commerce/http";
import {
  retrievePayPal,
  retrievePayPalRefundCapture,
  retrievePayPalDisputeCaptures,
  verifyPayPalWebhook,
} from "@/lib/commerce/providers/paypal";
export const runtime = "nodejs";
export const maxDuration = 60;
const eventSchema = z.object({
  id: z.string(),
  event_type: z.string(),
  resource: z
    .object({
      id: z.string().optional(),
      dispute_id: z.string().optional(),
      supplementary_data: z
        .object({
          related_ids: z
            .object({
              order_id: z.string().optional(),
              capture_id: z.string().optional(),
            })
            .optional(),
        })
        .optional(),
    })
    .passthrough(),
});
export async function POST(request: Request) {
  try {
    const c = config();
    if (
      c.mode === "preview" ||
      !c.paypalWebhook ||
      !c.paypalClient ||
      !c.paypalSecret
    )
      throw new CommerceError("Webhook is not configured.", 503);
    const raw = await rawBody(request);
    JSON.parse(raw);
    await verifyPayPalWebhook(raw, request.headers, c);
    const event = eventSchema.parse(JSON.parse(raw));
    if (
      ["PAYMENT.CAPTURE.COMPLETED", "CHECKOUT.ORDER.APPROVED"].includes(
        event.event_type,
      )
    ) {
      const checkoutId =
        event.event_type === "CHECKOUT.ORDER.APPROVED"
          ? event.resource.id
          : event.resource.supplementary_data?.related_ids?.order_id;
      if (!checkoutId)
        throw new CommerceError("Webhook order reference is missing.", 422);
      const order = await byCheckout("paypal", checkoutId);
      if (!order)
        throw new CommerceError("Order is not ready for this event.", 409);
      const verified = await retrievePayPal(
        order,
        c,
        event.id,
        event.event_type === "CHECKOUT.ORDER.APPROVED",
      );
      if (verified) {
        if (
          event.event_type === "PAYMENT.CAPTURE.COMPLETED" &&
          verified.paymentId !== event.resource.id
        )
          throw new CommerceError("Capture identity mismatch.", 422);
        await confirmPaymentAndDispatch(verified, after);
      }
    } else if (
      event.event_type === "PAYMENT.CAPTURE.REFUNDED" ||
      event.event_type === "PAYMENT.CAPTURE.REVERSED"
    ) {
      const captureId =
        event.event_type === "PAYMENT.CAPTURE.REFUNDED" && event.resource.id
          ? await retrievePayPalRefundCapture(event.resource.id, c)
          : event.resource.supplementary_data?.related_ids?.capture_id ||
            event.resource.id;
      if (captureId) await markRisk("paypal", captureId, event.id, "refund");
    } else if (event.event_type === "CUSTOMER.DISPUTE.CREATED") {
      const disputeId = event.resource.dispute_id || event.resource.id;
      if (!disputeId)
        throw new CommerceError("Dispute reference is missing.", 422);
      for (const captureId of await retrievePayPalDisputeCaptures(disputeId, c))
        await markRisk(
          "paypal",
          captureId,
          `${event.id}-${captureId}`,
          "dispute",
        );
    }
    return json({ received: true });
  } catch (error) {
    return apiError(error);
  }
}
