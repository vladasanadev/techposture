import { z } from "zod";
import { db } from "@/lib/commerce/db";
import { processFulfillments } from "@/lib/commerce/fulfillment";
import { apiError, json, rawBody } from "@/lib/commerce/http";
import { verifyQueueRequest } from "@/lib/commerce/queue";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: Request) {
  try {
    const raw = await rawBody(request, 4096);
    await verifyQueueRequest(
      raw,
      request.headers.get("upstash-signature") || "",
    );
    const { orderId } = z
      .object({ orderId: z.string().uuid() })
      .strict()
      .parse(JSON.parse(raw));
    await processFulfillments(1, orderId);
    const [job] =
      await db()`SELECT state,next_attempt FROM commerce_fulfillments WHERE order_id=${orderId}`;
    if (!job || job.state === "attention" || job.state === "bounced")
      return Response.json(
        { error: "Delivery requires merchant review." },
        {
          status: 489,
          headers: {
            "Upstash-NonRetryable-Error": "true",
            "Cache-Control": "no-store",
          },
        },
      );
    if (job.state === "pending" || job.state === "sending")
      return Response.json(
        { error: "Delivery will retry." },
        {
          status: 503,
          headers: {
            "Retry-After": String(
              Math.max(
                60,
                Math.ceil(
                  (new Date(job.next_attempt).getTime() - Date.now()) / 1000,
                ),
              ),
            ),
            "Cache-Control": "no-store",
          },
        },
      );
    return json({ state: job.state });
  } catch (error) {
    return apiError(error);
  }
}
