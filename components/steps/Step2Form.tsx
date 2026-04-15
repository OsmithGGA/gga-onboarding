"use client";

import Script from "next/script";

interface Props {
  completed: boolean;
  completing: boolean;
  onComplete: () => void;
}

export default function Step2Form({ completed, completing, onComplete }: Props) {
  if (completed) {
    return (
      <div className="text-center py-4">
        <div className="inline-flex items-center gap-2 text-[#ADFF00] text-sm font-medium">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Onboarding form submitted. Thank you!
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Explanation */}
      <div className="bg-[#ADFF00]/10 border border-[#ADFF00]/20 rounded-xl p-4">
        <p className="text-sm text-[#ADFF00] font-medium mb-1">📋 Why this matters</p>
        <p className="text-sm text-[#888] leading-relaxed">
          This form gives us everything we need to build your campaign correctly from day one — your target area, ideal customer, unique selling points, and business details. The more detail you provide, the better your ads will perform.
        </p>
      </div>

      {/* Onboarding form embed */}
      <div className="rounded-xl overflow-hidden border border-[#222] bg-[#0a0a0a] min-h-[700px]">
        <iframe
          src="https://api.leadconnectorhq.com/widget/survey/kFYnxrKKQD6Hl4JqomgG"
          style={{ border: "none", width: "100%", minHeight: "700px" }}
          scrolling="no"
          id="kFYnxrKKQD6Hl4JqomgG"
          title="survey"
        />
      </div>

      <Script src="https://link.msgsndr.com/js/form_embed.js" strategy="lazyOnload" />

      {/* Complete button */}
      <button
        onClick={onComplete}
        disabled={completing}
        className="w-full bg-[#ADFF00] hover:bg-[#8FCC00] text-black font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:shadow-[0_0_20px_rgba(173,255,0,0.4)] disabled:opacity-50 text-sm"
      >
        {completing ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Saving...
          </span>
        ) : (
          "✅ I've submitted the form"
        )}
      </button>
    </div>
  );
}
