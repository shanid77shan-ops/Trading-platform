"use client";

import { useEffect } from "react";
import { useConnectedWallet } from "@/hooks/useConnectedWallet";

export function WalletSync() {
  const { address, isConnected } = useConnectedWallet();

  useEffect(() => {
    if (!isConnected || !address) return;

    fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet_address: address }),
    });
  }, [address, isConnected]);

  return null;
}
