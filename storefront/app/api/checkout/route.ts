import { createCheckout } from "@/lib/commerce/checkout";
import { apiError, json, rawBody, verifyOrigin } from "@/lib/commerce/http";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: Request) {
  try {
    verifyOrigin(request);
    const body = JSON.parse(await rawBody(request, 4096));
    const ip =
      request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    return json(
      await createCheckout(
        body,
        request.headers.get("idempotency-key") || "",
        ip,
      ),
    );
  } catch (error) {
    return apiError(error);
  }
}
