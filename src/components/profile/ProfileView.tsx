"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  Coins,
  Copy,
  CreditCard,
  Gift,
  Headphones,
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
  { label: "Transfer", icon: Wallet, href: "#" },
  { label: "Withdraw", icon: FolderOutput, href: "#" },
  { label: "Funds", icon: Coins, href: "#" },
];

const rewardItems: GridItem[] = [
  { label: "Coupons", icon: TicketPercent, href: "#" },
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
  const [account, setAccount] = useState<Account | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [copied, setCopied] = useState(false);
  const [walletCopied, setWalletCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const { address, displayAddress, isConnected } = useConnectedWallet();

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        setAccount(data.account);
        setProfile(data.profile);
        setLoading(false);
      });
  }, []);

  function copyUid() {
    if (!profile) return;
    navigator.clipboard.writeText(profile.uid);
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
            <Link href="/admin" className="text-[#8a9bb0]">
              <Settings size={20} />
            </Link>
          </div>
        </div>
      </header>

      <Link
        href="#"
        className="mt-4 flex items-center gap-3 border-b border-[#1a2332] px-4 pb-5"
      >
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
            onClick={(e) => {
              e.preventDefault();
              copyUid();
            }}
            className="mt-0.5 flex items-center gap-1.5 text-sm text-[#8a9bb0]"
          >
            UID: {profile.uid}
            {copied ? (
              <Check size={12} className="text-[#26a69a]" />
            ) : (
              <Copy size={12} />
            )}
          </button>
          {isConnected && address && displayAddress && (
            <button
              onClick={(e) => {
                e.preventDefault();
                copyWallet();
              }}
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
      </Link>

      <div className="mt-5 px-4">
        <WalletConnectButton />
      </div>

      <GridSection title="Assets" items={assetItems} />
      <GridSection title="Rewards" items={rewardItems} />
      <GridSection title="Other" items={otherItems} />
    </div>
  );
}
