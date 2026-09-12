# Vladasana storefront — partner handover

Updated September 12, 2026. **The live storefront now runs on Amir’s Vercel at https://vladasana.com/Job-bundle.** Namecheap remains in Vlada’s account. The next sections also explain a future migration to Vlada’s own service accounts; a migration is optional and has not been performed. The existing portfolio remains at the repository root; the new store is a separate Next.js application in `storefront/`.

## 1. What you are receiving

- Repository: [vladasanadev/techposture](https://github.com/vladasanadev/techposture), branch **`codex/vladasana-storefront`**. Select this branch to see the new application. It has not been merged into `main`.
- Two-screen “Quiet Ambition” landing page, interactive hero, 3D PDF preview magazine, purchase flow, legal pages and branded delivery email.
- **The Developer Job Search Playbook**, one-time **$19 USD**: 12 guides (259 pages), a 22-page roadmap, a combined 281-page PDF containing those same resources, and two CSV worksheets. The email attaches the combined PDF and complete delivery ZIP, with a seven-day signed ZIP recovery link.
- Paddle Billing for cards, PayPal and eligible Apple Pay / Google Pay; NOWPayments API for selected USDT/USDC networks.
- Shared PostgreSQL order database, verified payment callbacks, durable delivery jobs, duplicate protection, delivery-status callbacks and five-minute recovery.
- Seller: **Vladyslava Kandyba, Ukraine**. Support: **support@vladasana.com**. Published voluntary refund window: **7 days**, without limiting mandatory consumer rights.

**Current launch status:** sales remain closed pending payment acceptance. The custom domain is live, Resend is verified, and automated mail sends as **Vlada <Support@Vladasana.com>**. A real email test reached the owner's Gmail inbox with SPF, DKIM and DMARC passing. The received PDF and ZIP match the approved hashes; ZIP integrity passed. The signed callback and five-minute cron are working on Amir's project. Namecheap's support mailbox is enabled; the reply test was confirmed by the owner and independently observed in the signed-in inbox on September 12. No payment was made or marked paid.

**Read [the current domain and email setup](storefront/docs/DOMAIN_EMAIL_LAUNCH.md) first.** That document identifies the running accounts, exact saved DNS, callback URLs and verification evidence. Do not recreate services or replace those DNS records simply to follow the optional migration steps below. Amir's project tracks `codex/vladasana-domain-email` in the original private source repository; this partner repository remains the mirror for handover and future deployment.

## 2. Accounts and files to have ready

| Account / material | What you need to own or control |
| --- | --- |
| GitHub | Access to `vladasanadev/techposture`; permission to install the Vercel GitHub integration for it |
| Vercel | Your team, billing, storefront project and private Blob store; Amir’s Pro project runs five-minute recovery; the mirror’s daily cron is preview-only |
| Namecheap | DNS management for `vladasana.com`, plus the existing Namecheap Private Email mailbox and DNS configuration |
| Neon | A dedicated PostgreSQL database connected to your storefront, owned through your account or your Vercel marketplace installation |
| Resend | Your sending account, verified domain, API key and webhook |
| Paddle Billing | Your verified seller account, payout details, approved website, product and price; separate sandbox account for testing |
| NOWPayments | Your merchant account, API key, IPN secret, enabled coins and correct receiving wallets |
| Support inbox | A mailbox or forwarding address that actually receives mail sent to `support@vladasana.com` |
| Paid product files | The exact finalized PDF and delivery ZIP, transferred privately by Amir; they are deliberately excluded from GitHub |

Enable account recovery and two-factor authentication. Store credentials in your password manager and Vercel environment settings, not this document or GitHub. Never enter wallet seed phrases or private keys in this application.

The magazine contains an adaptation of David McBacon's Framer component. Preserve [its attribution and license notice](storefront/docs/MAGAZINE.md); do not redistribute it as a standalone asset or template. Keeping application source private is the project's recommended handling. Repository visibility is controlled by the GitHub owner; changing it is separate from deploying the website.

## 3. Create your Vercel storefront project

1. Sign in to **your** Vercel team. Import `vladasanadev/techposture` as a **new project**, for example `vladasana-storefront`.
2. Set **Root Directory: `storefront`**, **Framework: Next.js**, **Install Command: `npm ci`**, **Build Command: `npm run build`**. Leave Output Directory at the Next.js default. Use Node.js **22.x**, matching CI.
3. Set the project's **Production Branch** to **`codex/vladasana-storefront`** under its Git/environment settings. If the first import deploys `main` and fails because `storefront/` is missing, change the branch and deploy again. A later reviewed merge into `main` can change this arrangement; do not replace the existing root portfolio.
4. Add the initial variables below to **Production**, especially `COMMERCE_MODE=preview` and `COMMERCE_LAUNCH_APPROVED=false`. Deploy and verify the build is **Ready**. A page that says checkout is being prepared is expected at this stage.
5. Keep live credentials and the production database out of general Preview deployments. Create a separate test project/database for sandbox acceptance.

The partner mirror preserves Vlada’s Hobby-compatible **daily** preview cron in `storefront/vercel.json`. That schedule is suitable for preview but is not the five-minute production recovery described here. On a future Pro deployment, change it to `*/5 * * * *` and verify scheduled execution before approving retries. Amir’s current production already uses the verified five-minute schedule. QStash is an optional engineered alternative described in [COMMERCE.md](storefront/docs/COMMERCE.md). Check current service prices and usage caps before enabling billing. [Vercel cron limits](https://vercel.com/docs/cron-jobs/usage-and-pricing).

## 4. Domain routing: current deployment and future migration

**Current address: `https://vladasana.com/Job-bundle`.** Both apex and www are verified on Amir's Vercel project; www redirects to apex. The Next.js application has a fixed `/Job-bundle` base path. The homepage and other portfolio routes are proxied to `https://techposture.vercel.app`, preserving the existing portfolio and its APIs. Keep that portfolio origin public and online.

The exact live DNS records are in [DOMAIN_EMAIL_LAUNCH.md](storefront/docs/DOMAIN_EMAIL_LAUNCH.md). No DNS work remains for the current deployment. Production requires:

```env
SITE_URL=https://vladasana.com/Job-bundle
PORTFOLIO_ORIGIN=https://techposture.vercel.app
```

For a future account migration, first deploy and test the new project with its own service connections. Use `SITE_URL=https://your-project.vercel.app/Job-bundle` while testing. Then add both custom domains to the new project, complete Vercel's ownership verification, use the exact DNS targets provided for that project, and move traffic only after acceptance. Preserve all email DNS records. Restore `SITE_URL=https://vladasana.com/Job-bundle` and redeploy before cutover.

Do not point `PORTFOLIO_ORIGIN` at the custom domain itself: that creates a proxy loop. All application, callback and payment-return URLs include `/Job-bundle`; changing DNS alone cannot create a path-based route. If using a separate subdomain instead, its application URL still includes `/Job-bundle` until a developer deliberately changes the Next.js base path.

## 5. Create your database and private file storage

### Orders: Neon PostgreSQL

Create a dedicated Neon database in your account, or install Neon from your Vercel team's Marketplace and connect it to this project's Production environment. Set `DATABASE_URL` to its TLS-enabled PostgreSQL connection URL. This database is shared by Paddle and crypto orders within this store only.

From a local checkout, enter `storefront/`, run `npm ci`, and put your operator values in the ignored `.env.local` file. Then run:

```sh
npm run commerce:migrate
npm run commerce:check-database
```

The migration applies `db/001-commerce.sql` and `db/002-paddle.sql`. The probe checks all five tables and a temporary write/rollback without creating a purchase. Do this against both your isolated sandbox database and your production database. Never point test resets at production.

### Product files: private Vercel Blob

Create a **private** Blob store in your Vercel team and connect it to this project. Upload the two files from the private owner-transfer package, preserving their bytes. The transfer package's outer ZIP is **not** the customer delivery ZIP.

| Upload file | Bytes | SHA-256 |
| --- | ---: | --- |
| `developer-job-search-playbook.pdf` | 1,067,944 | `d4638217bac98ebd075f0c8514ebb531a966a9e9a14951d370155476764b0328` |
| `developer-job-search-playbook.zip` | 2,539,601 | `b2eb9e732fb8c19801f849ea780c744e15496560773fcc1fed7cfd7584225f46` |

Copy the new private file URLs into `BUNDLE_PDF_URL` and `BUNDLE_ARCHIVE_URL`. Use this store's `BLOB_READ_WRITE_TOKEN`. Do not copy the original project's URLs unless you intentionally arrange continued access to that original store. Do not upload these files to `public/`, a GitHub release, or public Blob storage. Do not re-create the inner delivery ZIP; that changes its hash. The [bundle manifest](storefront/docs/BUNDLE_MANIFEST.json) lists the included resources.

## 6. Activate your branded email in Resend and Namecheap

1. In **your Resend account**, add `vladasana.com` as a sending domain. Select the desired supported region. Create an API key with sending access to that domain and set `RESEND_API_KEY` in Vercel.
2. Copy the DNS records generated by **your account**. The older [RESEND_DNS.md](storefront/docs/RESEND_DNS.md) records belong to the original account; **do not reuse its DKIM key for a fresh Resend account**.
3. In Namecheap Advanced DNS, add the generated records. Usually these are TXT at `resend._domainkey`, plus MX and SPF TXT at `send`; use Resend's exact hosts, values and MX priority. Namecheap's Host field uses the relative hostname rather than appending the domain twice.
4. Preserve root-domain MX records and existing support forwarding. The sending subdomain's MX record is separate from your inbound support mailbox. If Namecheap asks to change mail settings to Custom MX, preserve/re-create the existing inbound records as needed and verify incoming mail afterwards.
5. Click Verify in Resend and wait for the required records to pass. If Resend reports the domain belongs to another account, resolve ownership/transfer with the provider and the existing account owner before changing active records.
6. Set `EMAIL_FROM=Vlada <Support@Vladasana.com>` and `SUPPORT_EMAIL=support@vladasana.com`. Test inbound support email and replies separately; Resend domain verification does not create a mailbox.
7. Add a Resend webhook at **`https://vladasana.com/Job-bundle/api/webhooks/resend`** for `email.delivered`, `email.bounced`, `email.complained`, `email.failed`, `email.suppressed`. Set the new endpoint's signing secret as `RESEND_WEBHOOK_SECRET`.
8. Redeploy. During sandbox acceptance, inspect the actual received email, both attachments and sender authentication. Review existing DMARC policy before altering it; confirm legitimate website/support senders continue to pass.

The preview at `/Job-bundle/email-preview` shows the template but sends nothing. The previous `onboarding@resend.dev` test sender is not a production sender. [Resend's Namecheap guide](https://resend.com/docs/knowledge-base/namecheap).

## 7. Activate Paddle: cards, PayPal, Apple Pay and Google Pay

1. Open your **Paddle Billing** seller account, complete requested identity/business checks and payout setup. Submit the final storefront domain for website approval. Review the public product, contact, terms, privacy and refund pages, and provide ownership evidence if Paddle requests it. Approval is Paddle's decision.
2. Set the **default payment link** to `https://vladasana.com/Job-bundle/pay`.
3. Create an active product named **The Developer Job Search Playbook**, using the appropriate digital-content tax category confirmed with Paddle. Create one active price with **amount `1900`, currency `USD`, tax mode `internal`, quantity minimum/maximum `1`**. Billing cycle and trial must be null; country overrides must be empty. This integration expects one fixed, tax-inclusive $19 purchase. Do not add discounts, subscriptions or price overrides without changing and testing the code contract.
4. Create an API key with the required price-read and transaction-read/write permissions, plus a client-side token. Set `PADDLE_API_KEY`, `PADDLE_CLIENT_TOKEN`, `PADDLE_PRODUCT_ID` and `PADDLE_PRICE_ID` from that same environment.
5. Add a notification destination at **`https://vladasana.com/Job-bundle/api/webhooks/paddle`**. Subscribe to `transaction.completed`, `transaction.canceled`, `adjustment.created`, `adjustment.updated`. Save its endpoint secret as `PADDLE_WEBHOOK_SECRET`. Live destination events must come from the real platform, not only the simulator.
6. Set `PADDLE_DOMAIN_APPROVED=true` only once Paddle approves that production origin. Sandbox uses its own account, IDs, tokens, notifications and test database; sandbox client tokens begin `test_`, live tokens `live_`.

| Method | What you must do |
| --- | --- |
| Card | Enable in Paddle checkout settings; test successful, declined and canceled purchases |
| PayPal | Enable within Paddle; test it where supported. No separate PayPal API app is needed |
| Apple Pay | Enable where available, complete any domain steps Paddle requests, and test on a supported Apple device/browser with a wallet |
| Google Pay | Enable where available and test on an eligible device/browser with a configured wallet |
| Revolut | A supported Revolut-issued card can use card checkout. A dedicated Revolut Pay button is not implemented |

Paddle controls wallet availability by buyer country, currency and device. No Stripe account or separate Stripe keys are needed. Read [website approval](https://www.paddle.com/help/start/account-verification/what-is-domain-verification), [default payment link](https://developer.paddle.com/build/transactions/default-payment-link), and [payment methods](https://developer.paddle.com/concepts/payment-methods).

## 8. Activate NOWPayments crypto

Use your own merchant API key and IPN secret. If the previously supplied account is already yours, retain ownership of it and review its settings; otherwise create new credentials in your account. Configure receiving wallets in NOWPayments, enable the intended token/network pairs, and verify payout details. The application never stores a wallet private key.

The previous account passed availability/minimum checks for these nine codes; that historical check does not approve a new account or guarantee today's fees:

| Code | Currency / network |
| --- | --- |
| `usdtbsc` | USDT / BNB Smart Chain |
| `usdcbsc` | USDC / BNB Smart Chain |
| `usdtmatic` | USDT / Polygon |
| `usdcarb` | USDC / Arbitrum One |
| `usdtarb` | USDT / Arbitrum One |
| `usdcsol` | USDC / Solana |
| `usdterc20` | USDT / Ethereum |
| `usdc` | USDC / Ethereum |
| `usdttrc20` | USDT / Tron |

Set `NOWPAYMENTS_API_KEY`, `NOWPAYMENTS_IPN_SECRET`, and `NOWPAYMENTS_TOKENS` to the selected comma-separated codes. `usdcmatic` means USDC/Polygon and was excluded because it was not enabled by the previous merchant API.

Run `npm run commerce:check-crypto` with your operator environment. It makes read-only merchant availability, estimate and minimum queries, even while checkout is closed. Review current fixed-rate service fees, network fees and expected net payout against a $19 order, and confirm actual receiving wallets in the dashboard. Enable only suitable networks, then set `NOWPAYMENTS_NETWORKS_APPROVED=true`. [Historical network review](storefront/docs/NOWPAYMENTS_NETWORK_REVIEW.md); [NOWPayments API](https://nowpayments.io/api).

Each new order automatically supplies **`https://vladasana.com/Job-bundle/api/webhooks/crypto`** as its IPN callback using `SITE_URL`. Do not use the old fixed payment button/invoice: it bypasses the application's order-to-email association. The app's crypto adapter is live-only. Controlled settlement tests spend real funds and incur fees; complete them on each advertised network before promoting it. Crypto tax/refund accounting is separate from Paddle's merchant-of-record service.

## 9. Complete environment-variable checklist

Set these in the **new project's Production environment**. The defaults below keep purchases closed while you configure services. Use [`.env.example`](storefront/.env.example) as the copyable template and replace the old `SITE_URL`. Redeploy after environment changes; old deployments retain old values. All secrets are server-side: **do not add `NEXT_PUBLIC_`**.

| Variables | Initial value / source |
| --- | --- |
| `COMMERCE_MODE` | `preview` initially; `sandbox` only in the separate test project; `live` for controlled production acceptance |
| `COMMERCE_LAUNCH_APPROVED` | `false` initially; `true` only for the acceptance/launch step below |
| `BUNDLE_FINAL_APPROVED` | `true` for the supplied, hash-verified final files |
| `SITE_URL` | The full storefront URL, `https://vladasana.com/Job-bundle`, including its path and without a trailing slash |
| `SELLER_COUNTRY`, `SELLER_LEGAL_NAME` | `UA`, `Vladyslava Kandyba` |
| `PORTFOLIO_ORIGIN` | `https://techposture.vercel.app` to preserve the existing homepage |
| `SUPPORT_EMAIL` | `Support@Vladasana.com` |
| `DATABASE_URL` | Your dedicated Neon connection string |
| `BLOB_READ_WRITE_TOKEN` | Your connected private Blob store token |
| `BUNDLE_PDF_URL`, `BUNDLE_ARCHIVE_URL` | The two private HTTPS URLs from your store |
| `BUNDLE_PDF_SHA256`, `BUNDLE_ARCHIVE_SHA256` | The two exact hashes in section 5 |
| `BUNDLE_VERSION` | `developer-playbook-2026-09-08` |
| `BUNDLE_FILENAME` | `developer-job-search-playbook.pdf` |
| `BUNDLE_ARCHIVE_FILENAME` | `developer-job-search-playbook.zip` |
| `DOWNLOAD_SIGNING_SECRET` | New independent random secret, at least 32 characters |
| `CRON_SECRET` | A different random secret, at least 32 characters |
| `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET` | Your Resend sending key and this site's endpoint secret |
| `EMAIL_FROM` | `Vlada <Support@Vladasana.com>` after domain verification |
| `PADDLE_API_KEY`, `PADDLE_CLIENT_TOKEN` | Matching live or sandbox credentials |
| `PADDLE_PRODUCT_ID`, `PADDLE_PRICE_ID` | Your matching `pro_…` and `pri_…` IDs |
| `PADDLE_WEBHOOK_SECRET` | Secret for the matching site/environment notification destination |
| `PADDLE_DOMAIN_APPROVED` | `false` until production website approval |
| `NOWPAYMENTS_API_KEY`, `NOWPAYMENTS_IPN_SECRET` | Your merchant key and IPN secret |
| `NOWPAYMENTS_TOKENS` | Your checked comma-separated network codes from section 8 |
| `NOWPAYMENTS_NETWORKS_APPROVED` | `false` until your wallet/network/fee review passes |
| `DELIVERY_RETRY_MODE` | `cron` for this guide |
| `COMMERCE_RETRY_SCHEDULE_APPROVED` | `false` until the schedule is registered and authenticated execution is verified |

Leave `BUNDLE_PDF_BEARER_TOKEN` empty with Vercel Blob; it is an optional alternative-storage override for both files. Leave `QSTASH_TOKEN`, `QSTASH_CURRENT_SIGNING_KEY`, `QSTASH_NEXT_SIGNING_KEY` unset when using cron; `QSTASH_URL` is only relevant to that optional integration. Leave all `STRIPE_*` and `PAYPAL_*` variables empty for this new store; those adapters exist for historical recovery only.

A password manager can generate the two application secrets independently. Once orders exist, preserve the download-signing secret and database during migration so existing links and order history remain valid.

## 10. Verify retries and service configuration

In Vercel's Cron Jobs view, verify `/Job-bundle/api/cron/commerce` is registered every five minutes. Vercel sends `Authorization: Bearer <CRON_SECRET>` automatically when that environment value is set. Verify a scheduled request returns 200 in runtime logs and an unsigned request returns 401. Then set `COMMERCE_RETRY_SCHEDULE_APPROVED=true` and redeploy. A successful preview-mode run proves scheduling/authentication; it does not prove a paid email retry.

Use Node 22 and run from `storefront/`, with your private `.env.local`:

```sh
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm run commerce:check-database
npm run commerce:check-crypto
npm run commerce:check -- --provider=crypto --verify-file
npm run commerce:check -- --provider=paddle
```

The configuration checker will report closed launch/provider gates while preview mode is intentional. Do not switch to live merely to make that command green. `--verify-file` verifies both private files without sending email or charging money.

For CLI work, link to **your new storefront project**. Environment pulls can return `[SENSITIVE]` placeholders for protected secrets; those are not usable credentials. Supply your actual keys in an ignored operator file or run the checks in your authorized Vercel environment. Never commit environment files or echo credentials into logs.

## 11. Purchase-to-inbox acceptance and launch

### First: isolated Paddle sandbox

Create a publicly reachable test project with its own database, sandbox Paddle credentials/notifications and `SITE_URL`. Ensure deployment protection does not block provider callbacks. Set `COMMERCE_MODE=sandbox`, `COMMERCE_LAUNCH_APPROVED=true`, `BUNDLE_FINAL_APPROVED=true`, and configure verified email, private files and working retries. The production site stays closed. Sandbox sends **real emails**: use only owner-controlled inboxes. Crypto remains disabled there.

Have your developer complete and record these acceptance tests:

- [ ] Successful purchase creates one confirmed order and one delivery containing the correct PDF and ZIP; open the ZIP and inspect all resources, not only its filename.
- [ ] Email arrives from the branded sender; SPF/DKIM pass, replies reach support, and signed backup download works.
- [ ] Declined, canceled, pending, partial or mismatched payments do not deliver.
- [ ] Closing the browser after payment does not stop delivery.
- [ ] Duplicate and delayed verified payment/email callbacks do not create duplicate orders or emails.
- [ ] A controlled temporary email-service failure recovers through the actual scheduler, without changing the stored email payload or idempotency key.
- [ ] Bounce/failure events appear for operator attention; no blind repeated send follows an uncertain provider result.
- [ ] Refund/risk events block unsent delivery and recovery links; valid, expired and refunded links behave correctly.

### Then: controlled live acceptance

Once the services and sandbox tests pass, use live credentials on Production. Enable only the providers that are ready, set `COMMERCE_MODE=live` and `COMMERCE_LAUNCH_APPROVED=true`, and redeploy. This opens the configured checkout, so perform this step during your controlled acceptance window before advertising it. Paddle can launch with crypto still disabled.

Check the final domain and `/Job-bundle/api/storefront` report the intended live methods. Complete an owner-approved real purchase, settlement, email/file inspection and refund test for the advertised payment routes. Test each crypto network before offering it broadly. If any acceptance step fails, return to `COMMERCE_MODE=preview` and `COMMERCE_LAUNCH_APPROVED=false`, redeploy, and investigate while preserving order history.

Only after acceptance should you update Instagram/X links, redirect the old product page and send customer traffic. Record the final domain, deployed commit, service ownership, test dates and results privately.

## 12. Operating the store after launch

- Monitor Vercel cron/function errors, Resend failures/bounces, payment dashboard discrepancies and the support inbox. Review service usage/billing and database backup/restore settings.
- Refund money through the relevant payment provider. The app records verified risk/refund events; it does not automatically issue refunds. Already delivered attachments cannot be recalled.
- Inspect delivery attention states from `storefront/` with `node --env-file=.env.local --import tsx scripts/commerce-inspect.ts`. This reports operational records without printing buyer email addresses.
- `scripts/commerce-reconcile.ts` can verify pending payments and send queued purchases: treat it as an operational action, not a read-only health check.
- For an uncertain send, use the provider message and stored order identity with `scripts/commerce-reconcile-email.ts <order-UUID> <Resend-message-UUID>`. It verifies and records the existing message without sending another. Follow [COMMERCE.md](storefront/docs/COMMERCE.md) for full recovery instructions; never manually mark an order paid or reset ambiguous email attempts blindly.
- Keep private files and their hashes stable. New versions require an archival delivery strategy for older orders; do not overwrite purchased file identities. Preserve backups and signing keys.
- For code changes, use a branch, pass CI, deploy/test Preview with isolated services, then release the intended production branch. A deployment rollback does not reverse payments or database changes.
- Before retiring Amir's old Vercel/Neon/Blob/Resend setup, confirm your project uses only your resources and passes purchase-to-inbox acceptance. Reconcile any old orders/jobs first, preserve records and valid links, then revoke obsolete access and remove unused billing resources. Do not delete shared accounts or change existing website/email DNS as part of this cleanup.

## References for your developer

- [Environment template](storefront/.env.example)
- [Vercel technical setup](storefront/docs/VERCEL_SETUP.md)
- [Payment activation details](storefront/docs/ACTIVATE_SALES.md)
- [Commerce architecture and recovery](storefront/docs/COMMERCE.md)
- [Original delivery evidence and limitations](storefront/docs/DELIVERY_ACTIVATION.md)
- [Product manifest](storefront/docs/BUNDLE_MANIFEST.json)
- [Paddle website review](storefront/docs/PADDLE_DOMAIN_REVIEW.md)
- [Magazine attribution](storefront/docs/MAGAZINE.md)

This guide contains no credentials or paid product bytes. Share the private file-transfer package separately with the owner.
