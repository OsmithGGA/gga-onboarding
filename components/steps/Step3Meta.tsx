"use client";

import { useState } from "react";
import { CheckCircle, Loader2, ChevronDown, ChevronUp, ExternalLink, Mail } from "lucide-react";

interface Client {
  first_name?: string;
  last_name?: string;
  name?: string;
  business_name?: string;
  company?: string | null;
}

interface Props {
  client: Client;
  completed: boolean;
  completing: boolean;
  onComplete: () => void;
}

const GGA_BM_ID = process.env.NEXT_PUBLIC_GGA_BM_ID || "1042826013821113";

const GUIDE_STEPS = [
  {
    number: 1,
    title: "Open Meta Business Suite",
    description:
      "Go to business.facebook.com and log in with the Facebook account that manages your business page. Make sure you are logging in as the account owner or admin.",
  },
  {
    number: 2,
    title: "Go to Business Settings",
    description:
      "Click the gear icon ⚙️ in the bottom-left corner and select Business Settings from the menu.",
  },
  {
    number: 3,
    title: "Link Your Facebook & Instagram Pages",
    description:
      "In Business Settings, click Accounts → Pages → + Add. Repeat for Instagram: click Accounts → Instagram Accounts → + Add.",
  },
  {
    number: 4,
    title: "Create or Confirm Your Ad Account",
    description:
      "Click Accounts → Ad Accounts → + Add. Name your ad account (this is internal only — nobody else sees it). Link your payment method (credit card) to the ad account — this is what Meta charges for your ad spend directly.",
  },
  {
    number: 5,
    title: "Add GGA as a Partner",
    description: null, // rendered below with ID
  },
  {
    number: 6,
    title: "Grant Ad Account Access",
    description:
      "Select Ad Accounts on the left. Select Assign Partners. Enter GGA's Business ID: " + GGA_BM_ID + ". Select the full access option.",
  },
  {
    number: 7,
    title: "Confirm Below",
    description:
      "Once both your Ad Account and Page access have been granted, hit the confirm button below.",
  },
];

const COMMON_ISSUES = [
  {
    q: "I don't have a Meta Business Manager set up",
    a: "You'll need to create one before completing this step. Go to business.facebook.com and follow the setup prompts. It takes around 5 minutes. Reach out if you need help.",
  },
  {
    q: "I can't find my Ad Account",
    a: "In Business Settings go to Accounts → Ad Accounts and check it appears there. If not, create a new one using the steps above.",
  },
  {
    q: "I'm getting a permission error",
    a: "You may not be the admin on the account. Ask whoever manages your Facebook Business Page to complete this step, or reach out to us and we'll help you resolve it.",
  },
];

