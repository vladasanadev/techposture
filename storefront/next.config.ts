import type { NextConfig } from "next";
import { STOREFRONT_BASE_PATH } from "./lib/site-path";
const config: NextConfig = {
  basePath: STOREFRONT_BASE_PATH,
  async rewrites() {
    const origin = process.env.PORTFOLIO_ORIGIN;
    // Preserve existing lowercase order links while exposing the requested
    // /Job-bundle/Success URL. A rewrite avoids case-insensitive redirect loops.
    const beforeFiles = [{ source: "/Success", destination: "/success" }];
    if (!origin) return { beforeFiles, afterFiles: [], fallback: [] };
    const url = new URL(origin);
    if (url.protocol !== "https:" || url.username || url.password || url.pathname !== "/")
      throw new Error("PORTFOLIO_ORIGIN must be an HTTPS origin.");
    return {
      beforeFiles,
      afterFiles: [],
      fallback: [{
        source: "/:path((?!Job-bundle(?:/|$)).*)",
        destination: `${url.origin}/:path`,
        basePath: false,
      }],
    };
  },
  poweredByHeader: false,
  devIndicators: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};
export default config;
