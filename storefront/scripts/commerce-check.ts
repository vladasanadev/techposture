import {
  activationIssues,
  config,
  providerAvailable,
  providerActivationIssues,
} from "../lib/commerce/config";
import { loadBundlePdf, loadBundleArchive } from "../lib/commerce/pdf";
async function main() {
  const args = process.argv.slice(2);
  if (
    args.some(
      (arg) =>
        !["--provider=crypto", "--provider=paddle", "--verify-file"].includes(
          arg,
        ),
    ) ||
    args.filter((arg) => arg.startsWith("--provider=")).length > 1
  )
    throw new Error(
      "Usage: npm run commerce:check -- [--provider=crypto|--provider=paddle] [--verify-file]",
    );
  const c = config();
  const issues = activationIssues(c);
  const providers = {
    paddle: providerActivationIssues("paddle", c),
    crypto: providerActivationIssues("crypto", c),
  };
  const selected = args.includes("--provider=crypto")
    ? "crypto"
    : args.includes("--provider=paddle")
      ? "paddle"
      : null;
  console.log(
    JSON.stringify(
      {
        mode: c.mode,
        issues,
        methods: {
          paddle: providerAvailable("paddle", c),
          crypto: providerAvailable("crypto", c),
        },
        providerIssues: providers,
        scope:
          "Configuration only; does not verify live services, settlement or inbox delivery.",
      },
      null,
      2,
    ),
  );
  if (
    selected
      ? providers[selected].length > 0
      : issues.length > 0 ||
        Object.values(providers).every((value) => value.length > 0)
  )
    process.exitCode = 1;
  if (args.includes("--verify-file")) {
    const bytes = await loadBundlePdf(c);
    const archive = await loadBundleArchive(c);
    console.log(
      `Private PDF verified: ${bytes.byteLength} bytes; archive: ${archive.byteLength} bytes. No email or payment created.`,
    );
  }
}
void main().catch((error) => {
  console.error(
    error instanceof Error ? error.message : "Configuration check failed.",
  );
  process.exitCode = 1;
});
