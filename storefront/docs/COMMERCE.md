# Commerce and delivery handoff

This storefront ships with **checkout disabled** until account activation and real acceptance. New non-crypto checkout uses **Paddle Billing**; crypto remains NOWPayments. The owner's final guides are uploaded to a dedicated private Vercel Blob store, verified by SHA-256 and denied anonymously (403). Seller identity and a 7-day refund policy are published. Paddle accounts, production database, verified email delivery and reliable retry configuration still need activation. No actual payment or customer email was created during development.

For account-by-account setup and the exact launch sequence, start with [Activate sales and PDF delivery](ACTIVATE_SALES.md). This document covers the technical contracts and operational recovery.

## Implemented purchase flow

1. `GET /api/storefront` returns the server-owned $19 USD price and availability of Paddle and crypto. With no environment variables, `mode` is `preview` and every method is unavailable.
2. `POST /api/checkout` accepts only `{provider,email,token?}` with provider `paddle` or `crypto` and a UUID `Idempotency-Key` header. The request must originate on `SITE_URL`. Database rate limits apply to hashed email and trusted Vercel source IP. The server creates an immutable order at 1,900 USD cents; browser-supplied prices are rejected.
3. The customer goes to `/pay` for a server-created Paddle transaction, or to a NOWPayments-hosted invoice. Card data and wallet credentials never enter this application. The opaque order token returns them to `/success?order=...`; that page polls a sanitized server status. A browser return never proves payment.
4. A verified webhook and an independent provider API retrieval confirm the order, exact amount/currency, merchant account, live/test mode, and completed settlement. A transaction records the paid event and inserts one unique order/version fulfillment job. Payment identities cannot be reused across orders. Risk events received before payment confirmation are retained and block delivery.
5. In QStash mode, the payment request waits for durable queue publication before returning a successful provider acknowledgement. When an approved five-minute cron provides retry recovery instead, `after()` runs the worker after the response. The worker retrieves the private, approved PDF and ZIP, verifies each purchased SHA-256 hash and file signature, attaches both to an on-brand Resend email, and stores the provider message ID. A signed seven-day ZIP recovery download accompanies the attachments. Delivery means provider-reported delivery; API acceptance is reported as sent.
6. Durable SQL leases and the cron reconciler recover interrupted work. Identical canonical email bodies and stable idempotency keys are reused inside Resend's retention window. Unresolved sends stop for review after 23 hours or repeated failures. Refunds/disputes stop unsent delivery and invalidate recovery downloads; bounce/complaint events never trigger an automatic resend.

## Payment services and account setup

Paddle is the merchant of record for new non-crypto transactions. Cards, PayPal, Apple Pay and Google Pay are selected in its checkout settings and shown when eligible. NOWPayments handles exact token/network crypto invoices separately. Legacy Stripe and PayPal adapters and webhook routes are retained for historical payment reconciliation; the new checkout schema rejects their provider IDs.

`lib/commerce/providers/paddle.ts` requires an active $19 USD tax-inclusive one-time price (`tax_mode: internal`, quantity 1, no trials/overrides/discounts). It creates the transaction on the server with order/version/PDF/ZIP metadata. The paid verifier retrieves the transaction from the mode-specific, account-authenticated API and checks transaction identity, customer email, product and price, metadata, currency, no subscription or discount, total, credit/balance and captured payment amount. `transaction.completed`, not browser success or merely `paid`, authorizes fulfillment. Approved adjustments and chargeback warnings are persisted before payment confirmation so out-of-order delivery remains safe.

