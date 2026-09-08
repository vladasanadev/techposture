import { createHash, createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { verifyQueueRequest } from "../lib/commerce/queue";
const current = "sig_current_test_key",
  next = "sig_next_test_key";
const body = '{"orderId":"12345678-1234-1234-1234-123456789abc"}';
function sign(
  key: string,
  subject = "https://store.example/api/queue/fulfill",
  expiry = Math.floor(Date.now() / 1000) + 60,
) {
  const header = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" }),
  ).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      iss: "Upstash",
      sub: subject,
      exp: expiry,
      nbf: Math.floor(Date.now() / 1000) - 60,
      body: createHash("sha256").update(body).digest("base64url"),
    }),
  ).toString("base64url");
  return `${header}.${payload}.${createHmac("sha256", key).update(`${header}.${payload}`).digest("base64url")}`;
}
beforeEach(() => {
  vi.stubEnv("SITE_URL", "https://store.example");
  vi.stubEnv("QSTASH_CURRENT_SIGNING_KEY", current);
  vi.stubEnv("QSTASH_NEXT_SIGNING_KEY", next);
});
afterEach(() => vi.unstubAllEnvs());
describe("QStash receiver trust boundary", () => {
  it("accepts valid current and rotating next signing keys", async () => {
    await expect(
      verifyQueueRequest(body, sign(current)),
    ).resolves.toBeUndefined();
    await expect(verifyQueueRequest(body, sign(next))).resolves.toBeUndefined();
  });
  it("rejects tampered body, wrong endpoint, expired or unsigned messages", async () => {
    await expect(
      verifyQueueRequest(body + " ", sign(current)),
    ).rejects.toThrow();
    await expect(
      verifyQueueRequest(
        body,
        sign(current, "https://other.example/api/queue/fulfill"),
      ),
    ).rejects.toThrow();
    await expect(
      verifyQueueRequest(
        body,
        sign(current, undefined, Math.floor(Date.now() / 1000) - 1),
      ),
    ).rejects.toThrow();
    await expect(verifyQueueRequest(body, "")).rejects.toThrow();
  });
});
