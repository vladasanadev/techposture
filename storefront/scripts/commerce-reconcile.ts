import { reconcileCommerce } from "../lib/commerce/reconcile";
import { db } from "../lib/commerce/db";
async function main() {
  try {
    console.log(JSON.stringify(await reconcileCommerce()));
  } finally {
    if (process.env.DATABASE_URL) await db().end();
  }
}
void main().catch((error) => {
  console.error(
    error instanceof Error ? error.message : "Reconciliation failed.",
  );
  process.exitCode = 1;
});
