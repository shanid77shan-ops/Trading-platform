"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { TrendingUp, TrendingDown, Search } from "lucide-react";
import { useMarketData } from "@/hooks/useMarketData";
import { cn, formatChange, formatPrice } from "@/lib/utils";
import type { Symbol } from "@/lib/types";

export function DiscoverView() {
  const { data, loading } = useMarketData();
  const [search, setSearch] = useState("");

  const symbols = data?.symbols ?? [];

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return symbols;
    return symbols.filter(
      (s) =>
        s.ticker.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q)
    );
  }, [symbols, search]);

  const gainers = useMemo(
    () => [...symbols].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5),
    [symbols]
  );

  const losers = useMemo(
    () => [...symbols].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5),
    [symbols]
  );

  if (loading && !data) {
    return (
      <main className="min-h-screen px-4 pt-6 pb-20">
        <div className="h-6 w-28 animate-pulse rounded bg-[#111a27]" />
        <div className="mt-4 h-10 animate-pulse rounded-xl bg-[#111a27]" />
        <div className="mt-6 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-[#111a27]" />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-20 px-4 pt-6">
      <h1 className="text-xl font-semibold text-white">Discover</h1>
      <p className="mt-1 text-sm text-[#8a9bb0]">Explore markets and trending assets</p>

      <div className="relative mt-4">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a6a7e]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search symbols..."
          className="w-full rounded-xl border border-[#1a2332] bg-[#111a27] py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-[#26a69a]"
        />
      </div>

      {!search && (
        <>
          <section className="mt-6">
            <div className="mb-3 flex items-center gap-2">
              <TrendingUp size={18} className="text-[#26a69a]" />
              <h2 className="font-semibold text-white">Top Gainers</h2>
            </div>
            {gainers.map((s) => (
              <DiscoverRow key={`g-${s.id}`} symbol={s} />
            ))}
          </section>

          <section className="mt-6">
            <div className="mb-3 flex items-center gap-2">
              <TrendingDown size={18} className="text-[#ef5350]" />
              <h2 className="font-semibold text-white">Top Losers</h2>
            </div>
            {losers.map((s) => (
              <DiscoverRow key={`l-${s.id}`} symbol={s} />
            ))}
          </section>
        </>
      )}

      {search && (
        <section className="mt-6">
          <h2 className="mb-3 font-semibold text-white">Search Results</h2>
          {filtered.length === 0 ? (
            <p className="text-sm text-[#5a6a7e]">No symbols found</p>
          ) : (
            filtered.map((s) => <DiscoverRow key={s.id} symbol={s} />)
          )}
        </section>
      )}
    </main>
  );
}

function DiscoverRow({ symbol }: { symbol: Symbol }) {
  const isUp = symbol.changePercent >= 0;

  return (
    <Link
      href={`/chart/${symbol.ticker.toLowerCase()}`}
      prefetch
      className="mb-2 flex items-center justify-between rounded-xl border border-[#1a2332] bg-[#111a27] px-4 py-3"
    >
      <div>
        <p className="font-medium text-white">{symbol.ticker}</p>
        <p className="text-xs text-[#5a6a7e]">{symbol.name}</p>
      </div>
      <div className="text-right">
        <p className={cn("font-medium", isUp ? "text-[#26a69a]" : "text-[#ef5350]")}>
          {formatPrice(symbol.price)}
        </p>
        <p className={cn("text-xs", isUp ? "text-[#26a69a]" : "text-[#ef5350]")}>
          {formatChange(symbol.changePercent)}
        </p>
      </div>
    </Link>
  );
}
