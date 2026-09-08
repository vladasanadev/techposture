import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  it,
  expect,
  vi,
} from "vitest";
const fixture = vi.hoisted(() => ({
  sql: undefined as unknown,
  paddle: vi.fn(),
  paypal: vi.fn(),
  crypto: vi.fn(),
  retrievePaddle: vi.fn(),
  retrievePayPal: vi.fn(),
  retrieveCrypto: vi.fn(),
}));
vi.mock("postgres", () => ({ default: () => fixture.sql }));
vi.mock("../lib/commerce/providers/paddle", () => ({
  createPaddle: fixture.paddle,
  retrievePaddle: fixture.retrievePaddle,
}));
vi.mock("../lib/commerce/providers/paypal", () => ({
  createPayPal: fixture.paypal,
  retrievePayPal: fixture.retrievePayPal,
}));
vi.mock("../lib/commerce/providers/crypto", () => ({
  createCrypto: fixture.crypto,
  retrieveCrypto: fixture.retrieveCrypto,
}));
import { createCheckout } from "../lib/commerce/checkout";
import {
  markPaid,
  markRisk,
  markUnpaidTerminal,
  Order,
} from "../lib/commerce/db";
import {
  processFulfillments,
  reconcileEmailEvents,
} from "../lib/commerce/fulfillment";
import {
  kickoffFulfillment,
  confirmPaymentAndDispatch,
} from "../lib/commerce/queue";
import { recoverCryptoPayment } from "../lib/commerce/recovery";
import { reconcileCommerce } from "../lib/commerce/reconcile";
import { sha256 } from "../lib/commerce/security";
const pg = new PGlite();
type QueryEngine = {
  query: (query: string, params?: unknown[]) => Promise<{ rows: unknown[] }>;
};
function sqlAdapter(engine: QueryEngine) {
  const tag = (strings: TemplateStringsArray, ...values: unknown[]) =>
    engine
      .query(
        strings.reduce(
          (sql, part, index) => sql + (index ? `$${index}` : "") + part,
          "",
        ),
        values,
      )
      .then((result) => result.rows);
  return Object.assign(tag, {
    json: (value: unknown) => JSON.stringify(value),
    begin: <T>(
      callback: (tx: ReturnType<typeof sqlAdapter>) => Promise<T>,
    ): Promise<T> => pg.transaction((tx) => callback(sqlAdapter(tx))),
  });
}
const pdf = Buffer.from("%PDF-1.7\nVerified fixture\n%%EOF");
const archive = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x01]);
const env = {
  COMMERCE_MODE: "live",
  DELIVERY_RETRY_MODE: "cron",
  COMMERCE_RETRY_SCHEDULE_APPROVED: "true",
  COMMERCE_LAUNCH_APPROVED: "true",
  BUNDLE_FINAL_APPROVED: "true",
  SELLER_COUNTRY: "GB",
  SELLER_LEGAL_NAME: "Test Seller",
  SITE_URL: "https://store.example",
  DATABASE_URL: "postgres://local-fixture",
  BUNDLE_PDF_URL: "https://private.example/bundle",
  BUNDLE_PDF_BEARER_TOKEN: "private-secret",
  BUNDLE_PDF_SHA256: sha256(pdf),
  BUNDLE_VERSION: "v1",
  BUNDLE_ARCHIVE_URL: "https://private.example/archive",
  BUNDLE_ARCHIVE_SHA256: sha256(archive),
  PADDLE_API_KEY: "test-key",
  PADDLE_WEBHOOK_SECRET: "secret",
  PADDLE_CLIENT_TOKEN: "live_test",
  PADDLE_PRICE_ID: "pri_" + "a".repeat(26),
  PADDLE_PRODUCT_ID: "pro_" + "a".repeat(26),
  PADDLE_DOMAIN_APPROVED: "true",
  DOWNLOAD_SIGNING_SECRET: "d".repeat(32),
  CRON_SECRET: "c".repeat(32),
  RESEND_API_KEY: "test",
  RESEND_WEBHOOK_SECRET: "whsec_test",
  EMAIL_FROM: "Vlada <delivery@example.com>",
  SUPPORT_EMAIL: "support@example.com",
  STRIPE_SECRET_KEY: "sk_live_test",
  STRIPE_WEBHOOK_SECRET: "whsec_test",
  STRIPE_ACCOUNT_ID: "acct_test",
  PAYPAL_CLIENT_ID: "test",
  PAYPAL_CLIENT_SECRET: "test",
  PAYPAL_WEBHOOK_ID: "test",
  PAYPAL_MERCHANT_ID: "test",
  NOWPAYMENTS_API_KEY: "test",
  NOWPAYMENTS_IPN_SECRET: "test",
  NOWPAYMENTS_TOKENS: "usdttrc20",
  NOWPAYMENTS_NETWORKS_APPROVED: "true",
};
beforeAll(async () => {
  await pg.exec(
    await readFile(new URL("../db/001-commerce.sql", import.meta.url), "utf8"),
  );
  await pg.exec(
    await readFile(new URL("../db/002-paddle.sql", import.meta.url), "utf8"),
  );
  fixture.sql = sqlAdapter(pg);
});
beforeEach(async () => {
  await pg.exec(
    "TRUNCATE commerce_email_events,commerce_events,commerce_fulfillments,commerce_orders,commerce_rate_limits RESTART IDENTITY CASCADE",
  );
  for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
  fixture.paddle.mockReset().mockImplementation(async (order: Order) => ({
    id: `cs_${order.id}`,
    url: `https://checkout.paddle.com/${order.id}`,
  }));
  fixture.crypto.mockReset();
  fixture.paypal.mockReset();
  fixture.retrievePaddle.mockReset();
  fixture.retrievePayPal.mockReset();
  fixture.retrieveCrypto.mockReset();
});
afterEach(() => vi.unstubAllGlobals());
afterAll(async () => {
  vi.unstubAllEnvs();
  await pg.close();
});
async function order() {
  await createCheckout(
    { provider: "paddle", email: "buyer@example.com" },
    randomUUID(),
    "127.0.0.1",
  );
  return (await pg.query<Order>("SELECT * FROM commerce_orders")).rows[0];
}
function payment(o: Order, eventId = "evt_1", paymentId = "pi_1") {
  return {
    orderId: o.id,
    provider: o.provider,
    checkoutId: o.provider_checkout_id!,
    paymentId,
    eventId,
    mode: o.mode,
    amount: o.amount,
    currency: o.currency,
  };
}
async function count(table: string) {
  return Number(
    (
      await pg.query<{ count: number }>(
        `SELECT COUNT(*) AS count FROM ${table}`,
      )
    ).rows[0].count,
  );
}
describe("real PostgreSQL order and outbox constraints (PGlite)", () => {
  it("keeps server price authoritative and reuses the same checkout once", async () => {
    const key = randomUUID();
    const body = { provider: "paddle", email: "BUYER@example.com" };
    const first = await createCheckout(body, key, "127.0.0.1");
    const second = await createCheckout(body, key, "127.0.0.1");
    expect(second).toEqual(first);
    expect(fixture.paddle).toHaveBeenCalledTimes(1);
    const stored = (await pg.query<Order>("SELECT * FROM commerce_orders"))
      .rows[0];
    expect(stored.amount).toBe(1900);
    expect(stored.email).toBe("buyer@example.com");
    await expect(
      createCheckout({ ...body, email: "other@example.com" }, key, "127.0.0.1"),
    ).rejects.toThrow(/already been used/);
    expect(await count("commerce_orders")).toBe(1);
  });
  it("rejects browser-supplied prices and default preview before creating an order", async () => {
    await expect(
      createCheckout(
        { provider: "paddle", email: "buyer@example.com", amount: 1 },
        randomUUID(),
        "127.0.0.1",
      ),
    ).rejects.toThrow();
    vi.stubEnv("COMMERCE_MODE", "preview");
    await expect(
      createCheckout(
        { provider: "paddle", email: "buyer@example.com" },
        randomUUID(),
        "127.0.0.1",
      ),
    ).rejects.toThrow(/not open/);
    expect(await count("commerce_orders")).toBe(0);
    expect(fixture.paddle).not.toHaveBeenCalled();
  });
  it("deduplicates repeated/concurrent payment notifications and creates one delivery", async () => {
    const o = await order();
    await Promise.all([
      markPaid(payment(o)),
      markPaid(payment(o)),
      markPaid(payment(o, "evt_2")),
    ]);
    expect(await count("commerce_events")).toBe(2);
    expect(await count("commerce_fulfillments")).toBe(1);
    expect(
      (await pg.query<Order>("SELECT * FROM commerce_orders")).rows[0].status,
    ).toBe("paid");
  });
  it("rolls back paid status and event if inserting the delivery outbox fails", async () => {
    const o = await order();
    await pg.exec(
      "ALTER TABLE commerce_fulfillments ADD CONSTRAINT test_reject_queue CHECK (false)",
    );
    try {
      await expect(markPaid(payment(o))).rejects.toThrow();
      expect(
        (await pg.query<Order>("SELECT * FROM commerce_orders")).rows[0].status,
      ).toBe("pending");
      expect(await count("commerce_events")).toBe(0);
    } finally {
      await pg.exec(
        "ALTER TABLE commerce_fulfillments DROP CONSTRAINT test_reject_queue",
      );
    }
  });
  it("prevents a capture from paying two different orders", async () => {
    const a = await order();
    await markPaid(payment(a));
    await createCheckout(
      { provider: "paddle", email: "second@example.com" },
      randomUUID(),
      "127.0.0.2",
    );
    const b = (
      await pg.query<Order>("SELECT * FROM commerce_orders WHERE id<>$1", [
        a.id,
      ])
    ).rows[0];
    await expect(markPaid(payment(b, "evt_other"))).rejects.toThrow();
    expect(
      (
        await pg.query<Order>("SELECT * FROM commerce_orders WHERE id=$1", [
          b.id,
        ])
      ).rows[0].status,
    ).toBe("pending");
    expect(await count("commerce_fulfillments")).toBe(1);
  });
  it("rejects a mismatched payment without leaving an event or outbox row", async () => {
    const o = await order();
    await expect(markPaid({ ...payment(o), amount: 1 })).rejects.toThrow(
      /match/,
    );
    expect(await count("commerce_events")).toBe(0);
    expect(await count("commerce_fulfillments")).toBe(0);
  });
  it("blocks fulfillment when refund notification arrives before payment notification", async () => {
    const o = await order();
    await markRisk("paddle", "pi_1", "early_refund", "refund");
    await markPaid(payment(o));
    expect(await count("commerce_fulfillments")).toBe(0);
    expect(
      (await pg.query<Order>("SELECT * FROM commerce_orders")).rows[0],
    ).toMatchObject({ status: "attention", risk_status: "refund" });
  });
  it("does not regress paid state when older expiry/failure arrives", async () => {
    const o = await order();
    await markPaid(payment(o));
    await markUnpaidTerminal(
      "paddle",
      o.provider_checkout_id!,
      "evt_expired",
      "expired",
    );
    expect(
      (await pg.query<Order>("SELECT * FROM commerce_orders")).rows[0].status,
    ).toBe("paid");
  });
  it("never repeats an ambiguous Paddle transaction creation", async () => {
    fixture.paddle.mockRejectedValueOnce(new Error("Network timeout"));
    const key = randomUUID();
    const body = { provider: "paddle", email: "buyer@example.com" };
    await expect(createCheckout(body, key, "ip")).rejects.toThrow();
    await expect(createCheckout(body, key, "ip")).rejects.toThrow(
      /being checked/,
    );
    expect(fixture.paddle).toHaveBeenCalledTimes(1);
    expect(
      (await pg.query<Order>("SELECT * FROM commerce_orders")).rows[0]
        .create_state,
    ).toBe("ambiguous");
  });
  it("rejects legacy providers for new orders", async () => {
    for (const provider of ["stripe", "paypal"])
      await expect(
        createCheckout(
          { provider, email: "buyer@example.com" },
          randomUUID(),
          "ip",
        ),
      ).rejects.toThrow();
    expect(await count("commerce_orders")).toBe(0);
  });
  it("never automatically creates a second crypto invoice after an unknown outcome", async () => {
    fixture.crypto.mockRejectedValue(new Error("Unknown outcome"));
    const key = randomUUID();
    const body = {
      provider: "crypto",
      email: "buyer@example.com",
      token: "usdttrc20",
    };
    await expect(createCheckout(body, key, "ip")).rejects.toThrow();
    await expect(createCheckout(body, key, "ip")).rejects.toThrow(
      /being checked/,
    );
    expect(fixture.crypto).toHaveBeenCalledTimes(1);
    expect(
      (await pg.query<Order>("SELECT * FROM commerce_orders")).rows[0]
        .create_state,
    ).toBe("ambiguous");
  });
});
describe("durable attachment email with mocked external transport", () => {
  it("sends the real verified attachment once despite repeated workers", async () => {
    const o = await order();
    await markPaid(payment(o));
    const fetcher = vi
      .fn()
      .mockImplementation(async (url: string) =>
        url.startsWith("https://private.example")
          ? new Response(url.endsWith("/archive") ? archive : pdf)
          : Response.json({ id: "email_1" }),
      );
    vi.stubGlobal("fetch", fetcher);
    expect(await processFulfillments()).toBe(1);
    expect(await processFulfillments()).toBe(0);
    const sends = fetcher.mock.calls.filter(
      (call) => call[0] === "https://api.resend.com/emails",
    );
    expect(sends).toHaveLength(1);
    const body = JSON.parse(sends[0][1].body);
    expect(Buffer.from(body.attachments[0].content, "base64")).toEqual(pdf);
    expect(body.html).toContain("attached");
    expect(body.attachments).toHaveLength(2);
    expect(Buffer.from(body.attachments[1].content, "base64")).toEqual(archive);
    expect(body.html).toContain("?asset=archive");
    expect(body.to).toEqual(["buyer@example.com"]);
    const job = (
      await pg.query<{ state: string; resend_id: string }>(
        "SELECT * FROM commerce_fulfillments",
      )
    ).rows[0];
    expect(job).toMatchObject({ state: "accepted", resend_id: "email_1" });
  });
  it("preserves exactly the same payload and idempotency key after a send timeout", async () => {
    const o = await order();
    await markPaid(payment(o));
    let calls = 0;
    const fetcher = vi.fn().mockImplementation(async (url: string) => {
      if (url.startsWith("https://private.example"))
        return new Response(url.endsWith("/archive") ? archive : pdf);
      calls++;
      if (calls === 1) throw new Error("Timeout after acceptance");
      return Response.json({ id: "email_1" });
    });
    vi.stubGlobal("fetch", fetcher);
    await processFulfillments();
    await pg.exec(
      "UPDATE commerce_fulfillments SET next_attempt=NOW()-INTERVAL '1 minute'",
    );
    await processFulfillments();
    const sends = fetcher.mock.calls.filter(
      (call) => call[0] === "https://api.resend.com/emails",
    );
    expect(sends).toHaveLength(2);
    expect(sends[0][1].body).toBe(sends[1][1].body);
    expect(sends[0][1].headers["Idempotency-Key"]).toBe(
      sends[1][1].headers["Idempotency-Key"],
    );
    expect(
      (await pg.query<{ state: string }>("SELECT * FROM commerce_fulfillments"))
        .rows[0].state,
    ).toBe("accepted");
  });
  it("does not send email if the supplied ZIP has changed", async () => {
    const o = await order();
    await markPaid(payment(o));
    const fetcher = vi
      .fn()
      .mockImplementation(
        async (url: string) =>
          new Response(url.endsWith("/archive") ? "changed archive" : pdf),
      );
    vi.stubGlobal("fetch", fetcher);
    await processFulfillments();
    expect(
      fetcher.mock.calls.some(
        (call) => call[0] === "https://api.resend.com/emails",
      ),
    ).toBe(false);
    expect(
      (
        await pg.query<{ state: string }>(
          "SELECT state FROM commerce_fulfillments",
        )
      ).rows[0].state,
    ).toBe("attention");
  });
  it("never retries an ambiguous send beyond safe idempotency retention", async () => {
    const o = await order();
    await markPaid(payment(o));
    await pg.exec(
      "UPDATE commerce_fulfillments SET first_send_at=NOW()-INTERVAL '24 hours'",
    );
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    await processFulfillments();
    expect(fetcher).not.toHaveBeenCalled();
    expect(
      (await pg.query<{ state: string }>("SELECT * FROM commerce_fulfillments"))
        .rows[0].state,
    ).toBe("attention");
  });
  it("blocks email and recovery retries for a refunded order", async () => {
    const o = await order();
    await markPaid(payment(o));
    await markRisk("paddle", "pi_1", "evt_refund", "refund");
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    expect(await processFulfillments()).toBe(0);
    expect(fetcher).not.toHaveBeenCalled();
    expect(
      (await pg.query<{ state: string }>("SELECT * FROM commerce_fulfillments"))
        .rows[0].state,
    ).toBe("attention");
  });
  it("records delivered/bounced outcomes out of order without resending", async () => {
    const o = await order();
    await markPaid(payment(o));
    await pg.exec(
      "UPDATE commerce_fulfillments SET state='accepted',resend_id='email_1'",
    );
    await pg.exec(
      "INSERT INTO commerce_email_events(event_id,resend_id,event_type) VALUES('bounce','email_1','email.bounced'),('delivered','email_1','email.delivered')",
    );
    await reconcileEmailEvents();
    expect(
      (await pg.query<{ state: string }>("SELECT * FROM commerce_fulfillments"))
        .rows[0].state,
    ).toBe("bounced");
    expect(await processFulfillments()).toBe(0);
  });
  it("does not send previously queued mail after commerce is switched to preview", async () => {
    const o = await order();
    await markPaid(payment(o));
    vi.stubEnv("COMMERCE_MODE", "preview");
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    await processFulfillments();
    expect(fetcher).not.toHaveBeenCalled();
  });
});

