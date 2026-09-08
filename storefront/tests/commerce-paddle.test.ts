import { afterEach, describe, expect, it, vi } from "vitest";
import { createHmac } from "node:crypto";
import { config, providerAvailable, storefront } from "../lib/commerce/config";
import type { Order } from "../lib/commerce/db";
import {
  createPaddle,
  retrievePaddle,
  validatePaddlePrice,
  type PaddlePrice,
  type PaddleTransaction,
} from "../lib/commerce/providers/paddle";
import { verifyPaddleSignature } from "../lib/commerce/security";
const risk = vi.hoisted(() => vi.fn());
vi.mock("../lib/commerce/db", () => ({ markRisk: risk }));
const c = {
  ...config({}),
  mode: "sandbox" as const,
  paddleKey: "sandbox-secret",
  paddlePrice: "pri_" + "a".repeat(26),
  paddleProduct: "pro_" + "a".repeat(26),
  siteUrl: "https://store.example",
};
const order: Order = {
  id: "12345678-1234-1234-1234-123456789abc",
  public_token: "a".repeat(43),
  email: "buyer@example.com",
  provider: "paddle",
  crypto_token: null,
  amount: 1900,
  currency: "USD",
  bundle_version: "v1",
  pdf_sha256: "a".repeat(64),
  archive_sha256: "b".repeat(64),
  mode: "sandbox",
  status: "pending",
  risk_status: null,
  provider_checkout_id: "txn_" + "a".repeat(26),
  provider_payment_id: null,
  checkout_url: null,
  create_state: "new",
  create_lease: null,
  created_at: new Date(),
};
const price: PaddlePrice = {
  id: c.paddlePrice,
  product_id: c.paddleProduct,
  status: "active",
  billing_cycle: null,
  trial_period: null,
  tax_mode: "internal",
  unit_price: { amount: "1900", currency_code: "USD" },
  unit_price_overrides: [],
  quantity: { minimum: 1, maximum: 1 },
};
function transaction(): PaddleTransaction {
  return {
    id: order.provider_checkout_id!,
    status: "completed",
    collection_mode: "automatic",
    currency_code: "USD",
    custom_data: {
      order_id: order.id,
      bundle_version: "v1",
      pdf_sha256: order.pdf_sha256,
      archive_sha256: order.archive_sha256,
      mode: "sandbox",
    },
    subscription_id: null,
    discount_id: null,
    items: [{ price: structuredClone(price), quantity: 1 }],
    details: {
      totals: {
        grand_total: "1900",
        currency_code: "USD",
        discount: "0",
        credit: "0",
        balance: "0",
      },
    },
    customer: { email: order.email },
    payments: [{ status: "captured", amount: "1900" }],
    adjustments: [],
  };
}
afterEach(() => {
  vi.unstubAllGlobals();
  risk.mockReset();
});
describe("Paddle server-side payment verification", () => {
  it("creates only the configured one-time product using the mode-specific account", async () => {
    const t = transaction();
    t.status = "draft";
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ data: price }))
      .mockResolvedValueOnce(Response.json({ data: t }));
    vi.stubGlobal("fetch", fetcher);
    expect(await createPaddle(order, c)).toEqual({
      id: t.id,
      url: `https://store.example/pay?order=${order.public_token}`,
    });
    expect(fetcher.mock.calls[1][0]).toBe(
      "https://sandbox-api.paddle.com/transactions",
    );
    const payload = JSON.parse(fetcher.mock.calls[1][1].body);
    expect(payload.items).toEqual([{ price_id: c.paddlePrice, quantity: 1 }]);
    expect(payload.custom_data.archive_sha256).toBe(order.archive_sha256);
    expect(payload.currency_code).toBe("USD");
  });
  it("fulfills only an independently retrieved completed and captured transaction", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json({ data: transaction() })),
    );
    expect(await retrievePaddle(order, c, "evt_test")).toMatchObject({
      provider: "paddle",
      amount: 1900,
      paymentId: order.provider_checkout_id,
    });
  });
  it.each(["draft", "ready", "paid", "past_due", "canceled"])(
    "never fulfills status %s",
    async (status) => {
      vi.stubGlobal(
        "fetch",
        vi
          .fn()
          .mockResolvedValue(
            Response.json({ data: { ...transaction(), status } }),
          ),
      );
      expect(await retrievePaddle(order, c, "evt_test")).toBeNull();
    },
  );
  it.each([
    [
      "order",
      (t: PaddleTransaction) => {
        t.custom_data!.order_id = "someone-else";
      },
    ],
    [
      "PDF",
      (t: PaddleTransaction) => {
        t.custom_data!.pdf_sha256 = "wrong";
      },
    ],
    [
      "ZIP",
      (t: PaddleTransaction) => {
        t.custom_data!.archive_sha256 = "wrong";
      },
    ],
    [
      "mode",
      (t: PaddleTransaction) => {
        t.custom_data!.mode = "live";
      },
    ],
    [
      "version",
      (t: PaddleTransaction) => {
        t.custom_data!.bundle_version = "v2";
      },
    ],
    [
      "amount",
      (t: PaddleTransaction) => {
        t.details.totals.grand_total = "1";
      },
    ],
    [
      "currency",
      (t: PaddleTransaction) => {
        t.currency_code = "EUR";
      },
    ],
    [
      "quantity",
      (t: PaddleTransaction) => {
        t.items[0].quantity = 2;
      },
    ],
    [
      "price",
      (t: PaddleTransaction) => {
        t.items[0].price.id = "other";
      },
    ],
    [
      "product",
      (t: PaddleTransaction) => {
        t.items[0].price.product_id = "other";
      },
    ],
    [
      "recurring",
      (t: PaddleTransaction) => {
        t.subscription_id = "sub_x";
      },
    ],
    [
      "discount",
      (t: PaddleTransaction) => {
        t.discount_id = "dsc_x";
      },
    ],
    [
      "credit",
      (t: PaddleTransaction) => {
        t.details.totals.credit = "1900";
      },
    ],
    [
      "email",
      (t: PaddleTransaction) => {
        t.customer!.email = "someone@example.com";
      },
    ],
    [
      "capture",
      (t: PaddleTransaction) => {
        t.payments[0].status = "pending";
      },
    ],
    [
      "capture amount",
      (t: PaddleTransaction) => {
        t.payments[0].amount = "100";
      },
    ],
  ] as const)("rejects mismatched %s", async (_name, mutate) => {
    const t = transaction();
    mutate(t);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json({ data: t })),
    );
    await expect(retrievePaddle(order, c, "evt_test")).rejects.toThrow();
  });
  it.each([
    { billing_cycle: { interval: "month" } },
    { trial_period: {} },
    { tax_mode: "external" },
    { unit_price_overrides: [{}] },
    { quantity: { minimum: 1, maximum: 10 } },
  ])("blocks an incorrectly configured product before payment", (change) => {
    expect(() =>
      validatePaddlePrice({ ...price, ...change }, order, c),
    ).toThrow();
  });
  it("records approved refunds and disputes, including before paid notification", async () => {
    const t = transaction();
    t.adjustments = [
      {
        id: "adj_refund",
        transaction_id: t.id,
        action: "refund",
        status: "approved",
      },
      {
        id: "adj_warning",
        transaction_id: t.id,
        action: "chargeback_warning",
        status: "approved",
      },
      {
        id: "adj_pending",
        transaction_id: t.id,
        action: "refund",
        status: "pending_approval",
      },
    ];
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json({ data: t })),
    );
    await retrievePaddle(order, c, "evt_test");
    expect(risk.mock.calls.map((call) => call[3])).toEqual([
      "refund",
      "dispute",
    ]);
    expect(risk.mock.calls[0][1]).toBe(t.id);
  });
  it("does not expose legacy providers or activate a missing Paddle configuration", () => {
    expect(storefront(config({})).methods.map((m) => m.id)).toEqual([
      "paddle",
      "crypto",
    ]);
    expect(providerAvailable("paddle", c)).toBe(false);
  });
});
describe("Paddle raw-body authentication", () => {
  const now = 1_800_000_000_000,
    raw = '{"event_type":"transaction.completed"}',
    timestamp = String(now / 1000);
  const signature = createHmac("sha256", "secret")
    .update(`${timestamp}:${raw}`)
    .digest("hex");
  it("accepts valid signatures and multiple rotated signatures", () => {
    expect(() =>
      verifyPaddleSignature(
        raw,
        `ts=${timestamp};h1=${"0".repeat(64)};h1=${signature}`,
        "secret",
        now,
      ),
    ).not.toThrow();
  });
  it.each([
    "wrong secret",
    "changed body",
    "old",
    "future",
    "duplicate ts",
    "missing h1",
  ])("rejects %s", (problem) => {
    expect(() =>
      verifyPaddleSignature(
        problem === "changed body" ? raw + " " : raw,
        problem === "missing h1"
          ? `ts=${timestamp}`
          : `ts=${timestamp};h1=${signature}${problem === "duplicate ts" ? `;ts=${timestamp}` : ""}`,
        problem === "wrong secret" ? "other" : "secret",
        problem === "old"
          ? now + 6000
          : problem === "future"
            ? now - 6000
            : now,
      ),
    ).toThrow();
  });
});
