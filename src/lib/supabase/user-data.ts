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

  const [{ data: profile }, { data: account }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("trading_accounts").select("*").eq("user_id", user.id).maybeSingle(),
  ]);

  if (profile && account) {
    return {
      user,
      profile: profile as DbProfile,
      account: account as DbTradingAccount,
    };
  }

  const ensured = await ensureUserRecords(supabase, user);
  return {
    user,
    profile: ensured.profile,
    account: ensured.account,
  };
}

export async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function getUserAccountRow(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("trading_accounts")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return data as DbTradingAccount | null;
}