describe("reconciler fairness", () => {
  it("rotates failing old orders and excludes historical sandbox rows", async () => {
    for (let i = 0; i < 10; i++)
      await createCheckout(
        { provider: "paddle", email: `buyer-${i}@example.com` },
        randomUUID(),
        `ip-${i}`,
      );
    const all = (
      await pg.query<Order>("SELECT * FROM commerce_orders ORDER BY created_at")
    ).rows;
    await pg.query(
      "UPDATE commerce_orders SET mode='sandbox',updated_at=NOW()-INTERVAL '2 days' WHERE id=$1",
      [all[0].id],
    );
    await pg.exec(
      "UPDATE commerce_orders SET updated_at=NOW()-INTERVAL '1 day' WHERE mode='live'",
    );
    fixture.retrievePaddle.mockRejectedValue(new Error("Provider unavailable"));
    const first = await reconcileCommerce();
    expect(first.errors).toBe(8);
    const firstIds = fixture.retrievePaddle.mock.calls.map(
      (call) => (call[0] as Order).id,
    );
    expect(firstIds).not.toContain(all[0].id);
    const unprocessed = all.find(
      (o) => o.id !== all[0].id && !firstIds.includes(o.id),
    )!;
    fixture.retrievePaddle.mockClear();
    await reconcileCommerce();
    expect((fixture.retrievePaddle.mock.calls[0][0] as Order).id).toBe(
      unprocessed.id,
    );
  });
});

