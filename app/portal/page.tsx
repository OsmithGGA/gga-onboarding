import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import PortalClient from "@/components/PortalClient";

function generatePaymentSection(client: Record<string, unknown>): string {
  const currency = (client.currency as string) || "€";
  const isPaidInFull = !client.month2_amount && !client.month3_amount && client.deposit_amount;

  if (isPaidInFull) {
    return `
      <div style="background: #0f1a0a; border: 1px solid #ADFF00; border-radius: 10px; padding: 18px 20px; margin-bottom: 12px;">
        <p style="margin: 0 0 8px; color: #ADFF00; font-weight: 700; font-size: 14px;">■ PAID IN FULL</p>
        <p style="margin: 0; color: #bbb; font-size: 14px;">Total amount: <strong style="color: #fff; font-size: 16px;">${currency}${client.deposit_amount}</strong> — paid in full prior to or at time of signing.</p>
      </div>
      <p style="margin: 0; color: #888; font-size: 13px; font-style: italic;">No further payments are due for the duration of this agreement.</p>
    `;
  }

  const dueDate = (client.payment_due_date as string)?.toString() || "TBD";
  const rows = [
    client.deposit_amount ? `<tr><td style="padding:10px 14px;border:1px solid #2a2a2a;color:#ccc;">Deposit</td><td style="padding:10px 14px;border:1px solid #2a2a2a;color:#ADFF00;font-weight:600;">${currency}${client.deposit_amount}</td><td style="padding:10px 14px;border:1px solid #2a2a2a;color:#ccc;">Due at signing</td></tr>` : "",
    client.month1_remainder ? `<tr><td style="padding:10px 14px;border:1px solid #2a2a2a;color:#ccc;">Month 1 Remainder</td><td style="padding:10px 14px;border:1px solid #2a2a2a;color:#ADFF00;font-weight:600;">${currency}${client.month1_remainder}</td><td style="padding:10px 14px;border:1px solid #2a2a2a;color:#ccc;">${dueDate} of Month 1</td></tr>` : "",
    client.month2_amount ? `<tr><td style="padding:10px 14px;border:1px solid #2a2a2a;color:#ccc;">Month 2</td><td style="padding:10px 14px;border:1px solid #2a2a2a;color:#ADFF00;font-weight:600;">${currency}${client.month2_amount}</td><td style="padding:10px 14px;border:1px solid #2a2a2a;color:#ccc;">${dueDate} of Month 2</td></tr>` : "",
    client.month3_amount ? `<tr><td style="padding:10px 14px;border:1px solid #2a2a2a;color:#ccc;">Month 3</td><td style="padding:10px 14px;border:1px solid #2a2a2a;color:#ADFF00;font-weight:600;">${currency}${client.month3_amount}</td><td style="padding:10px 14px;border:1px solid #2a2a2a;color:#ccc;">${dueDate} of Month 3</td></tr>` : "",
  ].filter(Boolean).join("");

  return `
    <table class="contract-fees" style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:12px;">
      <thead><tr>
        <th style="background:#1a1a1a;color:#fff;padding:10px 14px;text-align:left;border:1px solid #333;font-weight:600;">Payment</th>
        <th style="background:#1a1a1a;color:#fff;padding:10px 14px;text-align:left;border:1px solid #333;font-weight:600;">Amount</th>
        <th style="background:#1a1a1a;color:#fff;padding:10px 14px;text-align:left;border:1px solid #333;font-weight:600;">Due</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="margin:0;color:#888;font-size:13px;font-style:italic;">Late payments may result in the campaign being paused until the outstanding balance is cleared.</p>
  `;
}

function interpolateContract(template: string, client: Record<string, unknown>): string {
  if (!template) return "";

  const firstName = (client.first_name as string) || "";
  const lastName = (client.last_name as string) || "";
  const clientName = `${firstName} ${lastName}`.trim() || (client.name as string) || "";
  const businessName = (client.business_name as string) || clientName;

  const countryLabel =
    client.country === "ireland"
      ? "Ireland"
      : client.country === "united_kingdom"
      ? "United Kingdom"
      : "United States";

  const contractStartDate = client.contract_start_date
    ? new Date(client.contract_start_date as string).toLocaleDateString("en-IE")
    : new Date().toLocaleDateString("en-IE");

  const endDateObj = client.contract_start_date
    ? new Date(
        new Date(client.contract_start_date as string).getTime() +
          90 * 24 * 60 * 60 * 1000
      )
    : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
  const contractEndDate = endDateObj.toLocaleDateString("en-IE");

  return template
    .replace(/\{ClientName\}/g, clientName)
    .replace(/\{BusinessName\}/g, businessName)
    .replace(/\{Country\}/g, countryLabel)
    .replace(/\{StartDate\}/g, contractStartDate)
    .replace(/\{ContractEndDate\}/g, contractEndDate)
    .replace(/\{SignatureDate\}/g, "[Signed at time of agreement]")
    .replace(/\{SignatureIP\}/g, "[Recorded at time of signing]")
    .replace(/\{Currency\}/g, (client.currency as string) || "€")
    .replace(/\{DailyAdBudget\}/g, (client.daily_ad_budget as string)?.toString() || "TBD")
    .replace(/\{DepositAmount\}/g, (client.deposit_amount as string)?.toString() || "TBD")
    .replace(/\{Month1Remainder\}/g, (client.month1_remainder as string)?.toString() || "TBD")
    .replace(/\{Month2Amount\}/g, (client.month2_amount as string)?.toString() || "TBD")
    .replace(/\{Month3Amount\}/g, (client.month3_amount as string)?.toString() || "TBD")
    .replace(/\{PaymentDueDate\}/g, (client.payment_due_date as string)?.toString() || "TBD")
    .replace(/\{PaymentSection\}/g, generatePaymentSection(client));
}

export default async function PortalPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch client record
  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!client) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[#ADFF00]/10 border border-[#ADFF00]/30 flex items-center justify-center mx-auto mb-5">
            <svg
              className="w-8 h-8 text-[#ADFF00]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Setting up your portal
          </h2>
          <p className="text-[#888] text-sm max-w-sm">
            Your onboarding portal is being prepared. Please contact your GGA
            account manager if this persists.
          </p>
        </div>
      </div>
    );
  }

  // Fetch completed steps
  const { data: completions } = await supabase
    .from("step_completions")
    .select("*")
    .eq("client_id", client.id);

  const completedSteps = (completions || []).map(
    (c: { step_number: number }) => c.step_number
  );

  // Fetch and interpolate contract template (use admin client for service-role access)
  let contractHtml = "";
  try {
    const adminSupabase = createAdminClient();
    const { data: templateRow } = await adminSupabase
      .from("contract_templates")
      .select("body")
      .eq("name", "Master Contract")
      .single();

    if (templateRow?.body) {
      contractHtml = interpolateContract(templateRow.body, client);
    }
  } catch (err) {
    console.error("Failed to fetch contract template:", err);
  }

  return (
    <PortalClient
      client={client}
      completedSteps={completedSteps}
      userEmail={user.email || ""}
      contractHtml={contractHtml}
    />
  );
}
