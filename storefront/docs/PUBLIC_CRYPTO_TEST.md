# Public crypto checkout — September 12, 2026

The owner explicitly requested: “Make public checkout live I want to test it IRL.” Crypto checkout is now open at **https://vladasana.com/Job-bundle** for real $19 payments. This supersedes earlier instructions to keep this deployment closed while waiting for payment acceptance. It does not mean real settlement or purchase-triggered delivery has already passed.

## Activated

- Production `COMMERCE_MODE=live` and `COMMERCE_LAUNCH_APPROVED=true` on Amir's `vladasana-job-bundle` project.
- All nine previously configured and freshly checked stablecoin networks remain available.
- Paddle remains unavailable because its credentials, product/price and domain approval are not configured. Crypto works independently.
- The deployed configuration checker reported **no crypto activation issues**, crypto available, Paddle unavailable, and verified both private file hashes. The production build passed.
- Initial activation deployment: `dpl_AR8vEuHhty9TURTr653oHvaTrm9w`, READY, source application commit `411a12afc23b0e297b0edcd7610f5d5135501571`. It was assigned to `vladasana.com`.
- The live browser checkout showed an enabled email field, nine network choices and **Get my bundle · $19**. The verification tab was closed without submitting a purchase or transferring funds.

## Owner test

Open the landing, choose **Get the bundle → Crypto**, select the exact token and network, and enter the inbox that should receive the product. Continue to the unique NOWPayments checkout and send its exact requested amount on that network, allowing for the sending wallet's fee.

After payment, verify the merchant's intended payout, the provider's `finished` status, one matching paid order and fulfillment, the PDF/ZIP email from Support@Vladasana.com and the signed download. Continue duplicate-event, recovery and refund checks with the operator. Do not manually mark an order paid. A browser return or payment screenshot alone does not establish settlement.

Public checkout remains open under the owner's instruction; no automatic closing timer was created. To pause new purchases, restore `COMMERCE_MODE=preview` and `COMMERCE_LAUNCH_APPROVED=false` and redeploy. Those settings also pause fulfillment, so reconcile real pending/paid orders with the operator before changing modes. Do not delete or reset order data.

The Namecheap support inbox and outgoing branded email are verified. [Domain and email setup](DOMAIN_EMAIL_LAUNCH.md) · [Fresh network review](NOWPAYMENTS_NETWORK_REVIEW.md).
