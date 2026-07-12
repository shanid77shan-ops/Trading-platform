"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Copy, Headphones, Check } from "lucide-react";
import type { PaymentMethod } from "@/lib/types";
import {
  resolveCryptoDepositAddress,
  useConnectedWallet,
} from "@/hooks/useConnectedWallet";
import { WalletConnectPrompt } from "@/components/web3/WalletConnectPrompt";

function PaymentIcon({ method }: { method: PaymentMethod }) {
  return (
    <div
      className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white"
      style={{ backgroundColor: method.iconColor }}
    >
      {method.icon}
    </div>
  );
}

export function DepositDetailView({ methodId }: { methodId: string }) {
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const { address, isConnected } = useConnectedWallet();

  const depositAddress = method
    ? resolveCryptoDepositAddress(method.walletAddress, address)
    : undefined;

  const isCrypto = method?.category === "crypto";

  useEffect(() => {
    fetch("/api/deposit")
      .then((r) => r.json())
      .then((data) => {
        const found = data.methods.find((m: PaymentMethod) => m.id === methodId);
        setMethod(found || null);
        setLoading(false);
      });
  }, [methodId]);

  function copyAddress() {
    if (!depositAddress) return;
    navigator.clipboard.writeText(depositAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b121c]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#26a69a] border-t-transparent" />
      </div>
    );
  }

  if (!method) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0b121c] px-4">
        <p className="text-[#8a9bb0]">Payment method not found</p>
        <Link href="/profile/deposit" className="mt-4 text-[#26a69a]">
          Back to Deposit
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0b121c] pb-8">
      <header className="border-b border-[#1a2332] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/profile/deposit" className="text-white">
              <ArrowLeft size={22} />
            </Link>
            <h1 className="text-lg font-semibold text-white">{method.name}</h1>
          </div>
          <button className="text-[#8a9bb0]">
            <Headphones size={22} />
          </button>
        </div>
      </header>

      <div className="px-4 py-6">
        <div className="flex items-center gap-4">
          <PaymentIcon method={method} />
          <div>
            <p className="text-lg font-semibold text-white">{method.name}</p>
            <div className="mt-1 flex items-center gap-2">
              {method.feeLabel && (
                <span className="text-xs text-[#8a9bb0]">{method.feeLabel}</span>
              )}
              <span className="rounded border border-[#26a69a]/40 bg-[#26a69a]/10 px-2 py-0.5 text-[11px] text-[#26a69a]">
                {method.processingTime}
              </span>
            </div>
          </div>
        </div>

        {isCrypto && !isConnected ? (
          <WalletConnectPrompt />
        ) : method.walletAddress || (isCrypto && depositAddress) ? (
          <div className="mt-8">
            <p className="text-sm text-[#8a9bb0]">
              Send only {method.name.split("-")[0] || "crypto"} to this address
              {method.network ? ` on the ${method.network} network` : ""}
            </p>

            {isConnected && address && (
              <p className="mt-2 text-xs text-[#26a69a]">
                Using your connected wallet address across all cryptocurrencies
              </p>
            )}

            <div className="mt-4 flex justify-center">
              <div className="rounded-xl bg-white p-4">
                <div className="flex h-40 w-40 items-center justify-center bg-white">
                  <svg viewBox="0 0 100 100" className="h-full w-full">
                    <rect x="0" y="0" width="100" height="100" fill="white" />
                    {Array.from({ length: 10 }).map((_, row) =>
                      Array.from({ length: 10 }).map((_, col) => {
                        const seed = (depositAddress ?? method.id).length;
                        const hash = (row * 10 + col + seed) % 3;
                        if (hash === 0) return null;
                        return (
                          <rect
                            key={`${row}-${col}`}
                            x={col * 10}
                            y={row * 10}
                            width="8"
                            height="8"
                            fill="#0b121c"
                          />
                        );
                      })
                    )}
                  </svg>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs text-[#5a6a7e]">Deposit Address</p>
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-[#1a2332] bg-[#111a27] p-3">
                <p className="flex-1 break-all text-sm text-white">
                  {depositAddress}
                </p>
                <button
                  onClick={copyAddress}
                  className="shrink-0 text-[#26a69a]"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
            </div>

            {method.minDeposit && (
              <p className="mt-4 text-xs text-[#5a6a7e]">
                Minimum deposit: {method.minDeposit} USD
              </p>
            )}

            <div className="mt-6 rounded-xl border border-[#1a2332] bg-[#111a27] p-4">
              <p className="text-sm font-medium text-white">Important</p>
              <ul className="mt-2 space-y-1 text-xs text-[#8a9bb0]">
                <li>• Only send {method.name} to this address</li>
                <li>• Deposits are credited within {method.processingTime}</li>
                <li>• Sending other assets may result in permanent loss</li>
                {isConnected && (
                  <li>• This is your connected wallet address used platform-wide</li>
                )}
              </ul>
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-xl border border-[#1a2332] bg-[#111a27] p-6 text-center">
            <p className="text-white">{method.name}</p>
            <p className="mt-2 text-sm text-[#8a9bb0]">
              Contact customer support to complete your deposit via {method.name}.
            </p>
            <button className="mt-4 rounded-xl bg-[#26a69a] px-6 py-2.5 text-sm font-medium text-white">
              Contact Support
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
