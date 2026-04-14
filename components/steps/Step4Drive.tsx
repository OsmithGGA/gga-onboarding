"use client";

interface Props {
  completed: boolean;
  completing: boolean;
  driveFolderUrl: string | null;
  onComplete: () => void;
}

const UPLOAD_GUIDELINES = [
  {
    icon: "🖼️",
    title: "Logo files",
    description: "PNG with transparent background (primary + any variations). Also include any brand guidelines if you have them.",
  },
  {
    icon: "📸",
    title: "Brand photos",
    description: "High-quality photos of your team, work, vehicles, equipment, or completed projects. At least 10 images.",
  },
  {
    icon: "🎬",
    title: "Videos (optional)",
    description: "Any short clips of your work, testimonials, or behind-the-scenes. Great for higher-performing video ads.",
  },
  {
    icon: "🎨",
    title: "Brand colours",
    description: "Your hex colour codes if known, or a screenshot/sample showing your brand colours.",
  },
  {
    icon: "📄",
    title: "Any existing ad creative",
    description: "If you've run ads before, upload anything that worked well — images, copy, anything useful.",
  },
];

export default function Step4Drive({ completed, completing, driveFolderUrl, onComplete }: Props) {
  if (completed) {
    return (
      <div className="text-center py-4">
        <div className="inline-flex items-center gap-2 text-[#00d4aa] text-sm font-medium">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Content uploaded. Our team will review your assets before the call.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="bg-[#00d4aa]/10 border border-[#00d4aa]/20 rounded-xl p-4">
        <p className="text-sm text-[#00d4aa] font-medium mb-1">📁 Upload your brand assets</p>
        <p className="text-sm text-[#888] leading-relaxed">
          We{"'"}ve created a private Google Drive folder just for you. Upload your logo, photos, and any other brand materials there. The better the creative, the better your ads will perform — don{"'"}t skip this step!
        </p>
      </div>

      {/* Upload guidelines */}
      <div>
        <h4 className="text-sm font-semibold text-white mb-3">What to upload</h4>
        <div className="space-y-2">
          {UPLOAD_GUIDELINES.map((item, i) => (
            <div
              key={i}
              className="flex gap-3 p-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl"
            >
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white">{item.title}</p>
                <p className="text-xs text-[#888] leading-relaxed mt-0.5">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Drive button */}
      {driveFolderUrl ? (
        <a
          href={driveFolderUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 w-full bg-[#1a1a1a] hover:bg-[#222] border border-[#333] hover:border-[#00d4aa]/40 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 group"
        >
          <svg className="w-5 h-5 text-[#00d4aa]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6.28 3h11.44L22 11 12 21 2 11zm5.72 8l-4.14-7H6.86L3 11h4.14L9 8.28V11h3zm0 0v5.72L13.86 11H10v0z" />
          </svg>
          <span>Open My Google Drive Folder</span>
          <svg
            className="w-4 h-4 text-[#555] group-hover:text-[#00d4aa] transition-colors ml-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      ) : (
        <div className="flex items-center gap-3 w-full bg-[#1a1a1a] border border-[#333] text-[#555] font-semibold py-4 px-6 rounded-xl">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6.28 3h11.44L22 11 12 21 2 11zm5.72 8l-4.14-7H6.86L3 11h4.14L9 8.28V11h3zm0 0v5.72L13.86 11H10v0z" />
          </svg>
          <span>Drive folder being prepared...</span>
        </div>
      )}

      <p className="text-xs text-[#555] text-center">
        Your folder is private and shared only with the GGA team.
      </p>

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
          "✅ I've uploaded my content"
        )}
      </button>
    </div>
  );
}
