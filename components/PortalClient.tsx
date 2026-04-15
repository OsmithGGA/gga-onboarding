"use client";

import { useState } from "react";
import ProgressBar from "@/components/ProgressBar";
import StepCard from "@/components/StepCard";
import Step0Contract from "@/components/steps/Step0Contract";
import Step1Calendly from "@/components/steps/Step1Calendly";
import Step2Form from "@/components/steps/Step2Form";
import Step3Meta from "@/components/steps/Step3Meta";
import Step4Drive from "@/components/steps/Step4Drive";
import InfoSection from "@/components/steps/InfoSection";

interface Client {
  id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  email: string;
  business_name?: string;
  company?: string | null;
  country: string | null;
  currency?: string | null;
  drive_folder_url?: string | null;
  drive_assets_folder_url?: string | null;
  drive_sheet_url?: string | null;
}

interface Props {
  client: Client;
  completedSteps: number[];
  userEmail: string;
  contractHtml?: string;
}

const STEPS = [
  { number: 0, title: "Sign Your Agreement", icon: "📋" },
  { number: 1, title: "Book Your Onboarding Call", icon: "📅" },
  { number: 2, title: "Complete Your Onboarding Form", icon: "📋" },
  { number: 3, title: "Link Your Meta Business Suite", icon: "🔗" },
  { number: 4, title: "Upload Your Content", icon: "📁" },
];

