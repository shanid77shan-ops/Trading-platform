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

function priceFromPnl(position: Position, pnl: number) {
  const direction = position.side === "buy" ? 1 : -1;
  const divisor = direction * position.lots * 100;
  if (divisor === 0) return position.currentPrice;
  return position.openPrice + pnl / divisor;
}

interface PricePnlInputsProps {
  position: Position;
  price: number;
  onPriceChange: (price: number) => void;
  pnlMode: "price" | "pnl";
  calcPnl: (position: Position, targetPrice: number) => number;
}

function PricePnlInputs({
  position,
  price,
  onPriceChange,
  pnlMode,
  calcPnl,
}: PricePnlInputsProps) {
  const step = priceStep(position.currentPrice);
  const pnl = calcPnl(position, price);
  const [priceInput, setPriceInput] = useState(formatPrice(price));
  const [pnlInput, setPnlInput] = useState(pnl.toFixed(2));

  useEffect(() => {
    setPriceInput(formatPrice(price));
    setPnlInput(pnl.toFixed(2));
  }, [price, pnl]);

  function commitPrice(value: string) {
    const parsed = parseFloat(value.replace(/,/g, ""));
    if (!Number.isNaN(parsed) && parsed >= 0) {
      onPriceChange(parsed);
      setPriceInput(formatPrice(parsed));
    } else {
      setPriceInput(formatPrice(price));
    }
  }

  function commitPnl(value: string) {
    const parsed = parseFloat(value.replace(/,/g, ""));
    if (!Number.isNaN(parsed)) {
      const nextPrice = priceFromPnl(position, parsed);
      onPriceChange(Math.max(0, nextPrice));
      setPnlInput(parsed.toFixed(2));
    } else {
      setPnlInput(pnl.toFixed(2));
    }
  }

  return (
    <div className="mt-3 grid grid-cols-2 gap-3">
      <div className="rounded-xl border border-[#1a2332] bg-[#0b121c] p-3">
        <p className="text-[10px] text-[#5a6a7e]">Price (USD)</p>
        <div className="mt-2 flex items-center justify-between gap-1">
          <button
            type="button"
            onClick={() => onPriceChange(Math.max(0, Number((price - step).toFixed(4))))}
            className="shrink-0 text-[#8a9bb0]"
          >
            <Minus size={16} />
          </button>
          <input
            type="text"
            inputMode="decimal"
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
            onBlur={(e) => commitPrice(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitPrice(priceInput);
            }}
            className="w-full min-w-0 bg-transparent text-center text-sm font-medium text-white outline-none selection:bg-[#26a69a]/40"
          />
          <button
            type="button"
            onClick={() => onPriceChange(Number((price + step).toFixed(4)))}
            className="shrink-0 text-[#8a9bb0]"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
      <div className="rounded-xl border border-[#1a2332] bg-[#0b121c] p-3">
        <p className="text-[10px] text-[#5a6a7e]">PnL (USD)</p>
        {pnlMode === "pnl" ? (
          <input
            type="text"
            inputMode="decimal"
            value={pnlInput}
            onChange={(e) => setPnlInput(e.target.value)}
            onBlur={(e) => commitPnl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitPnl(pnlInput);
            }}
            className={cn(
              "mt-3 w-full bg-transparent text-center text-sm font-medium outline-none selection:bg-[#26a69a]/40",
              pnl >= 0 ? "text-[#26a69a]" : "text-[#ef5350]"
            )}
          />
        ) : (
          <p
            className={cn(
              "mt-3 text-center text-sm font-medium",
              pnl >= 0 ? "text-[#26a69a]" : "text-[#ef5350]"
            )}
          >
            {pnl >= 0 ? "+" : ""}
            {pnl.toFixed(2)}
          </p>
        )}
      </div>
    </div>
  );
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

  const tpPnl = calcPnl(position, takeProfitPrice);
  const slPnl = calcPnl(position, stopLossPrice);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

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
              <PricePnlInputs
                position={position}
                price={takeProfitPrice}
                onPriceChange={setTakeProfitPrice}
                pnlMode={pnlMode}
                calcPnl={calcPnl}
              />
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
              <PricePnlInputs
                position={position}
                price={stopLossPrice}
                onPriceChange={setStopLossPrice}
                pnlMode={pnlMode}
                calcPnl={calcPnl}
              />
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
