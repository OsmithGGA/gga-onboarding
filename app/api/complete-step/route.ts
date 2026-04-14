import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notifyStepComplete, notifyAllStepsComplete } from "@/lib/resend";

export async function POST(request: Request) {
  try {
    const { clientId, stepNumber, note, clientName, clientEmail } =
      await request.json();

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
      .select("id")
      .eq("id", clientId)
      .eq("user_id", user.id)
      .single();

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Insert step completion (ignore conflict if already completed)
    const { error } = await supabase.from("step_completions").upsert(
      {
        client_id: clientId,
        step_number: stepNumber,
        note: note || null,
      },
      { onConflict: "client_id,step_number" }
    );

    if (error) {
      console.error("Step completion error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Check how many steps are now complete
    const { data: completions } = await supabase
      .from("step_completions")
      .select("step_number")
      .eq("client_id", clientId);

    const completedCount = completions?.length || 0;

    // Send email notification (fire and forget — don't block the response)
    if (completedCount >= 4) {
      notifyAllStepsComplete(clientName, clientEmail).catch(console.error);
    } else {
      notifyStepComplete(clientName, clientEmail, stepNumber).catch(
        console.error
      );
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
