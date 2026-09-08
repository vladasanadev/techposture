# Activate Paddle, crypto and delivery

**New Vercel project or the `vladasanadev/techposture` handoff:** use [VERCEL_SETUP.md](VERCEL_SETUP.md) first. The configured storage and environment status below applies to the original Vercel project only; new projects do not inherit its credentials, paid files or service connections.

Updated September 9, 2026. Production: https://vladasana-job-bundle.vercel.app. The final product files and seller details are supplied. Private Blob delivery files, seller settings and the dedicated Neon commerce database are configured; both SQL migrations and real database read/write/rollback checks passed. Vercel Pro runs the recovery endpoint every five minutes. Resend is installed and its signed callback is verified. One owner-authorized test email with both actual attachments reached Gmail through the Resend test sender; duplicate callbacks and repeated send requests deduplicated correctly. Custom sending-domain DNS verification and a real purchase-to-inbox test remain. Checkout remains closed; no payment has been created. See [delivery activation evidence](DELIVERY_ACTIVATION.md).

## 1. Paddle account and website approval

1. Create the seller's [Paddle Billing account](https://login.paddle.com/signup). Use **Vladyslava Kandyba / Vladasana / Ukraine**, complete identity/business verification and set the seller's payout account. These are the seller's account actions; no Stripe account or separate PayPal API application is needed for this integration.
2. In **Checkout → Website approval**, submit **vladasana-job-bundle.vercel.app**, or the final custom domain if you connect one first. Review [PADDLE_DOMAIN_REVIEW.md](PADDLE_DOMAIN_REVIEW.md). All required public pages are linked from the site.
3. Supply product ownership/licensing evidence and other documents if Paddle requests them. The full bundle remains private; share it directly with Paddle if requested. Approval is Paddle's decision.
4. In **Checkout → Checkout settings → Default payment link**, set **https://vladasana-job-bundle.vercel.app/pay**. This is required even for one-time products. If changing domains, also update `SITE_URL`, callback URLs and website approval together. Sandbox has separate settings and does not require website approval.
5. Verify that **support@vladasana.com** is a working mailbox and monitor it. The website publishes the owner's **7-day refund policy**; longer statutory rights remain intact.

