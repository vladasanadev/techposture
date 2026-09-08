import { after } from "next/server";
import { z } from "zod";
import { config, CommerceError } from "@/lib/commerce/config";
import { byCheckout, db } from "@/lib/commerce/db";
import { confirmPaymentAndDispatch } from "@/lib/commerce/queue";
import { apiError, json, rawBody } from "@/lib/commerce/http";
import { retrieveCrypto } from "@/lib/commerce/providers/crypto";
import { sha256, verifyCryptoSignature } from "@/lib/commerce/security";
export const runtime = "nodejs";
export const maxDuration = 60;
const eventSchema = z.object({
  invoice_id: z.union([z.string(), z.number()]),
  payment_id: z.union([z.string(), z.number()]),
  payment_status: z.string(),
});
export async function POST(request: Request) {
  try {
    const c = config();
    if (!c.cryptoSecret || !c.cryptoKey || c.mode !== "live")
      throw new CommerceError("Webhook is not configured.", 503);
    const raw = await rawBody(request);
    verifyCryptoSignature(
      raw,
      request.headers.get("x-nowpayments-sig") || "",
      c.cryptoSecret,
    );
    const event = eventSchema.parse(JSON.parse(raw));
    const order = await byCheckout("crypto", String(event.invoice_id));
    if (!order)
      throw new CommerceError("Order is not ready for this event.", 409);
    const eventId = sha256(raw);
    const paymentId = String(event.payment_id);
    const verified = await retrieveCrypto(order, c, paymentId, eventId);
    // Keep the independently retrieved payment reference for cron recovery even if settlement is still pending.
    await db()`UPDATE commerce_orders SET provider_payment_id=COALESCE(provider_payment_id,${paymentId}),updated_at=NOW() WHERE id=${order.id} AND (provider_payment_id IS NULL OR provider_payment_id=${paymentId})`;
    if (verified) {
      await confirmPaymentAndDispatch(verified, after);
    }
    return json({ received: true });
  } catch (error) {
    return apiError(error);
  }
}
