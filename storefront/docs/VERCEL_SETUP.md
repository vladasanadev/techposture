# Vercel setup for the storefront handoff

Prepared September 9, 2026. New purchases use **Paddle Billing + NOWPayments API**. The storefront creates a unique $19 invoice for each crypto order and saves the buyer email before redirecting. Signed payment notifications are verified against the provider API; only a matching, fully settled payment enters the durable PDF + ZIP email queue. Do not embed the fixed invoice `4684374406`: it has no corresponding storefront order.

## GitHub and deployment location

Destination requested: `vladasanadev/techposture`. Its existing root app is a separate Vite portfolio. The handoff adds this Next.js application under **`storefront/`** on **`codex/vladasana-storefront`**, preserving the existing app and repository history. Import that branch in a **separate Vercel project**, with **Root Directory = `storefront`**, **Framework Preset = Next.js**, **Install Command = `npm ci`**, **Build Command = `npm run build`**, and the default Next.js output directory. Do not use the portfolio's Vite framework preset, `dist` output or root-level rewrites.

The repository must be private before uploading the adapted magazine source, per this project's `AGENTS.md` and [component attribution](MAGAZINE.md). The handoff is prepared locally while that condition is unmet; a prepared branch is not a completed push.

An existing Vercel project does not acquire the new GitHub repository automatically. Git connection, deployment branch, environment variables and storage connections are separate settings. This work does not change the portfolio's production deployment. A push to the handoff branch alone does not move production traffic.

## Add values in Vercel

Use **Settings → Environment Variables → Production** in the storefront's Vercel project. `.env.example` is a complete template. All keys below are server-side environment variables: do not add `NEXT_PUBLIC_`. After editing variables, redeploy; existing deployments keep their old values. Keep Preview environments isolated from live credentials and live order storage. [Vercel environment settings](https://vercel.com/docs/environment-variables/managing-environment-variables).

| Group | Variables and values |
| --- | --- |
| Start closed | `COMMERCE_MODE=preview`, `COMMERCE_LAUNCH_APPROVED=false`, `BUNDLE_FINAL_APPROVED=true` |
| Website | `SITE_URL` = the storefront's final HTTPS origin, without a path or trailing slash. The existing preview is `https://vladasana-job-bundle.vercel.app`; **replace this for a new project/domain**. |
| Seller | `SELLER_COUNTRY=UA`, `SELLER_LEGAL_NAME=Vladyslava Kandyba`, `SUPPORT_EMAIL=support@vladasana.com` |
| Orders | `DATABASE_URL` = dedicated PostgreSQL TLS connection string; run the migrations below |
| Crypto secrets | `NOWPAYMENTS_API_KEY`, `NOWPAYMENTS_IPN_SECRET` from the seller's NOWPayments account |
| Crypto networks | `NOWPAYMENTS_TOKENS` = comma-separated exact enabled codes; `NOWPAYMENTS_NETWORKS_APPROVED=false` until verified |
| Paddle secrets and IDs | `PADDLE_API_KEY`, `PADDLE_CLIENT_TOKEN`, `PADDLE_WEBHOOK_SECRET`, `PADDLE_PRODUCT_ID`, `PADDLE_PRICE_ID`, `PADDLE_DOMAIN_APPROVED=false` until approved |
| Email | `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET`, `EMAIL_FROM=Vlada <delivery@vladasana.com>`; verify the sending domain and the separate support mailbox |
| Delivery security | `DOWNLOAD_SIGNING_SECRET` and `CRON_SECRET`: independent random secrets, each at least 32 characters |
| Prompt retries | Current Pro setup: `DELIVERY_RETRY_MODE=cron`, `COMMERCE_RETRY_SCHEDULE_APPROVED=true` after verified registration/execution, plus `CRON_SECRET` |

The shipped Vercel cron runs every five minutes and requires Pro or Enterprise. The original project uses the existing Pro plan. Verify the schedule and authenticated execution again for a new project. QStash remains an alternative (`DELIVERY_RETRY_MODE=qstash`, token, current/next signing keys and URL). A Hobby deployment must change the Vercel schedule to daily and use QStash or another authenticated five-minute scheduler; a daily sweep alone is insufficient.

### NOWPayments dashboard

Configure receiving wallets and enable the chosen token/network pairs. Current application allowlist:

| Code | Asset and network |
| --- | --- |
| `usdttrc20` | USDT / Tron |
| `usdterc20` | USDT / Ethereum |
| `usdtbsc` | USDT / BNB Smart Chain |
| `usdc` | USDC / Ethereum |
| `usdcmatic` | USDC / Polygon |
| `usdcsol` | USDC / Solana |
| `usdcarb` | USDC / Arbitrum One |
| `usdtarb` | USDT / Arbitrum One |
| `usdcbsc` | USDC / BNB Smart Chain |
| `usdtmatic` | USDT / Polygon |

The September 9 screenshot selected ten pairs, but the authenticated merchant API enabled nine: `usdcmatic` was absent. `.env.example` now prefills only the nine that passed the live fixed-rate minimum check. See [NOWPAYMENTS_NETWORK_REVIEW.md](NOWPAYMENTS_NETWORK_REVIEW.md) for the results and fee schedule. Recheck for a new merchant or payout configuration; this does not establish actual settlement or inbox delivery.

