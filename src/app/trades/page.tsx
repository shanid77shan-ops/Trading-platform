"use client";

import Link from "next/link";
import { useMarketData } from "@/hooks/useMarketData";
import { cn, formatPrice } from "@/lib/utils";

export default function TradesPage() {
  const { data, loading } = useMarketData();

  if (loading || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#26a69a] border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-20 px-4 pt-6">
      <h1 className="text-xl font-semibold text-white">Open Positions</h1>
      <p className="mt-1 text-sm text-[#8a9bb0]">
        {data.positions.length} active position{data.positions.length !== 1 ? "s" : ""}
      </p>

      {data.positions.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-[#5a6a7e]">No open positions</p>
          <Link href="/" className="mt-4 inline-block text-sm text-[#26a69a]">
            Browse markets
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {data.positions.map((pos) => (
            <Link
              key={pos.id}
              href={`/chart/${pos.ticker.toLowerCase()}`}
              className="block rounded-xl border border-[#1a2332] bg-[#111a27] p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">{pos.ticker}</p>
                  <p className="text-xs capitalize text-[#8a9bb0]">
                    {pos.side} · {pos.lots} lots @ {formatPrice(pos.openPrice)}
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
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