export default function PortalClient({
  client,
  completedSteps: initial,
  userEmail,
  contractHtml = "",
}: Props) {
  const [completedSteps, setCompletedSteps] = useState<number[]>(initial);
  const [activeStep, setActiveStep] = useState<number>(() => {
    for (let i = 0; i <= 4; i++) {
      if (!initial.includes(i)) return i;
    }
    return 4;
  });
  const [completing, setCompleting] = useState<number | null>(null);

  const isCompleted = (step: number) => completedSteps.includes(step);
  const allComplete = completedSteps.length >= 5;
  const step0Complete = completedSteps.includes(0);

  const firstName =
    client.first_name ||
    client.name?.split(" ")[0] ||
    "there";
  const businessName =
    client.business_name || client.company || client.name || "your business";

  const driveAssetsUrl =
    client.drive_assets_folder_url || client.drive_folder_url;
  const currency = client.currency || "€";
  const country = client.country || "ireland";

  // Handles Step 0 contract signing
  const handleContractSign = () => {
    const newCompleted = [...completedSteps, 0];
    setCompletedSteps(newCompleted);
    setActiveStep(1);
  };

  // Handles steps 1-4 via API
  const handleComplete = async (stepNumber: number, note?: string) => {
    setCompleting(stepNumber);
    try {
      const res = await fetch("/api/complete-step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: client.id,
          stepNumber,
          note,
        }),
      });

      if (res.ok) {
        const newCompleted = [...completedSteps, stepNumber];
        setCompletedSteps(newCompleted);
        const nextStep = stepNumber + 1;
        if (nextStep <= 4) {
          setActiveStep(nextStep);
        }
      }
    } finally {
      setCompleting(null);
    }
  };

  const handleStepClick = (stepNumber: number) => {
    // Hard gate: steps 1-4 not accessible until step 0 is complete
    if (stepNumber > 0 && !step0Complete) return;

    const firstIncomplete = [0, 1, 2, 3, 4].find(
      (s) => !completedSteps.includes(s)
    );
    if (
      isCompleted(stepNumber) ||
      stepNumber === activeStep ||
      stepNumber === firstIncomplete
    ) {
      setActiveStep(stepNumber);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-[#1a1a1a] bg-[#0d0d0d] sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Green Growth Agency" className="h-8 w-auto" />
          </div>
          <div className="text-right">
            <p className="text-white text-sm font-medium">
              {client.first_name && client.last_name
                ? `${client.first_name} ${client.last_name}`
                : client.name}
            </p>
            <p className="text-[#555] text-xs">{userEmail}</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome message */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Welcome, {firstName}.
          </h1>
          <div className="space-y-3 text-[#888] text-sm md:text-base leading-relaxed max-w-3xl">
            <p>
              We&apos;re delighted to welcome{" "}
              <strong className="text-white">{businessName}</strong> to Green
              Growth Agency — you&apos;ve made a great decision and we&apos;re
              excited to get to work for you.
            </p>
            <p>
              This is your onboarding portal. It&apos;s the only thing you need
              to complete before your campaign goes live — no back and forth, no
              long calls, just a few straightforward steps that give us
              everything we need to build your campaign correctly from day one.
            </p>
            <p>
              Take your time with each step. The quality of what you put in
              directly determines the quality of what we build — the more we
              know about your business, your customers, and your goals, the
              sharper your ads will be from the moment they go live.
            </p>
            <p>
              If anything isn&apos;t clear or you have questions along the way,
              don&apos;t worry — that&apos;s exactly what your onboarding call
              is for. You can also reach out to us directly at any point and
              we&apos;ll get back to you straight away.
            </p>
            <p>
              Once you&apos;re done, we&apos;ll take it from here. Let&apos;s
              get started. 🚀
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <ProgressBar
          totalSteps={5}
          completedSteps={completedSteps}
          activeStep={activeStep}
          onStepClick={handleStepClick}
          stepLabels={STEPS.map((s) => s.title)}
          step0Locked={!step0Complete}
        />

        {/* Steps */}
        <div className="mt-6 space-y-3">
          {STEPS.map((step) => {
            const completed = isCompleted(step.number);
            const active = activeStep === step.number;
            const firstIncomplete = [0, 1, 2, 3, 4].find(
              (s) => !completedSteps.includes(s)
            );
            // Steps 1-4 are locked until step 0 is complete
            const gatedByStep0 = step.number > 0 && !step0Complete;
            const locked =
              gatedByStep0 ||
              (!completed &&
                step.number !== firstIncomplete &&
                step.number !== activeStep);

            return (
              <StepCard
                key={step.number}
                stepNumber={step.number}
                title={step.title}
                icon={step.icon}
                completed={completed}
                active={active}
                locked={locked}
                onToggle={() => handleStepClick(step.number)}
              >
                {step.number === 0 && (
                  <Step0Contract
                    client={client}
                    contractHtml={contractHtml}
                    completed={completed}
                    onComplete={handleContractSign}
                  />
                )}
                {step.number === 1 && (
                  <Step1Calendly
                    completed={completed}
                    completing={completing === 1}
                    onComplete={(note) => handleComplete(1, note)}
                  />
                )}
                {step.number === 2 && (
                  <Step2Form
                    completed={completed}
                    completing={completing === 2}
                    onComplete={() => handleComplete(2)}
                  />
                )}
                {step.number === 3 && (
                  <Step3Meta
                    client={client}
                    completed={completed}
                    completing={completing === 3}
                    onComplete={() => handleComplete(3)}
                  />
                )}
                {step.number === 4 && (
                  <Step4Drive
                    completed={completed}
                    completing={completing === 4}
                    driveFolderUrl={driveAssetsUrl || null}
                    onComplete={() => handleComplete(4)}
                  />
                )}
              </StepCard>
            );
          })}
        </div>

        {/* All steps complete banner */}
        {allComplete && (
          <div className="mt-8">
            <div className="bg-[#ADFF00]/10 border border-[#ADFF00]/30 rounded-2xl p-6 mb-6 text-center">
              <div className="text-3xl mb-3">🎉</div>
              <h2 className="text-xl font-bold text-white mb-2">
                You&apos;re locked in.
              </h2>
              <p className="text-[#888] text-sm max-w-xl mx-auto">
                Our team is already preparing your campaign. Everything you&apos;ve provided has been received. We&apos;ll see you on your onboarding call — come with any questions.
              </p>
            </div>
            <InfoSection
              country={country}
              currency={currency}
              businessName={businessName}
              sheetUrl={client.drive_sheet_url || null}
            />
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-[#1a1a1a] text-center">
          <p className="text-[#555] text-xs">
            Questions?{" "}
            <a
              href="mailto:osmith.greengrowthagency@gmail.com"
              className="text-[#ADFF00] hover:underline"
            >
              osmith.greengrowthagency@gmail.com
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
