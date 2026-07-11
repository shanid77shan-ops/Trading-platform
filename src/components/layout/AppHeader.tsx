"use client";

import { ChevronDown, MessageCircle, Search } from "lucide-react";
import type { Account } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  account: Account;
}

export function AppHeader({ account }: AppHeaderProps) {
  return (
    <header className="px-4 pt-3">
      <div className="flex items-center justify-between">
        <button className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1a2a3a]">
            <span className="text-xs text-[#26a69a]">★</span>
          </div>
          <span className="text-sm font-medium text-white">{account.label}</span>
          <span className="text-sm text-[#8a9bb0]">{account.id}</span>
          <ChevronDown size={14} className="text-[#8a9bb0]" />
        </button>
        <div className="flex items-center gap-4">
          <Search size={20} className="text-[#8a9bb0]" />
          <MessageCircle size={20} className="text-[#8a9bb0]" />
        </div>
      </div>
    </header>
  );
}

interface AccountSummaryProps {
  account: Account;
}

export function AccountSummary({ account }: AccountSummaryProps) {
  const pnlPositive = account.floatingPnl >= 0;

  return (
    <section className="px-4 py-4">
      <p className="text-sm text-[#8a9bb0]">Equity</p>
      <p className="text-3xl font-semibold text-white">
        {account.equity.toFixed(2)} {account.currency}
      </p>
      <div className="mt-2 flex items-center justify-between">
        <div>
          <p className="text-xs text-[#8a9bb0]">Floating PnL</p>
          <p
            className={cn(
              "text-sm font-medium",
              pnlPositive ? "text-[#26a69a]" : "text-[#ef5350]"
            )}
          >
            {pnlPositive ? "+" : ""}
            {account.floatingPnl.toFixed(2)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[#8a9bb0]">Margin Level</p>
          <p className="text-sm font-medium text-[#26a69a]">
            {account.marginLevel.toFixed(2)}%
          </p>
        </div>
      </div>
    </section>
  );
}
