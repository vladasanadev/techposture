# NOWPayments network approval — September 9, 2026

The seller's API and IPN keys are stored as Vercel Production secrets. Authenticated read-only checks ran inside Vercel so those keys were never exported, printed or placed in Git. Nine selected stablecoin networks passed the merchant selection and **fixed-rate, seller-paid-fee** minimum checks for the $19 bundle. USDC/Polygon (`usdcmatic`) was not enabled for this API key and is excluded.

Approved Production configuration:

```dotenv
NOWPAYMENTS_TOKENS=usdtbsc,usdcbsc,usdtmatic,usdcarb,usdtarb,usdcsol,usdterc20,usdc,usdttrc20
NOWPAYMENTS_NETWORKS_APPROVED=true
```

USDT/BNB Smart Chain is first in the selector. The screenshot originally selected ten stablecoins, but the current authenticated API is authoritative. BTC, ETH and BNB remain outside this storefront's stablecoin checkout. The allowlist still supports `usdcmatic` for a future merchant configuration, but this account does not advertise it.

## Live account results

Read-only review at **2026-09-08 17:49 UTC / September 9 00:49 Bangkok**, using the actual merchant API key. Amounts below are in each payment token, not a promise of USD settlement. All nine estimates for $19 exceeded their minimums.

| Network code | $19 estimated payment | Fixed-rate minimum | Result |
| --- | ---: | ---: | --- |
| `usdtbsc` | 19.00170923 | 8.30052992 | Passed |
| `usdcbsc` | 18.99979580 | 8.30294436 | Passed |
| `usdtmatic` | 19.00594704 | 8.34742500 | Passed |
| `usdcarb` | 19.00241552 | 8.43462100 | Passed |
| `usdtarb` | 19.00083862 | 8.43534900 | Passed |
| `usdcsol` | 19.00117873 | 8.53489100 | Passed |
| `usdterc20` | 18.99655615 | 8.78439400 | Passed |
| `usdc` | 18.99287982 | 8.79117200 | Passed |
| `usdttrc20` | 18.98007500 | 14.02711800 | Passed |
| `usdcmatic` | — | — | Not selected by this merchant key; removed |

The same requests are repeated before each invoice. The merchant's default payout configuration is used when `currency_to` is omitted, matching the provider's official Node SDK checkout flow. Minimums change with network conditions; the values above are evidence from the review, not hardcoded thresholds. The [official SDK](https://github.com/NowPaymentsIO/nowpayments-sdk-nodejs) and [minimum-payment documentation](https://nowpayments.zendesk.com/hc/en-us/articles/27407237685917-Minimum-payment-amount) describe this check.

The live check exposed uppercase values in `selectedCurrencies`. The integration now normalizes those symbols before matching the exact token/network codes. It also explicitly passes `is_fixed_rate=true` and `is_fee_paid_by_user=false` when requesting the minimum, matching the invoice settings. Payment-currency identity checks are likewise case-insensitive without accepting a different network.

## Fees and scope of approval

[NOWPayments pricing](https://nowpayments.io/pricing), checked September 9, lists **1% without conversion** and **1.5% for autoconverted/fixed-rate payments**, plus network fees. Our fixed-rate checkout uses the standard **1.5%** service-fee basis, approximately **$0.285 on $19 before network costs**. Custom account pricing may differ. This is not an exact net settlement quote.

The buyer pays their sending-wallet network fee. Processing and external-wallet payout network fees may also reduce the merchant's proceeds; costs vary with the selected payment network, payout currency and current conditions. No payout wallet, custody setting, funds transfer or merchant account preference was changed in this review.

Network approval records that the selected merchant coins and live fixed-rate minimums support the product price under the checked configuration. It does not attest to real settlement, the correctness of a payout wallet, successful IPN delivery, email inbox delivery or refunds. Recheck approval if the merchant account, payout settings or product price changes. The IPN secret is present and the server supplies `${SITE_URL}/api/webhooks/crypto` on every unique invoice; no fixed invoice ID is used.

## Remaining launch work

The broader checkout remains in preview: shared PostgreSQL order storage, verified Resend email/reply mailbox, retry service, Paddle activation and purchase-to-inbox acceptance are separate requirements. Do not set `COMMERCE_LAUNCH_APPROVED=true` merely because crypto networks are approved. No live payment or customer email was created during this review.

The existing Vercel project is `vladasana-job-bundle`. A new Vercel project in the seller's account needs its own environment configuration. The `vladasanadev/techposture` handoff remains local while that repository is public, per the magazine-source private-repository instruction.
