import { CommerceError } from "../config";
export async function gatewayFetch(url: string, init: RequestInit = {}) {
  const response = await fetch(url, {
    ...init,
    cache: "no-store",
    signal: AbortSignal.timeout(18_000),
  });
  if (!response.ok)
    throw new CommerceError(
      "The payment provider could not complete this request. Please try again shortly.",
      response.status === 429 ? 429 : 502,
    );
  return response.json();
}
export function assertHostedUrl(value: string, hosts: string[]) {
  const url = new URL(value);
  if (
    url.protocol !== "https:" ||
    !hosts.includes(url.hostname) ||
    url.username ||
    url.password
  )
    throw new CommerceError(
      "The payment provider returned an invalid checkout.",
      502,
    );
  return value;
}
