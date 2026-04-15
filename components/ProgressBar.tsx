"use client";

import { Lock } from "lucide-react";

interface Props {
  totalSteps: number;
  completedSteps: number[];
  activeStep: number;
  onStepClick: (step: number) => void;
  stepLabels: string[];
  step0Locked?: boolean; // Whether steps 1-4 are gated behind step 0
}

const SHORT_LABELS = [
  "Sign Agreement",
  "Book Call",
  "Onboarding Form",
  "Meta Access",
  "Upload Content",
];

export default function ProgressBar({
  totalSteps,
  completedSteps,
  activeStep,
  onStepClick,
  step0Locked,
}: Props) {
  const percentage = Math.round((completedSteps.length / totalSteps) * 100);
  const step0Complete = completedSteps.includes(0);

  return (
    <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-[#777]">Your Progress</p>
        <span className="text-sm font-semibold text-[#ADFF00]">
          {completedSteps.length}/{totalSteps} steps complete
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-[#1a1a1a] rounded-full mb-5 overflow-hidden">
        <div
          className="h-full rounded-full bg-[#ADFF00] transition-all duration-700 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Step indicators — steps 0 through 4 */}
      <div className="grid grid-cols-5 gap-1.5">
        {Array.from({ length: totalSteps }, (_, i) => i).map((step) => {
          const completed = completedSteps.includes(step);
          const active = activeStep === step;
          const gated = step > 0 && step0Locked && !step0Complete;
          const firstIncomplete = Array.from({ length: totalSteps }, (_, i) => i).find(
            (s) => !completedSteps.includes(s)
          );
          const clickable = !gated && (completed || step === firstIncomplete || step === activeStep);

          return (
            <button
              key={step}
              onClick={() => clickable && onStepClick(step)}
              disabled={!clickable}
              title={gated ? "Complete Step 0 first" : SHORT_LABELS[step]}
              className={`
                relative flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all duration-200
                ${clickable ? "cursor-pointer" : "cursor-default"}
                ${active && !completed ? "bg-[#ADFF00]/10 border border-[#ADFF00]/30" : ""}
                ${completed ? "bg-[#ADFF00]/5 hover:bg-[#ADFF00]/10 border border-[#ADFF00]/15" : ""}
                ${!completed && !active ? "bg-[#0a0a0a] border border-[#1a1a1a]" : ""}
                ${gated ? "opacity-30" : ""}
                ${!completed && !active && !gated && clickable ? "opacity-100" : ""}
                ${!completed && !active && !gated && !clickable ? "opacity-40" : ""}
              `}
            >
              {/* Circle */}
              <div
                className={`
                  w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                  ${completed ? "bg-[#ADFF00] text-black" : ""}
                  ${active && !completed ? "bg-[#ADFF00]/20 text-[#ADFF00] border-2 border-[#ADFF00]" : ""}
                  ${!completed && !active ? "bg-[#1a1a1a] text-[#555] border border-[#2a2a2a]" : ""}
                `}
              >
                {completed ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : gated ? (
                  <Lock className="w-3 h-3" />
                ) : (
                  step
                )}
              </div>

              {/* Label */}
              <span
                className={`
                  text-[9px] font-medium text-center leading-tight hidden md:block
                  ${completed ? "text-[#ADFF00]" : ""}
                  ${active && !completed ? "text-[#ADFF00]" : ""}
                  ${!completed && !active ? "text-[#444]" : ""}
                `}
              >
                {SHORT_LABELS[step]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
