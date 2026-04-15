import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { createClientFolderStructure } from "@/lib/google-drive";
import { sendWelcomeEmail } from "@/lib/email";

// Verify admin password
function isAdmin(request: Request): boolean {
  const authHeader = request.headers.get("x-admin-password");
  return authHeader === process.env.ADMIN_PASSWORD;
}

// ─── POST — Create new client ────────────────────────────────────────────────
export async function POST(request: Request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      businessName,
      email,
      password,
      country,
      currency,
      depositAmount,
      month1Remainder,
      month2Amount,
      month3Amount,
      dailyAdBudget,
      paymentDueDate,
      driveAssetsUrl,
      pandadocNotes,
    } = body;

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: "First name, last name, email and password are required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const fullName = `${firstName} ${lastName}`;

    // 1. Create Supabase auth user (email_confirm: true skips confirmation email)
    const { data: userData, error: userError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name: fullName, business_name: businessName },
      });

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 400 });
    }

    const userId = userData.user.id;

    // 2. Determine currency from country if not provided
    const resolvedCurrency =
      currency ||
      (country === "united_kingdom"
        ? "£"
        : country === "usa"
        ? "$"
        : "€");

    // 3. Create Google Drive folder structure (if configured)
    let driveAssetsFolder: string | null = driveAssetsUrl || null;
    let driveContractsFolderId: string | null = null;
    let driveSheetUrl: string | null = null;

    if (
      process.env.GOOGLE_SERVICE_ACCOUNT_JSON &&
      process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID
    ) {
      try {
        const folderResult = await createClientFolderStructure(fullName, email);
        driveAssetsFolder = folderResult.assetsFolderUrl;
        driveContractsFolderId = folderResult.contractsFolderId;
        driveSheetUrl = folderResult.sheetUrl;
      } catch (driveError) {
        console.error("Drive folder creation failed:", driveError);
        // Continue — can be configured manually later
      }
    }

    // 4. Create client record in DB
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .insert({
        user_id: userId,
        name: fullName,
        first_name: firstName,
        last_name: lastName,
        business_name: businessName || fullName,
        email,
        country: country || "ireland",
        currency: resolvedCurrency,
        deposit_amount: depositAmount ? parseFloat(depositAmount) : null,
        month1_remainder: month1Remainder ? parseFloat(month1Remainder) : null,
        month2_amount: month2Amount ? parseFloat(month2Amount) : null,
        month3_amount: month3Amount ? parseFloat(month3Amount) : null,
        daily_ad_budget: dailyAdBudget ? parseFloat(dailyAdBudget) : null,
        payment_due_date: paymentDueDate ? parseInt(paymentDueDate) : null,
        drive_assets_folder_url: driveAssetsFolder,
        drive_contracts_folder_id: driveContractsFolderId,
        drive_sheet_url: driveSheetUrl,
        pandadoc_notes: pandadocNotes || null,
        contract_start_date: new Date().toISOString().split("T")[0],
        // Legacy fields kept for backwards compat
        drive_folder_id: null,
        drive_folder_url: driveAssetsFolder,
        company: businessName || null,
      })
      .select()
      .single();

    if (clientError) {
      // Clean up the auth user so admin can retry with same email
      await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: clientError.message },
        { status: 500 }
      );
    }

    // 5. Log client creation in activity log
    await supabase.from("client_activity_log").insert({
      client_id: client.id,
      event_type: "client_created",
      event_data: {
        created_by: "admin",
        country: country || "ireland",
        business_name: businessName,
      },
    });

    // 6. Send welcome email (fire and forget)
    sendWelcomeEmail(
      {
        first_name: firstName,
        last_name: lastName,
        business_name: businessName || fullName,
        email,
      },
      password
    ).catch(console.error);

    return NextResponse.json({ success: true, client });
  } catch (err) {
    console.error("create-client error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ─── GET — List all clients ───────────────────────────────────────────────────
export async function GET(request: Request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const url = new URL(request.url);
    const countryFilter = url.searchParams.get("country");

    let query = supabase
      .from("clients")
      .select(`*, step_completions(step_number, completed_at, completed_by)`)
      .order("created_at", { ascending: false });

    if (countryFilter && countryFilter !== "all") {
      query = query.eq("country", countryFilter);
    }

    const { data: clients, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ clients });
  } catch (err) {
    console.error("get-clients error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ─── PATCH — Admin actions on a client ───────────────────────────────────────
export async function PATCH(request: Request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { action, clientId, stepNumber, userId, ...rest } =
      await request.json();

    const supabase = createAdminClient();

    if (action === "resend-welcome" || action === "reset-password") {
      // Trigger Supabase's built-in password reset email to the client
      const { data: clientData } = await supabase
        .from("clients")
        .select("email, first_name")
        .eq("id", clientId)
        .single();

      if (!clientData) {
        return NextResponse.json({ error: "Client not found" }, { status: 404 });
      }

      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL || "https://gga-onboarding2.vercel.app";

      const { error } = await supabase.auth.resetPasswordForEmail(
        clientData.email,
        { redirectTo: `${siteUrl}/auth/reset-password` }
      );

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      await supabase.from("client_activity_log").insert({
        client_id: clientId,
        event_type: "password_reset_sent",
        event_data: { triggered_by: "admin" },
      });

      return NextResponse.json({ success: true, message: "Password reset email sent" });
    }

    if (action === "override-step") {
      const mark = rest.mark || "complete";

      if (mark === "complete") {
        await supabase.from("step_completions").upsert(
          {
            client_id: clientId,
            step_number: stepNumber,
            completed_by: "admin",
            note: "Manually completed by admin",
          },
          { onConflict: "client_id,step_number" }
        );
      } else {
        await supabase
          .from("step_completions")
          .delete()
          .eq("client_id", clientId)
          .eq("step_number", stepNumber);
      }

      await supabase.from("client_activity_log").insert({
        client_id: clientId,
        event_type: "step_overridden",
        event_data: { step_number: stepNumber, mark, by: "admin" },
      });

      return NextResponse.json({ success: true });
    }

    if (action === "update-contract-template") {
      const { body } = rest;
      await supabase
        .from("contract_templates")
        .update({ body, updated_at: new Date().toISOString() })
        .eq("name", "Master Contract");

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("patch-client error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
