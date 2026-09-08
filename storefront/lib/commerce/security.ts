import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { CommerceError } from "./config";
export const opaqueToken = () => randomBytes(32).toString("base64url");
export const sha256 = (input: string | Buffer) =>
  createHash("sha256").update(input).digest("hex");
export function equalSecret(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
export function minorUnits(amount: string | number, decimals = 2): bigint {
  const value = String(amount);
  if (!/^\d+(\.\d+)?$/.test(value))
    throw new CommerceError("Invalid payment amount.");
  const [whole, fraction = ""] = value.split(".");
  if (fraction.length > decimals && /[1-9]/.test(fraction.slice(decimals)))
    throw new CommerceError("Payment amount has unexpected precision.");
  return (
    BigInt(whole) * 10n ** BigInt(decimals) +
    BigInt(fraction.slice(0, decimals).padEnd(decimals, "0"))
  );
}
export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object")
    return `{${Object.keys(value)
      .sort()
      .map(
        (k) =>
          `${JSON.stringify(k)}:${canonicalJson((value as Record<string, unknown>)[k])}`,
      )
      .join(",")}}`;
  return JSON.stringify(value);
}
export function verifyCryptoSignature(
  raw: string,
  signature: string,
  secret: string,
) {
  if (!secret || !/^[a-f\d]{128}$/i.test(signature))
    throw new CommerceError("Invalid webhook signature.", 401);
  const calculated = createHmac("sha512", secret)
    .update(canonicalJson(JSON.parse(raw)))
    .digest("hex");
  if (!equalSecret(calculated, signature.toLowerCase()))
    throw new CommerceError("Invalid webhook signature.", 401);
}
export function verifyResendSignature(
  raw: string,
  headers: Headers,
  secret: string,
  now = Date.now(),
) {
  const id = headers.get("svix-id") || "";
  const timestamp = headers.get("svix-timestamp") || "";
  if (
    !secret ||
    !id ||
    !/^\d+$/.test(timestamp) ||
    Math.abs(now / 1000 - Number(timestamp)) > 300
  )
    throw new CommerceError("Invalid webhook signature.", 401);
  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = createHmac("sha256", key)
    .update(`${id}.${timestamp}.${raw}`)
    .digest("base64");
  if (
    !(headers.get("svix-signature") || "").split(" ").some((s) => {
      const [version, signature] = s.split(",");
      return (
        version === "v1" && !!signature && equalSecret(expected, signature)
      );
    })
  )
    throw new CommerceError("Invalid webhook signature.", 401);
}
export function signDownload(
  orderId: string,
  version: string,
  expires: number,
  secret: string,
) {
  if (secret.length < 32)
    throw new CommerceError("Download security is not configured.", 503);
  const payload = Buffer.from(
    JSON.stringify({ id: orderId, version, expires }),
  ).toString("base64url");
  return `${payload}.${createHmac("sha256", secret).update(payload).digest("base64url")}`;
}
export function verifyDownload(
  token: string,
  secret: string,
  now = Date.now(),
) {
  if (secret.length < 32 || token.length > 1024)
    throw new CommerceError("This download link is invalid.", 403);
  const [payload, signature, extra] = token.split(".");
  if (
    !payload ||
    !signature ||
    extra ||
    !equalSecret(
      createHmac("sha256", secret).update(payload).digest("base64url"),
      signature,
    )
  )
    throw new CommerceError("This download link is invalid.", 403);
  const data = JSON.parse(
    Buffer.from(payload, "base64url").toString("utf8"),
  ) as { id: string; version: string; expires: number };
  if (
    !/^[a-f0-9-]{36}$/.test(data.id) ||
    typeof data.version !== "string" ||
    !Number.isSafeInteger(data.expires) ||
    data.expires * 1000 <= now
  )
    throw new CommerceError(
      "This download link has expired. Please contact support.",
      410,
    );
  return data;
}

/** Verify the unmodified body; accept rotated h1 signatures and reject stale or future deliveries. */
export function verifyPaddleSignature(
  raw: string,
  header: string,
  secret: string,
  now = Date.now(),
) {
  const parts = header.split(";").map((v) => v.trim().split("="));
  const timestamps = parts
    .filter(([key]) => key === "ts")
    .map(([, value]) => value);
  const timestamp = timestamps[0] || "";
  if (
    !secret ||
    timestamps.length !== 1 ||
    !/^\d+$/.test(timestamp) ||
    Math.abs(now / 1000 - Number(timestamp)) > 5
  )
    throw new CommerceError("Invalid webhook signature.", 401);
  const expected = createHmac("sha256", secret)
    .update(`${timestamp}:${raw}`)
    .digest("hex");
  if (
    !parts.some(
      ([key, value]) =>
        key === "h1" &&
        /^[a-f0-9]{64}$/i.test(value || "") &&
        equalSecret(expected, value.toLowerCase()),
    )
  )
    throw new CommerceError("Invalid webhook signature.", 401);
}
