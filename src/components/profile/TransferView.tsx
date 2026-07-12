"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function TransferView() {
  const [amount, setAmount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [status, setStatus] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || !toAccount) return;
    setStatus(`Transfer of $${amount} to account ${toAccount} submitted.`);
  }

  return (
    <main className="min-h-screen px-4 pb-20 pt-6">
      <Link href="/profile" className="flex items-center gap-2 text-[#8a9bb0]">
        <ArrowLeft size={18} />
        <span className="text-sm">Back</span>
      </Link>
      <h1 className="mt-4 text-xl font-semibold text-white">Transfer</h1>
      <p className="mt-1 text-sm text-[#8a9bb0]">Move funds between your accounts</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="text-xs text-[#8a9bb0]">Destination Account</label>
          <input
            value={toAccount}
            onChange={(e) => setToAccount(e.target.value)}
            placeholder="Account number"
            className="mt-1 w-full rounded-xl border border-[#1a2332] bg-[#111a27] px-4 py-3 text-white outline-none focus:border-[#26a69a]"
          />
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
          Transfer
        </button>
      </form>

      {status && (
        <p className="mt-4 rounded-xl border border-[#26a69a]/30 bg-[#26a69a]/10 px-4 py-3 text-sm text-[#26a69a]">
          {status}
        </p>
      )}
    </main>
  );
}
