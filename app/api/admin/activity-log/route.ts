import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

function isAdmin(request: Request): boolean {
  return request.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

export async function GET(request: Request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const clientId = url.searchParams.get("clientId");

  if (!clientId) {
    return NextResponse.json({ error: "clientId is required" }, { status: 400 });
  }

  const supabase = await createAdminClient();
  const { data: events, error } = await supabase
    .from("client_activity_log")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ events });
}
