"use client";

import { useState } from "react";
import ProgressBar from "@/components/ProgressBar";
import StepCard from "@/components/StepCard";
import Step1Calendly from "@/components/steps/Step1Calendly";
import Step2Form from "@/components/steps/Step2Form";
import Step3Meta from "@/components/steps/Step3Meta";
import Step4Drive from "@/components/steps/Step4Drive";
import InfoSection from "@/components/steps/InfoSection";

interface Client {
  id: string;
  name: string;
  email: string;
  company: string | null;
  country: string | null;
  drive_folder_url: string | null;
}

interface Props {
  client: Client;
  completedSteps: number[];
  userEmail: string;
}

const STEPS = [
  { number: 1, title: "Book Your Onboarding Call", icon: "📅" },
  { number: 2, title: "Complete Your Onboarding Form", icon: "📋" },
  { number: 3, title: "Link Your Meta Business Suite", icon: "🔗" },
  { number: 4, title: "Upload Your Content", icon: "📁" },
];

export default function PortalClient({ client, completedSteps: initial, userEmail }: Props) {
  const [completedSteps, setCompletedSteps] = useState<number[]>(initial);
  const [activeStep, setActiveStep] = useState<number>(() => {
    // Open the first incomplete step by default
    for (let i = 1; i <= 4; i++) {
      if (!initial.includes(i)) return i;
    }
    return 4;
  });
  const [completing, setCompleting] = useState<number | null>(null);

  const isCompleted = (step: number) => completedSteps.includes(step);
  const allComplete = completedSteps.length >= 4;

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
          clientName: client.name,
          clientEmail: client.email,
        }),
      });

      if (res.ok) {
        const newCompleted = [...completedSteps, stepNumber];
        setCompletedSteps(newCompleted);
        // Auto-advance to next step
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
    // Allow free navigation to completed steps or the current active step
    if (isCompleted(stepNumber) || stepNumber === activeStep) {
      setActiveStep(stepNumber);
    }
    // Also allow clicking the next unlocked step
    const firstIncomplete = [1, 2, 3, 4].find((s) => !completedSteps.includes(s));
    if (stepNumber === firstIncomplete) {
      setActiveStep(stepNumber);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-[#1a1a1a] bg-[#0d0d0d] sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00d4aa] flex items-center justify-center">
              <span className="text-black font-bold text-sm">G</span>
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-none">
                Green Growth Agency
              </p>
              <p className="text-[#555] text-xs mt-0.5">Client Portal</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white text-sm font-medium">{client.name}</p>
            <p className="text-[#555] text-xs">{userEmail}</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-white mb-2">
            Welcome, {client.name.split(" ")[0]} 👋
          </h1>
          <p className="text-[#888] text-sm md:text-base">
            Complete the steps below before your onboarding call with the GGA team.
          </p>
        </div>

        {/* Progress Bar */}
        <ProgressBar
          totalSteps={4}
          completedSteps={completedSteps}
          activeStep={activeStep}
          onStepClick={handleStepClick}
          stepLabels={STEPS.map((s) => s.title)}
        />

        {/* Steps */}
        <div className="mt-8 space-y-4">
          {STEPS.map((step) => {
            const completed = isCompleted(step.number);
            const active = activeStep === step.number;
            const firstIncomplete = [1, 2, 3, 4].find((s) => !completedSteps.includes(s));
            const locked = !completed && step.number !== firstIncomplete && step.number !== activeStep;

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
                    completed={completed}
                    completing={completing === 3}
                    onComplete={() => handleComplete(3)}
                  />
                )}
                {step.number === 4 && (
                  <Step4Drive
                    completed={completed}
                    completing={completing === 4}
                    driveFolderUrl={client.drive_folder_url}
                    onComplete={() => handleComplete(4)}
                  />
                )}
              </StepCard>
            );
          })}
        </div>

        {/* Info Section — unlocks after all steps */}
        {allComplete && (
          <div className="mt-8">
            <div className="bg-[#00d4aa]/10 border border-[#00d4aa]/30 rounded-2xl p-6 mb-6 text-center">
              <div className="text-3xl mb-3">🎉</div>
              <h2 className="text-xl font-semibold text-white mb-2">
                All steps complete!
              </h2>
              <p className="text-[#888] text-sm">
                You{"'"}re all set for your onboarding call. Here{"'"}s everything you need to know about working with us.
              </p>
            </div>
            <InfoSection country={client.country || "ireland"} />
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-[#1a1a1a] text-center">
          <p className="text-[#555] text-xs">
            Questions?{" "}
            <a
              href="mailto:hello@greengrowthagency.com"
              className="text-[#00d4aa] hover:underline"
            >
              hello@greengrowthagency.com
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
