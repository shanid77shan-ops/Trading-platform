"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: name.trim() },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (data.user && !data.session) {
        setMessage("Account created. Check your email to confirm, then sign in.");
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
        <h1 className="text-2xl font-semibold text-white">Create account</h1>
        <p className="mt-2 text-sm text-[#8a9bb0]">
          Register with your name, email, and password
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-[#8a9bb0]">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-[#1a2332] bg-[#111a27] px-4 py-3 text-white outline-none focus:border-[#26a69a]"
              placeholder="Your name"
            />
          </div>
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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[#1a2332] bg-[#111a27] px-4 py-3 text-white outline-none focus:border-[#26a69a]"
              placeholder="Minimum 6 characters"
            />
          </div>

          {error && <p className="text-sm text-[#ef5350]">{error}</p>}
          {message && <p className="text-sm text-[#26a69a]">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#26a69a] py-3 font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#8a9bb0]">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-[#26a69a]">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
