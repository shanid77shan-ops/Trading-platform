"use client";

import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { Web3Provider } from "@/components/web3/Web3Provider";
import { WalletSync } from "@/components/web3/WalletSync";

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
    <Web3Provider cookies={cookies}>
      <WalletSync />
      {children}
    </Web3Provider>
  );
}
