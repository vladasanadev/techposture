import { randomUUID } from "node:crypto";
import { z } from "zod";
import { CommerceError, PRODUCT, requireProvider } from "./config";
import { db, Order } from "./db";
import { opaqueToken, sha256 } from "./security";
import { createPaddle } from "./providers/paddle";
import { createCrypto } from "./providers/crypto";
const checkoutSchema = z
  .object({
    provider: z.enum(["paddle", "crypto"]),
    email: z.string().trim().email().max(254),
    token: z.string().max(32).optional(),
  })
  .strict();
export async function createCheckout(raw: unknown, key: string, ip: string) {
  const input = checkoutSchema.parse(raw);
  z.string().uuid().parse(key);
  const c = requireProvider(input.provider);
  const email = input.email.toLowerCase();
  const token =
    input.provider === "crypto" ? input.token || c.cryptoTokens[0] : null;
  if (
    input.provider === "crypto" &&
    (!token || !c.cryptoTokens.includes(token))
  )
    throw new CommerceError("Choose a supported stablecoin network.");
  const requestHash = sha256(
    JSON.stringify({ provider: input.provider, email, token }),
  );
  const order = await db().begin(async (tx) => {
    const [existing] = await tx<
      (Order & { request_hash: string })[]
    >`SELECT * FROM commerce_orders WHERE idempotency_key=${key} FOR UPDATE`;
    if (existing) {
      if (existing.request_hash !== requestHash)
        throw new CommerceError(
          "This checkout request has already been used. Start a new checkout.",
          409,
        );
      return existing;
    }
    for (const value of [`ip:${sha256(ip)}`, `email:${sha256(email)}`]) {
      const [limit] =
        await tx`INSERT INTO commerce_rate_limits(key,bucket) VALUES(${value},date_trunc('hour',NOW())) ON CONFLICT(key,bucket) DO UPDATE SET requests=commerce_rate_limits.requests+1 RETURNING requests`;
      if (limit.requests > (value.startsWith("ip:") ? 30 : 8))
        throw new CommerceError(
          "Too many checkout attempts. Please try again later.",
          429,
        );
    }
    const id = randomUUID();
    const [created] = await tx<
      Order[]
    >`INSERT INTO commerce_orders(id,public_token,idempotency_key,request_hash,email,provider,crypto_token,amount,currency,bundle_version,pdf_sha256,archive_sha256,mode) VALUES(${id},${opaqueToken()},${key},${requestHash},${email},${input.provider},${token},${PRODUCT.amount},${PRODUCT.currency},${c.version},${c.pdfSha256},${c.archiveSha256},${c.mode}) ON CONFLICT(idempotency_key) DO NOTHING RETURNING *`;
    if (created) return created;
    const [raced] = await tx<
      (Order & { request_hash: string })[]
    >`SELECT * FROM commerce_orders WHERE idempotency_key=${key}`;
    if (!raced || raced.request_hash !== requestHash)
      throw new CommerceError("Checkout request conflict.", 409);
    return raced;
  });
  if (
    order.mode !== c.mode ||
    order.bundle_version !== c.version ||
    order.pdf_sha256 !== c.pdfSha256 ||
    order.archive_sha256 !== c.archiveSha256
  )
    throw new CommerceError(
      "This checkout belongs to an earlier store configuration. Please start a new checkout.",
      409,
    );
  if (order.status === "paid")
    return { url: `${c.siteUrl}/Success?order=${order.public_token}` };
  if (order.risk_status || order.status === "expired")
    throw new CommerceError(
      "This checkout is no longer available. Please contact support if you made a payment.",
      409,
    );
  if (order.checkout_url) return { url: order.checkout_url };
  const safeCreateWindow =
    order.provider === "paypal" ? 5 * 3600_000 : 23 * 3600_000;
  if (
    order.provider !== "crypto" &&
    Date.now() - new Date(order.created_at).getTime() > safeCreateWindow
  ) {
    await db()`UPDATE commerce_orders SET create_state='ambiguous',status='attention',updated_at=NOW() WHERE id=${order.id}`;
    throw new CommerceError(
      "This checkout needs a provider check before it can be retried. Please contact support.",
      409,
    );
  }
  if (order.create_state === "ambiguous")
    throw new CommerceError(
      "This checkout is being checked. Please contact support before trying again.",
      409,
    );
  const [claimed] = await db()<
    Order[]
  >`UPDATE commerce_orders SET create_state='creating',create_lease=NOW()+INTERVAL '2 minutes' WHERE id=${order.id} AND (create_state='new' OR (create_state='creating' AND create_lease<NOW() AND provider NOT IN ('crypto','paddle'))) RETURNING *`;
  if (!claimed)
    throw new CommerceError(
      "Your checkout is being prepared. Please try again in a moment.",
      409,
    );
  try {
    const result =
      input.provider === "paddle"
        ? await createPaddle(claimed, c)
        : await createCrypto(claimed, c);
    await db()`UPDATE commerce_orders SET provider_checkout_id=${result.id},checkout_url=${result.url},create_state='ready',create_lease=NULL,updated_at=NOW() WHERE id=${claimed.id}`;
    return { url: result.url };
  } catch (error) {
    await db()`UPDATE commerce_orders SET create_state=${"ambiguous"},status=${"attention"},create_lease=NULL,updated_at=NOW() WHERE id=${claimed.id}`;
    throw error;
  }
}
