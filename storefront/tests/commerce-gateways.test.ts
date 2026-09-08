import { afterEach, describe, it, expect, vi } from "vitest";
import { config } from "../lib/commerce/config";
import type { Order } from "../lib/commerce/db";
import {
  createPayPal,
  retrievePayPal,
  verifyPayPalWebhook,
} from "../lib/commerce/providers/paypal";
import {
  checkCryptoNetwork,
  createCrypto,
  retrieveCrypto,
} from "../lib/commerce/providers/crypto";
const c = {
  ...config({}),
  mode: "live" as const,
  siteUrl: "https://store.example",
  paypalMerchant: "MERCHANT",
  paypalClient: "client",
  paypalSecret: "secret",
  paypalWebhook: "webhook",
  cryptoKey: "crypto-secret",
  cryptoTokens: ["usdttrc20"],
};
const o = {
  id: "12345678-1234-1234-1234-123456789abc",
  public_token: "opaque",
  email: "buyer@example.com",
  provider: "paypal",
  amount: 1900,
  currency: "USD",
  bundle_version: "v1",
  mode: "live",
  provider_checkout_id: "ORDER1",
  crypto_token: "usdttrc20",
} as Order;
const unit = {
  custom_id: o.id,
  reference_id: o.id,
  payee: { merchant_id: "MERCHANT" },
  amount: { value: "19.00", currency_code: "USD" },
  payments: {
    captures: [
      {
        id: "CAPTURE1",
        status: "COMPLETED",
        amount: { value: "19.00", currency_code: "USD" },
        final_capture: true,
      },
    ],
  },
};
afterEach(() => vi.unstubAllGlobals());
describe("PayPal HTTP contract fixtures", () => {
  it("creates hosted approval with authoritative price, merchant and stable request ID", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ access_token: "access" }))
      .mockResolvedValueOnce(
        Response.json({
          id: "ORDER1",
          status: "PAYER_ACTION_REQUIRED",
          purchase_units: [unit],
          links: [
            {
              rel: "payer-action",
              href: "https://www.paypal.com/checkoutnow?token=ORDER1",
            },
          ],
        }),
      );
    vi.stubGlobal("fetch", fetcher);
    expect(await createPayPal(o, c)).toMatchObject({ id: "ORDER1" });
    const call = fetcher.mock.calls[1];
    expect(call[0]).toBe("https://api-m.paypal.com/v2/checkout/orders");
    expect(call[1].headers["PayPal-Request-Id"]).toBe(`c-${o.id}`);
    expect(call[1].headers["PayPal-Request-Id"].length).toBeLessThanOrEqual(38);
    expect(JSON.parse(call[1].body)).toMatchObject({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: { value: "19.00", currency_code: "USD" },
          payee: { merchant_id: "MERCHANT" },
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            return_url: "https://store.example/api/paypal/return?order=opaque",
          },
        },
      },
    });
  });
  it("captures only a remotely approved order then retrieves the completed capture", async () => {
    let orderReads = 0;
    const fetcher = vi
      .fn()
      .mockImplementation(async (url: string, init: RequestInit) => {
        if (url.endsWith("/v1/oauth2/token"))
          return Response.json({ access_token: "access" });
        if (init.method === "POST") return Response.json({ id: "ORDER1" });
        orderReads++;
        return Response.json({
          id: "ORDER1",
          status: orderReads === 1 ? "APPROVED" : "COMPLETED",
          purchase_units: [unit],
        });
      });
    vi.stubGlobal("fetch", fetcher);
    expect(await retrievePayPal(o, c, "event", true)).toMatchObject({
      paymentId: "CAPTURE1",
    });
    const capture = fetcher.mock.calls.find((call) =>
      call[0].endsWith("/capture"),
    );
    expect(capture?.[1].headers["PayPal-Request-Id"]).toBe(`p-${o.id}`);
    expect(orderReads).toBe(2);
  });
  it("preserves the exact raw webhook bytes in the verification service request", async () => {
    const raw = '{ "id" : "event",\n  "amount" : 19.00 }';
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ access_token: "access" }))
      .mockResolvedValueOnce(Response.json({ verification_status: "SUCCESS" }));
    vi.stubGlobal("fetch", fetcher);
    const headers = new Headers({
      "paypal-auth-algo": "SHA256withRSA",
      "paypal-cert-url": "https://api.paypal.com/v1/notifications/certs/TEST",
      "paypal-transmission-id": "id",
      "paypal-transmission-sig": "sig",
      "paypal-transmission-time": "2026-01-01T00:00:00Z",
    });
    await verifyPayPalWebhook(raw, headers, c);
    expect(fetcher.mock.calls[1][1].body).toContain(`"webhook_event":${raw}`);
  });
});
describe("NOWPayments HTTP contract fixtures", () => {
  it("checks merchant currency, estimate and minimum before creating a fixed-network invoice", async () => {
    const responses = [
      { selectedCurrencies: ["usdttrc20"] },
      { estimated_amount: 19.1 },
      { min_amount: 1 },
      { id: "123", invoice_url: "https://nowpayments.io/payment/?iid=123" },
    ];
    const fetcher = vi
      .fn()
      .mockImplementation(async () => Response.json(responses.shift()));
    vi.stubGlobal("fetch", fetcher);
    expect(await createCrypto({ ...o, provider: "crypto" }, c)).toEqual({
      id: "123",
      url: "https://nowpayments.io/payment/?iid=123",
    });
    expect(fetcher.mock.calls.map((call) => call[0])).toEqual([
      "https://api.nowpayments.io/v1/merchant/coins",
      "https://api.nowpayments.io/v1/estimate?amount=19&currency_from=usd&currency_to=usdttrc20",
      "https://api.nowpayments.io/v1/min-amount?currency_from=usdttrc20&fiat_equivalent=usd",
      "https://api.nowpayments.io/v1/invoice",
    ]);
    expect(JSON.parse(fetcher.mock.calls[3][1].body)).toMatchObject({
      price_amount: 19,
      price_currency: "usd",
      pay_currency: "usdttrc20",
      order_id: o.id,
      ipn_callback_url: "https://store.example/api/webhooks/crypto",
      success_url: "https://store.example/success?order=opaque",
      cancel_url: "https://store.example/?checkout=cancelled#buy",
      is_fixed_rate: true,
      is_fee_paid_by_user: false,
    });
  });
  it("probes a configured live merchant from preview without creating an invoice", async () => {
    const responses = [
      { selectedCurrencies: ["usdttrc20"] },
      { estimated_amount: "19.1" },
      { min_amount: "1" },
    ];
    const fetcher = vi
      .fn()
      .mockImplementation(async () => Response.json(responses.shift()));
    vi.stubGlobal("fetch", fetcher);
    expect(
      await checkCryptoNetwork("usdttrc20", { ...c, mode: "preview" }),
    ).toEqual({
      token: "usdttrc20",
      estimatedAmount: "19.1",
      minimumAmount: "1",
    });
    expect(fetcher.mock.calls.every((call) => call[1].method === "GET")).toBe(
      true,
    );
    expect(fetcher).toHaveBeenCalledTimes(3);
    await expect(
      createCrypto({ ...o, provider: "crypto" }, { ...c, mode: "preview" }),
    ).rejects.toThrow();
    expect(fetcher).toHaveBeenCalledTimes(3);
  });
  it("stops before price checks when the merchant has not enabled the chosen network", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(Response.json({ selectedCurrencies: [] }));
    vi.stubGlobal("fetch", fetcher);
    await expect(checkCryptoNetwork("usdttrc20", c)).rejects.toThrow(
      /not currently available/,
    );
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("refuses a zero estimate instead of creating a zero-value invoice", async () => {
    const responses = [
      { selectedCurrencies: ["usdttrc20"] },
      { estimated_amount: 0 },
      { min_amount: 0 },
    ];
    const fetcher = vi
      .fn()
      .mockImplementation(async () => Response.json(responses.shift()));
    vi.stubGlobal("fetch", fetcher);
    await expect(
      createCrypto({ ...o, provider: "crypto" }, c),
    ).rejects.toThrow();
    expect(fetcher).toHaveBeenCalledTimes(3);
  });
  it("does not create an invoice when the network minimum exceeds the product price", async () => {
    const responses = [
      { selectedCurrencies: ["usdttrc20"] },
      { estimated_amount: 19 },
      { min_amount: 25 },
    ];
    const fetcher = vi
      .fn()
      .mockImplementation(async () => Response.json(responses.shift()));
    vi.stubGlobal("fetch", fetcher);
    await expect(createCrypto({ ...o, provider: "crypto" }, c)).rejects.toThrow(
      /minimum/,
    );
    expect(fetcher).toHaveBeenCalledTimes(3);
  });
  it("rejects a pending payment from a different invoice during recovery", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json({
          payment_id: 123,
          invoice_id: "OTHER",
          order_id: o.id,
          payment_status: "waiting",
          price_amount: 19,
          price_currency: "usd",
          pay_currency: "usdttrc20",
          pay_amount: 19,
          actually_paid: 0,
        }),
      ),
    );
    await expect(
      retrieveCrypto({ ...o, provider: "crypto" }, c, "123", "recovery"),
    ).rejects.toThrow(/identity/);
  });
  it("retrieves the signed event payment independently with the merchant API key", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      Response.json({
        payment_id: 123,
        invoice_id: "ORDER1",
        order_id: o.id,
        payment_status: "finished",
        price_amount: 19,
        price_currency: "usd",
        pay_currency: "usdttrc20",
        pay_amount: 19,
        actually_paid: 19,
      }),
    );
    vi.stubGlobal("fetch", fetcher);
    expect(
      await retrieveCrypto({ ...o, provider: "crypto" }, c, "123", "event"),
    ).toMatchObject({ paymentId: "123" });
    expect(fetcher.mock.calls[0][0]).toBe(
      "https://api.nowpayments.io/v1/payment/123",
    );
    expect(fetcher.mock.calls[0][1].headers["x-api-key"]).toBe("crypto-secret");
  });
});
