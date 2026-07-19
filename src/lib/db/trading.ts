import { sql } from "@/lib/db";
import { getSymbol, getSymbols } from "@/lib/store";
import type { Account, Position, Symbol, Trade } from "@/lib/types";
import {
  getAuthenticatedUserData,
  getUserAccountRow,
  mapAccount,
  type DbTradingAccount,
} from "./user-data";

function mapPosition(row: {
  id: string;
  symbol_id: string;
  ticker: string;
  side: string;
  lots: number;
  open_price: number;
  current_price: number;
  pnl: number;
  amount?: number | null;
  expires_at?: string | null;
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
    amount: row.amount != null ? Number(row.amount) : undefined,
    expiresAt: row.expires_at ?? undefined,
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
  const rows = await sql<{ symbol_id: string }>`
    SELECT symbol_id FROM watchlist WHERE user_id = ${userId}
  `;
  return new Set(rows.map((r) => r.symbol_id));
}

export async function mergeWatchlist(symbols: Symbol[], userId: string) {
  const watchlist = await getUserWatchlistIds(userId);
  return symbols.map((s) => ({
    ...s,
    inWatchlist: watchlist.has(s.id),
  }));
}

export async function toggleUserWatchlist(userId: string, symbolId: string) {
  const watchlist = await getUserWatchlistIds(userId);

  if (watchlist.has(symbolId)) {
    await sql`
      DELETE FROM watchlist
      WHERE user_id = ${userId} AND symbol_id = ${symbolId}
    `;
    return false;
  }

  await sql`
    INSERT INTO watchlist (user_id, symbol_id)
    VALUES (${userId}, ${symbolId})
  `;
  return true;
}

export async function getUserPositions(userId: string) {
  const rows = await sql<{
    id: string;
    symbol_id: string;
    ticker: string;
    side: string;
    lots: number;
    open_price: number;
    current_price: number;
    pnl: number;
    amount?: number | null;
    expires_at?: string | null;
  }>`
    SELECT * FROM positions
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;
  return rows.map(mapPosition);
}

export async function getUserTrades(userId: string) {
  const rows = await sql<{
    id: string;
    symbol_id: string;
    ticker: string;
    side: string;
    lots: number;
    price: number;
    created_at: string;
  }>`
    SELECT * FROM trade_history
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT 50
  `;
  return rows.map(mapTrade);
}

async function recalcUserAccount(userId: string, positions: Position[]) {
  const floatingPnl = positions.reduce((sum, p) => sum + p.pnl, 0);

  const accounts = await sql<DbTradingAccount>`
    SELECT * FROM trading_accounts WHERE user_id = ${userId} LIMIT 1
  `;
  const account = accounts[0];
  if (!account) return null;

  const balance = Number(account.balance);
  const equity = balance + floatingPnl;
  const marginUsed = positions.reduce((sum, p) => sum + p.lots * p.currentPrice * 0.01, 0);
  const freeMargin = Math.max(0, equity - marginUsed);
  const marginLevel = marginUsed > 0 ? (equity / marginUsed) * 100 : 100;

  await sql`
    UPDATE trading_accounts
    SET
      floating_pnl = ${Number(floatingPnl.toFixed(2))},
      equity = ${Number(equity.toFixed(2))},
      free_margin = ${Number(freeMargin.toFixed(2))},
      margin_level = ${Number(marginLevel.toFixed(2))},
      updated_at = now()
    WHERE user_id = ${userId}
  `;

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

export async function closeExpiredPositions(userId: string) {
  const expired = await sql<{ id: string }>`
    SELECT id FROM positions
    WHERE user_id = ${userId}
      AND expires_at IS NOT NULL
      AND expires_at <= now()
  `;

  for (const position of expired) {
    await closeUserPosition(userId, position.id);
  }
}

export async function getLiveMarketTick(userId: string, symbols: Symbol[]) {
  await closeExpiredPositions(userId);

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
  const auth = await getAuthenticatedUserData();
  if (!auth.user) return null;

  const userId = auth.user.id;
  await closeExpiredPositions(userId);

  const symbols = getSymbols();
  const [watchlist, positions, trades] = await Promise.all([
    getUserWatchlistIds(userId),
    getUserPositions(userId),
    getUserTrades(userId),
  ]);

  const merged = mergeWatchlistSync(symbols, watchlist);
  const accountRow = auth.account ?? (await getUserAccountRow(userId));
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

  const price = side === "buy" ? symbol.ask : symbol.bid;
  const marginRequired = price * lots * 0.01;

  const accounts = await sql<DbTradingAccount>`
    SELECT * FROM trading_accounts WHERE user_id = ${userId} LIMIT 1
  `;
  const account = accounts[0];

  if (!account || Number(account.free_margin) < marginRequired) {
    return { success: false, error: "Insufficient margin" };
  }

  const tradeRows = await sql<{
    id: string;
    symbol_id: string;
    ticker: string;
    side: string;
    lots: number;
    price: number;
    created_at: string;
  }>`
    INSERT INTO trade_history (user_id, symbol_id, ticker, side, lots, price)
    VALUES (${userId}, ${symbol.id}, ${symbol.ticker}, ${side}, ${lots}, ${price})
    RETURNING *
  `;
  const tradeRow = tradeRows[0];

  const existing = await sql<{
    id: string;
    lots: number;
    open_price: number;
  }>`
    SELECT * FROM positions
    WHERE user_id = ${userId}
      AND symbol_id = ${symbol.id}
      AND side = ${side}
    LIMIT 1
  `;

  if (existing[0]) {
    const row = existing[0];
    const totalLots = Number(row.lots) + lots;
    const avgPrice =
      (Number(row.open_price) * Number(row.lots) + price * lots) / totalLots;

    await sql`
      UPDATE positions
      SET lots = ${totalLots}, open_price = ${avgPrice}, current_price = ${price}, updated_at = now()
      WHERE id = ${row.id}
    `;
  } else {
    await sql`
      INSERT INTO positions (
        user_id, symbol_id, ticker, side, lots, open_price, current_price, pnl
      )
      VALUES (
        ${userId}, ${symbol.id}, ${symbol.ticker}, ${side}, ${lots}, ${price}, ${price}, ${0}
      )
    `;
  }

  const positions = await getUserPositions(userId);
  await recalcUserAccount(userId, positions);

  return {
    success: true,
    trade: tradeRow ? mapTrade(tradeRow) : undefined,
  };
}

export async function executeEntrustTrade(
  userId: string,
  symbolId: string,
  side: "buy" | "sell",
  amount: number,
  durationSeconds: number
) {
  if (!Number.isFinite(amount) || amount <= 0) {
    return { success: false, error: "Invalid amount" };
  }

  if (![60, 120, 190].includes(durationSeconds)) {
    return { success: false, error: "Invalid duration" };
  }

  const symbol = getSymbol(symbolId);
  if (!symbol) return { success: false, error: "Symbol not found" };

  const price = side === "buy" ? symbol.ask : symbol.bid;
  const lots = amount / (price * 0.01);
  const expiresAt = new Date(Date.now() + durationSeconds * 1000).toISOString();

  const accounts = await sql<DbTradingAccount>`
    SELECT * FROM trading_accounts WHERE user_id = ${userId} LIMIT 1
  `;
  const account = accounts[0];

  if (!account || Number(account.free_margin) < amount) {
    return { success: false, error: "Insufficient margin" };
  }

  const tradeRows = await sql<{
    id: string;
    symbol_id: string;
    ticker: string;
    side: string;
    lots: number;
    price: number;
    created_at: string;
  }>`
    INSERT INTO trade_history (user_id, symbol_id, ticker, side, lots, price)
    VALUES (${userId}, ${symbol.id}, ${symbol.ticker}, ${side}, ${lots}, ${price})
    RETURNING *
  `;
  const tradeRow = tradeRows[0];

  const positionRows = await sql<{
    id: string;
    symbol_id: string;
    ticker: string;
    side: string;
    lots: number;
    open_price: number;
    current_price: number;
    pnl: number;
    amount?: number | null;
    expires_at?: string | null;
  }>`
    INSERT INTO positions (
      user_id, symbol_id, ticker, side, lots, open_price, current_price, pnl, amount, expires_at
    )
    VALUES (
      ${userId}, ${symbol.id}, ${symbol.ticker}, ${side}, ${lots}, ${price}, ${price}, ${0}, ${amount}, ${expiresAt}
    )
    RETURNING *
  `;
  const positionRow = positionRows[0];

  const positions = await getUserPositions(userId);
  await recalcUserAccount(userId, positions);

  return {
    success: true,
    trade: tradeRow ? mapTrade(tradeRow) : undefined,
    position: positionRow ? mapPosition(positionRow) : undefined,
    expiresAt,
  };
}

export async function closeUserPosition(userId: string, positionId: string) {
  const rows = await sql<{
    id: string;
    symbol_id: string;
    ticker: string;
    side: string;
    lots: number;
    open_price: number;
  }>`
    SELECT * FROM positions
    WHERE id = ${positionId} AND user_id = ${userId}
    LIMIT 1
  `;
  const position = rows[0];

  if (!position) return { success: false, error: "Position not found" };

  const symbol = getSymbol(position.symbol_id);
  if (!symbol) return { success: false, error: "Symbol not found" };

  const closeSide = position.side === "buy" ? "sell" : "buy";
  const price = closeSide === "buy" ? symbol.ask : symbol.bid;
  const direction = position.side === "buy" ? 1 : -1;
  const pnl = Number(
    (
      (price - Number(position.open_price)) *
      direction *
      Number(position.lots) *
      100
    ).toFixed(2)
  );

  await sql`
    INSERT INTO trade_history (user_id, symbol_id, ticker, side, lots, price)
    VALUES (
      ${userId}, ${position.symbol_id}, ${position.ticker}, ${closeSide}, ${position.lots}, ${price}
    )
  `;

  const accounts = await sql<{ balance: number }>`
    SELECT balance FROM trading_accounts WHERE user_id = ${userId} LIMIT 1
  `;
  const account = accounts[0];

  if (account) {
    await sql`
      UPDATE trading_accounts
      SET balance = ${Number(account.balance) + pnl}, updated_at = now()
      WHERE user_id = ${userId}
    `;
  }

  await sql`DELETE FROM positions WHERE id = ${positionId}`;

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
  const accounts = await sql<DbTradingAccount>`
    SELECT * FROM trading_accounts WHERE user_id = ${userId} LIMIT 1
  `;
  const account = accounts[0];

  if (!account) return { success: false, error: "Account not found" };

  const balance = Number(account.balance) + amount;

  await sql`
    UPDATE trading_accounts
    SET balance = ${Number(balance.toFixed(2))}, updated_at = now()
    WHERE user_id = ${userId}
  `;

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