Sources: [Paddle transaction checkout](https://developer.paddle.com/build/transactions/pass-transaction-checkout), [webhook signatures](https://developer.paddle.com/webhooks/about/signature-verification), [payment methods](https://developer.paddle.com/concepts/payment-methods), [NOWPayments API](https://nowpayments.io/api), [Resend attachments](https://resend.com/docs/dashboard/emails/attachments).

## Provisioning and activation

Use a new Postgres database for this storefront. Do not reuse another project's database, payment credentials, deployment environment, or files. Copy `.env.example` to a private `.env.local` and supply secrets through Vercel's environment settings for deployment. The CLI scripts do not automatically load `.env.local`; on Node 20+ the following commands load it explicitly from the project root:

```sh
node --env-file=.env.local --import tsx scripts/commerce-migrate.ts
node --env-file=.env.local --import tsx scripts/commerce-check.ts --verify-file
```

Required common configuration:

- `SITE_URL`: canonical HTTPS storefront origin, without a trailing path.
- `SELLER_COUNTRY`, `SELLER_LEGAL_NAME`, `SUPPORT_EMAIL`: actual seller and support details.
- `DATABASE_URL`: durable Postgres connection string; use your database provider's TLS requirement.
- `BUNDLE_PDF_URL`: an HTTPS endpoint serving the final combined bundle PDF directly from private storage. It must require `Authorization: Bearer <BUNDLE_PDF_BEARER_TOKEN>`, return bytes without redirects, and remain private. An authenticated object-storage proxy or private storage API can supply this endpoint. A public URL with an ignored authorization header is not private storage.
- `BUNDLE_ARCHIVE_URL`, `BUNDLE_ARCHIVE_SHA256`, `BUNDLE_ARCHIVE_FILENAME`: matching private ZIP, verified separately and bound to each new order.
- `BUNDLE_PDF_BEARER_TOKEN` (or `BLOB_READ_WRITE_TOKEN`), `BUNDLE_PDF_SHA256`, `BUNDLE_VERSION`, `BUNDLE_FILENAME`: immutable release identity. Compute the SHA-256 locally from the approved file. Do not put the paid product in `public/` or Git.
- `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET`, `EMAIL_FROM`: verified sending domain and endpoint secret. Complete Resend's SPF/DKIM DNS and appropriate DMARC policy; verify the actual inbox and attachment.
- `DOWNLOAD_SIGNING_SECRET`, `CRON_SECRET`: distinct random secrets of at least 32 characters.
- Reliable retries: choose `DELIVERY_RETRY_MODE=qstash` and supply `QSTASH_TOKEN`, `QSTASH_CURRENT_SIGNING_KEY`, `QSTASH_NEXT_SIGNING_KEY`, plus the account-specific `QSTASH_URL` if regional; alternatively choose `DELIVERY_RETRY_MODE=cron` with `COMMERCE_RETRY_SCHEDULE_APPROVED=true` only after an authenticated five-minute scheduler is actually active. Checkout activation requires one of these complete configurations.
- `COMMERCE_LAUNCH_APPROVED=true` and `BUNDLE_FINAL_APPROVED=true`: set only after seller/product/legal/account checks and end-to-end acceptance.
- `COMMERCE_MODE=live`: opens only fully configured methods. `preview` is the safe deployed default. `sandbox` enables only appropriately configured Paddle sandbox integration for a separate test deployment/database; it never enables NOWPayments. Sandbox orders and real orders cannot reuse a checkout.

A syntactically complete configuration does not prove provider eligibility, account balances/limits, private-storage access control, tax compliance, correct DNS, or delivery. Complete the acceptance checklist below before setting launch approval. Public availability intentionally does not expose individual secret/configuration names.

**Price and tax:** price is a single server constant in `lib/product.ts`: 1,900 USD cents. The UI uses the same public $19 price. Paddle calculates/remits applicable tax within the tax-inclusive total. Discounts, subscriptions and automatic currency conversion are not used. Crypto is outside Paddle and its tax treatment must be confirmed separately.

## Webhook subscriptions

| Provider    | Endpoint               | Required events                                                                                                                                                                            |
| ----------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Paddle | `/api/webhooks/paddle` | `transaction.completed`, `transaction.canceled`, `adjustment.created`, `adjustment.updated` |
| Stripe (historical) | `/api/webhooks/stripe` | `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`, `charge.refunded`, `charge.dispute.created` |
| PayPal (historical) | `/api/webhooks/paypal` | `CHECKOUT.ORDER.APPROVED`, `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.REFUNDED`, `PAYMENT.CAPTURE.REVERSED`, `CUSTOMER.DISPUTE.CREATED`                                                 |
| NOWPayments | `/api/webhooks/crypto` | Set invoice IPN callback to this URL; settlement status is independently retrieved                                                                                                         |
| Resend      | `/api/webhooks/resend` | `email.delivered`, `email.bounced`, `email.complained`, `email.failed`, `email.suppressed` where available; other signed email events are safely recorded                                  |

Use raw body delivery and the exact endpoint's signing secret. Resend signatures enforce a five-minute replay window. NOWPayments uses recursively sorted JSON with HMAC SHA-512. PayPal verification preserves the original event JSON bytes when forwarding them to the verification service. Never use an unverified provider event, browser query parameter, or support assertion to mark an order paid.

## Queue, cron and reliable retries

**Recommended on Hobby: QStash.** In `DELIVERY_RETRY_MODE=qstash`, confirmed purchases are published to `/api/queue/fulfill`. The official QStash `Receiver` validates the current/next signing key, JWT lifetime, exact destination URL and raw-body hash before doing any work. Only the internal order UUID enters the broker; customer email and file data remain in the application. Jobs receive eight retries with a custom delay capped at one hour, keeping normal retries inside Resend's retention window. The endpoint returns a retryable response while a transient job is pending, and a nonretryable response requiring merchant review for an ambiguous/bounced job. SQL state remains authoritative even when broker messages are duplicated.

A publish failure leaves the durable SQL outbox intact and returns a failed acknowledgement so the payment provider retries. Replaying an already-recorded paid event still publishes its missing queue job. Concurrent requests do not acknowledge a publication lease without a durable queue receipt. Cron republishes never-queued or stale pending jobs. QStash publish receipts and dispatch leases are recorded in the database. Monitor its dead-letter queue; the service is an additional account whose plan and delivery timeout must suit the attachment workload. [QStash retries](https://upstash.com/docs/qstash/features/retry), [QStash publish API](https://upstash.com/docs/qstash/api-reference/messages/publish-a-message).

The Vercel baseline may use a daily Hobby-compatible cron at `/api/cron/commerce` as a disaster-recovery sweep when QStash handles timely retries. **If using `DELIVERY_RETRY_MODE=cron` without QStash, schedule this endpoint at least every five minutes** on an eligible Vercel plan or an external authenticated scheduler before approving that configuration. Daily-only email retry recovery is not an approved live setup: an ambiguous send can pass Resend's safe window and require manual review. Configure `Authorization: Bearer <CRON_SECRET>`; Vercel sets this header from the matching environment variable for its cron.

Cron prioritizes already-confirmed delivery jobs (or republishes them to QStash), then checks a bounded batch of pending payments. Successful and failing polling attempts both rotate so a broken old order cannot starve later orders. Orders from other environment modes are excluded. Workers lease jobs atomically with `FOR UPDATE SKIP LOCKED`; interrupted leases expire after five minutes. The amount of batch work and plan limits should be revisited if sales volume grows.

Local operator commands:

```sh
node --env-file=.env.local --import tsx scripts/commerce-reconcile.ts
node --env-file=.env.local --import tsx scripts/commerce-inspect.ts
```

The first can verify payments and send already authorized queued purchases when live configuration is active. The second only reports actionable records, excluding customer email addresses, opaque tokens, and file credentials.

## Recovery procedures and deliberate limits

**Lost initial crypto IPN:** a hosted invoice does not include a payment ID until the customer creates a payment. Ordinary cron can poll a payment only after a verified IPN supplied that ID. If every initial IPN is missing, find the matching invoice and payment ID in the NOWPayments merchant dashboard, then call the protected `POST /api/commerce/recover-crypto` with `Authorization: Bearer <CRON_SECRET>` and JSON `{ "orderId": "<internal order UUID>", "paymentId": "<provider numeric ID>" }`. The server independently retrieves that payment under the merchant API key, checks the invoice, internal order, USD price, exact token/network and settled amount, and only then attaches its identity or queues fulfillment. This is a verified recovery path, not a manual paid-state override. No provider login/password or wallet private key is needed. Provider dashboard IPN replay is also valid.

**Ambiguous checkout creation:** Paddle and NOWPayments creation have no undocumented idempotency assumptions. Unknown create responses and abandoned creation leases are marked `ambiguous` for review; there is no automatic replacement transaction. For Paddle, find the transaction in the seller's dashboard by its stored internal order ID in `custom_data`, then call protected `POST /api/commerce/recover-paddle` with `Authorization: Bearer <CRON_SECRET>` and JSON `{ "orderId": "<internal order UUID>", "transactionId": "txn_…" }`. This retrieves the transaction and validates all metadata and price bindings before attaching it. A completed transaction must pass the normal payment verifier before delivery. A mismatched reference is rejected. Do not reset order identity or mark orders paid manually.

**Ambiguous email after 23 hours:** never clear `first_send_at` or blindly resend. Search Resend by the persisted `order_id` tag or known message ID. To reconcile an existing email, use:

```sh
node --env-file=.env.local --import tsx scripts/commerce-reconcile-email.ts <order-UUID> <Resend-message-UUID>
```

This read/record operation independently retrieves the message and requires exact recipient, subject, and prepared HTML equality before recording its provider state. It sends nothing. If no matching provider message can be established, an operator must investigate with Resend before authorizing a separate resend. There is intentionally no unauthenticated resend endpoint or automated duplicate-risk override.

**Attachment size:** each PDF or ZIP may be up to 25 MiB, with a total encoded email body under 39 MiB, below Resend's 40 MB provider limit. Smaller PDFs work better in inboxes. Oversize, changed-hash, unapproved, missing, or incorrect file signatures blocks delivery with an actionable state. The recovery route streams verified bytes, as recommended for [Vercel function response size limits](https://vercel.com/kb/guide/how-to-bypass-vercel-body-size-limit-serverless-functions).

**Bundle versions:** order version and both file hashes are immutable. The initial implementation serves one active PDF-and-ZIP version. Changing `BUNDLE_VERSION`/file configuration pauses older undelivered jobs and older recovery links for merchant attention; already-sent attachments remain available to buyers. Retain old private files. Add a version-to-private-asset catalog before routine multi-version releases rather than overwriting old order identity.

**Refunds and disputes:** provider-verified risk events block unfulfilled orders and recovery links. Money movement and dispute resolution stay in provider dashboards; this storefront does not issue refunds automatically. An attachment already delivered cannot be revoked. Payment-risk and email delivery events are stored separately.

## Verification performed and launch acceptance still required

Automated tests include real PostgreSQL execution through PGlite for transactional paid/outbox rollback, duplicate and concurrent event handling, unique capture use, refund-before-paid ordering, unavailable-mode behavior, worker leases/retries, immutable resend payloads, provider error rotation, and bounce precedence. Gateway transport is mocked; no paid provider was called. Signature, amount, currency, merchant, token/network, file-integrity, expiry, HTML escaping and malicious URL tests cover the core trust boundaries. PGlite tests execute Postgres SQL but do not simulate separate production database processes or all provider behavior.

Before live sales, complete real Paddle sandbox card and PayPal purchases in a separate test environment, verify immediate and delayed webhooks, duplicate events, refund and bounce behavior, both actual inbox attachments plus expired link behavior, and a seller-approved live crypto test on each advertised token/network. NOWPayments has no live-money-free sandbox path enabled here. Verify that its hosted invoice keeps the intended network and that callback/recovery matches the actual merchant account. Public previews are now actual covers and contents from the supplied bundle. Confirm business identity, country/account eligibility, policies, tax treatment, actual price, sending DNS, support mailbox, production domain, reliable retry configuration, and monitoring ownership. Verify QStash signature/retry/dead-letter behavior in the real account if that retry mode is selected.
