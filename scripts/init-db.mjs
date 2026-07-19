import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
if (!url) {
  console.error("Set DATABASE_URL or POSTGRES_URL before running init-db.");
  process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(__dirname, "../src/lib/db/schema.sql");
const schema = readFileSync(schemaPath, "utf8");
const sql = neon(url);

const statements = schema
  .split(";")
  .map((part) => part.trim())
  .filter(Boolean);

async function runWithRetry(fn, attempts = 5) {
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 1500 * (i + 1)));
    }
  }
  throw lastError;
}

for (const statement of statements) {
  await runWithRetry(async () => {
    await sql.query(`${statement};`);
  });
  console.log("OK:", statement.split("\n")[0]);
}

console.log("Neon schema initialized.");
