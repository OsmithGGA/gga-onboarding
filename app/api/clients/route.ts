import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { createClientFolder } from "@/lib/google-drive";
import { cookies } from "next/headers";

// Verify admin password
function isAdmin(request: Request): boolean {
  const authHeader = request.headers.get("x-admin-password");
  return authHeader === process.env.ADMIN_PASSWORD;
}

export async function POST(request: Request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, email, company, country } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();

    // 1. Invite the user via Supabase Auth (sends magic link email)
    const { data: inviteData, error: inviteError } =
      await supabase.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        data: { name, company },
      });

    if (inviteError) {
      return NextResponse.json(
        { error: inviteError.message },
        { status: 400 }
      );
    }

    const userId = inviteData.user.id;

    // 2. Create Google Drive folder (if configured)
    let driveFolderId: string | null = null;
    let driveFolderUrl: string | null = null;

    if (
      process.env.GOOGLE_SERVICE_ACCOUNT_JSON &&
      process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID
    ) {
      try {
        const folder = await createClientFolder(name, email);
        driveFolderId = folder.folderId;
        driveFolderUrl = folder.folderUrl;
      } catch (driveError) {
        console.error("Drive folder creation failed:", driveError);
        // Continue without Drive — can be set manually later
      }
    }

    // 3. Create client record in DB
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .insert({
        user_id: userId,
        name,
        email,
        company: company || null,
        country: country || "ireland",
        drive_folder_id: driveFolderId,
        drive_folder_url: driveFolderUrl,
      })
      .select()
      .single();

    if (clientError) {
      return NextResponse.json(
        { error: clientError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, client });
  } catch (err) {
    console.error("create-client error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = await createAdminClient();

    const { data: clients, error } = await supabase
      .from("clients")
      .select(`
        *,
        step_completions(step_number)
      `)
      .order("created_at", { ascending: false });

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
