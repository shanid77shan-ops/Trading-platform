"use client";

import { useState } from "react";
import Link from "next/link";
import { Moon, Search, Star, X } from "lucide-react";
import type { Symbol } from "@/lib/types";
import { cn, formatChange, formatPrice } from "@/lib/utils";

interface MarketRowProps {
  symbol: Symbol;
  showStar?: boolean;
  onToggleWatchlist?: (symbolId: string) => void;
}

export function MarketRow({ symbol, showStar, onToggleWatchlist }: MarketRowProps) {
  const isUp = symbol.changePercent >= 0;

  return (
    <div className="flex items-center border-b border-[#141c28] px-4 py-3.5 transition-colors hover:bg-[#111a27]">
      {showStar && onToggleWatchlist && (
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleWatchlist(symbol.id);
          }}
          className="mr-2 shrink-0"
          aria-label={symbol.inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
        >
          <Star
            size={16}
            className={cn(
              symbol.inWatchlist ? "fill-[#f59e0b] text-[#f59e0b]" : "text-[#5a6a7e]"
            )}
          />
        </button>
      )}
      <Link
        href={`/chart/${symbol.ticker.toLowerCase()}`}
        className="flex min-w-0 flex-1 items-center"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-white">{symbol.ticker}</span>
            {!symbol.isOpen && <Moon size={12} className="text-[#5a6a7e]" />}
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
    </div>
  );
}

interface MarketListProps {
  symbols: Symbol[];
  allSymbols?: Symbol[];
  showAddButton?: boolean;
  onWatchlistChange?: () => void;
}

export function MarketList({
  symbols,
  allSymbols = [],
  showAddButton,
  onWatchlistChange,
}: MarketListProps) {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  async function toggleWatchlist(symbolId: string) {
    await fetch("/api/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbolId }),
    });
    onWatchlistChange?.();
  }

  const available = allSymbols.filter((s) => !s.inWatchlist);
  const filtered = search
    ? available.filter(
        (s) =>
          s.ticker.toLowerCase().includes(search.toLowerCase()) ||
          s.name.toLowerCase().includes(search.toLowerCase())
      )
    : available;

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
          <MarketRow
            key={symbol.id}
            symbol={symbol}
            showStar={showAddButton}
            onToggleWatchlist={toggleWatchlist}
          />
        ))
      )}
      {showAddButton && (
        <button
          onClick={() => setShowModal(true)}
          className="mx-auto mt-4 flex items-center gap-1 rounded-lg border border-[#26a69a]/30 px-4 py-2 text-sm text-[#26a69a]"
        >
          + Add Symbol
        </button>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60">
          <div className="max-h-[70vh] w-full max-w-lg overflow-hidden rounded-t-2xl bg-[#0b121c]">
            <div className="flex items-center justify-between border-b border-[#1a2332] px-4 py-4">
              <h2 className="font-semibold text-white">Add to Watchlist</h2>
              <button onClick={() => setShowModal(false)} className="text-[#8a9bb0]">
                <X size={20} />
              </button>
            </div>
            <div className="relative mx-4 mt-4">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a6a7e]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search markets..."
                className="w-full rounded-lg border border-[#1a2332] bg-[#111a27] py-2.5 pl-9 pr-3 text-sm text-white outline-none"
              />
            </div>
            <div className="max-h-[50vh] overflow-y-auto p-4">
              {filtered.length === 0 ? (
                <p className="py-8 text-center text-sm text-[#5a6a7e]">
                  No symbols available
                </p>
              ) : (
                filtered.map((symbol) => (
                  <button
                    key={symbol.id}
                    onClick={async () => {
                      await toggleWatchlist(symbol.id);
                      setShowModal(false);
                      setSearch("");
                    }}
                    className="mb-2 flex w-full items-center justify-between rounded-lg border border-[#1a2332] bg-[#111a27] px-4 py-3 text-left"
                  >
                    <div>
                      <p className="font-medium text-white">{symbol.ticker}</p>
                      <p className="text-xs text-[#5a6a7e]">{symbol.name}</p>
                    </div>
                    <Star size={16} className="text-[#f59e0b]" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
