export type AssetCategory =
  | "watchlist"
  | "crypto"
  | "forex"
  | "commodities"
  | "indices"
  | "metals"
  | "shares"
  | "etf";

export interface Symbol {
  id: string;
  ticker: string;
  name: string;
  category: AssetCategory;
  price: number;
  change: number;
  changePercent: number;
  bid: number;
  ask: number;
  high: number;
  low: number;
  open: number;
  close: number;
  isOpen: boolean;
  inWatchlist: boolean;
}

export interface Account {
  id: string;
  label: string;
  equity: number;
  balance: number;
  floatingPnl: number;
  marginLevel: number;
  freeMargin: number;
  currency: string;
}

export interface Position {
  id: string;
  symbolId: string;
  ticker: string;
  side: "buy" | "sell";
  lots: number;
  openPrice: number;
  currentPrice: number;
  pnl: number;
}

export interface Trade {
  id: string;
  symbolId: string;
  ticker: string;
  side: "buy" | "sell";
  lots: number;
  price: number;
  timestamp: string;
}

export interface UserProfile {
  id: string;
  username: string;
  uid: string;
  avatar: string;
  verified: boolean;
}

export interface PlatformSettings {
  platformName: string;
  spreadMultiplier: number;
  defaultLots: number;
}

export type PaymentCategory = "bank" | "crypto" | "ewallet" | "offline";

export interface PaymentMethod {
  id: string;
  name: string;
  category: PaymentCategory;
  icon: string;
  iconColor: string;
  feeLabel?: string;
  processingTime: string;
  walletAddress?: string;
  network?: string;
  minDeposit?: number;
  enabled: boolean;
}
