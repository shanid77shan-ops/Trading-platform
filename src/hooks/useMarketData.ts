"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Account, Position, Symbol } from "@/lib/types";

interface MarketData {
  symbols: Symbol[];
  account: Account;
  positions: Position[];
}

export function useMarketData(intervalMs = 2000) {
  const router = useRouter();
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchData(tick = false) {
      try {
        const url = tick ? "/api/symbols?tick=1" : "/api/symbols";
        const res = await fetch(url);

        if (res.status === 401) {
          if (mounted) {
            setLoading(false);
            router.push("/auth/login");
          }
          return;
        }

        const json = await res.json();
        if (!mounted) return;

        if (tick && json.symbols) {
          setData((prev) =>
            prev
              ? {
                  ...prev,
                  symbols: json.symbols,
                  account: json.account ?? prev.account,
                  positions: json.positions ?? prev.positions,
                }
              : null
          );
        } else {
          const [accountRes, tradesRes] = await Promise.all([
            fetch("/api/account"),
            fetch("/api/trades"),
          ]);

          if (accountRes.status === 401) {
            if (mounted) {
              setLoading(false);
              router.push("/auth/login");
            }
            return;
          }

          const accountJson = await accountRes.json();
          const tradesJson = await tradesRes.json();

          if (!accountJson.account) {
            if (mounted) setLoading(false);
            return;
          }

          setData({
            symbols: json.symbols,
            account: accountJson.account,
            positions: tradesJson.positions ?? [],
          });
        }
        if (mounted) setLoading(false);
      } catch {
        if (mounted) setLoading(false);
      }
    }

    fetchData();
    const interval = setInterval(() => fetchData(true), intervalMs);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [intervalMs, router]);

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
