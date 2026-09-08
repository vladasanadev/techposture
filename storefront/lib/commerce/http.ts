import { ZodError } from "zod";
import { CommerceError, config } from "./config";
export const json = (data: unknown, status = 200) =>
  Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
export function apiError(error: unknown) {
  if (error instanceof CommerceError)
    return json({ error: error.message }, error.status);
  if (error instanceof ZodError)
    return json({ error: "Please check your email and payment details." }, 400);
  if (error instanceof SyntaxError)
    return json({ error: "Invalid request." }, 400);
  console.error(
    "Commerce request failed:",
    error instanceof Error ? error.name : "UnknownError",
  );
  return json(
    { error: "This request could not be completed. Please try again shortly." },
    503,
  );
}
export async function rawBody(request: Request, maxBytes = 128 * 1024) {
  if (Number(request.headers.get("content-length") || 0) > maxBytes)
    throw new CommerceError("Request is too large.", 413);
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > maxBytes) {
      await reader.cancel();
      throw new CommerceError("Request is too large.", 413);
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}
export function verifyOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const c = config();
  if (!origin || origin !== new URL(c.siteUrl || request.url).origin)
    throw new CommerceError("Please start checkout from the storefront.", 403);
}
