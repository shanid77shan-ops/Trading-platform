"use client";

import Link from "next/link";
import { useAppKit } from "@reown/appkit/react";
import { projectId } from "@/config";
import { useConnectedWallet } from "@/hooks/useConnectedWallet";

const neuroBase =
  "rounded-2xl border border-[#4a5d75]/20 bg-[#3d4f63] text-[#e8edf4] transition-all duration-200";

const neuroRaised = `${neuroBase} shadow-[6px_6px_14px_rgba(0,0,0,0.45),-6px_-6px_14px_rgba(255,255,255,0.05)]`;

const neuroPressed = `${neuroBase} shadow-[inset_5px_5px_12px_rgba(0,0,0,0.45),inset_-5px_-5px_12px_rgba(255,255,255,0.04)]`;

export function WalletConnectPrompt() {
  const { open } = useAppKit();

  if (!projectId) return null;

  return (
    <div className="mt-6 rounded-xl border border-[#26a69a]/30 bg-[#26a69a]/10 p-5 text-center">
      <p className="text-sm font-medium text-white">Wallet not connected</p>
      <p className="mt-2 text-xs text-[#8a9bb0]">
        Connect your wallet to view your deposit address. The same address will
        be used for all cryptocurrencies.
      </p>
      <button
        type="button"
        onClick={() => open()}
        className={`mt-4 px-6 py-3 text-sm font-semibold ${neuroRaised}`}
        style={{ background: "linear-gradient(145deg, #4a5d75, #3d4f63)" }}
      >
        Connect Wallet
      </button>
      <Link
        href="/profile"
        className="mt-3 block text-xs text-[#26a69a]"
      >
        Go to Profile to connect
      </Link>
    </div>
  );
}

export function ConnectedWalletBadge({ className = "" }: { className?: string }) {
  const { address, displayAddress, isConnected } = useConnectedWallet();

  if (!isConnected || !address || !displayAddress) return null;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg border border-[#6b8cae]/30 bg-[#3d4f63]/60 px-3 py-1.5 text-xs text-[#b8c9d6] ${className}`}
    >
      <span className="inline-block h-2 w-2 rounded-full bg-[#6b8cae] shadow-[0_0_6px_#6b8cae]" />
      <span>Your wallet: {displayAddress}</span>
    </div>
  );
}
