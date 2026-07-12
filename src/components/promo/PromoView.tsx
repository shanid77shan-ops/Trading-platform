"use client";

import { useState } from "react";
import { Gift, Percent, Star, Zap } from "lucide-react";
import { useMarketData } from "@/hooks/useMarketData";
import { cn } from "@/lib/utils";

const promotions = [
  {
    id: "welcome",
    title: "Welcome Bonus",
    description: "Get $10 trading credit on your first deposit of $50+",
    badge: "New User",
    icon: Gift,
    color: "border-[#26a69a]/30 bg-[#26a69a]/10",
    claimAmount: 10,
  },
  {
    id: "referral",
    title: "Refer a Friend",
    description: "Earn $25 for each friend who starts trading",
    badge: "Referral",
    icon: Star,
    color: "border-[#3b82f6]/30 bg-[#3b82f6]/10",
    claimAmount: 0,
  },
  {
    id: "zero-fee",
    title: "Zero Fee Weekend",
    description: "Trade crypto with 0% commission this weekend",
    badge: "Limited",
    icon: Percent,
    color: "border-[#f59e0b]/30 bg-[#f59e0b]/10",
    claimAmount: 0,
  },
  {
    id: "leverage",
    title: "Boost Your Trades",
    description: "Increased leverage on Forex pairs — trade with confidence",
    badge: "Forex",
    icon: Zap,
    color: "border-[#8b5cf6]/30 bg-[#8b5cf6]/10",
    claimAmount: 0,
  },
];

export function PromoView() {
  const { refresh } = useMarketData();
  const [claimed, setClaimed] = useState<Set<string>>(new Set());
  const [claiming, setClaiming] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function claimPromo(id: string, amount: number) {
    if (claimed.has(id)) return;
    setClaiming(id);
    setMessage("");

    if (amount > 0) {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deposit: amount }),
      });

      if (res.ok) {
        setClaimed((prev) => new Set(prev).add(id));
        setMessage(`$${amount} credited to your account!`);
        await refresh();
      }
    } else {
      setClaimed((prev) => new Set(prev).add(id));
      setMessage("Promotion activated!");
    }

    setClaiming(null);
  }

  return (
    <main className="min-h-screen pb-20 px-4 pt-6">
      <h1 className="text-xl font-semibold text-white">Promotions</h1>
      <p className="mt-1 text-sm text-[#8a9bb0]">Exclusive offers and rewards</p>

      {message && (
        <div className="mt-4 rounded-xl border border-[#26a69a]/30 bg-[#26a69a]/10 px-4 py-3 text-sm text-[#26a69a]">
          {message}
        </div>
      )}

      <div className="mt-6 space-y-4">
        {promotions.map((promo) => {
          const Icon = promo.icon;
          const isClaimed = claimed.has(promo.id);

          return (
            <div
              key={promo.id}
              className={cn("rounded-xl border p-5", promo.color)}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0b121c]/50">
                  <Icon size={22} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-white">{promo.title}</h2>
                    <span className="rounded bg-[#0b121c]/40 px-2 py-0.5 text-[10px] text-[#8a9bb0]">
                      {promo.badge}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[#8a9bb0]">{promo.description}</p>
                  <button
                    onClick={() => claimPromo(promo.id, promo.claimAmount)}
                    disabled={isClaimed || claiming === promo.id}
                    className={cn(
                      "mt-3 rounded-lg px-4 py-2 text-sm font-medium",
                      isClaimed
                        ? "bg-[#1a2332] text-[#5a6a7e]"
                        : "bg-[#26a69a] text-white"
                    )}
                  >
                    {isClaimed
                      ? "Claimed"
                      : claiming === promo.id
                        ? "Claiming..."
                        : promo.claimAmount > 0
                          ? `Claim $${promo.claimAmount}`
                          : "Activate"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
