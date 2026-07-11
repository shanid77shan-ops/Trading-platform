"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Headphones } from "lucide-react";
import type { PaymentCategory, PaymentMethod } from "@/lib/types";
import { cn } from "@/lib/utils";

type FilterTab = "all" | PaymentCategory;

const tabs: { id: FilterTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "bank", label: "Local Bank Transfer" },
  { id: "crypto", label: "Cryptocurrency" },
  { id: "ewallet", label: "E-wallet" },
  { id: "offline", label: "Offline" },
];

function PaymentIcon({ method }: { method: PaymentMethod }) {
  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
      style={{ backgroundColor: method.iconColor }}
    >
      {method.icon}
    </div>
  );
}

function PaymentRow({ method }: { method: PaymentMethod }) {
  return (
    <Link
      href={`/profile/deposit/${method.id}`}
      className="flex items-center gap-3 border-b border-[#141c28] px-4 py-4 transition-colors hover:bg-[#111a27]"
    >
      <PaymentIcon method={method} />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-white">{method.name}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          {method.feeLabel && (
            <span className="text-xs text-[#8a9bb0]">{method.feeLabel}</span>
          )}
          <span className="rounded border border-[#26a69a]/40 bg-[#26a69a]/10 px-2 py-0.5 text-[11px] text-[#26a69a]">
            {method.processingTime}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function DepositView() {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/deposit")
      .then((r) => r.json())
      .then((data) => {
        setMethods(data.methods);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    if (activeTab === "all") return methods;
    return methods.filter((m) => m.category === activeTab);
  }, [methods, activeTab]);

  return (
    <div className="flex min-h-screen flex-col bg-[#0b121c] pb-6">
      <header className="border-b border-[#1a2332] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/profile" className="text-white">
              <ArrowLeft size={22} />
            </Link>
            <h1 className="text-lg font-semibold text-white">Deposit</h1>
          </div>
          <button className="text-[#8a9bb0]">
            <Headphones size={22} />
          </button>
        </div>
        <p className="mt-4 text-sm text-[#8a9bb0]">Select payment method</p>
      </header>

      <div className="flex items-center border-b border-[#1a2332]">
        <div className="flex flex-1 gap-0 overflow-x-auto px-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "shrink-0 whitespace-nowrap border-b-2 px-3 py-3 text-sm transition-colors",
                activeTab === tab.id
                  ? "border-white font-medium text-white"
                  : "border-transparent text-[#8a9bb0]"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#26a69a] border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="px-4 py-12 text-center text-sm text-[#5a6a7e]">
          No payment methods available
        </p>
      ) : (
        <div className="flex-1">
          {filtered.map((method) => (
            <PaymentRow key={method.id} method={method} />
          ))}
        </div>
      )}
    </div>
  );
}
