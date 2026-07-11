import {
  defaultAccount,
  defaultSettings,
  defaultUserProfile,
  initialPaymentMethods,
  initialPositions,
  initialSymbols,
  initialTrades,
} from "./mock-data";
import type {
  Account,
  PaymentMethod,
  PlatformSettings,
  Position,
  Symbol,
  Trade,
  UserProfile,
} from "./types";

let symbols = [...initialSymbols];
let account = { ...defaultAccount };
let userProfile = { ...defaultUserProfile };
let positions = [...initialPositions];
let trades = [...initialTrades];
let settings = { ...defaultSettings };
let paymentMethods = [...initialPaymentMethods];

function recalcAccount() {
  const floatingPnl = positions.reduce((sum, p) => sum + p.pnl, 0);
  account = {
    ...account,
    floatingPnl: Number(floatingPnl.toFixed(2)),
    equity: Number((account.balance + floatingPnl).toFixed(2)),
  };
}

export function getSymbols() {
  return symbols;
}

export function getSymbol(id: string) {
  return symbols.find((s) => s.id === id || s.ticker.toLowerCase() === id.toLowerCase());
}

export function getAccount() {
  return account;
}

export function getUserProfile() {
  return userProfile;
}

export function updateUserProfile(updates: Partial<UserProfile>) {
  userProfile = { ...userProfile, ...updates };
  return userProfile;
}

export function getPositions() {
  return positions;
}

export function getTrades() {
  return trades;
}

export function getSettings() {
  return settings;
}

export function updateSymbol(id: string, updates: Partial<Symbol>) {
  symbols = symbols.map((s) => (s.id === id ? { ...s, ...updates } : s));
  return symbols.find((s) => s.id === id);
}

export function addSymbol(symbol: Omit<Symbol, "id">) {
  const id = symbol.ticker.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const newSymbol = { ...symbol, id };
  symbols = [...symbols, newSymbol];
  return newSymbol;
}

export function deleteSymbol(id: string) {
  symbols = symbols.filter((s) => s.id !== id);
}

export function updateAccount(updates: Partial<Account>) {
  account = { ...account, ...updates };
  return account;
}

export function updateSettings(updates: Partial<PlatformSettings>) {
  settings = { ...settings, ...updates };
  return settings;
}

export function toggleWatchlist(id: string) {
  const symbol = symbols.find((s) => s.id === id);
  if (!symbol) return null;
  return updateSymbol(id, { inWatchlist: !symbol.inWatchlist });
}

export function executeTrade(
  symbolId: string,
  side: "buy" | "sell",
  lots: number
): { success: boolean; error?: string; trade?: Trade } {
  const symbol = getSymbol(symbolId);
  if (!symbol) return { success: false, error: "Symbol not found" };

  const price = side === "buy" ? symbol.ask : symbol.bid;
  const trade: Trade = {
    id: `trade-${Date.now()}`,
    symbolId: symbol.id,
    ticker: symbol.ticker,
    side,
    lots,
    price,
    timestamp: new Date().toISOString(),
  };

  trades = [trade, ...trades];

  const existing = positions.find(
    (p) => p.symbolId === symbol.id && p.side === side
  );

  if (existing) {
    positions = positions.map((p) =>
      p.id === existing.id
        ? {
            ...p,
            lots: p.lots + lots,
            openPrice:
              (p.openPrice * p.lots + price * lots) / (p.lots + lots),
          }
        : p
    );
  } else {
    positions = [
      ...positions,
      {
        id: `pos-${Date.now()}`,
        symbolId: symbol.id,
        ticker: symbol.ticker,
        side,
        lots,
        openPrice: price,
        currentPrice: price,
        pnl: 0,
      },
    ];
  }

  recalcAccount();
  return { success: true, trade };
}

export function tickPrices() {
  symbols = symbols.map((s) => {
    const volatility = s.price > 1000 ? 0.0003 : s.price > 10 ? 0.001 : 0.005;
    const delta = (Math.random() - 0.5) * 2 * s.price * volatility;
    const newPrice = Math.max(0.0001, s.price + delta);
    const spread = (s.ask - s.bid) || newPrice * 0.0004;
    const newBid = newPrice - spread / 2;
    const newAsk = newPrice + spread / 2;
    const change = newPrice - s.open;
    const changePercent = (change / s.open) * 100;

    return {
      ...s,
      price: Number(newPrice.toFixed(s.price < 1 ? 4 : 2)),
      bid: Number(newBid.toFixed(s.price < 1 ? 4 : 2)),
      ask: Number(newAsk.toFixed(s.price < 1 ? 4 : 2)),
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2)),
      high: Math.max(s.high, newPrice),
      low: Math.min(s.low, newPrice),
    };
  });

  positions = positions.map((p) => {
    const symbol = symbols.find((s) => s.id === p.symbolId);
    if (!symbol) return p;
    const currentPrice = p.side === "buy" ? symbol.bid : symbol.ask;
    const direction = p.side === "buy" ? 1 : -1;
    const pnl = (currentPrice - p.openPrice) * direction * p.lots * 100;
    return {
      ...p,
      currentPrice,
      pnl: Number(pnl.toFixed(2)),
    };
  });

  recalcAccount();
  return { symbols, account, positions };
}

export function getPaymentMethods() {
  return paymentMethods.filter((m) => m.enabled);
}

export function getAllPaymentMethods() {
  return paymentMethods;
}

export function getPaymentMethod(id: string) {
  return paymentMethods.find((m) => m.id === id);
}

export function addPaymentMethod(method: Omit<PaymentMethod, "id">) {
  const id = method.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const newMethod = { ...method, id };
  paymentMethods = [...paymentMethods, newMethod];
  return newMethod;
}

export function updatePaymentMethod(id: string, updates: Partial<PaymentMethod>) {
  paymentMethods = paymentMethods.map((m) =>
    m.id === id ? { ...m, ...updates } : m
  );
  return paymentMethods.find((m) => m.id === id);
}

export function deletePaymentMethod(id: string) {
  paymentMethods = paymentMethods.filter((m) => m.id !== id);
}
