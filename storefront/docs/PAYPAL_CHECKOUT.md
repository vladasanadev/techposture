# Direct PayPal checkout — 2 October 2026

## What is live

- Dedicated PayPal option in the existing checkout, opening seller-provided hosted checkout `59VY3T3WTU4G4`. Public checkout was inspected: **Vladasana / Job Bundle / $19 USD**.
- The optional embedded-button component is ready, but disabled until the exact Part 1 public client ID is supplied as text. The screenshot transcription failed the SDK validation endpoint. A public client ID is an embed identifier, not an API secret; never put a REST client secret in browser code.
- The prominent PayPal button opens PayPal's own secure checkout. It needs no script and cannot be blocked by a failed SDK load. PayPal controls which eligible card/wallet methods appear.
- Return page: **https://vladasana.com/Job-bundle/Success**. The owner confirmed this is already saved in PayPal. Existing lowercase `/success` order links still work.
- Existing automatically verified Paddle/NOWPayments orders use the new URL with their private `order` token. Their payment/delivery status still comes from the server.

## Important: direct PayPal delivery is manual

This supplied integration is PayPal **Payment Links and Buttons / HostedButtons**, not the application's REST Orders checkout. We have no seller REST credentials for verifying its transactions, and it does not supply an app-created order reference. A return URL, browser callback or receipt alone must never unlock the private files.

The checkout explains before payment that the buyer must email their receipt and preferred delivery address to **Support@Vladasana.com**. The return page offers a prefilled receipt email. Vlada must:

1. Find the transaction in her own PayPal business account. Do not trust a buyer screenshot as settlement proof.
2. Confirm completed payment, correct seller, $19 USD and the correct bundle; check for reversals and prior fulfillment.
3. Send the actual PDF and guide/worksheet ZIP to the verified customer's requested inbox. Record the PayPal transaction ID and delivery so repeat requests are not treated as new purchases.
4. Handle qualifying refund requests through the original PayPal transaction. The storefront's 7-day voluntary policy still applies.

NOWPayments automatic verification, durable orders, email outbox and retry schedule are unchanged. No buyer data or test transaction was submitted while testing the PayPal embed.

## Return URL setting

PayPal Business → Pay & Get Paid → Payment Links and Buttons → edit **Job Bundle** → **Confirmation** → **Auto-return** → `https://vladasana.com/Job-bundle/Success` → save/build.

The owner confirmed this setting on 2 October. Actual post-payment redirection still requires a real successful purchase (or an equivalent separately configured sandbox button) to prove end to end.

Official reference: https://developer.paypal.com/payment-links-buttons/create-payment-link/

## Future automatic PayPal delivery

Automatic delivery requires a separately configured, server-verified payment flow. The historical REST adapter is retained in `lib/commerce/providers/paypal.ts`, with signature-verified webhooks and server capture/validation, but new REST PayPal order creation is intentionally not exposed in `/api/checkout`. Merely adding keys does **not** automatically convert this hosted button to that integration.

To switch to automated REST checkout, configure seller-owned live `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_MERCHANT_ID`, and `PAYPAL_WEBHOOK_ID`; connect the PayPal create-order adapter to the checkout API/UI; register `https://vladasana.com/Job-bundle/api/webhooks/paypal`; test order creation, capture, merchant/amount/currency matching, duplicate webhooks, refunds/disputes, retry and inbox delivery. Keep the hosted button off that automatic pipeline unless a documented provider binding has been implemented and verified.

## Verification

Automated commerce tests cover launch gates, provider settlement validation and existing delivery behavior. Hosted PayPal availability is tested separately from REST readiness; sandbox/preview modes cannot expose the live button. Browser checks must cover button rendering, method switching, reopening the modal, blocked-SDK fallback, exact `/Success` casing, lowercase compatibility, and forged `success=true` parameters never showing payment confirmed.

Neither a rendered button nor an owner-confirmed return setting constitutes a completed payment or an inbox test.
