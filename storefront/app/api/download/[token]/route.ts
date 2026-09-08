import { config, CommerceError } from "@/lib/commerce/config";
import { getOrder } from "@/lib/commerce/db";
import { apiError } from "@/lib/commerce/http";
import { loadBundlePdf, loadBundleArchive } from "@/lib/commerce/pdf";
import { verifyDownload } from "@/lib/commerce/security";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const c = config();
    const data = verifyDownload((await params).token, c.downloadSecret);
    const order = await getOrder(data.id);
    if (
      !order ||
      order.status !== "paid" ||
      order.mode !== c.mode ||
      order.risk_status ||
      order.bundle_version !== data.version
    )
      throw new CommerceError(
        "This download is not available. Please contact support.",
        403,
      );
    if (order.bundle_version !== c.version)
      throw new CommerceError(
        "Please contact support for this bundle version.",
        410,
      );
    const archive =
      new URL(_request.url).searchParams.get("asset") === "archive";
    if (
      archive &&
      (!order.archive_sha256 || order.archive_sha256 !== c.archiveSha256)
    )
      throw new CommerceError(
        "Please contact support for this bundle archive.",
        410,
      );
    const pdf = archive
      ? await loadBundleArchive(c, order.archive_sha256!)
      : await loadBundlePdf(c, order.pdf_sha256);
    const filename = (archive ? c.archiveFilename : c.filename).replace(
      /[^a-zA-Z0-9._-]/g,
      "_",
    );
    let offset = 0;
    const stream = new ReadableStream<Uint8Array>({
      pull(controller) {
        if (offset >= pdf.length) {
          controller.close();
          return;
        }
        controller.enqueue(
          new Uint8Array(pdf.subarray(offset, offset + 65536)),
        );
        offset += 65536;
      },
    });
    return new Response(stream, {
      headers: {
        "Content-Type": archive ? "application/zip" : "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
        "Referrer-Policy": "no-referrer",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
