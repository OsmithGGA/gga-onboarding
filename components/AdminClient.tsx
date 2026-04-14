"use client";

import { useState, useEffect, useCallback } from "react";

interface StepCompletion {
  step_number: number;
}

interface Client {
  id: string;
  name: string;
  email: string;
  company: string | null;
  country: string | null;
  drive_folder_url: string | null;
  created_at: string;
  step_completions: StepCompletion[];
}

interface Props {
  adminPassword: string;
}

export default function AdminClient({ adminPassword }: Props) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    country: "ireland",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchClients = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/clients", {
      headers: { "x-admin-password": adminPassword },
    });
    if (res.ok) {
      const data = await res.json();
      setClients(data.clients || []);
    }
    setLoading(false);
  }, [adminPassword]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    const res = await fetch("/api/clients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": adminPassword,
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (res.ok) {
      setSuccess(`✅ ${form.name} has been added. Magic link sent to ${form.email}`);
      setForm({ name: "", email: "", company: "", country: "ireland" });
      fetchClients();
    } else {
      setError(data.error || "Something went wrong");
    }
    setSubmitting(false);
  };

  const getStepsComplete = (client: Client) =>
    client.step_completions?.length || 0;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-[#1a1a1a] bg-[#0d0d0d]">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00d4aa] flex items-center justify-center">
              <span className="text-black font-bold text-sm">G</span>
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-none">
                Green Growth Agency
              </p>
              <p className="text-[#555] text-xs mt-0.5">Admin Panel</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#00d4aa] hover:bg-[#00bfa0] text-black font-semibold py-2 px-4 rounded-xl transition-all text-sm hover:shadow-[0_0_15px_rgba(0,212,170,0.4)]"
          >
            + Add New Client
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Clients", value: clients.length },
            {
              label: "Fully Onboarded",
              value: clients.filter((c) => getStepsComplete(c) >= 4).length,
            },
            {
              label: "In Progress",
              value: clients.filter(
                (c) => getStepsComplete(c) > 0 && getStepsComplete(c) < 4
              ).length,
            },
            {
              label: "Not Started",
              value: clients.filter((c) => getStepsComplete(c) === 0).length,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-[#111] border border-[#222] rounded-2xl p-5"
            >
              <p className="text-2xl font-bold text-[#00d4aa]">{stat.value}</p>
              <p className="text-xs text-[#888] mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Client table */}
        <div className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1a1a1a]">
            <h2 className="text-sm font-semibold text-white">All Clients</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center gap-2 text-[#555] text-sm">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Loading clients...
              </div>
            </div>
          ) : clients.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[#555] text-sm">No clients yet. Add your first client above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1a1a1a]">
                    {["Client", "Company", "Country", "Progress", "Drive", "Added"].map(
                      (h) => (
                        <th
                          key={h}
                          className="text-left text-xs font-medium text-[#555] px-6 py-3"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => {
                    const steps = getStepsComplete(client);
                    return (
                      <tr
                        key={client.id}
                        className="border-b border-[#1a1a1a] last:border-0 hover:bg-[#0d0d0d] transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-white">
                            {client.name}
                          </p>
                          <p className="text-xs text-[#555]">{client.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-[#888]">
                            {client.company || "—"}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs px-2 py-1 rounded-full bg-[#1a1a1a] text-[#888] capitalize">
                            {client.country || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              {[1, 2, 3, 4].map((s) => (
                                <div
                                  key={s}
                                  className={`w-2 h-2 rounded-full ${
                                    client.step_completions?.some(
                                      (sc) => sc.step_number === s
                                    )
                                      ? "bg-[#00d4aa]"
                                      : "bg-[#333]"
                                  }`}
                                />
                              ))}
                            </div>
                            <span
                              className={`text-xs font-medium ${
                                steps >= 4
                                  ? "text-[#00d4aa]"
                                  : steps > 0
                                  ? "text-amber-400"
                                  : "text-[#555]"
                              }`}
                            >
                              {steps}/4
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {client.drive_folder_url ? (
                            <a
                              href={client.drive_folder_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-[#00d4aa] hover:underline"
                            >
                              Open folder →
                            </a>
                          ) : (
                            <span className="text-xs text-[#555]">Not created</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs text-[#555]">
                            {formatDate(client.created_at)}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Add client modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="w-full max-w-md bg-[#111] border border-[#222] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Add New Client</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setError("");
                  setSuccess("");
                }}
                className="text-[#555] hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {success ? (
              <div className="text-center py-4">
                <div className="text-3xl mb-3">✅</div>
                <p className="text-white font-medium mb-2">Client added!</p>
                <p className="text-sm text-[#888]">{success}</p>
                <button
                  onClick={() => {
                    setSuccess("");
                    setShowModal(false);
                  }}
                  className="mt-4 text-sm text-[#00d4aa] hover:underline"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-[#888] mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="John Smith"
                    className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl px-4 py-2.5 text-white text-sm placeholder-[#555] focus:outline-none focus:border-[#00d4aa] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#888] mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="john@company.com"
                    className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl px-4 py-2.5 text-white text-sm placeholder-[#555] focus:outline-none focus:border-[#00d4aa] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#888] mb-1.5">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) =>
                      setForm({ ...form, company: e.target.value })
                    }
                    placeholder="Smith Insulation Ltd."
                    className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl px-4 py-2.5 text-white text-sm placeholder-[#555] focus:outline-none focus:border-[#00d4aa] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#888] mb-1.5">
                    Country
                  </label>
                  <select
                    value={form.country}
                    onChange={(e) =>
                      setForm({ ...form, country: e.target.value })
                    }
                    className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00d4aa] transition-colors"
                  >
                    <option value="ireland">Ireland 🇮🇪</option>
                    <option value="usa">USA 🇺🇸</option>
                  </select>
                </div>

                {error && (
                  <p className="text-red-400 text-xs">{error}</p>
                )}

                <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-3">
                  <p className="text-xs text-[#555]">
                    This will automatically:
                    <br />• Send a magic link invite to the client{"'"}s email
                    <br />• Create their Google Drive folder
                    <br />• Set up their portal profile
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#00d4aa] hover:bg-[#00bfa0] text-black font-semibold py-3 rounded-xl transition-all text-sm disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Add Client & Send Invite"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
