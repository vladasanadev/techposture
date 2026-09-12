/** Public mount point shared by browser requests and static assets. */
export const STOREFRONT_BASE_PATH = "/Job-bundle";

/** Next Link/router add basePath themselves; use this for fetch, img and plain anchors. */
export function storefrontPath(path: string): string {
  if (!path.startsWith("/") || path.startsWith("//"))
    throw new Error("A storefront path must be root-relative.");
  return `${STOREFRONT_BASE_PATH}${path === "/" ? "" : path}`;
}

/** Preserve the storefront path when resolving email images and other absolute URLs. */
export function storefrontUrl(siteUrl: string, path: string): string {
  if (!path.startsWith("/") || path.startsWith("//"))
    throw new Error("A storefront path must be root-relative.");
  return new URL(path.slice(1), `${siteUrl.replace(/\/$/, "")}/`).href;
}