describe("durable broker dispatch", () => {
  it("publishes only the order identity with bounded retries and deduplicates dispatch", async () => {
    const o = await order();
    await markPaid(payment(o));
    vi.stubEnv("DELIVERY_RETRY_MODE", "qstash");
    vi.stubEnv("QSTASH_TOKEN", "queue-secret");
    const fetcher = vi
      .fn()
      .mockResolvedValue(Response.json({ messageId: "queue_1" }));
    vi.stubGlobal("fetch", fetcher);
    await kickoffFulfillment(o.id);
    await kickoffFulfillment(o.id);
    expect(fetcher).toHaveBeenCalledTimes(1);
    const [, init] = fetcher.mock.calls[0];
    expect(JSON.parse(init.body)).toEqual({ orderId: o.id });
    const headers = new Headers(init.headers);
    expect(headers.get("upstash-retries")).toBe("8");
    expect(headers.get("upstash-retry-delay")).toBe(
      "min(3600000,pow(2,retried)*300000)",
    );
    expect(
      (
        await pg.query<{ queue_message_id: string; state: string }>(
          "SELECT * FROM commerce_fulfillments",
        )
      ).rows[0],
    ).toMatchObject({ queue_message_id: "queue_1", state: "pending" });
  });
});
describe("lost crypto webhook recovery", () => {
  it("records a provider-retrieved pending payment without marking it paid", async () => {
    fixture.crypto.mockResolvedValue({
      id: "invoice_1",
      url: "https://nowpayments.io/payment/?iid=invoice_1",
    });
    await createCheckout(
      { provider: "crypto", email: "buyer@example.com", token: "usdttrc20" },
      randomUUID(),
      "ip",
    );
    const o = (await pg.query<Order>("SELECT * FROM commerce_orders")).rows[0];
    fixture.retrieveCrypto.mockResolvedValue(null);
    expect(await recoverCryptoPayment(o.id, "123")).toEqual({
      recovered: true,
      settled: false,
    });
    expect(
      (await pg.query<Order>("SELECT * FROM commerce_orders")).rows[0],
    ).toMatchObject({ status: "pending", provider_payment_id: "123" });
    expect(await count("commerce_fulfillments")).toBe(0);
  });
});

