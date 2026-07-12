"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Account, Position, Symbol, Trade } from "@/lib/types";

interface MarketData {
  symbols: Symbol[];
  account: Account | null;
  positions: Position[];
  trades: Trade[];
}

interface MarketDataContextValue {
  data: MarketData | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const MarketDataContext = createContext<MarketDataContextValue | null>(null);

const POLL_MS = 5000;
const AUTH_ROUTES = ["/auth/login", "/auth/signup"];

export function MarketDataProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const fetching = useRef(false);

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  const fetchMarket = useCallback(async (tick = false) => {
    if (fetching.current) return;
    fetching.current = true;

    try {
      const url = tick ? "/api/market?tick=1" : "/api/market";
      const res = await fetch(url, { cache: "no-store" });

      if (res.status === 401) {
        if (!tick) {
          setLoading(false);
          router.push("/auth/login");
        }
        return;
      }

      if (!res.ok) return;

      const json = await res.json();

      if (tick) {
        setData((prev) =>
          prev
            ? {
                ...prev,
                symbols: json.symbols ?? prev.symbols,
                account: json.account ?? prev.account,
                positions: json.positions ?? prev.positions,
              }
            : {
                symbols: json.symbols ?? [],
                account: json.account ?? null,
                positions: json.positions ?? [],
                trades: [],
              }
        );
      } else {
        setData({
          symbols: json.symbols ?? [],
          account: json.account ?? null,
          positions: json.positions ?? [],
          trades: json.trades ?? [],
        });
      }
      setLoading(false);
    } catch {
      setLoading(false);
    } finally {
      fetching.current = false;
    }
  }, [router]);

  const refresh = useCallback(async () => {
    await fetchMarket(false);
  }, [fetchMarket]);

  useEffect(() => {
    if (isAuthRoute) {
      setLoading(false);
      return;
    }

    fetchMarket(false);

    let interval: ReturnType<typeof setInterval> | null = null;

    function startPolling() {
      if (interval) return;
      interval = setInterval(() => {
        if (document.visibilityState === "visible") {
          fetchMarket(true);
        }
      }, POLL_MS);
    }

    function stopPolling() {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    }

    function handleVisibility() {
      if (document.visibilityState === "visible") {
        fetchMarket(true);
        startPolling();
      } else {
        stopPolling();
      }
    }

    startPolling();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isAuthRoute, fetchMarket]);

  const value = useMemo(
    () => ({ data, loading, refresh }),
    [data, loading, refresh]
  );

  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <MarketDataContext.Provider value={value}>
      {children}
    </MarketDataContext.Provider>
  );
}

export function useMarketData() {
  const ctx = useContext(MarketDataContext);
  if (!ctx) {
    throw new Error("useMarketData must be used within MarketDataProvider");
  }
  return ctx;
}

export function useSymbol(symbolId: string) {
  const { data, loading, refresh } = useMarketData();

  const symbol = data?.symbols.find(
    (s) => s.id === symbolId || s.ticker.toLowerCase() === symbolId.toLowerCase()
  );
  const position = data?.positions.find((p) => p.symbolId === symbol?.id);

  return {
    symbol,
    position,
    account: data?.account,
    loading: loading && !symbol,
    refresh,
  };
}
