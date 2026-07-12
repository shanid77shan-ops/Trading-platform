"use client";

import Link from "next/link";
import { useMarketData } from "@/hooks/useMarketData";

export function FundsView() {
  const { data, loading } = useMarketData();
  const account = data?.account;

  if (loading && !account) {
    return (
      <div className="min-h-screen px-4 pt-6 pb-20">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-[#111a27]" />
          ))}
        </div>
      </div>
    );
  }

  if (!account) return null;

  const marginUsed = Math.max(0, account.equity - account.freeMargin);

  return (
    <main className="min-h-screen px-4 pb-20 pt-6">
      <Link href="/profile" className="flex items-center gap-2 text-[#8a9bb0]">
        <span className="text-sm">← Back</span>
      </Link>
      <h1 className="mt-4 text-xl font-semibold text-white">Funds</h1>
      <div className="mt-6 space-y-3">
        {[
          { label: "Balance", value: account.balance },
          { label: "Equity", value: account.equity },
          { label: "Floating PnL", value: account.floatingPnl },
          { label: "Free Margin", value: account.freeMargin },
          { label: "Margin Used", value: marginUsed },
          { label: "Margin Level", value: account.marginLevel, suffix: "%" },
        ].map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between rounded-xl border border-[#1a2332] bg-[#111a27] px-4 py-3"
          >
            <span className="text-sm text-[#8a9bb0]">{row.label}</span>
            <span className="font-medium text-white">
              {row.value.toFixed(2)}
              {row.suffix ?? ` ${account.currency}`}
            </span>
          </div>
        ))}
      </div>
    </main>
  );
}
