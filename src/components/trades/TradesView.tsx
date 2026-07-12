"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { cn, formatPrice } from "@/lib/utils";
import { useMarketData } from "@/hooks/useMarketData";

type Tab = "positions" | "history";

export function TradesView() {
  const { data, loading, refresh } = useMarketData();
  const [tab, setTab] = useState<Tab>("positions");
  const [closing, setClosing] = useState<string | null>(null);

  const positions = data?.positions ?? [];
  const trades = data?.trades ?? [];

  async function closePosition(positionId: string) {
    setClosing(positionId);
    await fetch("/api/trades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "close", positionId }),
    });
    await refresh();
    setClosing(null);
  }

  const totalPnl = useMemo(
    () => positions.reduce((sum, p) => sum + p.pnl, 0),
    [positions]
  );

  if (loading && !data) {
    return (
      <div className="min-h-screen px-4 pt-6 pb-20">
        <div className="h-6 w-24 animate-pulse rounded bg-[#111a27]" />
        <div className="mt-4 h-20 animate-pulse rounded-xl bg-[#111a27]" />
        <div className="mt-6 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-[#111a27]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-20">
      <div className="px-4 pt-6">
        <h1 className="text-xl font-semibold text-white">Trades</h1>
        <div className="mt-3 flex items-center justify-between rounded-xl border border-[#1a2332] bg-[#111a27] p-4">
          <div>
            <p className="text-xs text-[#8a9bb0]">Total Floating PnL</p>
            <p
              className={cn(
                "text-lg font-semibold",
                totalPnl >= 0 ? "text-[#26a69a]" : "text-[#ef5350]"
              )}
            >
              {totalPnl >= 0 ? "+" : ""}
              {totalPnl.toFixed(2)} USD
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#8a9bb0]">Open Positions</p>
            <p className="text-lg font-semibold text-white">{positions.length}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex border-b border-[#1a2332] px-4">
        {(["positions", "history"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "mr-6 border-b-2 py-3 text-sm capitalize",
              tab === t
                ? "border-[#26a69a] font-medium text-white"
                : "border-transparent text-[#8a9bb0]"
            )}
          >
            {t === "positions" ? "Open Positions" : "Order History"}
          </button>
        ))}
      </div>

      {tab === "positions" ? (
        positions.length === 0 ? (
          <div className="mt-12 px-4 text-center">
            <p className="text-[#5a6a7e]">No open positions</p>
            <Link href="/" className="mt-4 inline-block text-sm text-[#26a69a]">
              Browse markets to trade
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-3 px-4">
            {positions.map((pos) => (
              <div
                key={pos.id}
                className="rounded-xl border border-[#1a2332] bg-[#111a27] p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <Link
                      href={`/chart/${pos.ticker.toLowerCase()}`}
                      className="font-semibold text-white"
                    >
                      {pos.ticker}
                    </Link>
                    <p className="mt-1 text-xs capitalize text-[#8a9bb0]">
                      {pos.side} · {pos.lots} lots @ {formatPrice(pos.openPrice)}
                    </p>
                    <p className="mt-1 text-xs text-[#5a6a7e]">
                      Current: {formatPrice(pos.currentPrice)}
                    </p>
                  </div>
                  <p
                    className={cn(
                      "text-lg font-semibold",
                      pos.pnl >= 0 ? "text-[#26a69a]" : "text-[#ef5350]"
                    )}
                  >
                    {pos.pnl >= 0 ? "+" : ""}
                    {pos.pnl.toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => closePosition(pos.id)}
                  disabled={closing === pos.id}
                  className="mt-3 w-full rounded-lg border border-[#ef5350]/40 py-2 text-sm text-[#ef5350] disabled:opacity-50"
                >
                  {closing === pos.id ? "Closing..." : "Close Position"}
                </button>
              </div>
            ))}
          </div>
        )
      ) : trades.length === 0 ? (
        <div className="mt-12 px-4 text-center text-sm text-[#5a6a7e]">
          No trade history yet
        </div>
      ) : (
        <div className="mt-4 px-4">
          <div className="flex border-b border-[#1a2332] py-2 text-xs text-[#5a6a7e]">
            <span className="flex-1">Symbol</span>
            <span className="w-16">Side</span>
            <span className="w-20 text-right">Lots</span>
            <span className="w-24 text-right">Price</span>
          </div>
          {trades.map((trade) => (
            <div
              key={trade.id}
              className="flex items-center border-b border-[#141c28] py-3 text-sm"
            >
              <span className="flex-1 font-medium text-white">{trade.ticker}</span>
              <span
                className={cn(
                  "w-16 capitalize",
                  trade.side === "buy" ? "text-[#26a69a]" : "text-[#ef5350]"
                )}
              >
                {trade.side}
              </span>
              <span className="w-20 text-right text-[#8a9bb0]">{trade.lots}</span>
              <span className="w-24 text-right text-white">
                {formatPrice(trade.price)}
              </span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
