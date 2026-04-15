"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface Props {
  country: string;
  currency: string;
  businessName: string;
  sheetUrl: string | null;
}

export default function InfoSection({ country, currency, businessName, sheetUrl }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const isIrelandOrUK = country === "ireland" || country === "united_kingdom";
  const isUS = country === "usa";
  const countryLabel =
    country === "ireland" ? "Ireland" : country === "united_kingdom" ? "United Kingdom" : "United States";

  const referral1 = isUS ? `${currency}500` : `${currency}400`;
  const referral2 = isUS ? `${currency}1,000` : `${currency}800`;
  const referral3 = isUS ? `${currency}1,500` : `${currency}1,200`;

  const items = [
    {
      icon: "💬",
      title: "How We Communicate",
      content: (
        <div className="space-y-4">
          {isIrelandOrUK ? (
            <>
              <p className="text-sm text-[#888] leading-relaxed">
                You will be added to a dedicated WhatsApp group with your GGA account manager. This is your main point of contact with the team — use it for questions, updates, feedback, or anything campaign related.
              </p>
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                <p className="text-sm text-green-400 font-medium mb-1.5">📱 WhatsApp Group</p>
                <p className="text-xs text-[#888] leading-relaxed">
                  Quick questions, campaign updates, reporting, and direct access to your account manager all happen here. Your leads will also be delivered directly to this group in real time as they come in.
                </p>
                <p className="text-xs text-[#777] mt-2">
                  If you&apos;d prefer your leads to also be sent by email, simply request this on your onboarding call and we&apos;ll get that set up for you.
                </p>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-[#888] leading-relaxed">
                You will be added to a dedicated channel in our shared Slack workspace. This is your main point of contact with the GGA team.
              </p>
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                <p className="text-sm text-purple-400 font-medium mb-1.5">💜 Slack Workspace</p>
                <p className="text-xs text-[#888] leading-relaxed">
                  Slack is a free messaging app used by businesses to communicate in one organised place. You&apos;ll receive an email invite — download the app or use it in your browser. Your dedicated channel is where you&apos;ll get weekly updates, campaign reports, lead notifications, and direct access to your account manager.
                </p>
                <p className="text-xs text-[#777] mt-2">
                  If you&apos;d prefer your leads to also be sent by email, simply request this on your onboarding call.
                </p>
              </div>
            </>
          )}
          <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-4">
            <p className="text-xs font-medium text-[#777] mb-1">Response Times</p>
            <p className="text-xs text-[#888] leading-relaxed">
              We&apos;re available Monday to Friday, 9am–9pm your local time. We aim to respond within 2 hours during these hours. If something is urgent outside of these hours, send a message and we&apos;ll get back to you as soon as we can.
            </p>
          </div>
        </div>
      ),
    },
    {
      icon: "📊",
      title: "Your Lead Tracker",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-[#888] leading-relaxed">
            Your lead tracker has been automatically created and is ready for you now. Every lead generated from your campaign will be logged here in real time — name, number, and status.
          </p>
          {sheetUrl ? (
            <a
              href={sheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#ADFF00] text-sm font-medium hover:underline"
            >
              📊 Open My Lead Tracker →
            </a>
          ) : (
            <p className="text-xs text-[#555]">Your lead tracker link will be shared on your onboarding call.</p>
          )}
          <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-4">
            <p className="text-xs font-medium text-white mb-2">Why this matters</p>
            <p className="text-xs text-[#888] leading-relaxed">
              The lead tracker is your direct feedback channel to GGA. Keeping it updated is one of the most important things you can do during your campaign. Every update you make feeds directly into how we manage and optimise your campaign — we use your tracker data to monitor lead quality, track connection rates, and measure how leads are converting through to quotes and closed jobs. The more you put in, the better your results get.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#888] mb-2 uppercase tracking-wide">Lead Status</p>
            <div className="space-y-1.5">
              {[
                { icon: "📞", status: "Can't Get Through", desc: "Called but no answer — follow up 3x over 3 days" },
                { icon: "📅", status: "Assessment Scheduled", desc: "Spoken to them, appointment booked" },
                { icon: "💬", status: "Quoted", desc: "Quote sent or site visit completed" },
                { icon: "❌", status: "Quoted Lost", desc: "Quote sent but they went elsewhere" },
                { icon: "⚠️", status: "Waste of Time", desc: "Not qualified or not a genuine lead" },
                { icon: "✅", status: "Won", desc: "Job confirmed and signed" },
              ].map((s) => (
                <div key={s.status} className="flex gap-3 items-start p-2.5 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg">
                  <span className="text-sm flex-shrink-0">{s.icon}</span>
                  <div>
                    <span className="text-xs font-semibold text-white">{s.status}</span>
                    <p className="text-xs text-[#666] mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#888] mb-2 uppercase tracking-wide">Lead Quality</p>
            <div className="space-y-1.5">
              {[
                { rating: "⭐ Poor", desc: "Not a good fit at all" },
                { rating: "⭐⭐ Fair", desc: "Some interest but weak" },
                { rating: "⭐⭐⭐ Good", desc: "Genuine interest, worth pursuing" },
                { rating: "⭐⭐⭐⭐ Very Good", desc: "Strong fit, high intent" },
              ].map((r) => (
                <div key={r.rating} className="flex gap-3 items-center p-2.5 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg">
                  <span className="text-xs font-medium text-white w-28 flex-shrink-0">{r.rating}</span>
                  <p className="text-xs text-[#666]">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-[#555] leading-relaxed">
            If a lead converts to a won job, enter the value of that job in the Closed Amount column. This lets us track your return on investment in real time.
          </p>
        </div>
      ),
    },
    {
      icon: "🚀",
      title: "What to Expect From Your Campaign",
      content: (
        <div className="space-y-3">
          <p className="text-sm text-[#888] leading-relaxed">
            Every campaign follows the same core journey. Here&apos;s an honest, realistic breakdown of what to expect from day one through to the end of your 90-day contract.
          </p>
          {[
            {
              period: "Days 1–7",
              title: "Setup & Launch",
              desc: "Once your onboarding call is complete, we get straight to work. We build your campaign, targeting, and creative. Your ads will go live within 5 business days of your onboarding call. You won't need to do anything during this phase — we'll keep you updated every step of the way.",
            },
            {
              period: "Weeks 2–3",
              title: "Learning Phase",
              desc: "In the first two weeks after launch, Meta's algorithm is learning. It's testing your ads across different audiences to find who responds best. You'll start to see leads come in during this period but volume will be lower than normal. This is completely expected — the algorithm needs time to optimise.",
            },
            {
              period: "Weeks 4–8",
              title: "Optimisation",
              desc: "This is where things start to accelerate. We analyse what's working, cut what isn't, and double down on your best performing ads and audiences. Lead volume and quality typically improve significantly during this phase. Your feedback via the lead tracker becomes especially important here.",
            },
            {
              period: "Weeks 9–13",
              title: "Consistency & Scale",
              desc: "By this stage your campaign is dialled in. We focus on maintaining lead quality and volume, and scaling what's working. This is where the results become consistent and predictable.",
            },
          ].map((item) => (
            <div key={item.period} className="p-4 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-mono text-[#ADFF00] bg-[#ADFF00]/10 px-2 py-0.5 rounded">
                  {item.period}
                </span>
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
      title: "Speed to Lead",
      content: (
        <div className="space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
            <p className="text-sm text-amber-400 font-semibold mb-1.5">
              ⚡ This is the single biggest factor in your conversion rate
            </p>
            <p className="text-sm text-[#888] leading-relaxed">
              Research consistently shows that responding to a lead within{" "}
              <strong className="text-amber-400">5 minutes</strong> dramatically
              increases your chances of converting them. After an hour, most
              leads have moved on. It&apos;s not a reflection of your service —
              it&apos;s simply how people behave when they&apos;re actively
              searching for a solution.
            </p>
          </div>
          <p className="text-sm text-[#888] leading-relaxed">
            The leads we send you are live. Someone has just seen your ad,
            stopped scrolling, and submitted their details. That intent is at
            its highest the moment they hit submit.
          </p>
          <div className="space-y-2">
            {[
              { icon: "📱", text: `Aim to call every new lead within 5 minutes of receiving them` },
              { icon: "🔔", text: `Keep notifications on for your communication channel and lead tracker` },
              { icon: "🗓️", text: `Where possible, look to book an appointment on the first call` },
              {
                icon: "🔁",
                text: `If there's no answer, follow up over the next few days before marking as Can't Get Through`,
              },
            ].map((tip, i) => (
              <div
                key={i}
                className="flex gap-3 p-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl"
              >
                <span className="text-lg flex-shrink-0">{tip.icon}</span>
                <p className="text-sm text-[#888]">{tip.text}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#555] leading-relaxed">
            The faster you move, the better your results. It&apos;s the one variable that sits entirely on your side — and the businesses we work with who prioritise speed to lead consistently see the strongest returns.
          </p>
        </div>
      ),
    },
    {
      icon: "🎁",
      title: "Referral Programme",
      content: (
        <div className="space-y-4">
          <div className="bg-[#ADFF00]/10 border border-[#ADFF00]/30 rounded-xl p-5 text-center">
            <p className="text-3xl font-bold text-[#ADFF00] mb-1">{referral1}</p>
            <p className="text-sm text-white font-medium">added to your following month&apos;s ad spend</p>
            <p className="text-xs text-[#888] mt-1">for every client you refer who signs with GGA</p>
          </div>
          <p className="text-sm text-[#888] leading-relaxed">
            If you know another business owner in home services, solar, insulation, roofing, or any trade who could benefit from more leads — we&apos;d love an introduction.
          </p>
          <p className="text-sm text-[#888] leading-relaxed">
            For every client you refer who signs with GGA, we&apos;ll add{" "}
            <strong className="text-white">{referral1}</strong> directly towards
            your following month&apos;s ad spend. There&apos;s no cap on this.
          </p>
          <div className="space-y-1.5">
            {[
              `Refer 2 businesses — ${referral2} added to your ad spend`,
              `Refer 3 businesses — ${referral3} added to your ad spend`,
              "No admin, no chasing — applied automatically the moment they sign",
            ].map((point, i) => (
              <div key={i} className="flex gap-2 items-start">
                <span className="text-[#ADFF00] text-sm flex-shrink-0 mt-0.5">✓</span>
                <p className="text-sm text-[#888]">{point}</p>
              </div>
            ))}
          </div>
          <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-4">
            <p className="text-xs font-medium text-white mb-2">How it works</p>
            <div className="space-y-1.5">
              {[
                "Send us their name and number via your communication channel",
                "We handle everything from there",
                `The moment they sign, ${referral1} is added to your following month's ad spend automatically`,
              ].map((step, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className="text-[#ADFF00] text-xs flex-shrink-0 mt-0.5 font-bold">
                    {i + 1}.
                  </span>
                  <p className="text-xs text-[#888]">{step}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-[#555]">
            {countryLabel} referral reward: {referral1} per client signed.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-white mb-4">
        Everything you need to know
      </h2>
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
              isOpen
                ? "border-[#ADFF00]/30 bg-[#0d0d0d]"
                : "border-[#1a1a1a] bg-[#0d0d0d] hover:border-[#2a2a2a]"
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
              <ChevronDown
                className={`w-4 h-4 flex-shrink-0 transition-transform text-[#555] ${
                  isOpen ? "rotate-180 text-[#ADFF00]" : ""
                }`}
              />
            </button>
            {isOpen && (
              <div className="border-t border-[#1a1a1a] p-5">{item.content}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
