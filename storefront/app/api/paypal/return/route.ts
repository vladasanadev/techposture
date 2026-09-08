import { after } from "next/server";
import { config, CommerceError } from "@/lib/commerce/config";
import { db, Order } from "@/lib/commerce/db";
import { confirmPaymentAndDispatch } from "@/lib/commerce/queue";
import { apiError } from "@/lib/commerce/http";
import { retrievePayPal } from "@/lib/commerce/providers/paypal";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function GET(request: Request) {
  try {
    const url = new URL(request.url),
      token = url.searchParams.get("order") || "",
      providerToken = url.searchParams.get("token");
    if (!/^[A-Za-z0-9_-]{43}$/.test(token))
      throw new CommerceError("Invalid order.", 404);
    const [order] = await db()<
      Order[]
    >`SELECT * FROM commerce_orders WHERE public_token=${token} AND provider='paypal'`;
    if (
      !order ||
      !providerToken ||
      providerToken !== order.provider_checkout_id
    )
      throw new CommerceError("Invalid PayPal return.", 403);
    const c = config();
    if (c.mode === "preview")
      throw new CommerceError("Checkout is not open.", 503);
    const verified = await retrievePayPal(
      order,
      c,
      `return-${order.provider_checkout_id}`,
      true,
    );
    if (verified) {
      await confirmPaymentAndDispatch(verified, after);
    }
    return Response.redirect(`${c.siteUrl}/success?order=${token}`, 303);
  } catch (error) {
    return apiError(error);
  }
}
