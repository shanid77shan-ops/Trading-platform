"use client";

import { useAppKit } from "@reown/appkit/react";
import { useAccount } from "wagmi";
import { projectId } from "@/config";

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

const neuroBase =
  "rounded-2xl border border-[#4a5d75]/20 bg-[#3d4f63] text-[#e8edf4] transition-all duration-200";

const neuroRaised = `${neuroBase} shadow-[6px_6px_14px_rgba(0,0,0,0.45),-6px_-6px_14px_rgba(255,255,255,0.05)] hover:shadow-[4px_4px_10px_rgba(0,0,0,0.4),-4px_-4px_10px_rgba(255,255,255,0.04)]`;

const neuroPressed = `${neuroBase} shadow-[inset_5px_5px_12px_rgba(0,0,0,0.45),inset_-5px_-5px_12px_rgba(255,255,255,0.04)]`;

function WalletConnectButtonInner() {
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();

  return (
    <div
      className={`${neuroRaised} p-5`}
      style={{ background: "linear-gradient(145deg, #425468, #364656)" }}
    >
      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-[#8fa3b8]">
        Web3 Wallet
      </p>
      <p className="mb-4 text-sm text-[#b8c9d6]">
        {isConnected && address
          ? "Connected via Trust Wallet or compatible wallet"
          : "Connect your wallet to get started"}
      </p>

      <button
        type="button"
        onClick={() => open()}
        className={`w-full px-6 py-3.5 text-sm font-semibold ${isConnected ? neuroPressed : neuroRaised} active:shadow-[inset_5px_5px_12px_rgba(0,0,0,0.45),inset_-5px_-5px_12px_rgba(255,255,255,0.04)]`}
        style={{ background: "linear-gradient(145deg, #4a5d75, #3d4f63)" }}
      >
        {isConnected && address ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-[#6b8cae] shadow-[0_0_6px_#6b8cae]" />
            {truncateAddress(address)}
          </span>
        ) : (
          "Connect Wallet"
        )}
      </button>
    </div>
  );
}

export function WalletConnectButton() {
  if (!projectId) {
    return (
      <div
        className={`${neuroRaised} px-5 py-4 text-center text-sm text-[#9aabb8]`}
      >
        Set{" "}
        <code className="text-[#b8c9d6]">NEXT_PUBLIC_PROJECT_ID</code> in your
        environment to enable wallet connection.
      </div>
    );
  }

  return <WalletConnectButtonInner />;
}
