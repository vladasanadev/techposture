import { randomUUID } from "node:crypto";
import { db } from "../lib/commerce/db";

// Operator-only connection probe. Its single temporary write is rolled back;
// it never creates an order, changes paid status, or invokes fulfillment.
async function main() {
  const sql = db();
  const key = `activation-probe-${randomUUID()}`;
  const rollback = new Error("Intentional probe rollback");
  try {
    const tables = await sql`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema='public' AND table_name LIKE 'commerce_%'
      ORDER BY table_name`;
    const names = tables.map((row) => row.table_name as string);
    for (const expected of [
      "commerce_orders", "commerce_events", "commerce_fulfillments",
      "commerce_email_events", "commerce_rate_limits",
    ]) {
      if (!names.includes(expected)) throw new Error("Run commerce migrations first.");
    }
    let wrote = false;
    try {
      await sql.begin(async (tx) => {
        await tx`INSERT INTO commerce_rate_limits(key,bucket,requests)
          VALUES (${key},date_trunc('minute',now()),1)`;
        const [row] = await tx`SELECT requests FROM commerce_rate_limits WHERE key=${key}`;
        if (row.requests !== 1) throw new Error("Database round-trip failed.");
        wrote = true;
        throw rollback;
      });
    } catch (error) {
      if (error !== rollback) throw error;
    }
    const remaining = await sql`SELECT key FROM commerce_rate_limits WHERE key=${key}`;
    if (!wrote || remaining.length) throw new Error("Database rollback failed.");
    console.log(JSON.stringify({
      tables: names, readWriteRollback: "passed", paymentCreated: false, emailSent: false,
    }, null, 2));
  } finally {
    await sql.end();
  }
}

void main().catch(() => {
  console.error("Database verification failed. Check DATABASE_URL, connectivity and migrations; credentials are not logged.");
  process.exitCode = 1;
});
