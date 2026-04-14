"use client";

interface Props {
  completed: boolean;
  completing: boolean;
  onComplete: () => void;
}

const STEPS = [
  {
    number: 1,
    title: "Go to Meta Business Suite",
    description: (
      <>
        Visit{" "}
        <a
          href="https://business.facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#00d4aa] hover:underline"
        >
          business.facebook.com
        </a>{" "}
        and log in with the Facebook account that manages your business page.
      </>
    ),
  },
  {
    number: 2,
    title: "Navigate to Business Settings",
    description:
      'Click the gear icon (⚙) in the bottom-left corner, then select "Business Settings" from the menu.',
  },
  {
    number: 3,
    title: "Go to Users → Partners",
    description:
      'In the left sidebar, click "Users" then "Partners". Click the blue "+ Add" button.',
  },
  {
    number: 4,
    title: "Enter GGA\'s Partner ID",
    description: (
      <>
        Select <strong className="text-white">"Give a partner access to your assets"</strong> and enter our Business Manager ID:{" "}
        <span className="font-mono text-[#00d4aa] bg-[#00d4aa]/10 px-2 py-0.5 rounded text-sm">
          [YOUR BUSINESS MANAGER ID]
        </span>
      </>
    ),
  },
  {
    number: 5,
    title: "Grant Ad Account Access",
    description:
      'Select your Ad Account from the list and toggle on "Manage campaigns". Click "Save Changes".',
  },
  {
    number: 6,
    title: "Grant Facebook Page Access",
    description:
      'Go to "Pages" in the left panel, select your Facebook Page, and grant GGA "Advertise" access. Click "Save Changes".',
  },
];

export default function Step3Meta({ completed, completing, onComplete }: Props) {
  if (completed) {
    return (
      <div className="text-center py-4">
        <div className="inline-flex items-center gap-2 text-[#00d4aa] text-sm font-medium">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Meta Business Suite linked. We now have access to run your ads.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="bg-[#00d4aa]/10 border border-[#00d4aa]/20 rounded-xl p-4">
        <p className="text-sm text-[#00d4aa] font-medium mb-1">🔗 Why we need access</p>
        <p className="text-sm text-[#888] leading-relaxed">
          To run ads on your behalf, we need Partner access to your Meta Business Manager. This allows us to create and manage your ad campaigns without needing your personal login. Watch the video below and follow the steps — it takes about 3 minutes.
        </p>
      </div>

      {/* Loom video embed */}
      <div className="rounded-xl overflow-hidden border border-[#222] bg-[#0a0a0a] aspect-video flex items-center justify-center">
        {/*
          REPLACE THIS DIV with your Loom video embed.
          It will look like:
          <div style={{position:'relative', paddingBottom:'62.5%', height:0}}>
            <iframe
              src="https://www.loom.com/embed/YOUR_VIDEO_ID"
              frameBorder="0"
              allowFullScreen
              style={{position:'absolute', top:0, left:0, width:'100%', height:'100%'}}
            />
          </div>
        */}
        <div className="text-center px-8 py-12">
          <div className="text-4xl mb-4">🎬</div>
          <p className="text-[#555] text-sm font-medium mb-2">Loom tutorial video goes here</p>
          <p className="text-[#444] text-xs max-w-xs">
            Replace with your Loom embed showing clients how to link Meta Business Suite
          </p>
        </div>
      </div>

      {/* Step-by-step guide */}
      <div>
        <h4 className="text-sm font-semibold text-white mb-4">
          Step-by-step guide
        </h4>
        <div className="space-y-3">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="flex gap-4 p-4 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl"
            >
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#00d4aa]/20 border border-[#00d4aa]/40 flex items-center justify-center text-[#00d4aa] text-xs font-bold">
                {step.number}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white mb-1">{step.title}</p>
                <p className="text-xs text-[#888] leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stuck? */}
      <div className="bg-[#1a1a1a] border border-[#222] rounded-xl p-4">
        <p className="text-xs text-[#888]">
          <span className="text-white font-medium">Stuck?</span> No worries — WhatsApp or email us and we{"'"}ll walk you through it on a quick screen share.
        </p>
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
          "✅ I've completed this"
        )}
      </button>
    </div>
  );
}