export default function Step3Meta({ client, completed, completing, onComplete }: Props) {
  const [selectedOption, setSelectedOption] = useState<"A" | "B" | null>(null);
  const [openIssue, setOpenIssue] = useState<number | null>(null);

  const businessName =
    client.business_name || client.company || `${client.first_name || ""} ${client.last_name || ""}`.trim() || client.name || "My Business";

  const emailSubject = encodeURIComponent(`Meta Login Details — ${businessName}`);
  const emailBody = encodeURIComponent(
    `Hi GGA,\n\nHere are my Meta Business Manager login details for the campaign setup:\n\nEmail: \nPassword: \n\nBusiness Name: ${businessName}\n\nPlease let me know once access is set up so I can change my password.\n\nThanks`
  );
  const mailtoLink = `mailto:osmith.greengrowthagency@gmail.com?subject=${emailSubject}&body=${emailBody}`;

  if (completed) {
    return (
      <div className="flex items-start gap-3 p-5 bg-[#ADFF00]/5 border border-[#ADFF00]/20 rounded-xl">
        <CheckCircle className="w-5 h-5 text-[#ADFF00] flex-shrink-0 mt-0.5" />
        <p className="text-[#ADFF00] text-sm font-medium">
          Meta access confirmed. We&apos;re ready to launch your campaign.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="bg-[#ADFF00]/5 border border-[#ADFF00]/20 rounded-xl p-4">
        <p className="text-sm text-[#ADFF00] font-medium mb-1.5">
          📋 Give Us Access To Run Your Ads
        </p>
        <p className="text-sm text-[#888] leading-relaxed">
          To run your campaign, we need Partner access to your Meta Business
          Manager. This allows us to build and manage your ads on your behalf —
          we never need your personal login details.
        </p>
        <p className="text-sm text-[#888] mt-2">
          Choose the option that suits you best:
        </p>
      </div>

      {/* Two-option cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Option A */}
        <button
          type="button"
          onClick={() => setSelectedOption("A")}
          className={`text-left p-5 rounded-xl border-2 transition-all duration-200 ${
            selectedOption === "A"
              ? "border-[#ADFF00] bg-[#ADFF00]/5"
              : "border-[#222] bg-[#0d0d0d] hover:border-[#333]"
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="text-2xl">🤝</div>
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                selectedOption === "A"
                  ? "border-[#ADFF00] bg-[#ADFF00]"
                  : "border-[#444]"
              }`}
            >
              {selectedOption === "A" && (
                <svg className="w-2.5 h-2.5 text-black" fill="currentColor" viewBox="0 0 8 8">
                  <circle cx="4" cy="4" r="3" />
                </svg>
              )}
            </div>
          </div>
          <p className="text-white font-semibold text-sm mb-1.5">
            Option A — We&apos;ll Handle It For You
          </p>
          <p className="text-[#777] text-xs leading-relaxed">
            If this sounds too technical, don&apos;t worry about it. Send us your
            Meta login details and we&apos;ll take care of the full setup before
            your onboarding call.
          </p>
        </button>

        {/* Option B */}
        <button
          type="button"
          onClick={() => setSelectedOption("B")}
          className={`text-left p-5 rounded-xl border-2 transition-all duration-200 ${
            selectedOption === "B"
              ? "border-[#ADFF00] bg-[#ADFF00]/5"
              : "border-[#222] bg-[#0d0d0d] hover:border-[#333]"
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="text-2xl">🛠️</div>
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                selectedOption === "B"
                  ? "border-[#ADFF00] bg-[#ADFF00]"
                  : "border-[#444]"
              }`}
            >
              {selectedOption === "B" && (
                <svg className="w-2.5 h-2.5 text-black" fill="currentColor" viewBox="0 0 8 8">
                  <circle cx="4" cy="4" r="3" />
                </svg>
              )}
            </div>
          </div>
          <p className="text-white font-semibold text-sm mb-1.5">
            Option B — Complete It Yourself
          </p>
          <p className="text-[#777] text-xs leading-relaxed">
            Follow the step-by-step guide below at your own pace. If you&apos;d
            prefer to do it together on your onboarding call, have the
            checklist below ready beforehand.
          </p>
        </button>
      </div>

      {/* Option A content */}
      {selectedOption === "A" && (
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-5 space-y-4">
          <p className="text-sm text-[#888] leading-relaxed">
            Send us your Meta login details directly and we&apos;ll take care of
            the full setup before your onboarding call.
          </p>
          <a
            href={mailtoLink}
            className="inline-flex items-center gap-2 bg-[#ADFF00] hover:bg-[#8FCC00] text-black font-bold text-sm py-2.5 px-5 rounded-xl transition-colors"
          >
            <Mail className="w-4 h-4" />
            Email Us Your Login Details
          </a>
          <p className="text-xs text-[#555] leading-relaxed">
            Your details are kept strictly confidential and only used to complete
            this step. Once access is set up we&apos;ll confirm with you and you
            can change your password immediately after.
          </p>
        </div>
      )}

      {/* Option B content */}
      {selectedOption === "B" && (
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-5 space-y-4">
          <div>
            <p className="text-sm text-[#888] mb-3 leading-relaxed">
              If you&apos;d prefer to do it together on your onboarding call,
              make sure you have the following ready beforehand:
            </p>
            <div className="space-y-2 mb-4">
              {[
                "Logged into Meta Business Suite on your laptop — business.facebook.com",
                "You are the admin on the account",
                "Your Facebook Business Page is visible in your account",
                "Your Ad Account is linked to your Business Manager",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded border border-[#333] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-[#888]">{item}</p>
                </div>
              ))}
            </div>
            <a
              href="https://business.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#ADFF00] text-sm font-medium hover:underline"
            >
              Open Meta Business Suite
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Step-by-step guide */}
      <div>
        <h4 className="text-sm font-semibold text-white mb-4">
          Step-by-Step Guide
        </h4>
        <div className="space-y-3">
          {GUIDE_STEPS.map((step) => (
            <div
              key={step.number}
              className="flex gap-4 p-4 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl"
            >
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#ADFF00]/15 border border-[#ADFF00]/30 flex items-center justify-center text-[#ADFF00] text-xs font-bold">
                {step.number}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white mb-1">
                  {step.title}
                </p>
                {step.number === 5 ? (
                  <p className="text-xs text-[#888] leading-relaxed">
                    Go to Partners in the left panel. Click + Add → Give Partner
                    Access. Enter GGA&apos;s Business Partner ID:{" "}
                    <span className="font-mono text-[#ADFF00] bg-[#ADFF00]/10 px-2 py-0.5 rounded">
                      {GGA_BM_ID}
                    </span>
                    . Once entered, allow access to everything.
                  </p>
                ) : (
                  <p className="text-xs text-[#888] leading-relaxed">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Common Issues accordion */}
      <div>
        <h4 className="text-sm font-semibold text-white mb-3">
          Common Issues
        </h4>
        <div className="space-y-2">
          {COMMON_ISSUES.map((issue, i) => (
            <div
              key={i}
              className="border border-[#1a1a1a] rounded-xl overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenIssue(openIssue === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-[#0d0d0d] transition-colors"
              >
                <p className="text-sm text-white font-medium pr-4">{issue.q}</p>
                {openIssue === i ? (
                  <ChevronUp className="w-4 h-4 text-[#555] flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#555] flex-shrink-0" />
                )}
              </button>
              {openIssue === i && (
                <div className="px-4 pb-4">
                  <p className="text-sm text-[#888] leading-relaxed">{issue.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Confirm button */}
      <button
        onClick={onComplete}
        disabled={completing || selectedOption === null}
        className="w-full bg-[#ADFF00] hover:bg-[#8FCC00] disabled:opacity-30 disabled:cursor-not-allowed text-black font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
      >
        {completing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving...
          </>
        ) : (
          "✅ I've completed this"
        )}
      </button>
      {selectedOption === null && (
        <p className="text-[#555] text-xs text-center -mt-2">
          Select an option above before confirming
        </p>
      )}
    </div>
  );
}
