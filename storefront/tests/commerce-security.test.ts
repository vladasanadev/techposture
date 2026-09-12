import { describe, it, expect } from "vitest";
import { createHmac } from "node:crypto";
import {
  canonicalJson,
  equalSecret,
  minorUnits,
  opaqueToken,
  signDownload,
  verifyCryptoSignature,
  verifyDownload,
  verifyResendSignature,
} from "../lib/commerce/security";
import {
  activationIssues,
  config,
  providerAvailable,
  providerActivationIssues,
  storefront,
} from "../lib/commerce/config";
import { retryDecision } from "../lib/commerce/fulfillment";
const liveEnv = {
  COMMERCE_MODE: "live",
  DELIVERY_RETRY_MODE: "cron",
  COMMERCE_RETRY_SCHEDULE_APPROVED: "true",
  COMMERCE_LAUNCH_APPROVED: "true",
  BUNDLE_FINAL_APPROVED: "true",
  SELLER_COUNTRY: "GB",
  SELLER_LEGAL_NAME: "Test Seller",
  SITE_URL: "https://store.example",
  DATABASE_URL: "postgres://test",
  BUNDLE_PDF_URL: "https://private.example/bundle",
  BUNDLE_PDF_BEARER_TOKEN: "file-secret",
  BUNDLE_PDF_SHA256: "a".repeat(64),
  BUNDLE_VERSION: "1",
  BUNDLE_ARCHIVE_URL: "https://private.example/archive",
  BUNDLE_ARCHIVE_SHA256: "b".repeat(64),
  DOWNLOAD_SIGNING_SECRET: "d".repeat(32),
  CRON_SECRET: "c".repeat(32),
  RESEND_API_KEY: "test",
  RESEND_WEBHOOK_SECRET: "whsec_test",
  EMAIL_FROM: "Seller <delivery@example.com>",
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
  NOWPAYMENTS_TOKENS: "usdttrc20,usdc",
  NOWPAYMENTS_NETWORKS_APPROVED: "true",
};
describe("fail-closed storefront activation", () => {
  it("does not expose configured secrets and disables all methods by default", () => {
    const result = storefront(config({}));
    expect(result.mode).toBe("preview");
    expect(result.methods.every((x) => !x.available)).toBe(true);
    expect(result.vlink.available).toBe(false);
    expect(result.price).toBe(19);
    expect(JSON.stringify(result)).not.toContain("sk_");
  });
  it("only opens the external vLink in a fully approved live storefront", () => {
    expect(storefront(config(liveEnv)).vlink.available).toBe(true);
    for (const mode of ["preview", "sandbox"]) {
      expect(
        storefront(config({ ...liveEnv, COMMERCE_MODE: mode })).vlink.available,
      ).toBe(false);
    }
    for (const key of [
      "COMMERCE_LAUNCH_APPROVED",
      "BUNDLE_FINAL_APPROVED",
      "RESEND_API_KEY",
    ]) {
      expect(
        storefront(config({ ...liveEnv, [key]: "" })).vlink.available,
      ).toBe(false);
    }
    // vLink never enters the automatically settled provider list.
    expect(
      storefront(config(liveEnv)).methods.map((method) => method.id),
    ).toEqual(["paddle", "crypto"]);
  });
  it("enables each fully configured provider and disables absent providers independently", () => {
    const c = config(liveEnv);
    expect(activationIssues(c)).toEqual([]);
    expect(
      ["stripe", "paypal", "crypto"].map((v) =>
        providerAvailable(v as "stripe", c),
      ),
    ).toEqual([true, true, true]);
    expect(providerAvailable("stripe", { ...c, stripeKey: "sk_test_x" })).toBe(
      false,
    );
    expect(providerAvailable("paypal", { ...c, paypalMerchant: "" })).toBe(
      false,
    );
    expect(providerAvailable("crypto", { ...c, cryptoApproved: false })).toBe(
      false,
    );
  });
  it.each([
    "BUNDLE_FINAL_APPROVED",
    "COMMERCE_LAUNCH_APPROVED",
    "BUNDLE_PDF_SHA256",
    "BUNDLE_PDF_BEARER_TOKEN",
    "DATABASE_URL",
    "SELLER_COUNTRY",
    "DOWNLOAD_SIGNING_SECRET",
    "RESEND_WEBHOOK_SECRET",
  ])("missing %s prevents checkout", (key) => {
    expect(providerAvailable("stripe", config({ ...liveEnv, [key]: "" }))).toBe(
      false,
    );
  });
  it("requires live Paddle domain approval and matching public-token mode", () => {
    const paddle = config({
      ...liveEnv,
      PADDLE_API_KEY: "key",
      PADDLE_WEBHOOK_SECRET: "secret",
      PADDLE_CLIENT_TOKEN: "live_token",
      PADDLE_PRICE_ID: "pri_" + "a".repeat(26),
      PADDLE_PRODUCT_ID: "pro_" + "a".repeat(26),
      PADDLE_DOMAIN_APPROVED: "true",
    });
    expect(providerAvailable("paddle", paddle)).toBe(true);
    expect(
      providerAvailable("paddle", { ...paddle, paddleApproved: false }),
    ).toBe(false);
    expect(
      providerAvailable("paddle", {
        ...paddle,
        paddleClientToken: "test_token",
      }),
    ).toBe(false);
    expect(providerAvailable("paddle", { ...paddle, paddleKey: "" })).toBe(
      false,
    );
    expect(
      providerAvailable("paddle", {
        ...paddle,
        mode: "sandbox",
        paddleApproved: false,
        paddleClientToken: "test_token",
      }),
    ).toBe(true);
  });
  it("never permits crypto sandbox as live money", () => {
    expect(
      providerAvailable(
        "crypto",
        config({ ...liveEnv, COMMERCE_MODE: "sandbox" }),
      ),
    ).toBe(false);
  });
  it("retains all ten seller-selected stablecoin networks while approval keeps checkout closed", () => {
    const tokens =
      "usdttrc20,usdterc20,usdc,usdtbsc,usdcmatic,usdcsol,usdcarb,usdtarb,usdcbsc,usdtmatic";
    const c = config({
      ...liveEnv,
      NOWPAYMENTS_TOKENS: tokens,
      NOWPAYMENTS_NETWORKS_APPROVED: "false",
    });
    expect(c.cryptoTokens).toEqual(tokens.split(","));
    expect(storefront(c).cryptoTokens).toHaveLength(10);
    expect(providerAvailable("crypto", c)).toBe(false);
    expect(providerAvailable("crypto", { ...c, cryptoApproved: true })).toBe(
      true,
    );
  });
  it("reports missing crypto keys even when all shared delivery services are configured", () => {
    const c = config({
      ...liveEnv,
      NOWPAYMENTS_API_KEY: "",
      NOWPAYMENTS_IPN_SECRET: "",
    });
    expect(activationIssues(c)).toEqual([]);
    expect(providerActivationIssues("crypto", c)).toEqual([
      "Set NOWPAYMENTS_API_KEY.",
      "Set NOWPAYMENTS_IPN_SECRET.",
    ]);
    expect(providerAvailable("crypto", c)).toBe(false);
  });
  it("keeps provider-specific diagnostics and secret values out of the public response", () => {
    const c = config({
      ...liveEnv,
      NOWPAYMENTS_API_KEY: "private-provider-key",
      NOWPAYMENTS_IPN_SECRET: "",
    });
    expect(JSON.stringify(providerActivationIssues("crypto", c))).not.toContain(
      "private-provider-key",
    );
    const result = JSON.stringify(storefront(c));
    expect(result).not.toContain("private-provider-key");
    expect(result).not.toContain("NOWPAYMENTS_IPN_SECRET");
  });
});
describe("exact monetary values", () => {
  it("preserves decimal money without floating point math", () => {
    expect(minorUnits("19.00")).toBe(1900n);
    expect(minorUnits("19.0000")).toBe(1900n);
    expect(minorUnits("0.00000001", 18)).toBe(10000000000n);
    expect(minorUnits("123456789012345678901.01")).toBe(
      12345678901234567890101n,
    );
  });
  it.each(["19.001", "-19", "NaN", "1e4", "Infinity", " 19", "+19"])(
    "rejects invalid amount %s",
    (value) => expect(() => minorUnits(value)).toThrow(),
  );
});
describe("cryptographic webhook validation", () => {
  it("canonicalizes nested NOWPayments objects and preserves array order", () =>
    expect(canonicalJson({ z: { b: 2, a: 1 }, a: [{ b: 1, a: 2 }, 3] })).toBe(
      '{"a":[{"a":2,"b":1},3],"z":{"a":1,"b":2}}',
    ));
  it("accepts valid HMAC and rejects body/signature tampering", () => {
    const raw = '{"payment_status":"finished","payment_id":123}';
    const signature = createHmac("sha512", "secret")
      .update(canonicalJson(JSON.parse(raw)))
      .digest("hex");
    expect(() => verifyCryptoSignature(raw, signature, "secret")).not.toThrow();
    expect(() =>
      verifyCryptoSignature(raw.replace("123", "124"), signature, "secret"),
    ).toThrow();
    expect(() => verifyCryptoSignature(raw, signature, "wrong")).toThrow();
  });
  it("validates raw Resend payloads, timestamp replay window, and rotation signatures", () => {
    const now = 1_800_000_000_000;
    const key = Buffer.from("strong-test-key");
    const raw = '{"type":"email.delivered"}';
    const timestamp = String(now / 1000);
    const sig = createHmac("sha256", key)
      .update(`msg_1.${timestamp}.${raw}`)
      .digest("base64");
    const headers = new Headers({
      "svix-id": "msg_1",
      "svix-timestamp": timestamp,
      "svix-signature": `v1,invalid v1,${sig}`,
    });
    expect(() =>
      verifyResendSignature(
        raw,
        headers,
        `whsec_${key.toString("base64")}`,
        now,
      ),
    ).not.toThrow();
    expect(() =>
      verifyResendSignature(
        raw,
        headers,
        `whsec_${key.toString("base64")}`,
        now + 301_000,
      ),
    ).toThrow();
    expect(() =>
      verifyResendSignature(
        raw + " ",
        headers,
        `whsec_${key.toString("base64")}`,
        now,
      ),
    ).toThrow();
  });
  it("compares secrets safely and issues unguessable opaque order references", () => {
    expect(equalSecret("abc", "abc")).toBe(true);
    expect(equalSecret("abc", "abcd")).toBe(false);
    const token = opaqueToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(token).not.toBe(opaqueToken());
  });
});
describe("private expiring download", () => {
  const secret = "a".repeat(32),
    id = "12345678-1234-1234-1234-123456789abc";
  it("binds order and version and rejects expired/tampered links", () => {
    const token = signDownload(id, "v1", 2000, secret);
    expect(verifyDownload(token, secret, 1_000_000)).toEqual({
      id,
      version: "v1",
      expires: 2000,
    });
    expect(() => verifyDownload(token, secret, 2_000_000)).toThrow(/expired/);
    expect(() => verifyDownload(token + "x", secret, 1_000_000)).toThrow();
    expect(() => verifyDownload(token, "b".repeat(32), 1_000_000)).toThrow();
  });
  it("refuses weak or missing signing configuration", () =>
    expect(() => signDownload(id, "v1", 2000, "short")).toThrow());
});
describe("durable send retries", () => {
  it("retries boundedly within Resend idempotency retention", () =>
    expect(retryDecision(new Date(0), 2, 60_000)).toEqual({
      state: "pending",
      delaySeconds: 120,
    }));
  it("requires reconciliation before the 24 hour key expires", () =>
    expect(retryDecision(new Date(0), 2, 23 * 3600_000).state).toBe(
      "attention",
    ));
  it("stops repeated failures instead of issuing unlimited email", () =>
    expect(retryDecision(null, 12).state).toBe("attention"));
});