describe("payment acknowledgement waits for durable publication", () => {
  it("recovers initial publish failure when the provider repeats an already-paid event", async () => {
    const o = await order();
    vi.stubEnv("DELIVERY_RETRY_MODE", "qstash");
    vi.stubEnv("QSTASH_TOKEN", "queue-secret");
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json({ error: "queue unavailable" }, { status: 401 }),
      )
      .mockResolvedValueOnce(Response.json({ messageId: "queue_recovered" }));
    vi.stubGlobal("fetch", fetcher);
    const afterResponse = vi.fn();
    await expect(
      confirmPaymentAndDispatch(payment(o), afterResponse),
    ).rejects.toThrow();
    expect(
      (await pg.query<Order>("SELECT * FROM commerce_orders")).rows[0].status,
    ).toBe("paid");
    expect(
      (
        await pg.query<{
          queue_message_id: string | null;
          queue_lease: Date | null;
        }>("SELECT * FROM commerce_fulfillments")
      ).rows[0],
    ).toMatchObject({ queue_message_id: null, queue_lease: null });
    // Same provider event ID returns false from markPaid, but still must publish the pending outbox.
    await expect(
      confirmPaymentAndDispatch(payment(o), afterResponse),
    ).resolves.toBeUndefined();
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(afterResponse).not.toHaveBeenCalled();
    expect(await count("commerce_events")).toBe(1);
    expect(await count("commerce_fulfillments")).toBe(1);
    expect(
      (
        await pg.query<{ queue_message_id: string }>(
          "SELECT * FROM commerce_fulfillments",
        )
      ).rows[0].queue_message_id,
    ).toBe("queue_recovered");
  });
  it("does not acknowledge a concurrent publication until its durable receipt exists", async () => {
    const o = await order();
    await markPaid(payment(o));
    vi.stubEnv("DELIVERY_RETRY_MODE", "qstash");
    vi.stubEnv("QSTASH_TOKEN", "queue-secret");
    await pg.exec(
      "UPDATE commerce_fulfillments SET queue_lease=NOW()+INTERVAL '2 minutes'",
    );
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    await expect(
      confirmPaymentAndDispatch(payment(o), vi.fn()),
    ).rejects.toThrow(/still pending/);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("keeps direct cron-mode sending after the provider response", async () => {
    const o = await order();
    const afterResponse = vi.fn();
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    await expect(
      confirmPaymentAndDispatch(payment(o), afterResponse),
    ).resolves.toBeUndefined();
    expect(afterResponse).toHaveBeenCalledOnce();
    expect(fetcher).not.toHaveBeenCalled();
  });
});
