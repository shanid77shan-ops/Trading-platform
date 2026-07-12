"use client";

import { useMemo, useState } from "react";
import { AppHeader, AccountSummary } from "@/components/layout/AppHeader";
import { CategoryTabs } from "@/components/home/CategoryTabs";
import { MarketList } from "@/components/home/MarketList";
import { useMarketData } from "@/hooks/useMarketData";
import type { AssetCategory } from "@/lib/types";

function HomeSkeleton() {
  return (
    <main className="flex min-h-screen flex-col pb-20">
      <div className="h-14 animate-pulse bg-[#111a27]" />
      <div className="mx-4 mt-4 h-20 animate-pulse rounded-xl bg-[#111a27]" />
      <div className="mt-4 flex gap-4 px-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 w-16 animate-pulse rounded bg-[#111a27]" />
        ))}
      </div>
      <div className="mt-4 space-y-2 px-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded bg-[#111a27]" />
        ))}
      </div>
    </main>
  );
}

export default function HomePage() {
  const [category, setCategory] = useState<AssetCategory | "watchlist">("watchlist");
  const { data, loading, refresh } = useMarketData();

  const filteredSymbols = useMemo(() => {
    if (!data) return [];
    if (category === "watchlist") {
      return data.symbols.filter((s) => s.inWatchlist);
    }
    return data.symbols.filter((s) => s.category === category);
  }, [data, category]);

  if (loading && !data) {
    return <HomeSkeleton />;
  }

  if (!data?.account) {
    return <HomeSkeleton />;
  }

  return (
    <main className="flex min-h-screen flex-col pb-20">
      <AppHeader account={data.account} />
      <AccountSummary account={data.account} />
      <CategoryTabs active={category} onChange={setCategory} />
      <MarketList
        symbols={filteredSymbols}
        allSymbols={data.symbols}
        showAddButton={category === "watchlist"}
        onWatchlistChange={refresh}
      />
    </main>
  );
}
