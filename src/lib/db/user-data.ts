import { sql } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import type { Account, UserProfile } from "@/lib/types";

export interface DbProfile {
  id: string;
  full_name: string | null;
  username: string | null;
  email: string | null;
  avatar: string | null;
  avatar_url: string | null;
  verified: boolean | null;
  wallet_address: string | null;
}

export interface DbTradingAccount {
  id: string;
  user_id: string;
  account_label: string;
  account_number: string;
  equity: number;
  balance: number;
  floating_pnl: number;
  margin_level: number;
  free_margin: number;
  currency: string;
}

export function mapProfile(row: DbProfile): UserProfile {
  const name = row.full_name || row.username || "User";
  return {
    id: row.id,
    username: name,
    uid: row.id.slice(0, 8).toUpperCase(),
    avatar: row.avatar || "🧑‍🚀",
    verified: row.verified ?? false,
  };
}

export function mapAccount(row: DbTradingAccount): Account {
  return {
    id: row.account_number,
    label: row.account_label,
    equity: Number(row.equity),
    balance: Number(row.balance),
    floatingPnl: Number(row.floating_pnl),
    marginLevel: Number(row.margin_level),
    freeMargin: Number(row.free_margin),
    currency: row.currency,
  };
}

async function ensureUserRecords(user: { id: string; email: string; fullName?: string }) {
  const fullName = user.fullName || user.email.split("@")[0] || "User";

  let profiles = await sql<DbProfile>`
    SELECT * FROM profiles WHERE id = ${user.id} LIMIT 1
  `;

  if (profiles.length === 0) {
    profiles = await sql<DbProfile>`
      INSERT INTO profiles (id, full_name, username, email, avatar, verified)
      VALUES (${user.id}, ${fullName}, ${fullName}, ${user.email}, ${"🧑‍🚀"}, ${false})
      RETURNING *
    `;
  }

  let accounts = await sql<DbTradingAccount>`
    SELECT * FROM trading_accounts WHERE user_id = ${user.id} LIMIT 1
  `;

  if (accounts.length === 0) {
    const accountNumber = String(Math.floor(Math.random() * 100000000)).padStart(8, "0");
    accounts = await sql<DbTradingAccount>`
      INSERT INTO trading_accounts (user_id, account_number, balance, equity, free_margin)
      VALUES (${user.id}, ${accountNumber}, ${10000}, ${10000}, ${10000})
      RETURNING *
    `;
  }

  return {
    profile: profiles[0] ?? null,
    account: accounts[0] ?? null,
  };
}

export async function getAuthenticatedUserData() {
  const user = await getSessionUser();
  if (!user) {
    return { user: null, profile: null, account: null };
  }

  const [profiles, accounts] = await Promise.all([
    sql<DbProfile>`SELECT * FROM profiles WHERE id = ${user.id} LIMIT 1`,
    sql<DbTradingAccount>`SELECT * FROM trading_accounts WHERE user_id = ${user.id} LIMIT 1`,
  ]);

  if (profiles[0] && accounts[0]) {
    return {
      user,
      profile: profiles[0],
      account: accounts[0],
    };
  }

  const ensured = await ensureUserRecords(user);
  return {
    user,
    profile: ensured.profile,
    account: ensured.account,
  };
}

export async function getAuthUser() {
  return getSessionUser();
}

export async function getUserAccountRow(userId: string) {
  const rows = await sql<DbTradingAccount>`
    SELECT * FROM trading_accounts WHERE user_id = ${userId} LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function updateProfileWallet(userId: string, walletAddress: string | null) {
  await sql`
    UPDATE profiles
    SET wallet_address = ${walletAddress}, updated_at = now()
    WHERE id = ${userId}
  `;
}
