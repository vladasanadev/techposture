# Delivery activation — September 9, 2026

Project: `amirs-projects-d9680079/vladasana-job-bundle`.
Production: https://vladasana-job-bundle.vercel.app.
Checkout remains in preview with launch approval false.

## Completed service setup

- Dedicated Neon Free database **vladasana-commerce**, `iad1`, resource `store_kp5KqLBis5rLtksu`; connected only to this storefront's Production environment. Both Paddle and crypto use this database. No other project's database is reused.
- Both idempotent SQL migrations applied. All five tables exist. Real database read/write/rollback passed; the probe left no rows. There are zero orders and deliveries.
- `npm run commerce:check-database` now provides the same repeatable connection/schema probe, without creating a purchase or sending email.
- Existing private Blob PDF/ZIP configuration retained. The sender is configured as `Vlada <delivery@vladasana.com>` with reply-to `support@vladasana.com`.
- Existing Vercel team verified on Pro. Recovery changed from daily to every five minutes at `/api/cron/commerce`, with `DELIVERY_RETRY_MODE=cron` and the existing `CRON_SECRET`. No QStash account or Vercel plan upgrade was purchased.
- Vercel project metadata confirmed the active `*/5 * * * *` definition. Its scheduled invocation at **2026-09-08 20:00:02 UTC** returned **HTTP 200** on deployment `dpl_7vXXvfweWNuRjoJe4gZM6cwP7ekE` (Bangkok: September 9, 03:00). An unauthenticated request returned **401**. `COMMERCE_RETRY_SCHEDULE_APPROVED=true` is now configured. Preview mode still pauses order processing and email sends.
- All 148 automated tests, lint and TypeScript passed. Tests cover duplicate payment events, SQL outbox transactions, attachment integrity, retries with a stable idempotency key, refund handling and email event ordering. External payment/email transports in those tests are mocked; this is not purchase-to-inbox acceptance.

## Resend account step required

Installation attempted using the Free plan for **vladasana-delivery**, domain **vladasana.com**, region **us-east-1**. Vercel returned `integration_terms_acceptance_required` and `userActionRequired: true`. No Resend resource or API key was provisioned.

The owner must accept [Resend marketplace terms](https://vercel.com/amirs-projects-d9680079/~/integrations/accept-terms/resend?source=cli). Then resume with:

```sh
npx vercel integration add resend/resend-email --name vladasana-delivery --plan free --metadata domain=vladasana.com --metadata region=us-east-1 --environment production --no-env-pull --no-claim
```

Before retrying after an uncertain outcome, list installations/resources to avoid duplicates. Domain nameservers are `dns1.registrar-servers.com` / `dns2.registrar-servers.com` (Namecheap). Existing inbound MX records provide Namecheap forwarding. Add only Resend's actual returned sending-verification records; do not replace the existing inbound MX records. Receiving at the support address must be checked independently.

Once the domain is verified, configure the signed Resend webhook at `https://vladasana-job-bundle.vercel.app/api/webhooks/resend`, store `RESEND_WEBHOOK_SECRET`, and verify delivered/bounced/failed/complained/suppressed events. No DNS values or webhook secrets have been invented.

## Purchase-to-inbox acceptance still required

The test recipient was requested and is not yet supplied. No email has been sent and no purchase has been created.

Paddle credentials/product/price IDs are also absent. Real Paddle sandbox acceptance needs those values in an isolated test deployment/database. The NOWPayments adapter uses live transfers; a controlled test needs an owner-funded payment. Neither simulated provider events nor a manual database update can substitute for a verified purchase.

After account access and the test recipient are available, verify:

1. Provider-confirmed purchase creates one paid order and one fulfillment.
2. The actual combined PDF and complete ZIP arrive and open in the selected inbox.
3. Resend's signed delivered event reaches the app and updates that fulfillment.
4. A duplicate payment notification does not send another email.
5. A temporary delivery failure recovers through the scheduled worker using the same email idempotency key and attachment bytes.
6. The seven-day recovery link works; expired/refunded downloads are rejected and replies reach support.

Keep public checkout closed until these results are recorded. A scheduler invocation while in preview proves its authentication and deployment, but does not prove email recovery.

Private evidence: `output/private/database-verification.json`, `output/private/project-retry-settings.json`, and `output/private/retry-runtime.jsonl`. These contain no committed credentials or paid files.
