# NOWPayments network selection — September 9, 2026

The seller supplied a screenshot of **Settings → Coins**, showing ten USDT/USDC networks enabled. The following is the selected configuration, now supported by the storefront's token allowlist:

```dotenv
NOWPAYMENTS_TOKENS=usdttrc20,usdterc20,usdc,usdtbsc,usdcmatic,usdcsol,usdcarb,usdtarb,usdcbsc,usdtmatic
NOWPAYMENTS_NETWORKS_APPROVED=false
```

| Code | Screenshot selection |
| --- | --- |
| `usdttrc20` | USDT / Tron |
| `usdterc20` | USDT / Ethereum |
| `usdc` | USDC / Ethereum |
| `usdtbsc` | USDT / BNB Smart Chain |
| `usdcmatic` | USDC / Polygon |
| `usdcsol` | USDC / Solana |
| `usdcarb` | USDC / Arbitrum One |
| `usdtarb` | USDT / Arbitrum One |
| `usdcbsc` | USDC / BNB Smart Chain |
| `usdtmatic` | USDT / Polygon |

BTC, ETH and BNB are also selected in the merchant screenshot, but this storefront sells through the requested stablecoin checkout. It does not expose those volatile assets as payment choices.

The additional Arbitrum/BNB/Polygon API symbols are documented by NOWPayments in its [stablecoin listing](https://nowpayments.io/blog/happy-5th-birthday-nowpayments) and [USDC Arbitrum guide](https://nowpayments.io/blog/accept-usdc-on-arbitrum-one). The authenticated merchant-currency response remains authoritative for whether each is available to this account today. In particular, never substitute another bridged/native token variant merely because the ticker looks similar.

## Fees checked against current public pricing

[NOWPayments pricing](https://nowpayments.io/pricing), checked September 9, 2026, lists **1% without conversion** and **1.5% for autoconverted/fixed-rate payments**, plus network fees. This storefront requests fixed-rate invoices with `is_fee_paid_by_user=false`, so the published standard service-fee basis is **1.5%**. For a nominal $19 payment, that is approximately **$0.285 in service fees before network costs**, assuming standard account pricing. It is not a settlement quote. Account discounts or custom pricing may differ.

The buyer pays their sending-wallet network fee. NOWPayments may also deduct processing and payout network fees from the merchant's proceeds; a custody payout has different costs from an external wallet payout. Exact costs depend on the payment network, payout currency, account settings and current conditions. Older FAQ/search results showing 0.5% or 1% fixed-rate fees must not override the current pricing page.

## Verification still required before approval

The screenshot establishes selected coins, not live network uptime, payout wallets, current $19 minimums or actual settlement costs. No NOWPayments API key is present in the accessible `vladasana-job-bundle` Vercel project or the storefront's local configuration. Unauthenticated currency/minimum API requests return `403 INVALID_API_KEY`. The Mac was locked when attempting to inspect the merchant dashboard. No invoice, charge, payout or customer email was created.

Accordingly, `NOWPAYMENTS_NETWORKS_APPROVED` remains **false**. After the merchant key is added, the operator can run the read-only `commerce:check-crypto` command and inspect the account's payout configuration and fee quote, remove unsuitable networks from `NOWPAYMENTS_TOKENS`, and then set approval true. The key should be stored in Vercel, not posted in chat. Approval is independent of `COMMERCE_LAUNCH_APPROVED`; approving networks alone does not open sales.

The app supplies `${SITE_URL}/api/webhooks/crypto` on every per-order invoice. No static invoice link or dashboard payment-button ID is needed.

## Deployment scope

These selections are saved in the existing Vercel project's Production environment (`vladasana-job-bundle`) and the prepared storefront handoff. A new Vercel project under the seller's account will need the same environment values. Vercel environment changes apply to the next deployment; deploy the updated code to recognize all ten pairs. The handoff is still local because `vladasanadev/techposture` remains public and the magazine-source private-repository instruction is unmet.
