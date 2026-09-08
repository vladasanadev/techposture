import { afterEach, describe, it, expect, vi } from "vitest";
import { config } from "../lib/commerce/config";
import {
  loadBundlePdf,
  loadBundleArchive,
  MAX_PDF_BYTES,
} from "../lib/commerce/pdf";
import { sha256 } from "../lib/commerce/security";
const bytes = Buffer.from("%PDF-1.7\nA final product fixture\n%%EOF");
const c = {
  ...config({}),
  finalPdfApproved: true,
  pdfUrl: "https://private.example/bundle",
  pdfBearer: "private-key",
  pdfSha256: sha256(bytes),
};
afterEach(() => vi.unstubAllGlobals());
describe("private attachment integrity", () => {
  it("fetches a verified final PDF with authorization and no redirects", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(bytes));
    vi.stubGlobal("fetch", fetcher);
    expect(await loadBundlePdf(c)).toEqual(bytes);
    expect(fetcher).toHaveBeenCalledWith(
      c.pdfUrl,
      expect.objectContaining({
        headers: { Authorization: "Bearer private-key" },
        redirect: "error",
        cache: "no-store",
      }),
    );
  });
  it("rejects a changed file, HTML login page, or insecure source", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(bytes)));
    await expect(
      loadBundlePdf({ ...c, pdfSha256: "a".repeat(64) }),
    ).rejects.toThrow(/verification/);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("<html>Login</html>")),
    );
    await expect(loadBundlePdf(c)).rejects.toThrow(/verification/);
    await expect(
      loadBundlePdf({ ...c, pdfUrl: "http://private.example/bundle" }),
    ).rejects.toThrow(/HTTPS/);
  });
  it("stops oversized payloads before creating a base64 email body", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(bytes, {
          headers: { "Content-Length": String(MAX_PDF_BYTES + 1) },
        }),
      ),
    );
    await expect(loadBundlePdf(c)).rejects.toThrow(/size limit/);
  });
  it("never fetches an unapproved placeholder product", async () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    await expect(
      loadBundlePdf({ ...c, finalPdfApproved: false }),
    ).rejects.toThrow(/not ready/);
    expect(fetcher).not.toHaveBeenCalled();
  });
});

describe("private guide archive", () => {
  const archive = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x01]);
  it("requires the correct ZIP signature and purchased hash", async () => {
    const archiveConfig = {
      ...c,
      archiveUrl: "https://private.example/archive",
      archiveSha256: sha256(archive),
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(async () => new Response(archive)),
    );
    expect(await loadBundleArchive(archiveConfig)).toEqual(archive);
    await expect(
      loadBundleArchive(archiveConfig, "b".repeat(64)),
    ).rejects.toThrow(/verification/);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(bytes)));
    await expect(
      loadBundleArchive({ ...archiveConfig, archiveSha256: sha256(bytes) }),
    ).rejects.toThrow(/verification/);
  });
});
