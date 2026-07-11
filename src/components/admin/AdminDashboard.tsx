"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Settings,
  Coins,
  Users,
  TrendingUp,
  Plus,
  Trash2,
  Pencil,
  Wallet,
} from "lucide-react";
import { DepositAdmin } from "./DepositAdmin";
import type { Account, PlatformSettings, Symbol, Trade } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";

type AdminTab = "overview" | "symbols" | "deposit" | "account" | "settings";

export function AdminDashboard() {
  const [tab, setTab] = useState<AdminTab>("overview");
  const [account, setAccount] = useState<Account | null>(null);
  const [symbols, setSymbols] = useState<Symbol[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [editingSymbol, setEditingSymbol] = useState<Symbol | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  async function loadData() {
    const res = await fetch("/api/admin/overview");
    const data = await res.json();
    setAccount(data.account);
    setSymbols(data.symbols);
    setTrades(data.trades);
    setSettings(data.settings);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function saveAccount(updates: Partial<Account>) {
    const res = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    setAccount(data.account);
  }

  async function saveSettings(updates: Partial<PlatformSettings>) {
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    setSettings(data.settings);
  }

  async function saveSymbol(symbol: Partial<Symbol> & { id?: string }) {
    if (symbol.id) {
      await fetch("/api/admin/symbols", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(symbol),
      });
    } else {
      await fetch("/api/admin/symbols", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(symbol),
      });
    }
    setEditingSymbol(null);
    setShowAddForm(false);
    loadData();
  }

  async function deleteSymbol(id: string) {
    await fetch(`/api/admin/symbols?id=${id}`, { method: "DELETE" });
    loadData();
  }

  const navItems: { id: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "symbols", label: "Symbols", icon: Coins },
    { id: "deposit", label: "Deposit", icon: Wallet },
    { id: "account", label: "Account", icon: Users },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-[#0a0f18]">
      <aside className="w-56 shrink-0 border-r border-[#1a2332] bg-[#0b121c] p-4">
        <div className="mb-8">
          <h1 className="text-lg font-bold text-white">TradeHub Admin</h1>
          <p className="text-xs text-[#5a6a7e]">Platform Management</p>
        </div>
        <nav className="space-y-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                tab === id
                  ? "bg-[#26a69a]/15 text-[#26a69a]"
                  : "text-[#8a9bb0] hover:bg-[#141c28]"
              )}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>
        <Link
          href="/"
          className="mt-8 flex items-center gap-2 text-sm text-[#8a9bb0] hover:text-white"
        >
          <TrendingUp size={16} />
          View Trading App
        </Link>
      </aside>

      <main className="flex-1 overflow-auto p-8">
        {tab === "overview" && account && (
          <div>
            <h2 className="mb-6 text-2xl font-semibold text-white">Overview</h2>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Equity", value: `$${account.equity.toFixed(2)}` },
                { label: "Balance", value: `$${account.balance.toFixed(2)}` },
                { label: "Floating PnL", value: `$${account.floatingPnl.toFixed(2)}`, color: account.floatingPnl < 0 ? "text-[#ef5350]" : "text-[#26a69a]" },
                { label: "Symbols", value: symbols.length.toString() },
              ].map((card) => (
                <div
                  key={card.label}
                  className="rounded-xl border border-[#1a2332] bg-[#0b121c] p-5"
                >
                  <p className="text-sm text-[#5a6a7e]">{card.label}</p>
                  <p className={cn("mt-1 text-2xl font-semibold text-white", card.color)}>
                    {card.value}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <h3 className="mb-4 text-lg font-medium text-white">Recent Trades</h3>
              {trades.length === 0 ? (
                <p className="text-sm text-[#5a6a7e]">No trades yet</p>
              ) : (
                <div className="overflow-hidden rounded-xl border border-[#1a2332]">
                  <table className="w-full text-sm">
                    <thead className="bg-[#141c28] text-left text-[#8a9bb0]">
                      <tr>
                        <th className="px-4 py-3">Symbol</th>
                        <th className="px-4 py-3">Side</th>
                        <th className="px-4 py-3">Lots</th>
                        <th className="px-4 py-3">Price</th>
                        <th className="px-4 py-3">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trades.slice(0, 10).map((t) => (
                        <tr key={t.id} className="border-t border-[#1a2332] text-white">
                          <td className="px-4 py-3">{t.ticker}</td>
                          <td className={cn("px-4 py-3 capitalize", t.side === "buy" ? "text-[#26a69a]" : "text-[#ef5350]")}>
                            {t.side}
                          </td>
                          <td className="px-4 py-3">{t.lots}</td>
                          <td className="px-4 py-3">{formatPrice(t.price)}</td>
                          <td className="px-4 py-3 text-[#8a9bb0]">
                            {new Date(t.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "symbols" && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">Manage Symbols</h2>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 rounded-lg bg-[#26a69a] px-4 py-2 text-sm font-medium text-white"
              >
                <Plus size={16} />
                Add Symbol
              </button>
            </div>

            {(showAddForm || editingSymbol) && (
              <SymbolForm
                symbol={editingSymbol}
                onSave={saveSymbol}
                onCancel={() => {
                  setShowAddForm(false);
                  setEditingSymbol(null);
                }}
              />
            )}

            <div className="overflow-hidden rounded-xl border border-[#1a2332]">
              <table className="w-full text-sm">
                <thead className="bg-[#141c28] text-left text-[#8a9bb0]">
                  <tr>
                    <th className="px-4 py-3">Ticker</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Change %</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {symbols.map((s) => (
                    <tr key={s.id} className="border-t border-[#1a2332] text-white">
                      <td className="px-4 py-3 font-medium">{s.ticker}</td>
                      <td className="px-4 py-3 text-[#8a9bb0]">{s.name}</td>
                      <td className="px-4 py-3 capitalize">{s.category}</td>
                      <td className="px-4 py-3">{formatPrice(s.price)}</td>
                      <td className={cn("px-4 py-3", s.changePercent >= 0 ? "text-[#26a69a]" : "text-[#ef5350]")}>
                        {s.changePercent >= 0 ? "+" : ""}{s.changePercent}%
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingSymbol(s)}
                            className="text-[#8a9bb0] hover:text-white"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => deleteSymbol(s.id)}
                            className="text-[#ef5350] hover:text-red-400"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "deposit" && <DepositAdmin />}

        {tab === "account" && account && (
          <div>
            <h2 className="mb-6 text-2xl font-semibold text-white">Account Settings</h2>
            <div className="max-w-md space-y-4">
              {[
                { key: "label", label: "Account Label" },
                { key: "balance", label: "Balance", type: "number" },
                { key: "freeMargin", label: "Free Margin", type: "number" },
                { key: "marginLevel", label: "Margin Level %", type: "number" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="mb-1 block text-sm text-[#8a9bb0]">{field.label}</label>
                  <input
                    type={field.type || "text"}
                    defaultValue={account[field.key as keyof Account] as string | number}
                    onBlur={(e) =>
                      saveAccount({
                        [field.key]: field.type === "number" ? parseFloat(e.target.value) : e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-[#1a2332] bg-[#141c28] px-4 py-2.5 text-white outline-none focus:border-[#26a69a]"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "settings" && settings && (
          <div>
            <h2 className="mb-6 text-2xl font-semibold text-white">Platform Settings</h2>
            <div className="max-w-md space-y-4">
              <div>
                <label className="mb-1 block text-sm text-[#8a9bb0]">Platform Name</label>
                <input
                  defaultValue={settings.platformName}
                  onBlur={(e) => saveSettings({ platformName: e.target.value })}
                  className="w-full rounded-lg border border-[#1a2332] bg-[#141c28] px-4 py-2.5 text-white outline-none focus:border-[#26a69a]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-[#8a9bb0]">Default Lot Size</label>
                <input
                  type="number"
                  step="0.01"
                  defaultValue={settings.defaultLots}
                  onBlur={(e) => saveSettings({ defaultLots: parseFloat(e.target.value) })}
                  className="w-full rounded-lg border border-[#1a2332] bg-[#141c28] px-4 py-2.5 text-white outline-none focus:border-[#26a69a]"
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function SymbolForm({
  symbol,
  onSave,
  onCancel,
}: {
  symbol: Symbol | null;
  onSave: (s: Partial<Symbol> & { id?: string }) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    ticker: symbol?.ticker || "",
    name: symbol?.name || "",
    category: symbol?.category || "crypto",
    price: symbol?.price || 0,
    changePercent: symbol?.changePercent || 0,
    bid: symbol?.bid || 0,
    ask: symbol?.ask || 0,
    high: symbol?.high || 0,
    low: symbol?.low || 0,
    open: symbol?.open || 0,
    close: symbol?.close || 0,
    isOpen: symbol?.isOpen ?? true,
    inWatchlist: symbol?.inWatchlist ?? false,
  });

  return (
    <div className="mb-6 rounded-xl border border-[#1a2332] bg-[#0b121c] p-6">
      <h3 className="mb-4 font-medium text-white">
        {symbol ? "Edit Symbol" : "Add New Symbol"}
      </h3>
      <div className="grid grid-cols-3 gap-4">
        {[
          { key: "ticker", label: "Ticker" },
          { key: "name", label: "Name" },
          { key: "category", label: "Category" },
          { key: "price", label: "Price", type: "number" },
          { key: "bid", label: "Bid", type: "number" },
          { key: "ask", label: "Ask", type: "number" },
          { key: "open", label: "Open", type: "number" },
          { key: "high", label: "High", type: "number" },
          { key: "low", label: "Low", type: "number" },
          { key: "changePercent", label: "Change %", type: "number" },
        ].map((field) => (
          <div key={field.key}>
            <label className="mb-1 block text-xs text-[#8a9bb0]">{field.label}</label>
            <input
              type={field.type || "text"}
              value={form[field.key as keyof typeof form] as string | number}
              onChange={(e) =>
                setForm({
                  ...form,
                  [field.key]: field.type === "number" ? parseFloat(e.target.value) || 0 : e.target.value,
                })
              }
              className="w-full rounded-lg border border-[#1a2332] bg-[#141c28] px-3 py-2 text-sm text-white outline-none focus:border-[#26a69a]"
            />
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-3">
        <button
          onClick={() => onSave(symbol ? { ...form, id: symbol.id } : form)}
          className="rounded-lg bg-[#26a69a] px-4 py-2 text-sm font-medium text-white"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="rounded-lg border border-[#1a2332] px-4 py-2 text-sm text-[#8a9bb0]"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
