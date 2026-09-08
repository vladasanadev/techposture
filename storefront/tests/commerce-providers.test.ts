import { describe, it, expect } from "vitest";
import type Stripe from "stripe";
import { config } from "../lib/commerce/config";
import type { Order } from "../lib/commerce/db";
import { validateStripePayment } from "../lib/commerce/providers/stripe";
import {
  validatePayPalPayment,
  PayPalOrder,
} from "../lib/commerce/providers/paypal";
import {
  validateCryptoPayment,
  CryptoPayment,
} from "../lib/commerce/providers/crypto";
import { assertHostedUrl } from "../lib/commerce/providers/http";
const order = {
  id: "12345678-1234-1234-1234-123456789abc",
  provider: "stripe",
  amount: 1900,
  currency: "USD",
  bundle_version: "v1",
  mode: "live",
  provider_checkout_id: "checkout_1",
} as Order;
const stripeSession = {
  id: "checkout_1",
  mode: "payment",
  status: "complete",
  payment_status: "paid",
  client_reference_id: order.id,
  metadata: { order_id: order.id, bundle_version: "v1" },
  livemode: true,
  amount_total: 1900,
  currency: "usd",
  payment_intent: "pi_1",
} as unknown as Stripe.Checkout.Session;
const intent = {
  id: "pi_1",
  status: "succeeded",
  metadata: { order_id: order.id },
  livemode: true,
  amount_received: 1900,
  currency: "usd",
} as unknown as Stripe.PaymentIntent;
describe("Stripe verification", () => {
  it("only accepts paid completed exact-order payments", () =>
    expect(
      validateStripePayment(stripeSession, intent, order, "evt_1")?.paymentId,
    ).toBe("pi_1"));
  it.each([{ payment_status: "unpaid" }, { status: "open" }])(
    "waits for delayed payment %o",
    (change) =>
      expect(
        validateStripePayment(
          { ...stripeSession, ...change } as Stripe.Checkout.Session,
          intent,
          order,
          "e",
        ),
      ).toBeNull(),
  );
  it.each([
    { amount_total: 1 },
    { currency: "eur" },
    { client_reference_id: "other" },
    { livemode: false },
    { metadata: { order_id: order.id, bundle_version: "other" } },
    { payment_intent: "other" },
  ])("rejects %o", (change) =>
    expect(() =>
      validateStripePayment(
        { ...stripeSession, ...change } as Stripe.Checkout.Session,
        intent,
        order,
        "e",
      ),
    ).toThrow(),
  );
  it("rejects a payment intent with insufficient captured funds", () =>
    expect(() =>
      validateStripePayment(
        stripeSession,
        { ...intent, amount_received: 1800 },
        order,
        "e",
      ),
    ).toThrow());
});
const paypalOrder = { ...order, provider: "paypal" } as Order;
const c = { ...config({}), mode: "live" as const, paypalMerchant: "MERCHANT" };
const remote: PayPalOrder = {
  id: "checkout_1",
  status: "COMPLETED",
  purchase_units: [
    {
      custom_id: order.id,
      reference_id: order.id,
      payee: { merchant_id: "MERCHANT" },
      amount: { value: "19.00", currency_code: "USD" },
      payments: {
        captures: [
          {
            id: "capture_1",
            status: "COMPLETED",
            amount: { value: "19.00", currency_code: "USD" },
            final_capture: true,
          },
        ],
      },
    },
  ],
};
describe("PayPal verification", () => {
  it("requires an exact completed capture paid to our merchant", () =>
    expect(validatePayPalPayment(remote, paypalOrder, c, "e")?.paymentId).toBe(
      "capture_1",
    ));
  it("does not mistake approved orders for paid captures", () =>
    expect(
      validatePayPalPayment(
        { ...remote, status: "APPROVED" },
        paypalOrder,
        c,
        "e",
      ),
    ).toBeNull());
  it("rejects a different merchant and split capture amounts", () => {
    const copy = structuredClone(remote);
    copy.purchase_units[0].payee!.merchant_id = "OTHER";
    expect(() => validatePayPalPayment(copy, paypalOrder, c, "e")).toThrow();
    const split = structuredClone(remote);
    split.purchase_units[0].payments!.captures!.push({
      ...split.purchase_units[0].payments!.captures![0],
      id: "capture_2",
    });
    expect(() => validatePayPalPayment(split, paypalOrder, c, "e")).toThrow();
  });
  it("rejects currency, order, mode and amount mismatches", () => {
    for (const change of [
      { amount: 1800 },
      { currency: "EUR" },
      { id: "other" },
      { mode: "sandbox" },
    ])
      expect(() =>
        validatePayPalPayment(
          remote,
          { ...paypalOrder, ...change } as Order,
          c,
          "e",
        ),
      ).toThrow();
  });
  it("waits for pending capture settlement", () => {
    const copy = structuredClone(remote);
    copy.purchase_units[0].payments!.captures![0].status = "PENDING";
    expect(validatePayPalPayment(copy, paypalOrder, c, "e")).toBeNull();
  });
});
const cryptoOrder = {
  ...order,
  provider: "crypto",
  crypto_token: "usdttrc20",
} as Order;
const payment: CryptoPayment = {
  payment_id: 123,
  invoice_id: "checkout_1",
  order_id: order.id,
  payment_status: "finished",
  price_amount: "19",
  price_currency: "usd",
  pay_currency: "usdttrc20",
  pay_amount: "19.120000",
  actually_paid: "19.120000",
};
describe("stablecoin verification", () => {
  it("accepts finished payments on the purchased token/network", () =>
    expect(validateCryptoPayment(payment, cryptoOrder, "e")?.paymentId).toBe(
      "123",
    ));
  it.each([
    "waiting",
    "confirming",
    "confirmed",
    "sending",
    "partially_paid",
    "expired",
    "failed",
    "refunded",
  ])("does not fulfill %s", (payment_status) =>
    expect(
      validateCryptoPayment({ ...payment, payment_status }, cryptoOrder, "e"),
    ).toBeNull(),
  );
  it.each([
    { actually_paid: "19.119999" },
    { price_amount: "18.99" },
    { price_currency: "eur" },
    { invoice_id: "other" },
    { order_id: "other" },
    { pay_currency: "usdterc20" },
    { pay_amount: "0" },
  ])("rejects mismatched crypto settlement %o", (change) =>
    expect(() =>
      validateCryptoPayment({ ...payment, ...change }, cryptoOrder, "e"),
    ).toThrow(),
  );
  it("accepts overpayment after final settlement without floating rounding", () =>
    expect(
      validateCryptoPayment(
        { ...payment, actually_paid: "19.120001" },
        cryptoOrder,
        "e",
      ),
    ).not.toBeNull());
});
describe("hosted checkout redirect boundary", () => {
  it("rejects lookalike domains, credentials and insecure transports", () => {
    for (const url of [
      "http://checkout.stripe.com/pay",
      "https://checkout.stripe.com.evil.example/pay",
      "https://user@checkout.stripe.com/pay",
    ])
      expect(() => assertHostedUrl(url, ["checkout.stripe.com"])).toThrow();
  });
});
