"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";
import { type ReactNode, useEffect, useState } from "react";
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";
import {
  metadata,
  networks,
  projectId,
  wagmiAdapter,
  wagmiConfig,
} from "@/config";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

let appKitReady = false;

function ensureAppKit() {
  if (appKitReady) return;
  createAppKit({
    adapters: [wagmiAdapter],
    networks,
    projectId: projectId || "00000000000000000000000000000000",
    metadata,
    themeMode: "dark",
    themeVariables: {
      "--apkt-color-mix": "#4a5d75",
      "--apkt-color-mix-strength": 20,
      "--apkt-font-family": "var(--font-geist-sans), system-ui, sans-serif",
      "--apkt-accent": "#6b8cae",
    },
  });
  appKitReady = true;
}

export function Web3Provider({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies: string | null;
}) {
  const [ready, setReady] = useState(false);
  const [client] = useState(() => queryClient);
  const initialState = cookieToInitialState(wagmiConfig as Config, cookies);

  useEffect(() => {
    ensureAppKit();
    setReady(true);
  }, []);

  if (!ready) {
    return <>{children}</>;
  }

  return (
    <WagmiProvider config={wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
