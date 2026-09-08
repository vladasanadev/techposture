import { after } from "next/server";
import { z } from "zod";
import { config, CommerceError } from "@/lib/commerce/config";
import { dispatchConfirmedFulfillment } from "@/lib/commerce/queue";
import { apiError, json, rawBody } from "@/lib/commerce/http";
import { recoverPaddlePayment } from "@/lib/commerce/recovery";
import { equalSecret } from "@/lib/commerce/security";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: Request) {
  try {
    const c = config();
    if (
      !c.cronSecret ||
      !equalSecret(
        request.headers.get("authorization") || "",
        `Bearer ${c.cronSecret}`,
      )
    )
      throw new CommerceError("Unauthorized.", 401);
    const input = z
      .object({
        orderId: z.string().uuid(),
        transactionId: z.string().regex(/^txn_[a-z0-9]{26}$/),
      })
      .strict()
      .parse(JSON.parse(await rawBody(request, 4096)));
    const result = await recoverPaddlePayment(
      input.orderId,
      input.transactionId,
    );
    if (result.settled)
      await dispatchConfirmedFulfillment(input.orderId, after);
    return json(result);
  } catch (error) {
    return apiError(error);
  }
}
