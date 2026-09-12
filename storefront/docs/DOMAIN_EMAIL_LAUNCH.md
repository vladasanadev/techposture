# Vladasana domain and support email — September 12, 2026

## Live ownership and routing

The storefront is live at **https://vladasana.com/Job-bundle** on **Amir's Vercel**: team `amirs-projects-d9680079`, project `vladasana-job-bundle` (`prj_ebjuksuNLAxtPtYolO9WDsYBsJkO`). `www.vladasana.com` redirects to the apex, preserving the path. Both project domains are verified and HTTPS works.

The original portfolio still appears at **https://vladasana.com/**. The storefront's Next.js `basePath` is `/Job-bundle`; a fallback rewrite proxies other paths, including existing portfolio API routes, to **https://techposture.vercel.app**. Keep that portfolio deployment online and publicly accessible. Do not change `PORTFOLIO_ORIGIN` to `vladasana.com` or `www.vladasana.com`: that would create a proxy loop. DNS routes hostnames, while this application routes the `/Job-bundle` path.

Production Git tracking is **`codex/vladasana-domain-email`** in the private source repo `TheDudeCommits/vladasana-job-bundle`. Pushes to that branch deploy to Amir's production project. The partner mirror remains `vladasanadev/techposture`, branch `codex/vladasana-storefront`, application directory `storefront/`. Its root portfolio is preserved; it is not the Git source currently attached to Amir's storefront project.

## Settings already configured

| Production setting | Value |
| --- | --- |
| `SITE_URL` | `https://vladasana.com/Job-bundle` |
| `PORTFOLIO_ORIGIN` | `https://techposture.vercel.app` |
| `EMAIL_FROM` | `Vlada <Support@Vladasana.com>` |
| `SUPPORT_EMAIL` | `Support@Vladasana.com` |
| `DELIVERY_RETRY_MODE` | `cron` |
| Vercel cron | `/Job-bundle/api/cron/commerce`, every five minutes on Amir's Pro team |
| Public sales | Closed: `COMMERCE_MODE=preview`, launch approval false |

The existing dedicated Neon database, private Blob product storage, Resend key, signed email callback secret, NOWPayments keys, download secret and cron secret remain connected. These resources stay in Amir's account; source-code copies do not transfer them.

## Namecheap DNS saved and independently verified

Keep BasicDNS nameservers `dns1.registrar-servers.com` and `dns2.registrar-servers.com`. Mail Settings is **Custom MX**, allowing Private Email at the root and Resend's return-path records at `send` simultaneously.

| Type | Host | Value | Priority |
| --- | --- | --- | --- |
| A | `@` | `216.150.1.1` | — |
| A | `@` | `216.150.16.1` | — |
| CNAME | `www` | `f96df4aa236701fb.vercel-dns-016.com.` | — |
| MX | `@` | `mx1.privateemail.com.` | 10 |
| MX | `@` | `mx2.privateemail.com.` | 10 |
| TXT | `@` | `v=spf1 include:spf.privateemail.com ~all` | — |
| TXT | `privateemail._domainkey` | The owner's supplied 2048-bit Private Email DKIM record, preserved unchanged | — |
| TXT | `resend._domainkey` | The Resend public key recorded in [RESEND_DNS.md](RESEND_DNS.md) | — |
| MX | `send` | `feedback-smtp.us-east-1.amazonses.com.` | 10 |
| TXT | `send` | `v=spf1 include:amazonses.com ~all` | — |
| TXT | `_dmarc` | `v=DMARC1; p=none; adkim=r; aspf=r` | — |
| TXT | `_vercel` | `vc-domain-verify=vladasana.com,73cfcd47d28db363be06` | — |
| TXT | `_vercel` | `vc-domain-verify=www.vladasana.com,2a68872c606be09240c0` | — |

Automatic TTL except the existing Private Email DKIM at 30 minutes. Vercel's DNS configuration API reports `misconfigured=false` and `ipStatus=no-change`. Root SPF is a single record. DMARC starts in monitoring mode; review all legitimate senders before adopting a stricter policy.

## How sending and replies work

