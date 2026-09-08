import { z } from "zod";
import { CommerceConfig, CommerceError, PRODUCT } from "../config";
import { Order, VerifiedPayment } from "../db";
import { minorUnits } from "../security";
import { assertHostedUrl, gatewayFetch } from "./http";
const amount = z.object({ value: z.string(), currency_code: z.string() });
const captureSchema = z.object({
  id: z.string(),
  status: z.string(),
  amount,
  final_capture: z.boolean().optional(),
});
export const paypalOrderSchema = z.object({
  id: z.string(),
  status: z.string(),
  purchase_units: z.array(
    z.object({
      custom_id: z.string().optional(),
      reference_id: z.string().optional(),
      amount,
      payee: z.object({ merchant_id: z.string().optional() }).optional(),
      payments: z
        .object({ captures: z.array(captureSchema).optional() })
        .optional(),
    }),
  ),
  links: z.array(z.object({ rel: z.string(), href: z.string() })).optional(),
});
export type PayPalOrder = z.infer<typeof paypalOrderSchema>;
const base = (c: CommerceConfig) =>
  c.mode === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
async function access(c: CommerceConfig) {
  const response = await gatewayFetch(`${base(c)}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${c.paypalClient}:${c.paypalSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  return z.object({ access_token: z.string() }).parse(response).access_token;
}
async function api(
  path: string,
  c: CommerceConfig,
  method = "GET",
  body?: unknown,
  key?: string,
) {
  return gatewayFetch(`${base(c)}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${await access(c)}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(key ? { "PayPal-Request-Id": key } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
}
export async function createPayPal(order: Order, c: CommerceConfig) {
  const response = paypalOrderSchema.parse(
    await api(
      "/v2/checkout/orders",
      c,
      "POST",
      {
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: order.id,
            custom_id: order.id,
            description: PRODUCT.name,
            amount: {
              currency_code: order.currency,
              value: (order.amount / 100).toFixed(2),
            },
            payee: { merchant_id: c.paypalMerchant },
          },
        ],
        payment_source: {
          paypal: {
            experience_context: {
              brand_name: "Vladasana",
              shipping_preference: "NO_SHIPPING",
              user_action: "PAY_NOW",
              return_url: `${c.siteUrl}/api/paypal/return?order=${order.public_token}`,
              cancel_url: `${c.siteUrl}/?checkout=cancelled#buy`,
            },
          },
        },
      },
      `c-${order.id}`,
    ),
  );
  const href = response.links?.find(
    (link) => link.rel === "payer-action" || link.rel === "approve",
  )?.href;
  if (!href) throw new CommerceError("PayPal checkout is unavailable.", 502);
  return {
    id: response.id,
    url: assertHostedUrl(href, [
      c.mode === "live" ? "www.paypal.com" : "www.sandbox.paypal.com",
    ]),
  };
}
export function validatePayPalPayment(
  remote: PayPalOrder,
  order: Order,
  c: CommerceConfig,
  eventId: string,
): VerifiedPayment | null {
  if (remote.status !== "COMPLETED") return null;
  if (
    remote.id !== order.provider_checkout_id ||
    remote.purchase_units.length !== 1 ||
    order.mode !== c.mode
  )
    throw new CommerceError("PayPal payment does not match the order.", 422);
  const unit = remote.purchase_units[0];
  const captures = unit.payments?.captures || [];
  if (
    unit.custom_id !== order.id ||
    unit.reference_id !== order.id ||
    unit.payee?.merchant_id !== c.paypalMerchant ||
    unit.amount.currency_code !== order.currency ||
    minorUnits(unit.amount.value) !== BigInt(order.amount) ||
    captures.length !== 1
  )
    throw new CommerceError("PayPal payment does not match the order.", 422);
  const capture = captures[0];
  if (capture.status !== "COMPLETED") return null;
  if (
    capture.amount.currency_code !== order.currency ||
    minorUnits(capture.amount.value) !== BigInt(order.amount) ||
    capture.final_capture === false
  )
    throw new CommerceError("PayPal capture does not match the order.", 422);
  return {
    orderId: order.id,
    provider: "paypal",
    checkoutId: remote.id,
    paymentId: capture.id,
    eventId,
    mode: order.mode,
    amount: order.amount,
    currency: order.currency,
  };
}
export async function retrievePayPal(
  order: Order,
  c: CommerceConfig,
  eventId: string,
  capture = false,
) {
  if (!order.provider_checkout_id) return null;
  let remote = paypalOrderSchema.parse(
    await api(
      `/v2/checkout/orders/${encodeURIComponent(order.provider_checkout_id)}`,
      c,
    ),
  );
  if (capture && remote.status === "APPROVED") {
    await api(
      `/v2/checkout/orders/${encodeURIComponent(order.provider_checkout_id)}/capture`,
      c,
      "POST",
      {},
      `p-${order.id}`,
    );
    remote = paypalOrderSchema.parse(
      await api(
        `/v2/checkout/orders/${encodeURIComponent(order.provider_checkout_id)}`,
        c,
      ),
    );
  }
  return validatePayPalPayment(remote, order, c, eventId);
}
export async function verifyPayPalWebhook(
  raw: string,
  headers: Headers,
  c: CommerceConfig,
) {
  const required = [
    "paypal-auth-algo",
    "paypal-cert-url",
    "paypal-transmission-id",
    "paypal-transmission-sig",
    "paypal-transmission-time",
  ];
  if (required.some((key) => !headers.get(key)))
    throw new CommerceError("Invalid webhook signature.", 401);
  const cert = new URL(headers.get("paypal-cert-url")!);
  if (
    cert.protocol !== "https:" ||
    ![
      "api.paypal.com",
      "api.sandbox.paypal.com",
      "api-m.paypal.com",
      "api-m.sandbox.paypal.com",
    ].includes(cert.hostname)
  )
    throw new CommerceError("Invalid webhook signature.", 401);
  const fields = JSON.stringify({
    auth_algo: headers.get("paypal-auth-algo"),
    cert_url: cert.href,
    transmission_id: headers.get("paypal-transmission-id"),
    transmission_sig: headers.get("paypal-transmission-sig"),
    transmission_time: headers.get("paypal-transmission-time"),
    webhook_id: c.paypalWebhook,
  });
  // PayPal's verification service requires the original webhook event bytes.
  const serialized = `${fields.slice(0, -1)},"webhook_event":${raw}}`;
  const result = await gatewayFetch(
    `${base(c)}/v1/notifications/verify-webhook-signature`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${await access(c)}`,
        "Content-Type": "application/json",
      },
      body: serialized,
    },
  );
  if (result.verification_status !== "SUCCESS")
    throw new CommerceError("Invalid webhook signature.", 401);
}
export async function retrievePayPalRefundCapture(
  refundId: string,
  c: CommerceConfig,
) {
  const refund = z
    .object({
      id: z.string(),
      status: z.string(),
      supplementary_data: z
        .object({
          related_ids: z
            .object({ capture_id: z.string().optional() })
            .optional(),
        })
        .optional(),
      links: z
        .array(z.object({ rel: z.string(), href: z.string() }))
        .optional(),
    })
    .parse(
      await api(`/v2/payments/refunds/${encodeURIComponent(refundId)}`, c),
    );
  if (refund.id !== refundId || refund.status !== "COMPLETED") return null;
  let captureId = refund.supplementary_data?.related_ids?.capture_id;
  if (!captureId) {
    const up = refund.links?.find((link) => link.rel === "up");
    if (up) {
      const url = new URL(up.href);
      if (
        [
          "api.paypal.com",
          "api-m.paypal.com",
          "api.sandbox.paypal.com",
          "api-m.sandbox.paypal.com",
        ].includes(url.hostname)
      )
        captureId = url.pathname.match(
          /^\/v2\/payments\/captures\/([A-Z0-9]+)$/,
        )?.[1];
    }
  }
  if (!captureId)
    throw new CommerceError("Refund capture reference is missing.", 422);
  const capture = z
    .object({ id: z.string(), status: z.string() })
    .parse(
      await api(`/v2/payments/captures/${encodeURIComponent(captureId)}`, c),
    );
  return capture.id === captureId &&
    ["REFUNDED", "PARTIALLY_REFUNDED"].includes(capture.status)
    ? captureId
    : null;
}
export async function retrievePayPalDisputeCaptures(
  disputeId: string,
  c: CommerceConfig,
) {
  const dispute = z
    .object({
      dispute_id: z.string(),
      disputed_transactions: z.array(
        z.object({ seller_transaction_id: z.string() }),
      ),
    })
    .parse(
      await api(`/v1/customer/disputes/${encodeURIComponent(disputeId)}`, c),
    );
  if (dispute.dispute_id !== disputeId)
    throw new CommerceError("Dispute identity mismatch.", 422);
  return dispute.disputed_transactions.map(
    (transaction) => transaction.seller_transaction_id,
  );
}
