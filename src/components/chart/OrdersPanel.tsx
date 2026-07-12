"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, ChevronDown, Zap } from "lucide-react";
import type { Position, Symbol } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";
import { TpSlModal } from "./TpSlModal";

type OrderSubTab = "positions" | "pending";

interface TpSlSettings {
  takeProfitEnabled: boolean;
  stopLossEnabled: boolean;
  takeProfitPrice: number;
  stopLossPrice: number;
}

function calcPnl(
  position: Position,
  targetPrice: number
): number {
  const direction = position.side === "buy" ? 1 : -1;
  return (targetPrice - position.openPrice) * direction * position.lots * 100;
}

interface OrdersPanelProps {
  symbol: Symbol;
  positions: Position[];
  onClosePosition: (positionId: string) => Promise<void>;
  closingId?: string | null;
}

export function OrdersPanel({
  symbol,
  positions,
  onClosePosition,
  closingId,
}: OrdersPanelProps) {
  const [subTab, setSubTab] = useState<OrderSubTab>("positions");
  const [tpSlPosition, setTpSlPosition] = useState<Position | null>(null);
  const [tpSlMap, setTpSlMap] = useState<Record<string, TpSlSettings>>({});

  const symbolPositions = useMemo(
    () => positions.filter((p) => p.symbolId === symbol.id || p.ticker === symbol.ticker),
    [positions, symbol.id, symbol.ticker]
  );

  function getTpSlSettings(position: Position): TpSlSettings {
    return (
      tpSlMap[position.id] ?? {
        takeProfitEnabled: true,
        stopLossEnabled: false,
        takeProfitPrice: position.currentPrice,
        stopLossPrice: position.currentPrice,
      }
    );
  }

  function handleTpSlConfirm(settings: TpSlSettings) {
    if (!tpSlPosition) return;
    setTpSlMap((prev) => ({ ...prev, [tpSlPosition.id]: settings }));
    setTpSlPosition(null);
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex border-b border-[#1a2332] px-4">
        {(["positions", "pending"] as OrderSubTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setSubTab(tab)}
            className={cn(
              "mr-6 border-b-2 py-3 text-sm capitalize",
              subTab === tab
                ? "border-white font-medium text-white"
                : "border-transparent text-[#8a9bb0]"
            )}
          >
            {tab === "positions" ? "Positions" : "Pending Orders"}
          </button>
        ))}
      </div>

      {subTab === "pending" ? (
        <p className="px-4 py-12 text-center text-sm text-[#5a6a7e]">
          No pending orders
        </p>
      ) : symbolPositions.length === 0 ? (
        <p className="px-4 py-12 text-center text-sm text-[#5a6a7e]">
          No open positions for {symbol.ticker}
        </p>
      ) : (
        symbolPositions.map((pos) => {
          const isProfit = pos.pnl >= 0;
          const settings = getTpSlSettings(pos);

          return (
            <div key={pos.id} className="border-b border-[#1a2332]">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white",
                      pos.side === "buy" ? "bg-[#26a69a]" : "bg-[#ef5350]"
                    )}
                  >
                    {pos.side === "buy" ? "B" : "S"}
                  </span>
                  <span className="font-semibold text-white">{pos.ticker}</span>
                </div>
                <span
                  className={cn(
                    "text-sm font-medium",
                    isProfit ? "text-[#26a69a]" : "text-[#ef5350]"
                  )}
                >
                  {isProfit ? "+" : ""}
                  {pos.pnl.toFixed(2)} USD
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 border-t border-[#1a2332] px-4 py-3">
                <div>
                  <p className="text-[10px] text-[#5a6a7e]">Volume (Lots)</p>
                  <p className="mt-0.5 text-sm text-white">{pos.lots}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#5a6a7e]">Entry Price</p>
                  <p className="mt-0.5 text-sm text-white">
                    {formatPrice(pos.openPrice)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[#5a6a7e]">Current Price</p>
                  <p className="mt-0.5 text-sm text-white">
                    {formatPrice(pos.currentPrice)}
                  </p>
                </div>
              </div>

              {(settings.takeProfitEnabled || settings.stopLossEnabled) && (
                <div className="flex gap-3 border-t border-[#141c28] px-4 py-2 text-[10px] text-[#8a9bb0]">
                  {settings.takeProfitEnabled && (
                    <span>TP: {formatPrice(settings.takeProfitPrice)}</span>
                  )}
                  {settings.stopLossEnabled && (
                    <span>SL: {formatPrice(settings.stopLossPrice)}</span>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 overflow-x-auto border-t border-[#1a2332] px-4 py-3">
                <button
                  type="button"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#1a2332] bg-[#111a27] text-[#8a9bb0]"
                  aria-label="Reverse"
                >
                  <ArrowUpDown size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setTpSlPosition(pos)}
                  className="shrink-0 rounded-full border border-[#1a2332] bg-[#111a27] px-4 py-2 text-xs text-white"
                >
                  TP/SL
                </button>
                <button
                  type="button"
                  className="shrink-0 rounded-full border border-[#1a2332] bg-[#111a27] px-4 py-2 text-xs text-white"
                >
                  Close By
                </button>
                <button
                  type="button"
                  className="shrink-0 rounded-full border border-[#1a2332] bg-[#111a27] px-4 py-2 text-xs text-white"
                >
                  Partially Close
                </button>
                <button
                  type="button"
                  onClick={() => onClosePosition(pos.id)}
                  disabled={closingId === pos.id}
                  className="flex shrink-0 items-center gap-1 rounded-full border border-[#26a69a]/30 bg-[#111a27] px-4 py-2 text-xs text-[#26a69a] disabled:opacity-50"
                >
                  <Zap size={14} />
                  {closingId === pos.id ? "Closing..." : "Close"}
                </button>
              </div>
            </div>
          );
        })
      )}

      {tpSlPosition && (
        <TpSlModal
          position={tpSlPosition}
          settings={getTpSlSettings(tpSlPosition)}
          onClose={() => setTpSlPosition(null)}
          onConfirm={handleTpSlConfirm}
          calcPnl={calcPnl}
        />
      )}
    </div>
  );
}
