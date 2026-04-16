import nodemailer from "nodemailer";

const FROM_NAME = "Green Growth Agency";
const FROM_ADDRESS = process.env.GMAIL_USER || "osmith.greengrowthagency@gmail.com";
const FROM = `${FROM_NAME} <${FROM_ADDRESS}>`;
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || FROM_ADDRESS;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://gga-onboarding2.vercel.app";

function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    console.warn("[email] GMAIL_USER or GMAIL_APP_PASSWORD not set — emails disabled");
    return null;
  }
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

const emailBase = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  max-width: 600px;
  margin: 0 auto;
  background: #0a0a0a;
  color: #ffffff;
  padding: 40px 32px;
  border-radius: 12px;
  border: 1px solid #1a1a1a;
`;

const accentColor = "#ADFF00";

const logoHeader = `
  <div style="margin-bottom: 32px;">
    <img src="${SITE_URL}/logo.png" alt="Green Growth Agency" style="height: 36px; width: auto;" />
  </div>
`;

// ─── 1. Welcome Email ──────────────────────────────────────────────────────────

export async function sendWelcomeEmail(
  client: {
    first_name: string;
    last_name: string;
    business_name: string;
    email: string;
  },
  password: string
) {
  const transporter = getTransporter();
  if (!transporter) return;

  const firstName = client.first_name;
  const businessName = client.business_name || `${client.first_name} ${client.last_name}`;

  await transporter.sendMail({
    from: FROM,
    to: client.email,
    subject: "Action Required — Complete Your Onboarding Portal Before Your Call",
    html: `
      <div style="${emailBase}">
        ${logoHeader}

        <p style="font-size: 16px; color: #cccccc; margin: 0 0 16px;">Hi ${firstName},</p>

        <p style="font-size: 15px; color: #aaaaaa; line-height: 1.7; margin: 0 0 16px;">
          Welcome to Green Growth Agency. We're delighted to have <strong style="color: #fff;">${businessName}</strong> on board and we're looking forward to getting your campaign live.
        </p>

        <p style="font-size: 15px; color: #aaaaaa; line-height: 1.7; margin: 0 0 16px;">
          Before your onboarding call, there is one thing you must complete — your client onboarding portal. This is essential. It gives us everything we need to build your campaign correctly and ensures your onboarding call is productive and focused on strategy rather than admin.
        </p>

        <p style="font-size: 15px; color: #aaaaaa; line-height: 1.7; margin: 0 0 24px;">
          <strong style="color: #fff;">Your portal must be completed in full before your onboarding call.</strong> Please do not leave this until the last minute — the quality of what you provide directly shapes the quality of your campaign.
        </p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${SITE_URL}/portal" style="display: inline-block; background: ${accentColor}; color: #000; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 8px; text-decoration: none; letter-spacing: 0.3px;">
            Go to My Portal →
          </a>
        </div>

        <div style="background: #111; border: 1px solid #222; border-radius: 10px; padding: 20px; margin: 24px 0;">
          <p style="margin: 0 0 12px; color: #888; font-size: 13px; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 600;">Your Login Details</p>
          <p style="margin: 0 0 8px; font-size: 14px; color: #ccc;">
            <span style="color: #666;">Email:</span> &nbsp;<strong style="color: #fff;">${client.email}</strong>
          </p>
          <p style="margin: 0; font-size: 14px; color: #ccc;">
            <span style="color: #666;">Password:</span> &nbsp;<strong style="color: #fff;">${password}</strong>
          </p>
        </div>

        <p style="font-size: 15px; color: #aaaaaa; line-height: 1.7; margin: 0 0 16px;">
          Work through each step carefully and take your time with the onboarding form in particular — it is the most important part of the process.
        </p>

        <p style="font-size: 15px; color: #aaaaaa; line-height: 1.7; margin: 0 0 32px;">
          If anything isn't clear or you have questions along the way, make a note and we'll cover everything on your onboarding call. You can also reach us directly at any point and we'll get back to you straight away.
        </p>

        <p style="font-size: 15px; color: #aaaaaa; margin: 0 0 4px;">We're looking forward to speaking with you.</p>
        <p style="font-size: 15px; color: #fff; font-weight: 600; margin: 0 0 4px;">Oran & Keelan</p>
        <p style="font-size: 13px; color: #555; margin: 0;">Green Growth Agency &nbsp;·&nbsp; ${FROM_ADDRESS}</p>
      </div>
    `,
  });
}

// ─── 2. Contract Signed Notification ──────────────────────────────────────────

export async function sendContractSignedNotification(
  client: {
    first_name: string;
    last_name: string;
    business_name: string;
    email: string;
    country: string;
  },
  details: {
    signedAt: string;
    ip: string;
    signatureName: string;
    pdfUrl: string;
  },
  pdfAttachment?: { filename: string; content: Buffer }
) {
  const transporter = getTransporter();
  if (!transporter) return;

  const clientName = `${client.first_name} ${client.last_name}`;
  const businessName = client.business_name || clientName;

  await transporter.sendMail({
    from: FROM,
    to: NOTIFICATION_EMAIL,
    subject: `📝 Contract Signed — ${businessName}`,
    attachments: pdfAttachment
      ? [{ filename: pdfAttachment.filename, content: pdfAttachment.content }]
      : [],
    html: `
      <div style="${emailBase}">
        ${logoHeader}<h1 style="margin: 0 0 24px; font-size: 20px; color: ${accentColor};">📝 Contract Signed</h1>

        <p style="font-size: 15px; color: #aaaaaa; line-height: 1.7; margin: 0 0 24px;">
          <strong style="color: #fff;">${clientName}</strong> from <strong style="color: #fff;">${businessName}</strong> has signed their client agreement.
        </p>

        <div style="background: #111; border: 1px solid #222; border-radius: 10px; padding: 20px; margin: 0 0 24px;">
          <p style="margin: 0 0 10px; color: #ccc; font-size: 14px;"><span style="color: #666;">Signed name:</span> &nbsp;${details.signatureName}</p>
          <p style="margin: 0 0 10px; color: #ccc; font-size: 14px;"><span style="color: #666;">Signed at:</span> &nbsp;${details.signedAt}</p>
          <p style="margin: 0 0 10px; color: #ccc; font-size: 14px;"><span style="color: #666;">IP Address:</span> &nbsp;${details.ip}</p>
          <p style="margin: 0; color: #ccc; font-size: 14px;"><span style="color: #666;">Contract saved to:</span> &nbsp;/Clients/${clientName}/Contracts/</p>
        </div>

        <div style="display: flex; gap: 12px; margin-top: 24px;">
          <a href="${details.pdfUrl}" style="display: inline-block; background: ${accentColor}; color: #000; font-weight: 700; font-size: 14px; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
            View Contract in Google Drive →
          </a>
          <a href="${SITE_URL}/admin" style="display: inline-block; background: #1a1a1a; color: #fff; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 8px; text-decoration: none; border: 1px solid #333;">
            View Client in Admin Panel →
          </a>
        </div>
      </div>
    `,
  });
}

// ─── 3. Step Completion Notification ──────────────────────────────────────────

const STEP_NAMES: Record<number, string> = {
  0: "Sign Agreement",
  1: "Book Onboarding Call",
  2: "Complete Onboarding Form",
  3: "Link Meta Business Suite",
  4: "Upload Content",
};

export async function notifyStepComplete(
  client: {
    first_name: string;
    last_name: string;
    business_name: string;
    email: string;
  },
  stepNumber: number
) {
  const transporter = getTransporter();
  if (!transporter) return;

  const clientName = `${client.first_name} ${client.last_name}`;
  const businessName = client.business_name || clientName;
  const stepName = STEP_NAMES[stepNumber] || `Step ${stepNumber}`;
  const percent = Math.round(((stepNumber + 1) / 5) * 100);

  await transporter.sendMail({
    from: FROM,
    to: NOTIFICATION_EMAIL,
    subject: `✅ ${businessName} completed Step ${stepNumber}: ${stepName}`,
    html: `
      <div style="${emailBase}">
        ${logoHeader}<h1 style="margin: 0 0 24px; font-size: 20px; color: ${accentColor};">✅ Step Complete</h1>
        <p style="font-size: 16px; margin: 0 0 8px;">
          <strong style="color: #fff;">${clientName}</strong>
          <span style="color: #666;"> (${client.email})</span>
        </p>
        <p style="font-size: 15px; color: #888; margin: 0 0 24px;">
          has completed <strong style="color: ${accentColor};">Step ${stepNumber}: ${stepName}</strong>
        </p>
        <div style="background: #111; border: 1px solid #222; border-radius: 8px; padding: 16px;">
          <p style="margin: 0; color: #888; font-size: 14px;">
            Step ${stepNumber + 1} of 5 — ${percent}% of onboarding complete
          </p>
          <div style="margin-top: 10px; height: 6px; background: #222; border-radius: 3px;">
            <div style="height: 6px; background: ${accentColor}; border-radius: 3px; width: ${percent}%;"></div>
          </div>
        </div>
      </div>
    `,
  });
}

// ─── 4. All Steps Complete Notification ───────────────────────────────────────

export async function notifyAllStepsComplete(client: {
  first_name: string;
  last_name: string;
  business_name: string;
  email: string;
  country: string;
}) {
  const transporter = getTransporter();
  if (!transporter) return;

  const clientName = `${client.first_name} ${client.last_name}`;
  const businessName = client.business_name || clientName;
  const countryLabel =
    client.country === "ireland"
      ? "Ireland"
      : client.country === "united_kingdom"
      ? "United Kingdom"
      : "United States";
  const now = new Date().toLocaleString("en-IE", { timeZone: "Europe/Dublin" });

  await transporter.sendMail({
    from: FROM,
    to: NOTIFICATION_EMAIL,
    subject: `✅ Onboarding Complete — ${businessName} (${countryLabel})`,
    html: `
      <div style="${emailBase}">
        ${logoHeader}<h1 style="margin: 0 0 24px; font-size: 22px; color: ${accentColor}; text-align: center;">🎉 Onboarding Complete</h1>

        <p style="font-size: 15px; color: #aaaaaa; line-height: 1.7; margin: 0 0 24px; text-align: center;">
          <strong style="color: #fff;">${clientName}</strong> from <strong style="color: #fff;">${businessName}</strong> has completed their onboarding portal in full. All steps are done and their campaign is ready to move forward.
        </p>

        <div style="background: #111; border: 1px solid #222; border-radius: 10px; padding: 20px; margin: 0 0 24px;">
          <p style="margin: 0 0 8px; color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 600;">Client Details</p>
          <p style="margin: 0 0 8px; color: #ccc; font-size: 14px;"><span style="color: #555;">Name:</span> &nbsp;${clientName}</p>
          <p style="margin: 0 0 8px; color: #ccc; font-size: 14px;"><span style="color: #555;">Business:</span> &nbsp;${businessName}</p>
          <p style="margin: 0 0 8px; color: #ccc; font-size: 14px;"><span style="color: #555;">Email:</span> &nbsp;${client.email}</p>
          <p style="margin: 0 0 8px; color: #ccc; font-size: 14px;"><span style="color: #555;">Country / Market:</span> &nbsp;${countryLabel}</p>
          <p style="margin: 0; color: #ccc; font-size: 14px;"><span style="color: #555;">Portal Completed:</span> &nbsp;${now}</p>
        </div>

        <div style="background: #111; border: 1px solid #222; border-radius: 10px; padding: 20px; margin: 0 0 24px;">
          <p style="margin: 0 0 12px; color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 600;">Onboarding Steps</p>
          <p style="margin: 0 0 6px; color: #ccc; font-size: 14px;">✅ Agreement signed</p>
          <p style="margin: 0 0 6px; color: #ccc; font-size: 14px;">✅ Onboarding call booked</p>
          <p style="margin: 0 0 6px; color: #ccc; font-size: 14px;">✅ Onboarding form submitted</p>
          <p style="margin: 0 0 6px; color: #ccc; font-size: 14px;">✅ Meta Business Suite linked</p>
          <p style="margin: 0; color: #ccc; font-size: 14px;">✅ Content uploaded</p>
        </div>

        <div style="background: #111; border: 1px solid #222; border-radius: 10px; padding: 20px; margin: 0 0 24px;">
          <p style="margin: 0 0 12px; color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 600;">Next Steps</p>
          <p style="margin: 0 0 6px; color: #ccc; font-size: 14px;">→ Review onboarding form responses</p>
          <p style="margin: 0 0 6px; color: #ccc; font-size: 14px;">→ Confirm Meta access is in place</p>
          <p style="margin: 0 0 6px; color: #ccc; font-size: 14px;">→ Review uploaded assets</p>
          <p style="margin: 0; color: #ccc; font-size: 14px;">→ Prepare campaign build ahead of onboarding call</p>
        </div>

        <div style="text-align: center;">
          <a href="${SITE_URL}/admin" style="display: inline-block; background: ${accentColor}; color: #000; font-weight: 700; font-size: 14px; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
            View Client in Admin Panel →
          </a>
        </div>
      </div>
    `,
  });
}

// ─── 5. Password Reset Email ───────────────────────────────────────────────────

export async function sendPasswordResetEmail(
  clientEmail: string,
  clientFirstName: string,
  resetLink: string
) {
  const transporter = getTransporter();
  if (!transporter) return;

  await transporter.sendMail({
    from: FROM,
    to: clientEmail,
    subject: "Reset Your GGA Portal Password",
    html: `
      <div style="${emailBase}">
        ${logoHeader}

        <p style="font-size: 16px; color: #cccccc; margin: 0 0 16px;">Hi ${clientFirstName},</p>

        <p style="font-size: 15px; color: #aaaaaa; line-height: 1.7; margin: 0 0 24px;">
          We received a request to reset your portal password. Click the button below to set a new password — this link is valid for 1 hour.
        </p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetLink}" style="display: inline-block; background: ${accentColor}; color: #000; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 8px; text-decoration: none;">
            Reset My Password →
          </a>
        </div>

        <p style="font-size: 13px; color: #555; text-align: center; margin: 0;">
          If you didn't request this, you can safely ignore this email. Your password won't change.
        </p>
      </div>
    `,
  });
}
