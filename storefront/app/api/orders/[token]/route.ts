import { db } from "@/lib/commerce/db";
import { apiError, json } from "@/lib/commerce/http";
export const dynamic = "force-dynamic";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;
    if (!/^[A-Za-z0-9_-]{43}$/.test(token))
      return json({ error: "Order not found." }, 404);
    const [order] =
      await db()`SELECT o.status,o.risk_status,f.state AS delivery FROM commerce_orders o LEFT JOIN commerce_fulfillments f ON f.order_id=o.id AND f.bundle_version=o.bundle_version WHERE o.public_token=${token}`;
    if (!order) return json({ error: "Order not found." }, 404);
    const delivery = order.delivery || "pending";
    const status =
      order.risk_status || delivery === "attention" || delivery === "bounced"
        ? "attention"
        : ["accepted", "delivered"].includes(delivery)
          ? "sent"
          : delivery === "sending"
            ? "delivering"
            : order.status;
    const message =
      status === "sent"
        ? delivery === "delivered"
          ? "Your bundle was delivered to your email."
          : "Your bundle email has been sent. Please also check spam and promotions."
        : status === "attention"
          ? "Your order needs a quick check. Please contact support."
          : status === "paid" || status === "delivering"
            ? "Payment confirmed. We are preparing your bundle email."
            : status === "expired"
              ? "This checkout has expired. You can start a new checkout."
              : "We are waiting for secure payment confirmation.";
    return json({ status, delivery, message });
  } catch (error) {
    return apiError(error);
  }
}
