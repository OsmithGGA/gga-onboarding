"use client";

import { useState } from "react";
import Script from "next/script";

interface Props {
  completed: boolean;
  completing: boolean;
  onComplete: (note: string) => void;
}

export default function Step1Calendly({ completed, completing, onComplete }: Props) {
  const [choice, setChoice] = useState<"book" | "already" | null>(null);

  if (completed) {
    return (
      <div className="text-center py-4">
        <div className="inline-flex items-center gap-2 text-[#00d4aa] text-sm font-medium">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Your onboarding call is booked. We look forward to speaking with you!
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="bg-[#00d4aa]/10 border border-[#00d4aa]/20 rounded-xl p-4">
        <p className="text-sm text-[#00d4aa] font-medium mb-1">📅 Book your onboarding call</p>
        <p className="text-sm text-[#888] leading-relaxed">
          If you haven't already scheduled your onboarding call with the GGA team, please do so now using the calendar below. This call is where we walk through your campaign strategy and get everything set up.
        </p>
      </div>

      {/* Booking calendar embed */}
      <div className="rounded-xl overflow-hidden border border-[#222] bg-[#0a0a0a] min-h-[600px]">
        <iframe
          src="https://api.leadconnectorhq.com/widget/booking/o0cWsep2uBig9iH9Nogy"
          style={{ width: "100%", border: "none", overflow: "hidden", minHeight: "600px" }}
          scrolling="no"
          id="o0cWsep2uBig9iH9Nogy_1776208534477"
        />
      </div>
      <Script src="https://link.msgsndr.com/js/form_embed.js" strategy="lazyOnload" />

      {/* Action buttons */}
      {!choice ? (
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              setChoice("book");
              onComplete("Booked via portal");
            }}
            disabled={completing}
            className="flex-1 bg-[#00d4aa] hover:bg-[#00bfa0] text-black font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:shadow-[0_0_20px_rgba(0,212,170,0.4)] disabled:opacity-50 text-sm"
          >
            {completing ? "Saving..." : "✅ I've just booked my call"}
          </button>
          <button
            onClick={() => {
              setChoice("already");
              onComplete("Already booked before portal");
            }}
            disabled={completing}
            className="flex-1 bg-[#1a1a1a] hover:bg-[#222] text-[#888] hover:text-white font-medium py-3 px-6 rounded-xl border border-[#333] transition-all duration-200 text-sm"
          >
            I already booked previously
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-[#00d4aa] text-sm">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Saving your progress...
        </div>
      )}
    </div>
  );
}
