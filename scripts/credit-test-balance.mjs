import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
const amount = Number(process.env.TEST_BALANCE ?? 10000);

if (!url) {
  console.error("Set DATABASE_URL or POSTGRES_URL.");
  process.exit(1);
}

const sql = neon(url);

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

await runWithRetry(async () => {
  await sql.query(`
    UPDATE trading_accounts
    SET
      balance = ${amount},
      equity = ${amount},
      free_margin = ${amount},
      floating_pnl = 0,
      margin_level = 100,
      updated_at = now()
  `);
});

console.log(`All trading accounts credited with ${amount} USD for testing.`);
