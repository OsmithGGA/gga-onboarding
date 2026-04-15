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
      <div className="flex items-start gap-3 p-5 bg-[#ADFF00]/5 border border-[#ADFF00]/20 rounded-xl">
        <svg className="w-5 h-5 text-[#ADFF00] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-[#ADFF00] text-sm font-medium">
          Onboarding call booked. We&apos;ll see you then — come with any questions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">📅</span>
          <h3 className="text-white font-semibold text-base">Book Your Onboarding Call</h3>
        </div>
        <p className="text-[#888] text-sm leading-relaxed">
          Your onboarding call is where we walk through your campaign strategy together, answer any questions from the portal, and make sure everything is set up for a strong launch.
        </p>
        <p className="text-[#888] text-sm leading-relaxed">
          If you haven&apos;t already booked your call, use the calendar below to pick a time that suits you. The call takes around 30 minutes and is with your dedicated GGA account manager.
        </p>
        <p className="text-[#888] text-sm">
          If Keelan or Oran has already scheduled a time with you directly, simply confirm below and move on to the next step.
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
            className="flex-1 bg-[#ADFF00] hover:bg-[#8FCC00] text-black font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:shadow-[0_0_20px_rgba(173,255,0,0.4)] disabled:opacity-50 text-sm"
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
        <div className="flex items-center gap-2 text-[#ADFF00] text-sm">
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
