"use client";

import { ReactNode } from "react";

interface Props {
  stepNumber: number;
  title: string;
  icon: string;
  completed: boolean;
  active: boolean;
  locked: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export default function StepCard({
  stepNumber,
  title,
  icon,
  completed,
  active,
  locked,
  onToggle,
  children,
}: Props) {
  return (
    <div
      className={`
        border rounded-2xl overflow-hidden transition-all duration-300
        ${completed ? "border-[#ADFF00]/30 bg-[#111]" : ""}
        ${active && !completed ? "border-[#ADFF00]/60 bg-[#111] shadow-[0_0_30px_rgba(173,255,0,0.08)]" : ""}
        ${locked ? "border-[#1a1a1a] bg-[#0d0d0d]" : ""}
        ${!active && !completed && !locked ? "border-[#222] bg-[#111]" : ""}
      `}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        disabled={locked}
        className="w-full flex items-center gap-4 p-5 text-left disabled:cursor-not-allowed"
      >
        {/* Step number / check */}
        <div
          className={`
            flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold transition-all duration-300
            ${completed ? "bg-[#ADFF00] text-black" : ""}
            ${active && !completed ? "bg-[#ADFF00]/20 border-2 border-[#ADFF00]" : ""}
            ${locked ? "bg-[#1a1a1a] text-[#444]" : ""}
            ${!active && !completed && !locked ? "bg-[#1a1a1a] text-[#555]" : ""}
          `}
        >
          {completed ? (
            <svg
              className="w-5 h-5"
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
            <span className={locked ? "text-[#333]" : "text-[#ADFF00]"}>
              {stepNumber}
            </span>
          )}
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">{icon}</span>
            <h3
              className={`
                font-semibold text-base truncate
                ${completed ? "text-[#ADFF00]" : ""}
                ${active && !completed ? "text-white" : ""}
                ${locked ? "text-[#444]" : ""}
                ${!active && !completed && !locked ? "text-[#888]" : ""}
              `}
            >
              {title}
            </h3>
          </div>
          {completed && (
            <p className="text-xs text-[#ADFF00]/60 mt-0.5">Completed</p>
          )}
          {locked && (
            <p className="text-xs text-[#444] mt-0.5">Complete previous steps first</p>
          )}
        </div>

        {/* Chevron */}
        {!locked && (
          <svg
            className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${active ? "rotate-180 text-[#ADFF00]" : "text-[#444]"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        )}
        {locked && (
          <svg
            className="w-4 h-4 flex-shrink-0 text-[#333]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        )}
      </button>

      {/* Content — shown when active */}
      {active && !locked && (
        <div className="border-t border-[#1a1a1a] p-5 md:p-6">{children}</div>
      )}

      {/* Collapsed completed preview */}
      {completed && !active && (
        <div
          onClick={onToggle}
          className="border-t border-[#ADFF00]/10 px-5 py-3 cursor-pointer hover:bg-[#ADFF00]/5 transition-colors"
        >
          <p className="text-xs text-[#ADFF00]/50">Click to review</p>
        </div>
      )}
    </div>
  );
}
