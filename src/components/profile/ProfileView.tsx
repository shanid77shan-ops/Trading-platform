"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  Coins,
  Copy,
  CreditCard,
  Gift,
  Headphones,
  LogOut,
  Settings,
  Shield,
  Store,
  TicketPercent,
  Wallet,
  FolderOutput,
  BadgeCheck,
  Check,
} from "lucide-react";
import type { Account, UserProfile } from "@/lib/types";
import { WalletConnectButton } from "@/components/web3/WalletConnectButton";
import { useConnectedWallet } from "@/hooks/useConnectedWallet";

interface GridItem {
  label: string;
  icon: React.ElementType;
  href: string;
  badge?: number;
}

const assetItems: GridItem[] = [
  { label: "Deposit", icon: CreditCard, href: "/profile/deposit" },
  { label: "Transfer", icon: Wallet, href: "/profile/transfer" },
  { label: "Withdraw", icon: FolderOutput, href: "/profile/withdraw" },
  { label: "Funds", icon: Coins, href: "/profile/funds" },
];

const rewardItems: GridItem[] = [
  { label: "Coupons", icon: TicketPercent, href: "/profile/coupons" },
];

const otherItems: GridItem[] = [
  { label: "Price Alerts", icon: Bell, href: "#" },
  { label: "Security", icon: Shield, href: "#", badge: 1 },
  { label: "Points Mall", icon: Store, href: "#" },
  { label: "Points Tasks", icon: Gift, href: "#" },
];

function GridSection({ title, items }: { title: string; items: GridItem[] }) {
  return (
    <section className="mt-6">
      <h2 className="mb-4 px-4 text-base font-semibold text-white">{title}</h2>
      <div className="grid grid-cols-4 gap-y-6 px-4">
        {items.map(({ label, icon: Icon, href, badge }) => (
          <Link
            key={label}
            href={href}
            className="relative flex flex-col items-center gap-2"
          >
            <div className="relative flex h-12 w-12 items-center justify-center">
              <Icon size={28} strokeWidth={1.5} className="text-white" />
              {badge && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ef5350] text-[10px] font-bold text-white">
                  {badge}
                </span>
              )}
            </div>
            <span className="text-center text-xs text-[#8a9bb0]">{label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function ProfileView() {
  const router = useRouter();
  const [account, setAccount] = useState<Account | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const [walletCopied, setWalletCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const { address, displayAddress, isConnected } = useConnectedWallet();

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => {
        if (!r.ok) throw new Error("Unauthorized");
        return r.json();
      })
      .then((data) => {
        setAccount(data.account);
        setProfile(data.profile);
        setEmail(data.email);
        setLoading(false);
      })
      .catch(() => {
        router.push("/auth/login");
      });
  }, [router]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
    router.refresh();
  }

  function copyEmail() {
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function copyWallet() {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setWalletCopied(true);
    setTimeout(() => setWalletCopied(false), 2000);
  }

  if (loading || !account || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#26a69a] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="px-4 pt-3">
        <div className="flex items-center justify-between">
          <button className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1a2a3a]">
              <span className="text-xs text-[#26a69a]">★</span>
            </div>
            <span className="text-sm font-medium text-white">{account.label}</span>
            <span className="text-sm text-[#8a9bb0]">{account.id}</span>
            <ChevronDown size={14} className="text-[#8a9bb0]" />
          </button>
          <div className="flex items-center gap-4">
            <button className="text-[#8a9bb0]">
              <Headphones size={20} />
            </button>
            <button
              onClick={handleLogout}
              className="text-[#8a9bb0]"
              aria-label="Sign out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="mt-4 flex items-center gap-3 border-b border-[#1a2332] px-4 pb-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#1a2a3a] text-2xl">
          {profile.avatar}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate font-semibold text-white">{profile.username}</p>
            {profile.verified && (
              <BadgeCheck size={16} className="shrink-0 text-[#3b82f6]" fill="#3b82f6" stroke="#0b121c" />
            )}
          </div>
          <button
            onClick={copyEmail}
            className="mt-0.5 flex items-center gap-1.5 text-sm text-[#8a9bb0]"
          >
            {email}
            {copied ? (
              <Check size={12} className="text-[#26a69a]" />
            ) : (
              <Copy size={12} />
            )}
          </button>
          <p className="mt-1 text-xs text-[#5a6a7e]">Account: {account.id}</p>
          {isConnected && address && displayAddress && (
            <button
              onClick={copyWallet}
              className="mt-1 flex items-center gap-1.5 text-sm text-[#6b8cae]"
            >
              Wallet: {displayAddress}
              {walletCopied ? (
                <Check size={12} className="text-[#26a69a]" />
              ) : (
                <Copy size={12} />
              )}
            </button>
          )}
          {profile.verified && (
            <span className="mt-1.5 inline-flex items-center gap-1 rounded-md border border-[#26a69a]/40 bg-[#26a69a]/10 px-2 py-0.5 text-[11px] text-[#26a69a]">
              <BadgeCheck size={10} />
              Verified
            </span>
          )}
        </div>
        <ChevronRight size={20} className="shrink-0 text-[#5a6a7e]" />
      </div>

      <div className="mt-5 px-4">
        <WalletConnectButton />
      </div>

      <div className="mx-4 mt-4 rounded-xl border border-[#1a2332] bg-[#111a27] p-4">
        <p className="text-xs text-[#8a9bb0]">Equity</p>
        <p className="text-xl font-semibold text-white">
          {account.equity.toFixed(2)} {account.currency}
        </p>
        <div className="mt-2 flex justify-between text-sm">
          <span className="text-[#ef5350]">PnL: {account.floatingPnl.toFixed(2)}</span>
          <span className="text-[#26a69a]">Margin: {account.marginLevel.toFixed(2)}%</span>
        </div>
      </div>

      <GridSection title="Assets" items={assetItems} />
      <GridSection title="Rewards" items={rewardItems} />
      <GridSection title="Other" items={otherItems} />
    </div>
  );
}
