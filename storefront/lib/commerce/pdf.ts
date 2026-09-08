import { CommerceConfig, CommerceError } from "./config";
import { sha256 } from "./security";
export const MAX_PDF_BYTES = 25 * 1024 * 1024;
export async function loadBundlePdf(
  c: CommerceConfig,
  expectedHash = c.pdfSha256,
): Promise<Buffer> {
  return loadPrivateAsset(c, c.pdfUrl, expectedHash, "pdf");
}
export async function loadBundleArchive(
  c: CommerceConfig,
  expectedHash = c.archiveSha256,
): Promise<Buffer> {
  return loadPrivateAsset(c, c.archiveUrl, expectedHash, "zip");
}
async function loadPrivateAsset(
  c: CommerceConfig,
  url: string,
  expectedHash: string,
  kind: "pdf" | "zip",
): Promise<Buffer> {
  if (
    !c.finalPdfApproved ||
    !url ||
    !c.pdfBearer ||
    !/^[a-f0-9]{64}$/.test(expectedHash)
  )
    throw new CommerceError("The final bundle is not ready for delivery.", 503);
  const source = new URL(url);
  if (source.protocol !== "https:" || source.username || source.password)
    throw new CommerceError(
      "Private bundle source must use secure HTTPS.",
      422,
    );
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${c.pdfBearer}` },
    redirect: "error",
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok || !response.body)
    throw new CommerceError("The bundle file is temporarily unavailable.", 503);
  if (Number(response.headers.get("content-length") || 0) > MAX_PDF_BYTES) {
    await response.body.cancel();
    throw new CommerceError(
      "Bundle exceeds the email attachment size limit.",
      422,
    );
  }
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_PDF_BYTES) {
      await reader.cancel();
      throw new CommerceError(
        "Bundle exceeds the email attachment size limit.",
        422,
      );
    }
    chunks.push(value);
  }
  const bytes = Buffer.concat(chunks);
  if (
    !(kind === "pdf"
      ? bytes.subarray(0, 5).equals(Buffer.from("%PDF-"))
      : bytes.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]))) ||
    sha256(bytes) !== expectedHash
  )
    throw new CommerceError(
      "Bundle verification failed. Delivery requires merchant attention.",
      422,
    );
  return bytes;
}
