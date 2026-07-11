"use client";

import Link from "next/link";
import { Moon } from "lucide-react";
import type { Symbol } from "@/lib/types";
import { cn, formatChange, formatPrice } from "@/lib/utils";

interface MarketRowProps {
  symbol: Symbol;
}

export function MarketRow({ symbol }: MarketRowProps) {
  const isUp = symbol.changePercent >= 0;

  return (
    <Link
      href={`/chart/${symbol.ticker.toLowerCase()}`}
      className="flex items-center border-b border-[#141c28] px-4 py-3.5 transition-colors hover:bg-[#111a27]"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-white">{symbol.ticker}</span>
          {!symbol.isOpen && (
            <Moon size={12} className="text-[#5a6a7e]" />
          )}
        </div>
        <p className="truncate text-xs text-[#5a6a7e]">{symbol.name}</p>
      </div>
      <div className="w-24 text-right">
        <span
          className={cn(
            "text-sm font-medium",
            isUp ? "text-[#26a69a]" : "text-[#ef5350]"
          )}
        >
          {formatPrice(symbol.price)}
        </span>
      </div>
      <div className="ml-3 w-20">
        <span
          className={cn(
            "inline-block w-full rounded-md px-2 py-1 text-center text-xs font-medium text-white",
            isUp ? "bg-[#26a69a]" : "bg-[#ef5350]"
          )}
        >
          {formatChange(symbol.changePercent)}
        </span>
      </div>
    </Link>
  );
}

interface MarketListProps {
  symbols: Symbol[];
  showAddButton?: boolean;
}

export function MarketList({ symbols, showAddButton }: MarketListProps) {
  return (
    <div className="flex-1">
      <div className="flex items-center border-b border-[#1a2332] px-4 py-2 text-xs text-[#5a6a7e]">
        <span className="flex-1">Symbol</span>
        <span className="w-24 text-right">Price</span>
        <span className="ml-3 w-20 text-center">%Change</span>
      </div>
      {symbols.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-[#5a6a7e]">
          No symbols in this category
        </p>
      ) : (
        symbols.map((symbol) => (
          <MarketRow key={symbol.id} symbol={symbol} />
        ))
      )}
      {showAddButton && (
        <button className="mx-auto mt-4 flex items-center gap-1 rounded-lg border border-[#26a69a]/30 px-4 py-2 text-sm text-[#26a69a]">
          + Add Symbol
        </button>
      )}
    </div>
  );
}
