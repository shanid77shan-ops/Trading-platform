"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, Minus, Plus, X } from "lucide-react";
import type { Position } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";

interface TpSlSettings {
  takeProfitEnabled: boolean;
  stopLossEnabled: boolean;
  takeProfitPrice: number;
  stopLossPrice: number;
}

interface TpSlModalProps {
  position: Position;
  settings: TpSlSettings;
  onClose: () => void;
  onConfirm: (settings: TpSlSettings) => void;
  calcPnl: (position: Position, targetPrice: number) => number;
}

function priceStep(price: number) {
  if (price >= 1000) return 1;
  if (price >= 1) return 0.01;
  return 0.0001;
}

export function TpSlModal({
  position,
  settings,
  onClose,
  onConfirm,
  calcPnl,
}: TpSlModalProps) {
  const [takeProfitEnabled, setTakeProfitEnabled] = useState(settings.takeProfitEnabled);
  const [stopLossEnabled, setStopLossEnabled] = useState(settings.stopLossEnabled);
  const [takeProfitPrice, setTakeProfitPrice] = useState(settings.takeProfitPrice);
  const [stopLossPrice, setStopLossPrice] = useState(settings.stopLossPrice);
  const [pnlMode, setPnlMode] = useState<"price" | "pnl">("price");

  const step = priceStep(position.currentPrice);
  const tpPnl = calcPnl(position, takeProfitPrice);
  const slPnl = calcPnl(position, stopLossPrice);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  function adjustTp(delta: number) {
    setTakeProfitPrice((p) => Math.max(0, Number((p + delta * step).toFixed(4))));
  }

  function adjustSl(delta: number) {
    setStopLossPrice((p) => Math.max(0, Number((p + delta * step).toFixed(4))));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60">
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-[#111a27]">
        <div className="flex justify-center pt-3">
          <div className="h-1 w-10 rounded-full bg-[#1a2332]" />
        </div>

        <div className="flex items-start justify-between border-b border-[#1a2332] px-4 py-4">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Take Profit/Stop Loss
            </h2>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white",
                  position.side === "buy" ? "bg-[#26a69a]" : "bg-[#ef5350]"
                )}
              >
                {position.side === "buy" ? "B" : "S"}
              </span>
              <span className="text-sm text-[#8a9bb0]">{position.ticker}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-[#8a9bb0]" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 border-b border-[#1a2332] px-4 py-4">
          <div>
            <p className="text-xs text-[#5a6a7e]">Entry Price (USD)</p>
            <p className="mt-1 text-sm font-medium text-white">
              {formatPrice(position.openPrice)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#5a6a7e]">Current Price (USD)</p>
            <p className="mt-1 text-sm font-medium text-white">
              {formatPrice(position.currentPrice)}
            </p>
          </div>
        </div>

        <div className="border-b border-[#1a2332] px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setTakeProfitEnabled((v) => !v)}
              className="flex items-center gap-2"
            >
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full border-2",
                  takeProfitEnabled
                    ? "border-[#26a69a] bg-[#26a69a]"
                    : "border-[#5a6a7e] bg-transparent"
                )}
              >
                {takeProfitEnabled && <Check size={12} className="text-white" />}
              </span>
              <span className="text-sm font-medium text-white">Take Profit</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-1 text-xs text-[#8a9bb0]"
              onClick={() => setPnlMode((m) => (m === "price" ? "pnl" : "price"))}
            >
              PnL <ChevronDown size={12} />
            </button>
          </div>

          {takeProfitEnabled && (
            <>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-[#1a2332] bg-[#0b121c] p-3">
                  <p className="text-[10px] text-[#5a6a7e]">Price (USD)</p>
                  <div className="mt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => adjustTp(-1)}
                      className="text-[#8a9bb0]"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="text-sm font-medium text-white">
                      {formatPrice(takeProfitPrice)}
                    </span>
                    <button
                      type="button"
                      onClick={() => adjustTp(1)}
                      className="text-[#8a9bb0]"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                <div className="rounded-xl border border-[#1a2332] bg-[#0b121c] p-3">
                  <p className="text-[10px] text-[#5a6a7e]">PnL (USD)</p>
                  <p
                    className={cn(
                      "mt-3 text-center text-sm font-medium",
                      tpPnl >= 0 ? "text-[#26a69a]" : "text-[#ef5350]"
                    )}
                  >
                    {tpPnl >= 0 ? "+" : ""}
                    {tpPnl.toFixed(2)}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-[#5a6a7e]">
                When the last price reaches{" "}
                <span className="font-medium text-white">
                  {formatPrice(takeProfitPrice)} USD
                </span>
                , it will trigger a{" "}
                <span className="font-medium text-white">Market Order</span>, and
                the estimated PnL will be{" "}
                <span
                  className={cn(
                    "font-medium",
                    tpPnl >= 0 ? "text-[#26a69a]" : "text-[#ef5350]"
                  )}
                >
                  {tpPnl >= 0 ? "+" : ""}
                  {tpPnl.toFixed(2)} USD
                </span>
              </p>
            </>
          )}
        </div>

        <div className="px-4 py-4">
          <button
            type="button"
            onClick={() => setStopLossEnabled((v) => !v)}
            className="flex items-center gap-2"
          >
            <span
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full border-2",
                stopLossEnabled
                  ? "border-[#26a69a] bg-[#26a69a]"
                  : "border-[#5a6a7e] bg-transparent"
              )}
            >
              {stopLossEnabled && <Check size={12} className="text-white" />}
            </span>
            <span className="text-sm font-medium text-white">Stop Loss</span>
          </button>

          {stopLossEnabled && (
            <>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-[#1a2332] bg-[#0b121c] p-3">
                  <p className="text-[10px] text-[#5a6a7e]">Price (USD)</p>
                  <div className="mt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => adjustSl(-1)}
                      className="text-[#8a9bb0]"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="text-sm font-medium text-white">
                      {formatPrice(stopLossPrice)}
                    </span>
                    <button
                      type="button"
                      onClick={() => adjustSl(1)}
                      className="text-[#8a9bb0]"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                <div className="rounded-xl border border-[#1a2332] bg-[#0b121c] p-3">
                  <p className="text-[10px] text-[#5a6a7e]">PnL (USD)</p>
                  <p
                    className={cn(
                      "mt-3 text-center text-sm font-medium",
                      slPnl >= 0 ? "text-[#26a69a]" : "text-[#ef5350]"
                    )}
                  >
                    {slPnl >= 0 ? "+" : ""}
                    {slPnl.toFixed(2)}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-[#5a6a7e]">
                When the last price reaches{" "}
                <span className="font-medium text-white">
                  {formatPrice(stopLossPrice)} USD
                </span>
                , it will trigger a{" "}
                <span className="font-medium text-white">Market Order</span>, and
                the estimated PnL will be{" "}
                <span
                  className={cn(
                    "font-medium",
                    slPnl >= 0 ? "text-[#26a69a]" : "text-[#ef5350]"
                  )}
                >
                  {slPnl >= 0 ? "+" : ""}
                  {slPnl.toFixed(2)} USD
                </span>
              </p>
            </>
          )}
        </div>

        <div className="border-t border-[#1a2332] p-4 pb-8">
          <button
            type="button"
            onClick={() =>
              onConfirm({
                takeProfitEnabled,
                stopLossEnabled,
                takeProfitPrice,
                stopLossPrice,
              })
            }
            className="w-full rounded-xl bg-[#26a69a] py-3.5 text-sm font-semibold text-white"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
