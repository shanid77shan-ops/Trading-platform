"use client";

import { useAccount } from "wagmi";

export function truncateAddress(address: string, start = 6, end = 4) {
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

export function useConnectedWallet() {
  const { address, isConnected, isConnecting, isDisconnected } = useAccount();

  return {
    address,
    isConnected,
    isConnecting,
    isDisconnected,
    displayAddress: address ? truncateAddress(address) : null,
  };
}

export function resolveCryptoDepositAddress(
  methodWalletAddress: string | undefined,
  connectedAddress: string | undefined
) {
  if (connectedAddress) return connectedAddress;
  return methodWalletAddress;
}
