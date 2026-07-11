"use client";

import { use } from "react";
import { ChartView } from "@/components/chart/ChartView";
import { useSymbol } from "@/hooks/useMarketData";

export default function ChartPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol: symbolId } = use(params);
  const { symbol, position, account, loading } = useSymbol(symbolId);

  if (loading || !symbol || !account) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b121c]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#26a69a] border-t-transparent" />
      </div>
    );
  }

  return <ChartView symbol={symbol} account={account} position={position} />;
}
