"use client";

interface Props {
  totalSteps: number;
  completedSteps: number[];
  activeStep: number;
  onStepClick: (step: number) => void;
  stepLabels: string[];
}

export default function ProgressBar({
  totalSteps,
  completedSteps,
  activeStep,
  onStepClick,
  stepLabels,
}: Props) {
  const percentage = Math.round((completedSteps.length / totalSteps) * 100);

  return (
    <div className="bg-[#111] border border-[#222] rounded-2xl p-6">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-[#888]">Onboarding Progress</p>
        <span className="text-sm font-semibold text-[#00d4aa]">
          {completedSteps.length}/{totalSteps} steps complete
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-[#1a1a1a] rounded-full mb-6 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out progress-shimmer"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Step indicators */}
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
          const completed = completedSteps.includes(step);
          const active = activeStep === step;
          const firstIncomplete = [1, 2, 3, 4].find(
            (s) => !completedSteps.includes(s)
          );
          const clickable =
            completed || step === firstIncomplete || step === activeStep;

          return (
            <button
              key={step}
              onClick={() => clickable && onStepClick(step)}
              disabled={!clickable}
              className={`
                relative flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200
                ${completed ? "cursor-pointer" : ""}
                ${active && !completed ? "cursor-pointer" : ""}
                ${!clickable ? "opacity-40 cursor-not-allowed" : ""}
                ${active && !completed ? "bg-[#00d4aa]/10 border border-[#00d4aa]/40" : ""}
                ${completed ? "bg-[#00d4aa]/5 hover:bg-[#00d4aa]/10 border border-[#00d4aa]/20" : ""}
                ${!completed && !active ? "bg-[#0a0a0a] border border-[#222]" : ""}
              `}
            >
              {/* Circle */}
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                  ${completed ? "bg-[#00d4aa] text-black" : ""}
                  ${active && !completed ? "bg-[#00d4aa]/20 text-[#00d4aa] border-2 border-[#00d4aa]" : ""}
                  ${!completed && !active ? "bg-[#1a1a1a] text-[#555] border border-[#333]" : ""}
                `}
              >
                {completed ? (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  step
                )}
              </div>

              {/* Label */}
              <span
                className={`
                  text-[10px] font-medium text-center leading-tight hidden md:block
                  ${completed ? "text-[#00d4aa]" : ""}
                  ${active && !completed ? "text-[#00d4aa]" : ""}
                  ${!completed && !active ? "text-[#555]" : ""}
                `}
              >
                {stepLabels[step - 1].split(" ").slice(0, 3).join(" ")}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
