import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import postgres from "postgres";
async function main() {
  if (!process.env.DATABASE_URL)
    throw new Error("Provide the new storefront DATABASE_URL.");
  const sql = postgres(process.env.DATABASE_URL, { max: 1 });
  try {
    for (const migration of ["001-commerce.sql", "002-paddle.sql"]) {
      await sql.begin(async (tx) => {
        await tx.unsafe(
          await readFile(
            resolve(dirname(process.argv[1]), "../db", migration),
            "utf8",
          ),
        );
      });
    }
    console.log("Commerce schema is ready.");
  } finally {
    await sql.end();
  }
}
void main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Migration failed.");
  process.exitCode = 1;
});
