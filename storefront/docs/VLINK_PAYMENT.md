# vLink payment channel

Added September 12, 2026 at the owner's request.

## Buyer experience

The checkout now offers **Card / PayPal**, **Crypto** (NOWPayments), and **vLink**. vLink uses the exact owner-supplied URL:

https://vlink.id/vladasanadev/kQX9ME

The hosted page was inspected and displayed **Vlada / @vladasanadev / 19 USDC**. It uses VPay and a wallet connection chooser. No wallet was connected, no signature requested, and no payment submitted during verification.

An on-brand introductory card explains personal email delivery before the buyer opens the payment frame. The remote page only loads after the buyer explicitly selects the vLink action. The frame is sandboxed; a persistent new-tab fallback supports wallets that cannot connect inside a frame. The embedded provider interface remains the provider's own styling. No scripts/styles are injected into it and no provider protection is bypassed.

The provider currently sends neither X-Frame-Options nor a CSP frame-ancestors restriction on this URL. Future provider restrictions can prevent inline loading; the new-tab fallback remains available.

## Payment and delivery boundary

**vLink fulfillment is manual.** This fixed payment link has no documented merchant callback, order-reference API, or verified settlement integration available to this storefront. The site does not claim to detect a successful payment. It never treats an iframe load, close, browser redirect, wallet message, screenshot or submitted transaction hash as proof of payment.

The buyer is instructed before payment to email their vLink receipt/transaction reference and preferred delivery email to **Support@Vladasana.com**. An “Email my receipt for delivery” link opens a prefilled draft in their email app; it does not send anything automatically.

The seller must:

1. Check support email for vLink purchase receipts.
2. Independently verify the transaction in the recipient's vPay account: this link/recipient, successful settlement, correct amount, and an unused receipt. A buyer's screenshot alone is insufficient.
3. Record the payment reference and delivery email in a private sales ledger to prevent duplicate claims. Keep payment evidence private.
4. Send the actual PDF/ZIP from the private bundle storage or authorized seller copies to the verified buyer. Never expose storage tokens or make the paid files public.
5. Handle refund requests under the same seven-day policy; confirm the return destination and transaction before any refund. vLink is separate from Paddle and NOWPayments.

NOWPayments retains its existing verified callback and automatic email pipeline. This change does not modify its invoice, settlement, database, retry, or delivery logic. Paddle remains subject to its existing activation requirements.

## Configuration and future automation

No new keys are required for the hosted link. `lib/vlink.ts` contains the exact link, amount and support address. The public storefront exposes only whether vLink is available, never payment secrets. The live launch and final-product gates still apply. Preview and sandbox builds cannot open the real payment link through the purchase UI. A price change requires updating and verifying the provider link as well as the storefront; the amount guard disables vLink if the bundle price differs.

Keep the vPay link active, at 19 USDC, and reusable for product sales. Do not replace it with a single-use payment request. Link repeatability and the complete signed wallet-to-payment flow require seller account/live-payment verification; they were not established by the public page inspection.

To automate delivery later, obtain official vPay documentation and merchant access for verified settlement callbacks or authenticated transaction queries, plus a supported per-order reference. Implement durable order binding, authenticated verification, duplicate protection and refund handling before connecting this channel to the existing delivery jobs. Do not use the NOWPayments IPN secret or invent a vLink webhook endpoint.

Official provider references: [vLink checkout](https://vlink.id/vladasanadev/kQX9ME), [vPay platform](https://vpay.fund/).

## Verification

- 151 automated tests pass, including approval/sandbox gates for the external channel; lint, typecheck, production build and whitespace checks pass.
- Staged production configuration rendered the real hosted payment frame and wallet chooser at desktop and 390×844 mobile sizes. Page/dialog horizontal overflow was zero. Keyboard arrow navigation between payment methods works; NOWPayments still shows all nine approved networks and its enabled purchase form.
- Browser wallet-extension injection warnings were observed in the installed multi-wallet Chrome profile; no application-origin errors were observed. Wallet connection and an actual signed payment remain an owner acceptance step. Use the new-tab fallback if a wallet extension does not appear in the frame.
- No invoice, payment, email or database fulfillment was created during these UI checks.
