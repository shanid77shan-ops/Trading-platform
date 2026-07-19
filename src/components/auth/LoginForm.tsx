"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Sign in failed");
        setLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Unable to reach the server. Check your internet and try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0b121c] px-4 py-10">
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-semibold text-white">Welcome back</h1>
        <p className="mt-2 text-sm text-[#8a9bb0]">Sign in with your email and password</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-[#8a9bb0]">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[#1a2332] bg-[#111a27] px-4 py-3 text-white outline-none focus:border-[#26a69a]"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-[#8a9bb0]">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[#1a2332] bg-[#111a27] px-4 py-3 text-white outline-none focus:border-[#26a69a]"
              placeholder="Your password"
            />
          </div>

          {error && <p className="text-sm text-[#ef5350]">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#26a69a] py-3 font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#8a9bb0]">
          New here?{" "}
          <Link href="/auth/signup" className="text-[#26a69a]">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
