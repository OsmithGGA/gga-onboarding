import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PortalClient from "@/components/PortalClient";

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
    // Client record not yet linked — show a waiting state
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[#00d4aa]/10 border border-[#00d4aa]/30 flex items-center justify-center mx-auto mb-5">
            <svg
              className="w-8 h-8 text-[#00d4aa]"
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

  return (
    <PortalClient
      client={client}
      completedSteps={completedSteps}
      userEmail={user.email || ""}
    />
  );
}
