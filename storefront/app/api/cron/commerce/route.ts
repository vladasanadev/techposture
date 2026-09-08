import { config, CommerceError } from "@/lib/commerce/config";
import { apiError, json } from "@/lib/commerce/http";
import { reconcileCommerce } from "@/lib/commerce/reconcile";
import { equalSecret } from "@/lib/commerce/security";
export const runtime = "nodejs";
export const maxDuration = 300;
export async function GET(request: Request) {
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
    return json(await reconcileCommerce());
  } catch (error) {
    return apiError(error);
  }
}
