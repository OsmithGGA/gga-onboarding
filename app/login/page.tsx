"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4">
      {/* Logo / Brand */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#00d4aa] flex items-center justify-center">
            <span className="text-black font-bold text-lg">G</span>
          </div>
          <span className="text-white font-semibold text-xl tracking-tight">
            Green Growth Agency
          </span>
        </div>
        <p className="text-[#888] text-sm">Client Onboarding Portal</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-[#111] border border-[#222] rounded-2xl p-8">
        {sent ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-[#00d4aa]/10 border border-[#00d4aa]/30 flex items-center justify-center mx-auto mb-5">
              <svg
                className="w-8 h-8 text-[#00d4aa]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Check your inbox
            </h2>
            <p className="text-[#888] text-sm leading-relaxed">
              We sent a magic link to{" "}
              <span className="text-white">{email}</span>. Click it to access
              your portal — no password needed.
            </p>
            <button
              onClick={() => setSent(false)}
              className="mt-6 text-sm text-[#00d4aa] hover:underline"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-semibold text-white mb-2">
              Welcome back
            </h2>
            <p className="text-[#888] text-sm mb-8">
              Enter your email to receive a secure login link.
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[#888] mb-2"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#00d4aa] focus:ring-1 focus:ring-[#00d4aa] transition-colors"
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#00d4aa] hover:bg-[#00bfa0] text-black font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:shadow-[0_0_20px_rgba(0,212,170,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Send Login Link"}
              </button>
            </form>
          </>
        )}
      </div>

      <p className="mt-6 text-[#555] text-xs text-center">
        Having trouble? Contact us at{" "}
        <a
          href="mailto:hello@greengrowthagency.com"
          className="text-[#00d4aa] hover:underline"
        >
          hello@greengrowthagency.com
        </a>
      </p>
    </div>
  );
}
