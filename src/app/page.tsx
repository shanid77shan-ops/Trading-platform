"use client";

import { useMemo, useState } from "react";
import { AppHeader, AccountSummary } from "@/components/layout/AppHeader";
import { CategoryTabs } from "@/components/home/CategoryTabs";
import { MarketList } from "@/components/home/MarketList";
import { useMarketData } from "@/hooks/useMarketData";
import type { AssetCategory } from "@/lib/types";

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

  if (loading || !data?.account) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#26a69a] border-t-transparent" />
      </div>
    );
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
