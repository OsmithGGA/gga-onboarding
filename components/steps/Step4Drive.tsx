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
      <div className="flex items-start gap-3 p-5 bg-[#ADFF00]/5 border border-[#ADFF00]/20 rounded-xl">
        <svg className="w-5 h-5 text-[#ADFF00] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-[#ADFF00] text-sm font-medium">
          Content uploaded. Our team will review your assets ahead of your onboarding call.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">📁</span>
          <h3 className="text-white font-semibold text-base">Upload Your Brand Assets</h3>
        </div>
        <p className="text-[#888] text-sm leading-relaxed">
          The creative quality of your ads has a direct impact on your results. The better the assets you provide, the stronger your campaign will be from day one.
        </p>
        <p className="text-[#888] text-sm leading-relaxed">
          We&apos;ve created a private Google Drive folder exclusively for your business. Upload your assets there using the button below.
        </p>
      </div>

      {/* Upload guidelines */}
      <div>
        <h4 className="text-sm font-semibold text-white mb-3">What to upload</h4>
        <div className="space-y-2">
          <div className="flex gap-3 p-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl">
            <span className="text-xl flex-shrink-0">🖼️</span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white">Logo</p>
              <p className="text-xs text-[#888] leading-relaxed mt-0.5">PNG file with a transparent background. Include any variations and brand guidelines if you have them.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-[#0a0a0a] border border-[#ADFF00]/20 rounded-xl">
            <span className="text-xl flex-shrink-0">📸</span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white">Photos <span className="text-[#ADFF00] text-xs ml-1">— Most Important</span></p>
              <p className="text-xs text-[#888] leading-relaxed mt-0.5">This is the single biggest factor in your ad creative quality. Real photos consistently outperform stock imagery.</p>
              <p className="text-xs text-[#888] leading-relaxed mt-1.5">Upload as many as you can. Aim for a minimum of 10. Best performing content includes:</p>
              <ul className="text-xs text-[#777] mt-1.5 space-y-0.5 list-none">
                <li>• Before and after shots — completed jobs</li>
                <li>• Team on the job — on site, in uniform</li>
                <li>• Finished work close-ups — high quality detail shots</li>
                <li>• Happy customers at their property</li>
                <li>• Your vehicles and equipment</li>
                <li>• Team together — group shot or headshots</li>
              </ul>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl">
            <span className="text-xl flex-shrink-0">🎬</span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white">Videos <span className="text-[#555] text-xs ml-1">— Optional</span></p>
              <p className="text-xs text-[#888] leading-relaxed mt-0.5">Short clips of your work, customer testimonials, or behind-the-scenes footage.</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl">
            <span className="text-xl flex-shrink-0">📄</span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white">Previous Ad Creative <span className="text-[#555] text-xs ml-1">— Optional</span></p>
              <p className="text-xs text-[#888] leading-relaxed mt-0.5">If you&apos;ve run ads before, upload anything that performed well — images, copy, anything useful.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Drive button */}
      {driveFolderUrl ? (
        <a
          href={driveFolderUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 w-full bg-[#1a1a1a] hover:bg-[#222] border border-[#333] hover:border-[#ADFF00]/40 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 group"
        >
          <svg className="w-5 h-5 text-[#ADFF00]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6.28 3h11.44L22 11 12 21 2 11zm5.72 8l-4.14-7H6.86L3 11h4.14L9 8.28V11h3zm0 0v5.72L13.86 11H10v0z" />
          </svg>
          <span>Open My Google Drive Folder</span>
          <svg
            className="w-4 h-4 text-[#555] group-hover:text-[#ADFF00] transition-colors ml-auto"
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
          "✅ I've uploaded my content"
        )}
      </button>
    </div>
  );
}