Automated delivery uses **Resend**, authenticated for `vladasana.com`, and sends as `Vlada <Support@Vladasana.com>`. Replies go to the real **Namecheap Private Email** mailbox `support@vladasana.com`. No mailbox password is required in Vercel for this arrangement. The Namecheap DKIM authenticates mail sent by Private Email; the separate Resend DKIM authenticates the application's outgoing messages.

The Namecheap support mailbox exists and is enabled. Its dashboard showed a trial ending **October 12, 2026**, with auto-renew on. The owner should check renewal/payment readiness in Namecheap. No billing changes were made during this setup.

Resend domain `ba872bae-a056-4290-a9b7-aa3fa8b2c334` is **verified**. Existing webhook `44b52bf2-a317-4452-806a-8b0933d624f8` was updated in place to:

**https://vladasana.com/Job-bundle/api/webhooks/resend**

Events: `email.delivered`, `email.bounced`, `email.complained`, `email.failed`, `email.suppressed`. The signing secret was preserved.

Other full callback URLs now use the same base path:

- Paddle: `https://vladasana.com/Job-bundle/api/webhooks/paddle`
- Paddle default payment link: `https://vladasana.com/Job-bundle/pay`
- NOWPayments: `https://vladasana.com/Job-bundle/api/webhooks/crypto` (automatically supplied on new invoices)
- Optional QStash worker: `https://vladasana.com/Job-bundle/api/queue/fulfill`
- Email preview: `https://vladasana.com/Job-bundle/email-preview`

Update any provider dashboard configured with an older root `/api/...` URL before using it. Paddle is not configured yet. Do not reuse the old fixed NOWPayments payment button: it does not associate a customer email with the app's order.

## Actual verification completed

- Public apex homepage returned the portfolio; `/Job-bundle`, legal pages, static images and storefront API returned the correct application. `www` redirected correctly. Invalid storefront paths returned 404. Existing portfolio subscription API returned its expected method rejection instead of storefront HTML.
- Browser screenshots showed the hero and real guide pages; advancing the magazine loaded the CV preview. Checkout stayed visibly closed.
- One owner-authorized email-only test was sent from the new support sender to the supplied Gmail inbox. Resend ID: `22a3e18c-c545-47d8-b5e3-02127b8551a4`. It reached **INBOX**.
- Gmail's actual message headers: **SPF pass, DKIM pass for vladasana.com, DMARC pass**. From and Reply-To were both the support address.
- Retrieved the original received MIME message and decoded both attachments. PDF: **1,067,944 bytes**, SHA-256 `d4638217bac98ebd075f0c8514ebb531a966a9e9a14951d370155476764b0328`. ZIP: **2,539,601 bytes**, SHA-256 `b2eb9e732fb8c19801f849ea780c744e15496560773fcc1fed7cfd7584225f46`. Both match the approved originals. ZIP integrity check passed for all **17 entries**.
- The real signed `email.delivered` callback reached the new production path and was stored in Neon at **2026-09-12 10:11:17 UTC**. An unsigned request returned 401.
- Scheduled requests to `/Job-bundle/api/cron/commerce` returned 200 at five-minute spacing. Preview mode pauses paid fulfillment work.
- The operator email is explicitly labeled as a test, with no purchase or payment. No order was created or manually marked paid.

Private test payload, MIME message and receipts live only in ignored `output/private/support-sender-2026-09-12-*`; the payload includes the paid files and must not be published.

## Still required

1. **Support inbox verified:** the owner confirmed receipt, and the signed-in Private Email inbox was independently inspected on September 12. The reply from the owner Gmail account addressed to Support@Vladasana.com is present. Automated sending and incoming customer replies are verified; no further mailbox login is needed for this check.
2. **Paddle activation:** seller/domain approval, matching product/price/keys and notification destination, then isolated sandbox and controlled live acceptance.
3. **Purchase-triggered delivery acceptance:** real provider-confirmed order, one fulfillment, signed download, duplicate callback handling, actual failed-send recovery and refund behavior. Crypto needs owner-funded controlled transfers. The successful operator email test does not establish these payment results.

Keep public sales closed until payment acceptance is recorded. Follow [ACTIVATE_SALES.md](ACTIVATE_SALES.md) for provider requirements, substituting the exact URLs above for historical root-path examples.
