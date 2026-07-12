"use client";

import { useEffect, useRef } from "react";
import { useAccount, useConnect } from "wagmi";

function isWalletBrowser() {
  if (typeof window === "undefined") return false;

  const win = window as Window & {
    ethereum?: unknown;
    trustwallet?: unknown;
    phantom?: { solana?: unknown };
  };

  return Boolean(
    win.ethereum ||
      win.trustwallet ||
      /MetaMask|TrustWallet|TokenPocket|imToken|Rainbow|CoinbaseWallet/i.test(
        navigator.userAgent
      )
  );
}

export function WalletAutoConnect() {
  const { isConnected, isConnecting } = useAccount();
  const { connect, connectors } = useConnect();
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current || isConnected || isConnecting) return;
    if (!isWalletBrowser()) return;

    attempted.current = true;

    const injected = connectors.find(
      (connector) =>
        connector.id === "injected" ||
        connector.id === "io.metamask" ||
        connector.type === "injected"
    );

    if (injected) {
      try {
        connect({ connector: injected });
      } catch {
        attempted.current = false;
      }
    }
  }, [connect, connectors, isConnected, isConnecting]);

  return null;
}

export function useWalletBrowser() {
  if (typeof window === "undefined") return false;
  return isWalletBrowser();
}
