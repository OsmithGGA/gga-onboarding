import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminClient from "@/components/AdminClient";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ pw?: string }>;
}) {
  const params = await searchParams;
  const pw = params.pw;

  // Simple password gate — passed as query param on first visit, stored in cookie
  const cookieStore = await cookies();
  const savedPw = cookieStore.get("admin_pw")?.value;

  const adminPw = process.env.ADMIN_PASSWORD;

  const isAuthorized = savedPw === adminPw || pw === adminPw;

  if (!isAuthorized) {
    // Show password form (handled client-side redirect)
    return <AdminLoginGate />;
  }

  return <AdminClient adminPassword={adminPw!} />;
}

function AdminLoginGate() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-[#111] border border-[#222] rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-[#ADFF00] flex items-center justify-center">
            <span className="text-black font-bold text-sm">G</span>
          </div>
          <h1 className="text-white font-semibold">GGA Admin</h1>
        </div>
        <form
          action=""
          method="get"
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <div>
            <label className="block text-sm text-[#888] mb-2">
              Admin Password
            </label>
            <input
              type="password"
              name="pw"
              required
              autoFocus
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#ADFF00] focus:ring-1 focus:ring-[#ADFF00] transition-colors"
              placeholder="Enter admin password"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#ADFF00] hover:bg-[#8FCC00] text-black font-semibold py-3 rounded-xl transition-all"
          >
            Access Admin
          </button>
        </form>
      </div>
    </div>
  );
}
