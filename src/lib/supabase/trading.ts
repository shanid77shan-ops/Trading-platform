import { createClient } from "@/lib/supabase/server";
import { getSymbol, getSymbols } from "@/lib/store";
import type { Account, Position, Symbol, Trade } from "@/lib/types";
import { getAuthenticatedUserData, getAuthUser, getUserAccountRow, mapAccount } from "./user-data";
import type { DbTradingAccount } from "./user-data";

function mapPosition(row: {
  id: string;
  symbol_id: string;
  ticker: string;
  side: string;
  lots: number;
  open_price: number;
  current_price: number;
  pnl: number;
}): Position {
  return {
    id: row.id,
    symbolId: row.symbol_id,
    ticker: row.ticker,
    side: row.side as "buy" | "sell",
    lots: Number(row.lots),
    openPrice: Number(row.open_price),
    currentPrice: Number(row.current_price),
    pnl: Number(row.pnl),
  };
}

function mapTrade(row: {
  id: string;
  symbol_id: string;
  ticker: string;
  side: string;
  lots: number;
  price: number;
  created_at: string;
}): Trade {
  return {
    id: row.id,
    symbolId: row.symbol_id,
    ticker: row.ticker,
    side: row.side as "buy" | "sell",
    lots: Number(row.lots),
    price: Number(row.price),
    timestamp: row.created_at,
  };
}

export async function getUserWatchlistIds(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("watchlist")
    .select("symbol_id")
    .eq("user_id", userId);
  return new Set((data ?? []).map((r) => r.symbol_id));
}

export async function mergeWatchlist(symbols: Symbol[], userId: string) {
  const watchlist = await getUserWatchlistIds(userId);
  return symbols.map((s) => ({
    ...s,
    inWatchlist: watchlist.has(s.id),
  }));
}

export async function toggleUserWatchlist(userId: string, symbolId: string) {
  const supabase = await createClient();
  const watchlist = await getUserWatchlistIds(userId);

  if (watchlist.has(symbolId)) {
    await supabase
      .from("watchlist")
      .delete()
      .eq("user_id", userId)
      .eq("symbol_id", symbolId);
    return false;
  }

  await supabase.from("watchlist").insert({ user_id: userId, symbol_id: symbolId });
  return true;
}

export async function getUserPositions(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("positions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data ?? []).map(mapPosition);
}

export async function getUserTrades(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("trade_history")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  return (data ?? []).map(mapTrade);
}

async function recalcUserAccount(userId: string, positions: Position[]) {
  const supabase = await createClient();
  const floatingPnl = positions.reduce((sum, p) => sum + p.pnl, 0);

  const { data: account } = await supabase
    .from("trading_accounts")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!account) return null;

  const balance = Number(account.balance);
  const equity = balance + floatingPnl;
  const marginUsed = positions.reduce((sum, p) => sum + p.lots * p.currentPrice * 0.01, 0);
  const freeMargin = Math.max(0, equity - marginUsed);
  const marginLevel = marginUsed > 0 ? (equity / marginUsed) * 100 : 100;

  await supabase
    .from("trading_accounts")
    .update({
      floating_pnl: Number(floatingPnl.toFixed(2)),
      equity: Number(equity.toFixed(2)),
      free_margin: Number(freeMargin.toFixed(2)),
      margin_level: Number(marginLevel.toFixed(2)),
    })
    .eq("user_id", userId);

  return mapAccount({
    ...account,
    floating_pnl: floatingPnl,
    equity,
    free_margin: freeMargin,
    margin_level: marginLevel,
  });
}

export function mergeWatchlistSync(symbols: Symbol[], watchlist: Set<string>) {
  return symbols.map((s) => ({
    ...s,
    inWatchlist: watchlist.has(s.id),
  }));
}

export function computeLiveSnapshot(
  positions: Position[],
  symbols: Symbol[],
  accountRow: DbTradingAccount | null
): { positions: Position[]; account: Account | null } {
  const updatedPositions = positions.map((pos) => {
    const symbol = symbols.find((s) => s.id === pos.symbolId);
    if (!symbol) return pos;

    const currentPrice = pos.side === "buy" ? symbol.bid : symbol.ask;
    const direction = pos.side === "buy" ? 1 : -1;
    const pnl = (currentPrice - pos.openPrice) * direction * pos.lots * 100;

    return {
      ...pos,
      currentPrice,
      pnl: Number(pnl.toFixed(2)),
    };
  });

  if (!accountRow) {
    return { positions: updatedPositions, account: null };
  }

  const floatingPnl = updatedPositions.reduce((sum, p) => sum + p.pnl, 0);
  const balance = Number(accountRow.balance);
  const equity = balance + floatingPnl;
  const marginUsed = updatedPositions.reduce(
    (sum, p) => sum + p.lots * p.currentPrice * 0.01,
    0
  );
  const freeMargin = Math.max(0, equity - marginUsed);
  const marginLevel = marginUsed > 0 ? (equity / marginUsed) * 100 : 100;

  return {
    positions: updatedPositions,
    account: mapAccount({
      ...accountRow,
      floating_pnl: floatingPnl,
      equity,
      free_margin: freeMargin,
      margin_level: marginLevel,
    }),
  };
}

