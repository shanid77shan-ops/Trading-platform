"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  ChevronDown,
  Heart,
  Pencil,
  Settings,
  Share2,
} from "lucide-react";
import type { Account, Symbol } from "@/lib/types";
import { cn, formatChange, formatPrice } from "@/lib/utils";
import { useMarketData } from "@/hooks/useMarketData";
import { OrdersPanel } from "./OrdersPanel";
import { TradingChart } from "./TradingChart";

const timeframes = ["Tick", "1m", "15m", "1h", "1D", "1W", "More"];
const tabs = ["Chart", "Orders"];
const entrustDurations = [60, 120, 190] as const;

interface ChartViewProps {
  symbol: Symbol;
  account: Account;
}

export function ChartView({ symbol, account }: ChartViewProps) {
  const { data, refresh } = useMarketData();
  const [activeTab, setActiveTab] = useState("Chart");
  const [activeTf, setActiveTf] = useState("1m");
  const [trading, setTrading] = useState(false);
  const [closingId, setClosingId] = useState<string | null>(null);
  const [inWatchlist, setInWatchlist] = useState(symbol.inWatchlist);
  const [tradeMsg, setTradeMsg] = useState("");
  const [entrustDuration, setEntrustDuration] = useState<(typeof entrustDurations)[number]>(60);
  const [entrustSide, setEntrustSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("10");
  const [ordersSubTab, setOrdersSubTab] = useState<"positions" | "pending">("positions");

  const positions = data?.positions ?? [];
  const isUp = symbol.changePercent >= 0;
  const spread = Math.round((symbol.ask - symbol.bid) * (symbol.price > 100 ? 100 : 10000));
  const showTradePanel = activeTab === "Chart";

  async function toggleWatchlist() {
    const res = await fetch("/api/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbolId: symbol.id }),
    });
    if (res.ok) {
      const json = await res.json();
      setInWatchlist(json.inWatchlist);
    }
  }

  async function handleEntrust() {
    const value = parseFloat(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setTradeMsg("Enter a valid amount");
      return;
    }
    if (value > account.freeMargin) {
      setTradeMsg("Insufficient margin");
      return;
    }

    setTrading(true);
    setTradeMsg("");
    try {
      const res = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "entrust",
          symbolId: symbol.id,
          side: entrustSide,
          amount: value,
          duration: entrustDuration,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setTradeMsg(json.error ?? "Entrust failed");
      } else {
        setTradeMsg("");
        setOrdersSubTab("pending");
        setActiveTab("Orders");
        await refresh();
      }
    } finally {
      setTrading(false);
    }
  }

  async function handleClosePosition(positionId: string) {
    setClosingId(positionId);
    await fetch("/api/trades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "close", positionId }),
    });
    await refresh();
    setClosingId(null);
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0b121c]">
      <header className="border-b border-[#1a2332] px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-[#8a9bb0]">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <button className="flex items-center gap-1">
                <span className="font-semibold text-white">{symbol.ticker}</span>
                <ChevronDown size={14} className="text-[#8a9bb0]" />
              </button>
              <p
                className={cn(
                  "text-xs",
                  isUp ? "text-[#26a69a]" : "text-[#ef5350]"
                )}
              >
                {formatPrice(symbol.price)} {formatChange(symbol.changePercent)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[#8a9bb0]">
            <button onClick={toggleWatchlist} aria-label="Toggle watchlist">
              <Heart
                size={18}
                className={cn(inWatchlist && "fill-[#ef5350] text-[#ef5350]")}
              />
            </button>
            <Bell size={18} />
            <Share2 size={18} />
          </div>
        </div>
        <div className="mt-2 flex gap-4 border-t border-[#1a2332] pt-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "border-b-2 pb-2 text-sm",
                activeTab === tab
                  ? "border-white font-medium text-white"
                  : "border-transparent text-[#8a9bb0]"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {activeTab === "Chart" && (
        <>
          <div className="flex items-start justify-between border-b border-[#1a2332] px-4 py-3">
            <div>
              <p className="text-2xl font-semibold text-white">
                {formatPrice(symbol.price)}
              </p>
              <p
                className={cn(
                  "text-sm",
                  isUp ? "text-[#26a69a]" : "text-[#ef5350]"
                )}
              >
                {isUp ? "+" : ""}
                {symbol.change.toFixed(2)} ({formatChange(symbol.changePercent)})
              </p>
            </div>
            <div className="text-right text-xs text-[#5a6a7e]">
              <p>High {formatPrice(symbol.high)}</p>
              <p>Open {formatPrice(symbol.open)}</p>
              <p>Low {formatPrice(symbol.low)}</p>
              <p>Close {formatPrice(symbol.close)}</p>
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-[#1a2332] px-3 py-1.5">
            <div className="flex gap-1 overflow-x-auto">
              {timeframes.map((tf) => (
                <button
                  key={tf}
                  onClick={() => setActiveTf(tf)}
                  className={cn(
                    "shrink-0 rounded px-2.5 py-1 text-xs",
                    activeTf === tf
                      ? "bg-[#1a2a3a] font-medium text-white"
                      : "text-[#8a9bb0]"
                  )}
                >
                  {tf}
                </button>
              ))}
            </div>
            <div className="flex gap-2 text-[#8a9bb0]">
              <Pencil size={16} />
              <Settings size={16} />
            </div>
          </div>

          <TradingChart price={symbol.price} />

          <div className="border-b border-[#1a2332] px-3 py-2">
            <div className="flex items-center justify-between text-[10px] text-[#5a6a7e]">
              <span>Volume</span>
              <span>OBV</span>
            </div>
            <div className="mt-1 h-12 rounded bg-[#111a27]">
              <svg viewBox="0 0 300 40" className="h-full w-full">
                <polyline
                  fill="none"
                  stroke="#26a69a"
                  strokeWidth="1"
                  points="0,30 30,25 60,28 90,20 120,22 150,15 180,18 210,12 240,16 270,10 300,14"
                />
              </svg>
            </div>
          </div>
        </>
      )}

      {activeTab === "Orders" && (
        <OrdersPanel
          symbol={symbol}
          positions={positions}
          onClosePosition={handleClosePosition}
          closingId={closingId}
          onRefresh={refresh}
          subTab={ordersSubTab}
          onSubTabChange={setOrdersSubTab}
        />
      )}

      {showTradePanel && (
        <div className="mt-auto border-t border-[#1a2332] bg-[#0b121c] p-4">
          <p className="mb-2 text-sm text-[#8a9bb0]">Entrust Now</p>

          <div className="mb-3 flex gap-1.5">
            {entrustDurations.map((seconds) => (
              <button
                key={seconds}
                type="button"
                onClick={() => setEntrustDuration(seconds)}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-medium",
                  entrustDuration === seconds
                    ? "bg-[#26a69a] text-white"
                    : "bg-[#1a2a3a] text-[#8a9bb0] hover:text-white"
                )}
              >
                {seconds}s
              </button>
            ))}
          </div>

          <div className="mb-3 flex gap-2">
            {(["buy", "sell"] as const).map((side) => (
              <button
                key={side}
                type="button"
                onClick={() => setEntrustSide(side)}
                className={cn(
                  "flex-1 rounded-xl py-2.5 text-sm font-semibold capitalize",
                  entrustSide === side
                    ? side === "buy"
                      ? "bg-[#26a69a] text-white"
                      : "bg-[#ef5350] text-white"
                    : "bg-[#1a2a3a] text-[#8a9bb0]"
                )}
              >
                {side}
              </button>
            ))}
          </div>

          <div className="mb-3">
            <label className="mb-1.5 block text-xs text-[#5a6a7e]">Amount (USD)</label>
            <input
              type="number"
              min="1"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl border border-[#1a2332] bg-[#111a27] px-3 py-2.5 text-white outline-none focus:border-[#26a69a]"
              placeholder="Enter amount"
            />
            <p className="mt-1.5 text-[10px] text-[#5a6a7e]">
              {entrustSide === "buy" ? "Buy" : "Sell"} @ {formatPrice(entrustSide === "buy" ? symbol.ask : symbol.bid)}
              {" · "}
              Spread {spread}
            </p>
          </div>

          <button
            type="button"
            onClick={handleEntrust}
            disabled={trading}
            className="w-full rounded-xl bg-[#26a69a] py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {trading ? "Processing..." : "Entrust Now"}
          </button>

          <div className="mt-3 flex items-center justify-between text-xs text-[#8a9bb0]">
            <span>
              Free Margin: {account.freeMargin.toFixed(2)} {account.currency}
            </span>
            <span className="text-[#26a69a]">{account.marginLevel.toFixed(2)}%</span>
          </div>
          {tradeMsg && (
            <p className="mt-2 text-center text-xs text-[#ef5350]">{tradeMsg}</p>
          )}
        </div>
      )}
    </div>
  );
}
