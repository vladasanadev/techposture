import { after } from "next/server";
import { config, CommerceError } from "@/lib/commerce/config";
import { byCheckout, markUnpaidTerminal } from "@/lib/commerce/db";
import { confirmPaymentAndDispatch } from "@/lib/commerce/queue";
import { apiError, json, rawBody } from "@/lib/commerce/http";
import {
  getPaddleTransaction,
  recordPaddleAdjustments,
  retrievePaddle,
  validatePaddleTransaction,
} from "@/lib/commerce/providers/paddle";
import { verifyPaddleSignature } from "@/lib/commerce/security";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: Request) {
  try {
    const c = config();
    if (c.mode === "preview" || !c.paddleSecret || !c.paddleKey)
      throw new CommerceError("Webhook is not configured.", 503);
    const raw = await rawBody(request);
    verifyPaddleSignature(
      raw,
      request.headers.get("paddle-signature") || "",
      c.paddleSecret,
    );
    const event = JSON.parse(raw) as {
      event_id: string;
      event_type: string;
      data: { id: string; transaction_id?: string };
    };
    if (!/^evt_[a-z0-9]{26}$/.test(event.event_id))
      throw new CommerceError("Invalid Paddle event.", 422);
    if (
      ![
        "transaction.completed",
        "transaction.canceled",
        "adjustment.created",
        "adjustment.updated",
      ].includes(event.event_type)
    )
      return json({ received: true });
    const id = event.event_type.startsWith("adjustment.")
      ? event.data.transaction_id
      : event.data.id;
    if (!id || !/^txn_[a-z0-9]{26}$/.test(id))
      throw new CommerceError("Invalid Paddle transaction.", 422);
    const order = await byCheckout("paddle", id);
    // A fast callback can arrive before checkout creation commits. Retry instead of discarding it.
    if (!order)
      throw new CommerceError("Order is not ready for this event.", 409);
    if (event.event_type === "transaction.completed") {
      const verified = await retrievePaddle(order, c, event.event_id);
      if (verified) await confirmPaymentAndDispatch(verified, after);
    } else {
      const transaction = await getPaddleTransaction(id, c);
      validatePaddleTransaction(transaction, order, c);
      await recordPaddleAdjustments(transaction, event.event_id);
      if (
        event.event_type === "transaction.canceled" &&
        transaction.status === "canceled"
      )
        await markUnpaidTerminal("paddle", id, event.event_id, "expired");
    }
    return json({ received: true });
  } catch (error) {
    return apiError(error);
  }
}
