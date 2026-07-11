"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import type { PaymentCategory, PaymentMethod } from "@/lib/types";
import { cn } from "@/lib/utils";

export function DepositAdmin() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [editing, setEditing] = useState<PaymentMethod | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/deposit");
    const data = await res.json();
    setMethods(data.methods);
  }

  useEffect(() => {
    load();
  }, []);

  async function save(method: Partial<PaymentMethod> & { id?: string }) {
    if (method.id) {
      await fetch("/api/admin/deposit", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(method),
      });
    } else {
      await fetch("/api/admin/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(method),
      });
    }
    setEditing(null);
    setShowAdd(false);
    load();
  }

  async function remove(id: string) {
    await fetch(`/api/admin/deposit?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-white">Deposit Methods</h2>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 rounded-lg bg-[#26a69a] px-4 py-2 text-sm font-medium text-white"
        >
          <Plus size={16} />
          Add Method
        </button>
      </div>

      {(showAdd || editing) && (
        <PaymentMethodForm
          method={editing}
          onSave={save}
          onCancel={() => {
            setShowAdd(false);
            setEditing(null);
          }}
        />
      )}

      <div className="overflow-hidden rounded-xl border border-[#1a2332]">
        <table className="w-full text-sm">
          <thead className="bg-[#141c28] text-left text-[#8a9bb0]">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Processing</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {methods.map((m) => (
              <tr key={m.id} className="border-t border-[#1a2332] text-white">
                <td className="px-4 py-3 font-medium">{m.name}</td>
                <td className="px-4 py-3 capitalize">{m.category}</td>
                <td className="px-4 py-3 text-[#8a9bb0]">{m.processingTime}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "rounded px-2 py-0.5 text-xs",
                      m.enabled
                        ? "bg-[#26a69a]/20 text-[#26a69a]"
                        : "bg-[#ef5350]/20 text-[#ef5350]"
                    )}
                  >
                    {m.enabled ? "Active" : "Disabled"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditing(m)}
                      className="text-[#8a9bb0] hover:text-white"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => remove(m.id)}
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
  );
}

function PaymentMethodForm({
  method,
  onSave,
  onCancel,
}: {
  method: PaymentMethod | null;
  onSave: (m: Partial<PaymentMethod> & { id?: string }) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: method?.name || "",
    category: (method?.category || "crypto") as PaymentCategory,
    icon: method?.icon || "₮",
    iconColor: method?.iconColor || "#26a17b",
    feeLabel: method?.feeLabel || "",
    processingTime: method?.processingTime || "1 hour",
    walletAddress: method?.walletAddress || "",
    network: method?.network || "",
    minDeposit: method?.minDeposit || 10,
    enabled: method?.enabled ?? true,
  });

  return (
    <div className="mb-6 rounded-xl border border-[#1a2332] bg-[#0b121c] p-6">
      <h3 className="mb-4 font-medium text-white">
        {method ? "Edit Payment Method" : "Add Payment Method"}
      </h3>
      <div className="grid grid-cols-3 gap-4">
        {[
          { key: "name", label: "Name" },
          { key: "category", label: "Category" },
          { key: "icon", label: "Icon" },
          { key: "iconColor", label: "Icon Color" },
          { key: "feeLabel", label: "Fee Label" },
          { key: "processingTime", label: "Processing Time" },
          { key: "walletAddress", label: "Wallet Address" },
          { key: "network", label: "Network" },
          { key: "minDeposit", label: "Min Deposit", type: "number" },
        ].map((field) => (
          <div key={field.key}>
            <label className="mb-1 block text-xs text-[#8a9bb0]">{field.label}</label>
            {field.key === "category" ? (
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value as PaymentCategory })
                }
                className="w-full rounded-lg border border-[#1a2332] bg-[#141c28] px-3 py-2 text-sm text-white outline-none focus:border-[#26a69a]"
              >
                <option value="crypto">Cryptocurrency</option>
                <option value="bank">Local Bank Transfer</option>
                <option value="ewallet">E-wallet</option>
                <option value="offline">Offline</option>
              </select>
            ) : (
              <input
                type={field.type || "text"}
                value={form[field.key as keyof typeof form] as string | number}
                onChange={(e) =>
                  setForm({
                    ...form,
                    [field.key]:
                      field.type === "number"
                        ? parseFloat(e.target.value) || 0
                        : e.target.value,
                  })
                }
                className="w-full rounded-lg border border-[#1a2332] bg-[#141c28] px-3 py-2 text-sm text-white outline-none focus:border-[#26a69a]"
              />
            )}
          </div>
        ))}
        <div className="flex items-center gap-2 pt-5">
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
            className="rounded"
          />
          <label className="text-sm text-[#8a9bb0]">Enabled</label>
        </div>
      </div>
      <div className="mt-4 flex gap-3">
        <button
          onClick={() => onSave(method ? { ...form, id: method.id } : form)}
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
