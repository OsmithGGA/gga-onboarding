import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { notifyStepComplete, notifyAllStepsComplete } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { clientId, stepNumber, note } = await request.json();

    const supabase = await createClient();

    // Verify the user owns this client record
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: client } = await supabase
      .from("clients")
      .select("id, first_name, last_name, business_name, email, country")
      .eq("id", clientId)
      .eq("user_id", user.id)
      .single();

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Guard: steps 1-4 require step 0 to be completed first
    if (stepNumber > 0) {
      const { data: step0 } = await supabase
        .from("step_completions")
        .select("id")
        .eq("client_id", clientId)
        .eq("step_number", 0)
        .single();

      if (!step0) {
        return NextResponse.json(
          { error: "You must sign your agreement (Step 0) before completing other steps." },
          { status: 403 }
        );
      }
    }

    // Insert step completion
    const { error } = await supabase.from("step_completions").upsert(
      {
        client_id: clientId,
        step_number: stepNumber,
        note: note || null,
        completed_by: "client",
      },
      { onConflict: "client_id,step_number" }
    );

    if (error) {
      console.error("Step completion error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log to activity log (use admin client to bypass RLS)
    const adminSupabase = createAdminClient();
    await adminSupabase.from("client_activity_log").insert({
      client_id: clientId,
      event_type: "step_completed",
      event_data: { step_number: stepNumber, note: note || null },
    });

    // Check how many steps are now complete
    const { data: completions } = await supabase
      .from("step_completions")
      .select("step_number")
      .eq("client_id", clientId);

    const completedCount = completions?.length || 0;

    // Build client object for emails
    const clientForEmail = {
      first_name: client.first_name || "",
      last_name: client.last_name || "",
      business_name: client.business_name || "",
      email: client.email,
      country: client.country,
    };

    // Send notification email (fire and forget)
    if (completedCount >= 5) {
      // Mark onboarding complete timestamp
      await adminSupabase
        .from("clients")
        .update({ onboarding_complete_at: new Date().toISOString() })
        .eq("id", clientId);

      notifyAllStepsComplete(clientForEmail).catch(console.error);
    } else {
      notifyStepComplete(clientForEmail, stepNumber).catch(console.error);
    }

    return NextResponse.json({ success: true, completedCount });
  } catch (err) {
    console.error("complete-step error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
