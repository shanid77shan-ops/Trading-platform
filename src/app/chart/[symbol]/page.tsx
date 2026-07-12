"use client";

import { use } from "react";
import { ChartView } from "@/components/chart/ChartView";
import { useSymbol } from "@/hooks/useMarketData";

function ChartSkeleton({ ticker }: { ticker: string }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#0b121c]">
      <div className="border-b border-[#1a2332] px-4 py-3">
        <p className="font-semibold text-white">{ticker.toUpperCase()}</p>
      </div>
      <div className="flex flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#26a69a] border-t-transparent" />
      </div>
    </div>
  );
}

export default function ChartPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol: symbolId } = use(params);
  const { symbol, position, account, loading } = useSymbol(symbolId);

  if (loading || !symbol || !account) {
    return <ChartSkeleton ticker={symbolId} />;
  }

  return <ChartView symbol={symbol} account={account} position={position} />;
}