export async function getLiveMarketTick(userId: string, symbols: Symbol[]) {
  const [watchlist, positions, accountRow] = await Promise.all([
    getUserWatchlistIds(userId),
    getUserPositions(userId),
    getUserAccountRow(userId),
  ]);

  const merged = mergeWatchlistSync(symbols, watchlist);
  const live = computeLiveSnapshot(positions, merged, accountRow);

  return {
    symbols: merged,
    positions: live.positions,
    account: live.account,
  };
}

export async function getFullMarketSnapshot() {
  const { user, account } = await getAuthenticatedUserData();
  if (!user) return null;

  const symbols = getSymbols();
  const [watchlist, positions, trades] = await Promise.all([
    getUserWatchlistIds(user.id),
    getUserPositions(user.id),
    getUserTrades(user.id),
  ]);

  const merged = mergeWatchlistSync(symbols, watchlist);
  const accountRow = account ?? (await getUserAccountRow(user.id));
  const live = computeLiveSnapshot(positions, merged, accountRow);

  return {
    symbols: merged,
    positions: live.positions,
    account: live.account,
    trades,
  };
}

export async function updateUserPositionsPrices(userId: string, symbols: Symbol[]) {
  const positions = await getUserPositions(userId);
  const accountRow = await getUserAccountRow(userId);
  return computeLiveSnapshot(positions, symbols, accountRow);
}

export async function executeUserTrade(
  userId: string,
  symbolId: string,
  side: "buy" | "sell",
  lots: number
) {
  const symbol = getSymbol(symbolId);
  if (!symbol) return { success: false, error: "Symbol not found" };

  const supabase = await createClient();
  const price = side === "buy" ? symbol.ask : symbol.bid;
  const marginRequired = price * lots * 0.01;

  const { data: account } = await supabase
    .from("trading_accounts")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!account || Number(account.free_margin) < marginRequired) {
    return { success: false, error: "Insufficient margin" };
  }

  const { data: tradeRow } = await supabase
    .from("trade_history")
    .insert({
      user_id: userId,
      symbol_id: symbol.id,
      ticker: symbol.ticker,
      side,
      lots,
      price,
    })
    .select("*")
    .single();

  const { data: existing } = await supabase
    .from("positions")
    .select("*")
    .eq("user_id", userId)
    .eq("symbol_id", symbol.id)
    .eq("side", side)
    .maybeSingle();

  if (existing) {
    const totalLots = Number(existing.lots) + lots;
    const avgPrice =
      (Number(existing.open_price) * Number(existing.lots) + price * lots) / totalLots;

    await supabase
      .from("positions")
      .update({
        lots: totalLots,
        open_price: avgPrice,
        current_price: price,
      })
      .eq("id", existing.id);
  } else {
    await supabase.from("positions").insert({
      user_id: userId,
      symbol_id: symbol.id,
      ticker: symbol.ticker,
      side,
      lots,
      open_price: price,
      current_price: price,
      pnl: 0,
    });
  }

  const positions = await getUserPositions(userId);
  await recalcUserAccount(userId, positions);

  return {
    success: true,
    trade: tradeRow ? mapTrade(tradeRow) : undefined,
  };
}

export async function closeUserPosition(userId: string, positionId: string) {
  const supabase = await createClient();
  const { data: position } = await supabase
    .from("positions")
    .select("*")
    .eq("id", positionId)
    .eq("user_id", userId)
    .single();

  if (!position) return { success: false, error: "Position not found" };

  const symbol = getSymbol(position.symbol_id);
  if (!symbol) return { success: false, error: "Symbol not found" };

  const closeSide = position.side === "buy" ? "sell" : "buy";
  const price = closeSide === "buy" ? symbol.ask : symbol.bid;

  await supabase.from("trade_history").insert({
    user_id: userId,
    symbol_id: position.symbol_id,
    ticker: position.ticker,
    side: closeSide,
    lots: position.lots,
    price,
  });

  const pnl = Number(position.pnl);
  const { data: account } = await supabase
    .from("trading_accounts")
    .select("balance")
    .eq("user_id", userId)
    .single();

  if (account) {
    await supabase
      .from("trading_accounts")
      .update({ balance: Number(account.balance) + pnl })
      .eq("user_id", userId);
  }

  await supabase.from("positions").delete().eq("id", positionId);

  const positions = await getUserPositions(userId);
  await recalcUserAccount(userId, positions);

  return { success: true };
}

export async function getTradingSnapshot(userId: string, symbols: Symbol[]) {
  const { positions, account } = await updateUserPositionsPrices(userId, symbols);
  const trades = await getUserTrades(userId);
  return { positions, trades, account };
}

export async function creditUserBalance(userId: string, amount: number) {
  const supabase = await createClient();
  const { data: account } = await supabase
    .from("trading_accounts")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!account) return { success: false, error: "Account not found" };

  const balance = Number(account.balance) + amount;

  await supabase
    .from("trading_accounts")
    .update({ balance: Number(balance.toFixed(2)) })
    .eq("user_id", userId);

  const positions = await getUserPositions(userId);
  const updated = await recalcUserAccount(userId, positions);
  return { success: true, account: updated };
}

export async function getAuthenticatedTradingData() {
  const { user, account } = await getAuthenticatedUserData();
  if (!user) return null;

  const symbols = getSymbols();
  const merged = await mergeWatchlist(symbols, user.id);
  const positions = await getUserPositions(user.id);
  const trades = await getUserTrades(user.id);

  return {
    user,
    account: account ? mapAccount(account) : null,
    symbols: merged,
    positions,
    trades,
  };
}
