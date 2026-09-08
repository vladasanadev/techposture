import { SELLER } from "../product";
export { PRODUCT } from "../product";
import { PRODUCT } from "../product";
export type Provider = "paddle" | "stripe" | "paypal" | "crypto";
export type CommerceMode = "preview" | "sandbox" | "live";
export const TOKEN_LABELS: Record<string, string> = {
  usdttrc20: "USDT · Tron",
  usdterc20: "USDT · Ethereum",
  usdtbsc: "USDT · BNB Smart Chain",
  usdc: "USDC · Ethereum",
  usdcmatic: "USDC · Polygon",
  usdcsol: "USDC · Solana",
  usdcarb: "USDC · Arbitrum One",
  usdtarb: "USDT · Arbitrum One",
  usdcbsc: "USDC · BNB Smart Chain",
  usdtmatic: "USDT · Polygon",
};
export function config(env: Record<string, string | undefined> = process.env) {
  const mode: CommerceMode =
    env.COMMERCE_MODE === "live"
      ? "live"
      : env.COMMERCE_MODE === "sandbox"
        ? "sandbox"
        : "preview";
  return {
    mode,
    siteUrl: (env.SITE_URL || "").replace(/\/$/, ""),
    databaseUrl: env.DATABASE_URL || "",
    sellerCountry: env.SELLER_COUNTRY ?? SELLER.countryCode,
    sellerName: env.SELLER_LEGAL_NAME ?? SELLER.name,
    approved: env.COMMERCE_LAUNCH_APPROVED === "true",
    finalPdfApproved: env.BUNDLE_FINAL_APPROVED === "true",
    pdfUrl: env.BUNDLE_PDF_URL || "",
    pdfBearer: env.BUNDLE_PDF_BEARER_TOKEN || env.BLOB_READ_WRITE_TOKEN || "",
    pdfSha256: env.BUNDLE_PDF_SHA256 || "",
    version: env.BUNDLE_VERSION || "",
    filename: env.BUNDLE_FILENAME || "developer-job-search-playbook.pdf",
    archiveUrl: env.BUNDLE_ARCHIVE_URL || "",
    archiveSha256: env.BUNDLE_ARCHIVE_SHA256 || "",
    archiveFilename:
      env.BUNDLE_ARCHIVE_FILENAME || "developer-job-search-playbook.zip",
    paddleKey: env.PADDLE_API_KEY || "",
    paddleClientToken: env.PADDLE_CLIENT_TOKEN || "",
    paddleSecret: env.PADDLE_WEBHOOK_SECRET || "",
    paddlePrice: env.PADDLE_PRICE_ID || "",
    paddleProduct: env.PADDLE_PRODUCT_ID || "",
    paddleApproved: env.PADDLE_DOMAIN_APPROVED === "true",
    downloadSecret: env.DOWNLOAD_SIGNING_SECRET || "",
    resendKey: env.RESEND_API_KEY || "",
    resendSecret: env.RESEND_WEBHOOK_SECRET || "",
    emailFrom: env.EMAIL_FROM || "",
    supportEmail: env.SUPPORT_EMAIL ?? SELLER.supportEmail,
    cronSecret: env.CRON_SECRET || "",
    stripeKey: env.STRIPE_SECRET_KEY || "",
    stripeSecret: env.STRIPE_WEBHOOK_SECRET || "",
    stripeAccount: env.STRIPE_ACCOUNT_ID || "",
    paypalClient: env.PAYPAL_CLIENT_ID || "",
    paypalSecret: env.PAYPAL_CLIENT_SECRET || "",
    paypalWebhook: env.PAYPAL_WEBHOOK_ID || "",
    paypalMerchant: env.PAYPAL_MERCHANT_ID || "",
    cryptoKey: env.NOWPAYMENTS_API_KEY || "",
    cryptoSecret: env.NOWPAYMENTS_IPN_SECRET || "",
    cryptoTokens: (env.NOWPAYMENTS_TOKENS || "")
      .split(",")
      .map((v) => v.trim().toLowerCase())
      .filter((v) => TOKEN_LABELS[v]),
    cryptoApproved: env.NOWPAYMENTS_NETWORKS_APPROVED === "true",
    retryMode: env.DELIVERY_RETRY_MODE === "qstash" ? "qstash" : "cron",
    retryScheduleApproved: env.COMMERCE_RETRY_SCHEDULE_APPROVED === "true",
    qstashToken: env.QSTASH_TOKEN || "",
    qstashCurrentKey: env.QSTASH_CURRENT_SIGNING_KEY || "",
    qstashNextKey: env.QSTASH_NEXT_SIGNING_KEY || "",
    qstashUrl: env.QSTASH_URL || "https://qstash.upstash.io",
  };
}
export type CommerceConfig = ReturnType<typeof config>;
function secureUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}
export function activationIssues(c: CommerceConfig): string[] {
  const issues: string[] = [];
  if (c.mode === "preview")
    issues.push("Checkout is being prepared. Payments are not open yet.");
  if (!c.approved || !c.finalPdfApproved)
    issues.push("Final product and seller launch approval are required.");
  if (!/^[A-Z]{2}$/.test(c.sellerCountry) || !c.sellerName)
    issues.push("Seller details are incomplete.");
  if (!secureUrl(c.siteUrl))
    issues.push("A secure storefront URL is required.");
  if (!c.databaseUrl) issues.push("Order storage is not configured.");
  if (
    !secureUrl(c.pdfUrl) ||
    !c.pdfBearer ||
    !/^[a-f0-9]{64}$/.test(c.pdfSha256) ||
    !c.version
  )
    issues.push("The private final PDF is not configured.");
  if (!secureUrl(c.archiveUrl) || !/^[a-f0-9]{64}$/.test(c.archiveSha256))
    issues.push("The private guide and worksheet archive is not configured.");
  if (c.downloadSecret.length < 32 || c.cronSecret.length < 32)
    issues.push("Delivery security is not configured.");
  if (
    !c.resendKey ||
    !c.resendSecret ||
    !c.emailFrom ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.supportEmail)
  )
    issues.push("Email delivery is not configured.");
  if (
    c.retryMode === "qstash"
      ? !c.qstashToken ||
        !c.qstashCurrentKey ||
        !c.qstashNextKey ||
        !/^https:\/\/qstash(?:-[a-z0-9-]+)?\.upstash\.io$/.test(c.qstashUrl)
      : !c.retryScheduleApproved
  )
    issues.push("Reliable delivery retries are not configured.");
  return issues;
}
// Operator diagnostics contain variable names, never credential values.
// The public storefront continues to return a generic unavailable message.
export function providerActivationIssues(
  provider: Provider,
  c = config(),
): string[] {
  const issues = activationIssues(c);
  const requireValue = (condition: unknown, message: string) => {
    if (!condition) issues.push(message);
  };
  if (provider === "paddle") {
    requireValue(c.paddleKey, "Set PADDLE_API_KEY.");
    requireValue(c.paddleSecret, "Set PADDLE_WEBHOOK_SECRET.");
    requireValue(
      c.paddleClientToken.startsWith(c.mode === "live" ? "live_" : "test_"),
      "Set PADDLE_CLIENT_TOKEN for the selected commerce mode.",
    );
    requireValue(
      /^pri_[a-z0-9]{26}$/.test(c.paddlePrice),
      "Set a valid PADDLE_PRICE_ID.",
    );
    requireValue(
      /^pro_[a-z0-9]{26}$/.test(c.paddleProduct),
      "Set a valid PADDLE_PRODUCT_ID.",
    );
    requireValue(
      c.mode === "sandbox" || c.paddleApproved,
      "Set PADDLE_DOMAIN_APPROVED=true after website approval.",
    );
  } else if (provider === "stripe") {
    requireValue(
      c.stripeSecret &&
        c.stripeAccount &&
        c.stripeKey.startsWith(c.mode === "live" ? "sk_live_" : "sk_test_"),
      "Historical Stripe credentials are incomplete or use the wrong mode.",
    );
  } else if (provider === "paypal") {
    requireValue(
      c.paypalClient && c.paypalSecret && c.paypalWebhook && c.paypalMerchant,
      "Historical PayPal credentials are incomplete.",
    );
  } else {
    requireValue(c.cryptoKey, "Set NOWPAYMENTS_API_KEY.");
    requireValue(c.cryptoSecret, "Set NOWPAYMENTS_IPN_SECRET.");
    requireValue(
      c.cryptoTokens.length,
      "Set NOWPAYMENTS_TOKENS to supported exact network codes.",
    );
    requireValue(
      c.cryptoApproved,
      "Set NOWPAYMENTS_NETWORKS_APPROVED=true after verifying wallets, availability and fees.",
    );
    requireValue(
      c.mode === "live",
      "This NOWPayments checkout requires COMMERCE_MODE=live.",
    );
  }
  return issues;
}
export function providerAvailable(provider: Provider, c = config()): boolean {
  return providerActivationIssues(provider, c).length === 0;
}
export function storefront(c = config()) {
  return {
    mode: activationIssues(c).length === 0 ? c.mode : "preview",
    price: PRODUCT.price,
    currency: PRODUCT.currency,
    methods: (
      [
        ["paddle", "Card / PayPal"],
        ["crypto", "USDT / USDC"],
      ] as const
    ).map(([id, label]) => ({
      id,
      label,
      available: providerAvailable(id, c),
      ...(!providerAvailable(id, c)
        ? { reason: "Checkout is being prepared. Payments are not open yet." }
        : {}),
    })),
    cryptoTokens: c.cryptoTokens.map((id) => ({ id, label: TOKEN_LABELS[id] })),
  };
}
export function requireProvider(provider: Provider) {
  const c = config();
  if (!providerAvailable(provider, c))
    throw new CommerceError(
      "Checkout is being prepared. Payments are not open yet.",
      503,
    );
  return c;
}
export class CommerceError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
