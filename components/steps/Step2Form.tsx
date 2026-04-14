"use client";

interface Props {
  completed: boolean;
  completing: boolean;
  onComplete: () => void;
}

export default function Step2Form({ completed, completing, onComplete }: Props) {
  if (completed) {
    return (
      <div className="text-center py-4">
        <div className="inline-flex items-center gap-2 text-[#00d4aa] text-sm font-medium">
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
      <div className="bg-[#00d4aa]/10 border border-[#00d4aa]/20 rounded-xl p-4">
        <p className="text-sm text-[#00d4aa] font-medium mb-1">📋 Why this matters</p>
        <p className="text-sm text-[#888] leading-relaxed">
          This form gives us everything we need to build your campaign correctly from day one — your target area, ideal customer, unique selling points, and business details. The more detail you provide, the better your ads will perform.
        </p>
      </div>

      {/* GoHighLevel form embed placeholder */}
      <div className="rounded-xl overflow-hidden border border-[#222] bg-[#0a0a0a] min-h-[700px] flex items-center justify-center">
        {/*
          REPLACE THIS DIV with your GoHighLevel form embed code.
          It will look something like:
          <iframe src="https://api.leadconnectorhq.com/widget/form/YOUR_FORM_ID"
            style={{width:'100%', height:'700px', border:'none', borderRadius:'12px'}}
            id="inline-YOUR_FORM_ID"
          />
          <script src="https://link.msgsndr.com/js/form_embed.js" type="text/javascript"></script>
        */}
        <div className="text-center px-8 py-12">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-[#555] text-sm font-medium mb-2">GoHighLevel form embed goes here</p>
          <p className="text-[#444] text-xs max-w-xs">
            Replace this placeholder with your GoHighLevel inline form embed code
          </p>
        </div>
      </div>

      {/* Complete button */}
      <button
        onClick={onComplete}
        disabled={completing}
        className="w-full bg-[#00d4aa] hover:bg-[#00bfa0] text-black font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:shadow-[0_0_20px_rgba(0,212,170,0.4)] disabled:opacity-50 text-sm"
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