Sources: [domain review](https://www.paddle.com/help/start/account-verification/what-is-domain-verification), [default payment link](https://developer.paddle.com/build/transactions/default-payment-link), [Buyer Terms](https://www.paddle.com/legal/buyer-terms).

## 2. Paddle product, price and keys

Create an active product named **The Developer Job Search Playbook**. Use the applicable ebook/digital-content tax category in Paddle (request access/confirmation from Paddle if the appropriate category is not available). Describe the 12 guides, roadmap, combined PDF and worksheets accurately.

Create an active price with exactly these settings:

| Setting | Required value |
| --- | --- |
| Billing | One-time: `billing_cycle: null` |
| Trial | None: `trial_period: null` |
| Amount/currency | `unit_price: { amount: "1900", currency_code: "USD" }` |
| Tax mode | `internal` (tax included in $19) |
| Quantity | Minimum 1, maximum 1 |
| Country-specific price overrides | Empty |
| Discounts/subscription/automatic currency changes | Not used by this fixed-price checkout |

The server verifies this price before creating checkout, then independently verifies transaction, product/price, amount, currency, captured payment, email and purchased-file identity before fulfillment. A browser success event never delivers files. Do not change dashboard pricing without updating the storefront and verification contract together. Tax calculation and remittance for Paddle purchases are handled by Paddle. Crypto is separate and requires the seller's appropriate tax treatment.

In **Developer tools → Authentication**, create an API key with `price.read`, `transaction.read`, and `transaction.write` access. Create a client-side token. In this Vercel project's **Settings → Environment Variables**, add the matching environment's values:

| Variable | Paddle value |
| --- | --- |
| `PADDLE_API_KEY` | Server API key; keep secret |
| `PADDLE_CLIENT_TOKEN` | Client-side token: `test_…` for sandbox, `live_…` for live |
| `PADDLE_PRODUCT_ID` | The `pro_…` product ID |
| `PADDLE_PRICE_ID` | The `pri_…` price ID |
| `PADDLE_WEBHOOK_SECRET` | Notification destination's endpoint secret, from step 3 |
| `PADDLE_DOMAIN_APPROVED` | `true` only after Paddle approves the production checkout origin |

Do not prefix server keys with `NEXT_PUBLIC_`. The app passes only the client token to a valid payment page. Sandbox uses `https://sandbox-api.paddle.com`; live uses `https://api.paddle.com`. Keep environments, accounts, price IDs, databases and webhook secrets separate. [Create products and prices](https://developer.paddle.com/build/products/create-products-prices).

## 3. Paddle webhook and each non-crypto payment method

In **Developer tools → Notifications**, create a webhook destination:

**https://vladasana-job-bundle.vercel.app/api/webhooks/paddle**

Subscribe to **transaction.completed**, **transaction.canceled**, **adjustment.created**, **adjustment.updated**. Use real platform event traffic for the live destination, not simulator-only traffic. Copy its endpoint secret into `PADDLE_WEBHOOK_SECRET`. Requests are authenticated against the exact raw body and a five-second signature timestamp window; keep server time correct. Duplicate and out-of-order notifications are handled by the database. Completed transactions are retrieved from Paddle; refunds and chargebacks stop unsent delivery and block recovery downloads. Pending refund requests do not count as an approved refund.

All these payment methods share this webhook and fulfillment path:

| Method | Activation and acceptance |
| --- | --- |
| Credit/debit cards | Enable in **Paddle → Checkout → Checkout settings**. Complete a sandbox success, decline and canceled checkout. Confirm a successful capture creates one order and one delivery. |
| PayPal | Enable PayPal in those Paddle settings. No standalone PayPal client ID, secret or webhook is required. Test the option in a supported buyer region/currency and complete the real sandbox flow available in Paddle. |
| Apple Pay | Enable in Paddle settings and complete any domain-verification steps Paddle shows for the checkout domain. Test on an eligible Apple device/browser with a configured wallet. No separate custom Apple Pay implementation is required. |
| Google Pay | Enable in Paddle settings. Test with an eligible browser/device and wallet. No separate Google Pay server integration is required. |
| Revolut | Eligible Revolut-issued cards can use the card option. A distinct **Revolut Pay** wallet button is not implemented or promised; it is not on Paddle's currently documented payment-method list. |

Paddle decides which methods appear based on buyer country, currency and device. A toggle does not guarantee every buyer will see every wallet. [Payment methods](https://developer.paddle.com/concepts/payment-methods), [webhook verification](https://developer.paddle.com/webhooks/about/signature-verification), [completed transaction](https://developer.paddle.com/webhooks/transactions/transaction-completed).

## 4. Database and final file delivery

Already provisioned for the original Vercel project: **vladasana-commerce**, Neon Free, region `iad1`, resource `store_kp5KqLBis5rLtksu`. `DATABASE_URL` is connected to Production only. Both payment providers share these five commerce tables. Both migrations and a real read/write/rollback probe passed without creating any orders. For a new project, connect this authorized storefront database or provision another dedicated database, then run:

```sh
node --env-file=.env.local --import tsx scripts/commerce-migrate.ts
node --env-file=.env.local --import tsx scripts/commerce-check-database.ts
```

The supplied paid files are already in the project-specific private Blob store **vladasana-playbook-private** (`store_GX6IXp65l4JDPX5O`). The loader uses the auto-injected `BLOB_READ_WRITE_TOKEN` (or explicit `BUNDLE_PDF_BEARER_TOKEN`). Both files require authenticated HTTPS and exact hashes. `docs/BUNDLE_MANIFEST.json` records every delivered file and page count. The delivery ZIP is 2,539,601 bytes; the PDF is 1,067,944 bytes. Public preview images expose only covers and contents.

Configured variables: `BUNDLE_PDF_URL`, `BUNDLE_PDF_SHA256`, `BUNDLE_ARCHIVE_URL`, `BUNDLE_ARCHIVE_SHA256`, `BUNDLE_VERSION=developer-playbook-2026-09-08`, `BUNDLE_FILENAME`, `BUNDLE_ARCHIVE_FILENAME`, `BUNDLE_FINAL_APPROVED=true`. `DOWNLOAD_SIGNING_SECRET` is already generated; do not replace it casually because existing recovery links depend on it.

The email attaches both the 281-page PDF and the entire ZIP. The backup download link supplies the ZIP, including the same PDF, separate guides, roadmap and CSV worksheets. It expires after seven days; locally saved files remain usable. Old orders are bound to their recorded version and both hashes. Changing to a new product version pauses old-version automatic delivery until an explicit archival delivery strategy is added; never silently replace purchased bytes.

## 5. Resend email and reliable retries

1. Resend marketplace terms are accepted and **vladasana-delivery** is installed on Free, `us-east-1`, for **vladasana.com**. Add [the three exact sending records](RESEND_DNS.md) at Namecheap, preserve the existing inbound mail-forwarding MX records, and wait for Resend to verify the domain.
2. Set `RESEND_API_KEY` and `EMAIL_FROM=Vlada <delivery@vladasana.com>`. `SUPPORT_EMAIL=support@vladasana.com` is configured; replies go to this actual mailbox. Verify receiving mail independently of Resend sending-domain verification.
3. Already configured: **https://vladasana-job-bundle.vercel.app/api/webhooks/resend**, all five delivery/failure events, and `RESEND_WEBHOOK_SECRET` in Vercel. Actual delivered and replayed events both returned 200; duplicate event storage was prevented.
4. Review the [on-brand email preview](https://vladasana-job-bundle.vercel.app/email-preview). Verify a real test delivery to Gmail and another inbox: both attachments open, all files are present, the private download works, reply-to reaches support, and SPF/DKIM/DMARC work as configured. A preview email is not an actual inbox test.
5. The selected retry service is the existing **Vercel Pro five-minute cron** at **/api/cron/commerce**. `DELIVERY_RETRY_MODE=cron` and `CRON_SECRET` are configured. The source schedule is `*/5 * * * *`. Set `COMMERCE_RETRY_SCHEDULE_APPROVED=true` only after registration and authenticated execution have been verified. A preview-mode execution proves scheduler/authentication, not a successful email retry; test real failure/recovery after Resend activation.

QStash remains an optional alternative. Set `DELIVERY_RETRY_MODE=qstash` with its token, current/next signing keys and URL, and verify signed delivery, retries and dead-letter handling before switching. If moving to Vercel Hobby, replace the five-minute Vercel schedule with a daily sweep and use QStash for prompt retries; Hobby cannot deploy the shipped five-minute schedule. No QStash account is needed on the current Pro setup. [Vercel cron limits](https://vercel.com/docs/cron-jobs/usage-and-pricing).

Uncertain email requests reuse exactly the same payload and idempotency key. They stop for operator review after 23 hours or repeated failures. Do not clear leases or resend blindly after an ambiguous result. [Resend attachments](https://resend.com/docs/dashboard/emails/attachments), [Vercel private Blob](https://vercel.com/docs/vercel-blob/private-storage).

## 6. Crypto: USDT and USDC

1. Create the seller's [NOWPayments](https://nowpayments.io) merchant account and complete its required checks. Configure receiving wallets inside that account. Never supply seed phrases or private keys to the app.
2. Set `NOWPAYMENTS_API_KEY`, `NOWPAYMENTS_IPN_SECRET`. The app supplies **https://vladasana-job-bundle.vercel.app/api/webhooks/crypto** as the invoice callback.
3. The September 9 authenticated merchant check approved nine stablecoin/network pairs for the $19 fixed-rate checkout; `usdcmatic` was not enabled for this key and is excluded. `NOWPAYMENTS_TOKENS` is prefilled in `.env.example`, including Arbitrum, USDC/BNB and USDT/Polygon. See [the verified network mapping and minimums](NOWPAYMENTS_NETWORK_REVIEW.md). Recheck if the merchant, payout configuration, fees or product price changes.
4. Only then set `NOWPAYMENTS_NETWORKS_APPROVED=true`. The app intentionally enables crypto only in `COMMERCE_MODE=live`; it does not pretend a sandbox transfer is settled money.
5. Arrange seller-approved controlled live tests on each advertised network, including settlement, IPN, one email, download and refund support. These spend funds and incur network fees, and have not been performed here. Partial, pending, mismatched and expired payments must not deliver. Confirm the seller's applicable crypto tax treatment separately from Paddle.

NOWPayments is independent of Paddle. Use the same final-file, database, email and retry configuration. A transaction hash or screenshot from a buyer never establishes paid status. [NOWPayments API](https://nowpayments.io/api).

## 7. Acceptance, then open sales

Use a separate publicly reachable test deployment and test database for Paddle sandbox; deployment protection must not block provider webhooks. Set `COMMERCE_MODE=sandbox`, matching sandbox Paddle values, approved test fixtures and both approval flags there. Resend still sends actual emails even during sandbox tests, so use only your own test recipients. Keep Production in preview.

Test successful and failed checkout, every advertised wallet, browser closed after payment, duplicate/delayed webhooks, refunds before and after payment notifications, a temporary email failure, successful retry, a bounced email and a valid/expired/refunded private download. Verify **one confirmed purchase → one email with both actual files**. Local transport mocks do not replace this test.

```sh
npm run lint
npm run typecheck
npm test
npm run build
node --env-file=.env.local --import tsx scripts/commerce-check.ts --verify-file
```

For Production, finish account/domain approval, migrate the production database, use only live service credentials, verify delivery, then set **COMMERCE_MODE=live**, **COMMERCE_LAUNCH_APPROVED=true**, **PADDLE_DOMAIN_APPROVED=true** and redeploy. `BUNDLE_FINAL_APPROVED` is already true for the supplied product. Paddle can launch while crypto remains disabled. Check `/api/storefront` shows `live` and only fully configured methods available. Then perform an owner-approved controlled live purchase/refund before directing customers to the page.

Operational recovery, including ambiguous Paddle creation: [COMMERCE.md](COMMERCE.md). No separate Stripe or PayPal integration is required for new sales; legacy code exists only to reconcile historical orders.
