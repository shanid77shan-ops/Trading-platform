"use client";

import type { AssetCategory } from "@/lib/types";
import { cn } from "@/lib/utils";
import { SlidersHorizontal } from "lucide-react";

const categories: { id: AssetCategory | "watchlist"; label: string; badge?: string }[] = [
  { id: "watchlist", label: "Watchlist" },
  { id: "crypto", label: "Crypto", badge: "Open" },
  { id: "forex", label: "Forex" },
  { id: "commodities", label: "Commodities" },
  { id: "indices", label: "Indices" },
  { id: "metals", label: "Metals" },
  { id: "shares", label: "Share CFDs" },
  { id: "etf", label: "ETF" },
];

interface CategoryTabsProps {
  active: AssetCategory | "watchlist";
  onChange: (category: AssetCategory | "watchlist") => void;
}

export function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  return (
    <div className="flex items-center border-b border-[#1a2332]">
      <div className="flex flex-1 gap-1 overflow-x-auto px-4 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-2 py-3 text-sm transition-colors",
              active === cat.id
                ? "border-[#26a69a] font-semibold text-white"
                : "border-transparent text-[#8a9bb0]"
            )}
          >
            {cat.label}
            {cat.badge && (
              <span className="rounded bg-[#26a69a]/20 px-1.5 py-0.5 text-[10px] font-medium text-[#26a69a]">
                {cat.badge}
              </span>
            )}
          </button>
        ))}
      </div>
      <button className="shrink-0 px-3 py-3 text-[#8a9bb0]">
        <SlidersHorizontal size={16} />
      </button>
    </div>
  );
}
