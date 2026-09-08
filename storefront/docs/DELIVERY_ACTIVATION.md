# Delivery activation — September 9, 2026

Project: `amirs-projects-d9680079/vladasana-job-bundle`.
Production: https://vladasana-job-bundle.vercel.app.
Checkout remains in preview with launch approval false.

## Database and automatic recovery

- Dedicated Neon Free database **vladasana-commerce**, `iad1`, resource `store_kp5KqLBis5rLtksu`; connected only to this storefront's Production environment. Paddle and crypto share the five commerce tables. No other project's database is reused.
- Both migrations applied. Actual database read/write/rollback passed locally and from Vercel. The repeatable operator command is `npm run commerce:check-database`; it never creates an order or sends email.
- Existing Vercel Pro schedules `/api/cron/commerce` every five minutes. `DELIVERY_RETRY_MODE=cron`, `COMMERCE_RETRY_SCHEDULE_APPROVED=true` and the existing `CRON_SECRET` are configured. No plan upgrade or QStash account was purchased.
- Project metadata verified the active schedule. A scheduled invocation at **2026-09-08 20:00:02 UTC** returned **200**; an unauthenticated request returned **401**. Preview mode still pauses fulfillment work. This establishes scheduler/authentication, not recovery of an actual paid order.

## Resend installation and callback complete

The owner accepted terms. **vladasana-delivery** is installed on Resend Free, region `us-east-1`, resource `ir_Tud4ikkPCtSNUYs5`, integration installation `icfg_Vk0ownzezT0lUI4WFVdA9hOs`. `RESEND_API_KEY` is connected to Production.

An enabled webhook was created at **https://vladasana-job-bundle.vercel.app/api/webhooks/resend**, ID `44b52bf2-a317-4452-806a-8b0933d624f8`. It subscribes to `email.delivered`, `email.bounced`, `email.complained`, `email.failed`, and `email.suppressed`. Its signing secret is stored in Vercel as `RESEND_WEBHOOK_SECRET`; it is not in Git.

The planned production sender remains `Vlada <delivery@vladasana.com>`, with reply-to `support@vladasana.com`. **The custom domain is not verified yet.** Its DNS records are the remaining email activation step.

## Real operator email test passed

The owner explicitly supplied a Gmail test recipient. One operator test sent the actual PDF and ZIP using Resend's available test sender `onboarding@resend.dev`. This was a clearly labeled delivery test with no paid claim, purchase record or private order link. The ordinary preview checkout still cannot send mail or mark orders paid.

Evidence:

- Resend email ID `02cd01c7-3bc2-421c-8266-28185db7de81`, final event **delivered**.
- Gmail confirmed exactly one matching email in **INBOX**, with the PDF (**1,067,944 bytes**) and ZIP (**2,539,601 bytes**).
- Gmail's PDF reader extracted the received document and identified **281 pages**. Sent attachment hashes matched the approved product hashes. Downloading the original received PDF through the connector's temporary URL returned 403, so a hash of the received Gmail bytes was not obtained. The Gmail connector does not support opening ZIPs; inbox ZIP metadata matches the sent size, but extraction from Gmail was not tested.
- Resend's signed `email.delivered` event reached Production with **HTTP 200** and was stored in Neon as `msg_3J3oPkL6NLHeTfUpIyl9udARsqd`.
- Replaying that actual event produced another **200** response while preserving exactly one database event.
- Repeating the send request with the identical saved payload/idempotency key returned the **same email ID**. Gmail still contained one matching email.
- Orders and fulfillment jobs remain **zero**. This verifies real email transport and callbacks, not a purchase-to-inbox result.

The email renderer now has a separate operator-test variant that labels real attachments without claiming payment or promising an unissued recovery link. Purchase and public-preview behavior remains separate. All **149 automated tests**, lint and TypeScript passed after adding the test variant. Those automated provider/worker fixtures remain distinct from the real email results above.

## Remaining domain access

Domain `vladasana.com`, Resend ID `ba872bae-a056-4290-a9b7-aa3fa8b2c334`, is still `not_started`. Public DNS confirms the required records are absent. Add the three exact records in [RESEND_DNS.md](RESEND_DNS.md), also available as `output/resend-namecheap-dns.csv`.

Namecheap is authoritative (`dns1.registrar-servers.com` / `dns2.registrar-servers.com`). Preserve existing website records and root inbound mail-forwarding MX records. The new sending records belong to `send` and `resend._domainkey`. No receiving service is being migrated.

Computer access returned **Mac locked**. The owner was asked to unlock and sign in to Namecheap; DNS changes could not be made. After records are saved, POST `/domains/ba872bae-a056-4290-a9b7-aa3fa8b2c334/verify` through Resend and check for `status=verified`. Repeat the inbox test from `delivery@vladasana.com`, inspect SPF/DKIM/DMARC results, and verify replies actually reach support.

## Purchase-to-inbox acceptance still required

Paddle credentials/product/price IDs are absent. Paddle sandbox acceptance needs those values in an isolated test deployment/database. NOWPayments uses live transfers and needs an owner-funded controlled test. No payment has been created or manually marked paid.

After domain verification and payment access, verify:

1. Provider-confirmed purchase creates one paid order and one fulfillment.
2. The PDF and complete ZIP arrive from the verified branded sender and both open.
3. The signed delivered event updates the matching fulfillment.
4. Duplicate payment notifications do not send another email.
5. A temporary delivery failure recovers through the scheduled worker with the same payload and idempotency key.
6. The seven-day recovery link works; expired/refunded downloads are rejected and replies reach support.

Keep public checkout closed until these results are recorded. The completed operator email test does not establish settlement, a paid-order worker retry, branded-domain deliverability, refund behavior, or signed download acceptance.

Private evidence is under `output/private/`: `email-activation-receipt.json`, `email-activation-verification.json`, `resend-webhook-deduplication.json`, `resend-idempotency-verification.json`, `resend-activation-runtime.jsonl`, and `database-verification.json`. The saved email payload contains the paid attachments and stays outside Git. Never repeat a test with a new idempotency key after an uncertain response without reconciling its existing receipt first.
