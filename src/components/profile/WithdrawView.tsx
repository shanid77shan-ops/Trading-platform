"use client";

import { useState } from "react";
import Link from "next/link";
import { useMarketData } from "@/hooks/useMarketData";

export function WithdrawView() {
  const { data } = useMarketData();
  const account = data?.account;
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bank");
  const [status, setStatus] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = parseFloat(amount);
    if (!account || !value || value > account.balance) {
      setStatus("Insufficient balance or invalid amount.");
      return;
    }
    setStatus(`Withdrawal of $${value.toFixed(2)} via ${method} is being processed.`);
  }

  return (
    <main className="min-h-screen px-4 pb-20 pt-6">
      <Link href="/profile" className="flex items-center gap-2 text-[#8a9bb0]">
        <span className="text-sm">← Back</span>
      </Link>
      <h1 className="mt-4 text-xl font-semibold text-white">Withdraw</h1>
      {account && (
        <p className="mt-1 text-sm text-[#8a9bb0]">
          Available: {account.balance.toFixed(2)} {account.currency}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="text-xs text-[#8a9bb0]">Method</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[#1a2332] bg-[#111a27] px-4 py-3 text-white outline-none"
          >
            <option value="bank">Bank Transfer</option>
            <option value="crypto">Crypto Wallet</option>
            <option value="ewallet">E-Wallet</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-[#8a9bb0]">Amount (USD)</label>
          <input
            type="number"
            min="1"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="mt-1 w-full rounded-xl border border-[#1a2332] bg-[#111a27] px-4 py-3 text-white outline-none focus:border-[#26a69a]"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-xl bg-[#26a69a] py-3 font-medium text-white"
        >
          Request Withdrawal
        </button>
      </form>

      {status && (
        <p className="mt-4 rounded-xl border border-[#3b82f6]/30 bg-[#3b82f6]/10 px-4 py-3 text-sm text-[#3b82f6]">
          {status}
        </p>
      )}
    </main>
  );
}
