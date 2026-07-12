"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  ChevronDown,
  Heart,
  Minus,
  Pencil,
  Plus,
  Settings,
  Share2,
} from "lucide-react";
import type { Account, Position, Symbol } from "@/lib/types";
import { cn, formatChange, formatPrice } from "@/lib/utils";
import { TradingChart } from "./TradingChart";

const timeframes = ["Tick", "1m", "15m", "1h", "1D", "1W", "More"];
const tabs = ["Chart", "Analysis", "Orders", "Info"];

interface ChartViewProps {
  symbol: Symbol;
  account: Account;
  position?: Position;
}

export function ChartView({ symbol, account, position }: ChartViewProps) {
  const [activeTab, setActiveTab] = useState("Chart");
  const [activeTf, setActiveTf] = useState("1m");
  const [lots, setLots] = useState(0.1);
  const [trading, setTrading] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(symbol.inWatchlist);
  const [tradeMsg, setTradeMsg] = useState("");

  const isUp = symbol.changePercent >= 0;
  const spread = Math.round((symbol.ask - symbol.bid) * (symbol.price > 100 ? 100 : 10000));

  async function toggleWatchlist() {
    const res = await fetch("/api/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbolId: symbol.id }),
    });
    if (res.ok) {
      const data = await res.json();
      setInWatchlist(data.inWatchlist);
    }
  }

  async function handleTrade(side: "buy" | "sell") {
    setTrading(true);
    setTradeMsg("");
    try {
      const res = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbolId: symbol.id, side, lots }),
      });
      const data = await res.json();
      if (!res.ok) {
        setTradeMsg(data.error ?? "Trade failed");
      } else {
        setTradeMsg(`${side.toUpperCase()} ${lots} lots executed`);
      }
    } finally {
      setTrading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0b121c]">
      <header className="border-b border-[#1a2332] px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-[#8a9bb0]">
              <ArrowLeft size={20} />
            </Link>
            <button className="flex items-center gap-1">
              <span className="font-semibold text-white">{symbol.ticker}</span>
              <ChevronDown size={14} className="text-[#8a9bb0]" />
            </button>
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
        <div className="mt-2 flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "border-b-2 pb-2 text-sm",
                activeTab === tab
                  ? "border-[#26a69a] font-medium text-white"
                  : "border-transparent text-[#8a9bb0]"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <div className="flex items-start justify-between px-4 py-3">
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

      <div className="flex items-center justify-between border-y border-[#1a2332] px-3 py-1.5">
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

      <TradingChart
        price={symbol.price}
        positionPrice={position?.openPrice}
        positionLabel={
          position
            ? `${position.side.toUpperCase()} ${position.lots} Lots ${position.pnl >= 0 ? "+" : ""}${position.pnl.toFixed(2)}`
            : undefined
        }
      />

      <div className="border-t border-[#1a2332] px-3 py-2">
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

      <div className="mt-auto border-t border-[#1a2332] bg-[#0b121c] p-4">
        <div className="mb-3 flex items-center justify-between">
          <button className="flex items-center gap-1 text-sm text-[#8a9bb0]">
            One-Tap <ChevronDown size={14} />
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLots(Math.max(0.01, lots - 0.01))}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1a2a3a] text-white"
            >
              <Minus size={16} />
            </button>
            <div className="text-center">
              <p className="text-lg font-semibold text-white">{lots.toFixed(2)}</p>
              <p className="text-[10px] text-[#5a6a7e]">Lots</p>
            </div>
            <button
              onClick={() => setLots(lots + 0.01)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1a2a3a] text-white"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleTrade("sell")}
            disabled={trading}
            className="flex flex-1 flex-col items-center rounded-xl bg-[#ef5350] py-3 disabled:opacity-60"
          >
            <span className="text-xs text-white/80">Sell</span>
            <span className="text-lg font-semibold text-white">
              {formatPrice(symbol.bid)}
            </span>
          </button>
          <div className="rounded-lg bg-[#1a2a3a] px-2 py-1 text-center">
            <span className="text-xs text-[#8a9bb0]">{spread}</span>
          </div>
          <button
            onClick={() => handleTrade("buy")}
            disabled={trading}
            className="flex flex-1 flex-col items-center rounded-xl bg-[#26a69a] py-3 disabled:opacity-60"
          >
            <span className="text-xs text-white/80">Buy</span>
            <span className="text-lg font-semibold text-white">
              {formatPrice(symbol.ask)}
            </span>
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-[#8a9bb0]">
          <span>Free Margin: {account.freeMargin.toFixed(2)} {account.currency}</span>
          <span className="text-[#26a69a]">{account.marginLevel.toFixed(2)}%</span>
        </div>
        {tradeMsg && (
          <p
            className={cn(
              "mt-2 text-center text-xs",
              tradeMsg.includes("failed") || tradeMsg.includes("Insufficient")
                ? "text-[#ef5350]"
                : "text-[#26a69a]"
            )}
          >
            {tradeMsg}
          </p>
        )}
      </div>
    </div>
  );
}
