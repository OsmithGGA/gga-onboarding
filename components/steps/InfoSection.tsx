"use client";

import { useState } from "react";

interface AccordionItem {
  icon: string;
  title: string;
  content: (country: string) => React.ReactNode;
}

const ITEMS: AccordionItem[] = [
  {
    icon: "💬",
    title: "How We Communicate",
    content: (country) => (
      <div className="space-y-3">
        {country === "ireland" ? (
          <>
            <p className="text-sm text-[#888] leading-relaxed">
              For our Irish clients, we communicate primarily via{" "}
              <strong className="text-white">WhatsApp</strong>. You{"'"}ll be added to a dedicated WhatsApp group with your account manager.
            </p>
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
              <p className="text-sm text-green-400 font-medium mb-1">📱 WhatsApp Group</p>
              <p className="text-xs text-[#888]">
                Your account manager will add you to a WhatsApp group after your onboarding call. This is for quick questions, updates, and reporting.
              </p>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-[#888] leading-relaxed">
              For our US clients, we communicate via{" "}
              <strong className="text-white">Slack</strong>. You{"'"}ll receive an invite to our shared Slack workspace.
            </p>
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
              <p className="text-sm text-purple-400 font-medium mb-1">💜 Slack Workspace</p>
              <p className="text-xs text-[#888]">
                Check your email for a Slack invite after your onboarding call. This is where you{"'"}ll get weekly updates, reports, and can message your account manager.
              </p>
            </div>
          </>
        )}
        <p className="text-xs text-[#555]">
          Response times: Mon–Fri, 9am–6pm (your local time). We aim to reply within 2 hours.
        </p>
      </div>
    ),
  },
  {
    icon: "📊",
    title: "Your Lead Tracker",
    content: () => (
      <div className="space-y-3">
        <p className="text-sm text-[#888] leading-relaxed">
          You{"'"}ll have access to a live <strong className="text-white">Google Sheets lead tracker</strong> that shows every lead generated from your campaign in real time — name, number, status, and notes.
        </p>
        <div className="space-y-2">
          {[
            { label: "New", desc: "Lead just came in — needs to be contacted within 5 minutes" },
            { label: "Assessment Scheduled", desc: "You've spoken to them and booked an appointment" },
            { label: "Quoted", desc: "You've sent a quote or had a site visit" },
            { label: "Won", desc: "Job confirmed and signed" },
            { label: "Lost", desc: "They went elsewhere or weren't qualified" },
          ].map((s) => (
            <div key={s.label} className="flex gap-3 items-start p-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg">
              <span className="flex-shrink-0 w-2 h-2 rounded-full bg-[#00d4aa] mt-1.5" />
              <div>
                <span className="text-xs font-semibold text-white">{s.label}</span>
                <p className="text-xs text-[#666] mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-[#555]">Your lead tracker link will be shared in your onboarding call.</p>
      </div>
    ),
  },
  {
    icon: "🚀",
    title: "What to Expect From Your Campaign",
    content: () => (
      <div className="space-y-3">
        <p className="text-sm text-[#888] leading-relaxed">
          Here{"'"}s a realistic timeline of what to expect once your campaign goes live:
        </p>
        {[
          { period: "Days 1–7", title: "Campaign setup & launch", desc: "We build your ads, targeting, and creative. Your campaign goes live within 5 business days of your onboarding call." },
          { period: "Week 2–3", title: "Learning phase", desc: "Meta's algorithm is learning. You may see some leads but the volume will ramp up. Don't panic — this is normal." },
          { period: "Week 4+", title: "Optimisation & scale", desc: "We analyse what's working, cut what isn't, and scale your best-performing ads. This is where consistency of results builds." },
          { period: "Month 3", title: "Our guarantee kicks in", desc: "If you haven't received 30 qualified leads by month 3, we work for free until you do." },
        ].map((item) => (
          <div key={item.period} className="p-4 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-[#00d4aa] bg-[#00d4aa]/10 px-2 py-0.5 rounded">{item.period}</span>
              <span className="text-sm font-medium text-white">{item.title}</span>
            </div>
            <p className="text-xs text-[#666] leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: "⚡",
    title: "Speed to Lead — Critical Reading",
    content: () => (
      <div className="space-y-4">
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <p className="text-sm text-amber-400 font-semibold mb-1">⚡ This is the #1 factor in your ROI</p>
          <p className="text-sm text-[#888] leading-relaxed">
            Research shows that responding to a lead within <strong className="text-amber-400">5 minutes</strong> makes you{" "}
            <strong className="text-white">100x more likely to convert them</strong> than responding after 30 minutes. After 1 hour, the lead has typically gone with a competitor.
          </p>
        </div>
        <div className="space-y-2">
          {[
            { icon: "📱", text: "Turn on notifications for your lead tracker and WhatsApp/Slack" },
            { icon: "📞", text: "Call or text new leads within 5 minutes of receiving them" },
            { icon: "🗓️", text: "Always try to book an appointment on the first call, not a callback" },
            { icon: "🔁", text: "If no answer, follow up 3x over 3 days before marking as lost" },
            { icon: "💬", text: "SMS works well if calls don't go through — keep it short and personal" },
          ].map((tip, i) => (
            <div key={i} className="flex gap-3 p-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl">
              <span className="text-lg flex-shrink-0">{tip.icon}</span>
              <p className="text-sm text-[#888]">{tip.text}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: "🎁",
    title: "Our Referral Programme",
    content: () => (
      <div className="space-y-4">
        <div className="bg-[#00d4aa]/10 border border-[#00d4aa]/30 rounded-xl p-5 text-center">
          <p className="text-3xl font-bold text-[#00d4aa] mb-1">€400</p>
          <p className="text-sm text-white font-medium">off your next month</p>
          <p className="text-xs text-[#888] mt-1">for every client you refer who signs with us</p>
        </div>
        <p className="text-sm text-[#888] leading-relaxed">
          Know another business owner in home services, solar, insulation, or any trade who could use more leads? Refer them to GGA and you get{" "}
          <strong className="text-white">€400 off your retainer</strong> for every person who signs.
        </p>
        <div className="space-y-2">
          {[
            "No cap — refer 3 people, get €1,200 off",
            "They get the same great results you're getting",
            "Just introduce us via WhatsApp or email and we handle the rest",
          ].map((point, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-[#00d4aa] text-sm flex-shrink-0 mt-0.5">✓</span>
              <p className="text-sm text-[#888]">{point}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-[#555]">
          To refer someone, just send their name and number to your account manager on WhatsApp/Slack.
        </p>
      </div>
    ),
  },
];

export default function InfoSection({ country }: { country: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-white mb-4">
        Everything you need to know
      </h2>
      {ITEMS.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
              isOpen
                ? "border-[#00d4aa]/40 bg-[#111]"
                : "border-[#222] bg-[#111] hover:border-[#333]"
            }`}
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="w-full flex items-center gap-4 p-5 text-left"
            >
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              <span className="flex-1 font-medium text-white text-sm">
                {item.title}
              </span>
              <svg
                className={`w-4 h-4 flex-shrink-0 transition-transform text-[#555] ${
                  isOpen ? "rotate-180 text-[#00d4aa]" : ""
                }`}
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
            </button>
            {isOpen && (
              <div className="border-t border-[#1a1a1a] p-5">
                {item.content(country)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
