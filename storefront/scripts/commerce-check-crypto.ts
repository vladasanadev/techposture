import { config, TOKEN_LABELS, CommerceError } from "../lib/commerce/config";
import { checkCryptoNetwork } from "../lib/commerce/providers/crypto";

// Explicit operator command. Uses live merchant GETs only, even in preview mode.
// Does not create invoices, transfer funds, write orders or send emails.
async function main() {
  const c = config();
  const tokens = (process.env.NOWPAYMENTS_TOKENS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  if (
    !c.cryptoKey ||
    !tokens.length ||
    tokens.some((token) => !TOKEN_LABELS[token])
  )
    throw new CommerceError(
      "Set NOWPAYMENTS_API_KEY and supported exact NOWPAYMENTS_TOKENS before running this probe.",
    );
  const results = [];
  for (const token of [...new Set(tokens)]) {
    try {
      results.push({
        ...(await checkCryptoNetwork(token, c)),
        available: true,
      });
    } catch (error) {
      process.exitCode = 1;
      results.push({
        token,
        available: false,
        error:
          error instanceof CommerceError
            ? error.message
            : "The provider returned an invalid response.",
      });
    }
  }
  console.log(
    JSON.stringify(
      {
        readOnly: true,
        networks: results,
        scope:
          "Merchant selection, estimate and minimum only. Settlement, payout wallets, IPN and email still require acceptance testing.",
      },
      null,
      2,
    ),
  );
}
void main().catch((error) => {
  console.error(
    error instanceof CommerceError
      ? error.message
      : "NOWPayments readiness probe failed.",
  );
  process.exitCode = 1;
});
