"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { MarketDataProvider } from "@/context/MarketDataContext";

const Web3Provider = dynamic(
  () => import("@/components/web3/Web3Provider").then((m) => m.Web3Provider),
  { ssr: false }
);

const WalletSync = dynamic(
  () => import("@/components/web3/WalletSync").then((m) => m.WalletSync),
  { ssr: false }
);

export function AppProviders({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies: string | null;
}) {
  const pathname = usePathname();
  const isAuthRoute = pathname.startsWith("/auth");

  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <MarketDataProvider>
      <Web3Provider cookies={cookies}>
        <WalletSync />
        {children}
      </Web3Provider>
    </MarketDataProvider>
  );
}
