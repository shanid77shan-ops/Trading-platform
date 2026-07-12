import { createClient } from "@/lib/supabase/server";
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

async function ensureUserRecords(
  supabase: Awaited<ReturnType<typeof createClient>>,
  user: { id: string; email?: string; user_metadata?: Record<string, unknown> }
) {
  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    const fullName =
      (user.user_metadata?.full_name as string) ||
      user.email?.split("@")[0] ||
      "User";

    const { data: createdProfile } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        full_name: fullName,
        username: fullName,
        email: user.email,
        avatar: "🧑‍🚀",
      })
      .select("*")
      .single();

    profile = createdProfile;
  }

  let { data: account } = await supabase
    .from("trading_accounts")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!account) {
    const accountNumber = String(Math.floor(Math.random() * 100000000)).padStart(
      8,
      "0"
    );

    const { data: createdAccount } = await supabase
      .from("trading_accounts")
      .insert({
        user_id: user.id,
        account_number: accountNumber,
        balance: 0,
        equity: 0,
        free_margin: 0,
      })
      .select("*")
      .single();

    account = createdAccount;
  }

  return {
    profile: profile as DbProfile | null,
    account: account as DbTradingAccount | null,
  };
}

export async function getAuthenticatedUserData() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { user: null, profile: null, account: null };
  }

  const { profile, account } = await ensureUserRecords(supabase, user);

  return {
    user,
    profile,
    account,
  };
}
