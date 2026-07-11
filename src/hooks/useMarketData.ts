"use client";

import { useEffect, useState } from "react";
import type { Account, Position, Symbol } from "@/lib/types";

interface MarketData {
  symbols: Symbol[];
  account: Account;
  positions: Position[];
}

export function useMarketData(intervalMs = 2000) {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchData(tick = false) {
      const url = tick ? "/api/symbols?tick=1" : "/api/symbols";
      const res = await fetch(url);
      const json = await res.json();

      if (!mounted) return;

      if (tick && json.symbols) {
        setData((prev) =>
          prev
            ? { ...prev, symbols: json.symbols, account: json.account, positions: json.positions }
            : null
        );
      } else {
        const [accountRes, tradesRes] = await Promise.all([
          fetch("/api/account"),
          fetch("/api/trades"),
        ]);
        const accountJson = await accountRes.json();
        const tradesJson = await tradesRes.json();

        setData({
          symbols: json.symbols,
          account: accountJson.account,
          positions: tradesJson.positions,
        });
      }
      setLoading(false);
    }

    fetchData();
    const interval = setInterval(() => fetchData(true), intervalMs);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [intervalMs]);

  return { data, loading };
}

export function useSymbol(symbolId: string) {
  const { data, loading } = useMarketData();
  const symbol = data?.symbols.find(
    (s) => s.id === symbolId || s.ticker.toLowerCase() === symbolId.toLowerCase()
  );
  const position = data?.positions.find((p) => p.symbolId === symbol?.id);

  return { symbol, position, account: data?.account, loading };
}
