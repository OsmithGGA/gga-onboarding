import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

const STEP_NAMES: Record<number, string> = {
  1: "Book Onboarding Call",
  2: "Complete Onboarding Form",
  3: "Link Meta Business Suite",
  4: "Upload Content to Google Drive",
};

export async function notifyStepComplete(
  clientName: string,
  clientEmail: string,
  stepNumber: number
) {
  const resend = getResend();
  if (!resend) {
    console.log(`[notify] Step ${stepNumber} complete for ${clientName} — Resend not configured`);
    return;
  }

  const stepName = STEP_NAMES[stepNumber] || `Step ${stepNumber}`;

  await resend.emails.send({
    from: "GGA Portal <onboarding@resend.dev>",
    to: process.env.NOTIFICATION_EMAIL || "oransmith03@gmail.com",
    subject: `✅ ${clientName} completed: ${stepName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fff; padding: 32px; border-radius: 12px; border: 1px solid #222;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
          <h1 style="margin: 0; font-size: 20px; color: #00d4aa;">✅ Step Complete</h1>
        </div>
        <p style="font-size: 16px; margin: 0 0 8px;">
          <strong style="color: #fff;">${clientName}</strong>
          <span style="color: #888;"> (${clientEmail})</span>
        </p>
        <p style="font-size: 16px; color: #888; margin: 0 0 24px;">
          has completed <strong style="color: #00d4aa;">Step ${stepNumber}: ${stepName}</strong>
        </p>
        <div style="background: #111; border: 1px solid #222; border-radius: 8px; padding: 16px;">
          <p style="margin: 0; color: #888; font-size: 14px;">
            Step ${stepNumber} of 4 — ${Math.round((stepNumber / 4) * 100)}% of onboarding complete
          </p>
        </div>
      </div>
    `,
  });
}

export async function notifyAllStepsComplete(
  clientName: string,
  clientEmail: string
) {
  const resend = getResend();
  if (!resend) {
    console.log(`[notify] All steps complete for ${clientName} — Resend not configured`);
    return;
  }

  await resend.emails.send({
    from: "GGA Portal <onboarding@resend.dev>",
    to: process.env.NOTIFICATION_EMAIL || "oransmith03@gmail.com",
    subject: `🎉 ${clientName} has completed all onboarding steps!`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fff; padding: 32px; border-radius: 12px; border: 1px solid #222;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="font-size: 48px; margin-bottom: 12px;">🎉</div>
          <h1 style="margin: 0; font-size: 24px; color: #00d4aa;">Onboarding Complete!</h1>
        </div>
        <p style="font-size: 16px; text-align: center; color: #888;">
          <strong style="color: #fff;">${clientName}</strong> (${clientEmail})<br/>
          has completed all 4 onboarding steps and is ready for their call.
        </p>
      </div>
    `,
  });
}
