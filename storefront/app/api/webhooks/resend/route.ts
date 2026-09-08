import { z } from "zod";
import { config } from "@/lib/commerce/config";
import { db } from "@/lib/commerce/db";
import { reconcileEmailEvents } from "@/lib/commerce/fulfillment";
import { apiError, json, rawBody } from "@/lib/commerce/http";
import { verifyResendSignature } from "@/lib/commerce/security";
export const runtime = "nodejs";
const eventSchema = z.object({
  type: z.string(),
  data: z.object({ email_id: z.string() }),
});
export async function POST(request: Request) {
  try {
    const raw = await rawBody(request);
    verifyResendSignature(raw, request.headers, config().resendSecret);
    const event = eventSchema.parse(JSON.parse(raw));
    await db()`INSERT INTO commerce_email_events(event_id,resend_id,event_type) VALUES(${request.headers.get("svix-id")!},${event.data.email_id},${event.type}) ON CONFLICT DO NOTHING`;
    await reconcileEmailEvents();
    return json({ received: true });
  } catch (error) {
    return apiError(error);
  }
}
