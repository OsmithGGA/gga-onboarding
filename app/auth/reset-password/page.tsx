"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Loader2, CheckCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Verify there's a valid recovery session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // No session — the reset link was invalid or expired
        router.replace("/login");
      } else {
        setChecking(false);
      }
    });
  }, [router, supabase.auth]);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/portal"), 2500);
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#ADFF00] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#ADFF00] flex items-center justify-center">
            <span className="text-black font-bold text-lg">G</span>
          </div>
          <span className="text-white font-semibold text-xl tracking-tight">
            Green Growth Agency
          </span>
        </div>
        <p className="text-[#888] text-sm">Set a new password</p>
      </div>

      <div className="w-full max-w-md bg-[#111] border border-[#222] rounded-2xl p-8">
        {done ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-[#ADFF00]/10 border border-[#ADFF00]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-[#ADFF00]" />
            </div>
            <h2 className="text-white font-semibold text-lg mb-2">
              Password updated
            </h2>
            <p className="text-[#666] text-sm">
              Redirecting you to your portal...
            </p>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-5">
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">
                Set new password
              </h2>
              <p className="text-[#666] text-sm mb-6">
                Choose a strong password — at least 8 characters.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#888] mb-2">
                New password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="New password"
                  className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl pl-10 pr-10 py-3 text-white placeholder-[#555] text-sm focus:outline-none focus:border-[#ADFF00] focus:ring-1 focus:ring-[#ADFF00]/30 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] hover:text-[#888]"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#888] mb-2">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  placeholder="Confirm password"
                  className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl pl-10 pr-4 py-3 text-white placeholder-[#555] text-sm focus:outline-none focus:border-[#ADFF00] focus:ring-1 focus:ring-[#ADFF00]/30 transition-colors"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !password || !confirm}
              className="w-full bg-[#ADFF00] hover:bg-[#8FCC00] disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Update password"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