Select only networks currently enabled for this merchant whose minimums and fees suit a $19 product. The code does not choose a payout wallet or network for the seller. It checks merchant availability, the estimate and the minimum before creating an invoice. The callback is supplied automatically as **`${SITE_URL}/api/webhooks/crypto`**. If configuring a dashboard callback, use that same URL and matching IPN secret. No fixed payment-link ID is needed. [NOWPayments API](https://nowpayments.io/api).

### Other service callbacks

| Service | URL and events |
| --- | --- |
| Paddle | `${SITE_URL}/api/webhooks/paddle`: `transaction.completed`, `transaction.canceled`, `adjustment.created`, `adjustment.updated` |
| Paddle default payment link | `${SITE_URL}/pay`; approve this storefront's domain |
| Resend | `${SITE_URL}/api/webhooks/resend`: `email.delivered`, `email.bounced`, `email.complained`, `email.failed`, `email.suppressed` where available |
| QStash | The app publishes authenticated jobs to `${SITE_URL}/api/queue/fulfill`; no manually created subscription is needed |
| Recovery cron | `${SITE_URL}/api/cron/commerce`, authenticated with `Authorization: Bearer <CRON_SECRET>` |

Paddle product and fixed one-time tax-inclusive $19 price settings are in [ACTIVATE_SALES.md](ACTIVATE_SALES.md#2-paddle-product-price-and-keys). Cards, PayPal and eligible Apple/Google wallets share the Paddle integration. Separate Stripe and PayPal credentials are not required for new sales.

## Private product storage

The original Vercel project already has a private Blob store with the complete PDF and delivery ZIP. A new Vercel project does **not** inherit those connections or environment variables. Connect the authorized existing store to the new storefront project if it is in the same account, or upload the supplied files to a new **private** store in the seller's account. Use the exact delivery ZIP recorded in `BUNDLE_MANIFEST.json`; re-zipping it changes its hash. Keep paid files outside Git and `public/`.

Set both authenticated URLs and the matching read/write token:

```dotenv
BLOB_READ_WRITE_TOKEN=<private-store-token>
BUNDLE_PDF_URL=<private-https-url-to-combined-pdf>
BUNDLE_ARCHIVE_URL=<private-https-url-to-delivery-zip>
BUNDLE_PDF_SHA256=d4638217bac98ebd075f0c8514ebb531a966a9e9a14951d370155476764b0328
BUNDLE_ARCHIVE_SHA256=b2eb9e732fb8c19801f849ea780c744e15496560773fcc1fed7cfd7584225f46
BUNDLE_VERSION=developer-playbook-2026-09-08
BUNDLE_FILENAME=developer-job-search-playbook.pdf
BUNDLE_ARCHIVE_FILENAME=developer-job-search-playbook.zip
```

For other authenticated HTTPS storage, use `BUNDLE_PDF_BEARER_TOKEN`; it is used for both files. Preserve existing signing secrets if moving existing orders: changing them invalidates recovery links. The email attaches the 281-page combined PDF and complete ZIP; the signed ZIP recovery link expires after seven days.

## Validate after entering keys

From `storefront/`, run `npm ci`. Link the CLI to the **storefront Vercel project**, then pull the selected environment to a fresh, ignored local file. Avoid overwriting an existing local environment file. The commands below use that file explicitly; they never print its contents.

```sh
npx vercel link
npx vercel env pull .env.vercel-check.local --environment=production
node --env-file=.env.vercel-check.local --import tsx scripts/commerce-migrate.ts
node --env-file=.env.vercel-check.local --import tsx scripts/commerce-check-database.ts
node --env-file=.env.vercel-check.local --import tsx scripts/commerce-check-crypto.ts
node --env-file=.env.vercel-check.local --import tsx scripts/commerce-check.ts --provider=crypto --verify-file
node --env-file=.env.vercel-check.local --import tsx scripts/commerce-check.ts --provider=paddle
```

The migration creates only this application's order tables in the configured database. The database probe verifies schema, reads, a temporary rate-limit write and rollback; it never creates an order or sends email. Vercel Secret values may pull as `[SENSITIVE]`; never use those placeholders against a provider. Run checks within an authorized Vercel build when protected values are needed. The crypto probe performs **GET requests only** against the live merchant API, including when the storefront is in preview: it creates no invoice, charge, email or order. It reports each configured network's availability, estimate and minimum. NOWPayments offers a sandbox, but this application's crypto adapter is deliberately live-only; Paddle sandbox is supported separately.

The configuration checker exits nonzero for missing shared services or the selected provider's missing settings. An exit failure while launch flags are closed is expected: it lists the remaining gates and must not be bypassed just to get a green result. `--verify-file` can verify private file hashes while checkout remains closed. Successful configuration and GET probes do not prove payment settlement, database connectivity, webhook delivery, retries or inbox delivery.

If you use `.env.local`, shortcuts are `npm run commerce:migrate`, `npm run commerce:check-crypto`, and `npm run commerce:check -- --provider=crypto --verify-file`.

Complete the acceptance sequence in [ACTIVATE_SALES.md](ACTIVATE_SALES.md#7-acceptance-then-open-sales): Paddle sandbox, duplicate/delayed events, delivery retries, refunds, valid/expired downloads and controlled seller-approved crypto settlement. Then approve configured networks, the Paddle domain and the live launch flags, redeploy and verify `/api/storefront`. Direct customers to the site only after a controlled live purchase delivers the actual PDF and ZIP. No live payment has been performed. The original project completed an owner-authorized email-only test through Resend’s test sender; this does not activate a new project or prove purchase-to-inbox delivery. See [delivery evidence](DELIVERY_ACTIVATION.md).
