"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Incorrect email or password. Please try again.");
      setLoading(false);
      return;
    }

    router.push("/portal");
    router.refresh();
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/auth/reset-password`,
    });

    setLoading(false);
    if (error) {
      setError(
        "Could not send reset email. Please check the address and try again."
      );
      return;
    }
    setResetSent(true);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4">
      {/* Logo / Header */}
      <div className="mb-10 text-center">
        <img src="/logo.png" alt="Green Growth Agency" className="h-12 w-auto mx-auto mb-4" />
        <p className="text-[#888] text-sm">
          {mode === "login"
            ? "Log in to access your onboarding portal"
            : "Reset your password"}
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-[#111] border border-[#222] rounded-2xl p-8">
        {mode === "login" ? (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">
                Welcome back
              </h2>
              <p className="text-[#666] text-sm mb-6">
                Enter your email and password to access your portal.
              </p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#888] mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl pl-10 pr-4 py-3 text-white placeholder-[#555] text-sm focus:outline-none focus:border-[#ADFF00] focus:ring-1 focus:ring-[#ADFF00]/30 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[#888] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl pl-10 pr-10 py-3 text-white placeholder-[#555] text-sm focus:outline-none focus:border-[#ADFF00] focus:ring-1 focus:ring-[#ADFF00]/30 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] hover:text-[#888] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-[#ADFF00] hover:bg-[#8FCC00] disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Log in to my portal
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setMode("forgot");
                  setError("");
                }}
                className="text-[#555] hover:text-[#888] text-sm transition-colors"
              >
                Forgot your password?
              </button>
            </div>
          </form>
        ) : resetSent ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-[#ADFF00]/10 border border-[#ADFF00]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-[#ADFF00]" />
            </div>
            <h2 className="text-white font-semibold text-lg mb-2">
              Check your inbox
            </h2>
            <p className="text-[#666] text-sm leading-relaxed mb-6">
              We&apos;ve sent a password reset link to{" "}
              <strong className="text-[#888]">{email}</strong>. Click the link
              to set a new password.
            </p>
            <button
              onClick={() => {
                setMode("login");
                setResetSent(false);
              }}
              className="text-[#ADFF00] text-sm hover:underline"
            >
              Back to login
            </button>
          </div>
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-5">
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">
                Reset your password
              </h2>
              <p className="text-[#666] text-sm mb-6">
                Enter your email and we&apos;ll send you a secure reset link.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#888] mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
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
              disabled={loading || !email}
              className="w-full bg-[#ADFF00] hover:bg-[#8FCC00] disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Send reset link"
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
                className="text-[#555] hover:text-[#888] text-sm transition-colors"
              >
                Back to login
              </button>
            </div>
          </form>
        )}
      </div>

      <p className="mt-6 text-[#555] text-xs text-center">
        Need help? Contact us at{" "}
        <a
          href="mailto:osmith.greengrowthagency@gmail.com"
          className="text-[#ADFF00] hover:underline"
        >
          osmith.greengrowthagency@gmail.com
        </a>
      </p>
    </div>
  );
}
