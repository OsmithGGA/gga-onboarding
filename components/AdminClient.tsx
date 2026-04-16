"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Loader2, X, ChevronDown, Eye, EyeOff, RefreshCw,
  CheckCircle, Clock, AlertCircle, Users, TrendingUp, UserCheck,
} from "lucide-react";

interface StepCompletion {
  step_number: number;
  completed_at: string;
  completed_by: string;
}

interface Client {
  id: string;
  name: string;
  first_name: string | null;
  last_name: string | null;
  business_name: string | null;
  email: string;
  company: string | null;
  country: string | null;
  currency: string | null;
  drive_assets_folder_url: string | null;
  drive_folder_url: string | null;
  created_at: string;
  onboarding_complete_at: string | null;
  step_completions: StepCompletion[];
}

interface ActivityEvent {
  id: string;
  event_type: string;
  event_data: Record<string, unknown>;
  created_at: string;
}

const COUNTRY_OPTIONS = [
  { value: "ireland", label: "Ireland 🇮🇪", currency: "€" },
  { value: "united_kingdom", label: "United Kingdom 🇬🇧", currency: "£" },
  { value: "usa", label: "United States 🇺🇸", currency: "$" },
];

const STEP_LABELS = ["Sign Agreement", "Book Call", "Onboarding Form", "Meta Access", "Upload Content"];

const defaultForm = {
  firstName: "",
  lastName: "",
  businessName: "",
  email: "",
  password: "",
  country: "ireland",
  currency: "€",
  paymentType: "monthly" as "monthly" | "paid_in_full",
  fullPaymentAmount: "",
  depositAmount: "",
  month1Remainder: "",
  month2Amount: "",
  month3Amount: "",
  dailyAdBudget: "",
  paymentDueDate: "",
  driveAssetsUrl: "",
  pandadocNotes: "",
};

export default function AdminClient({ adminPassword }: { adminPassword: string }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Override step modal
  const [overrideClient, setOverrideClient] = useState<Client | null>(null);
  const [overrideStep, setOverrideStep] = useState(0);
  const [overrideLoading, setOverrideLoading] = useState(false);

  // Activity log panel
  const [activityClient, setActivityClient] = useState<Client | null>(null);
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);

  // Contract template
  const [showTemplate, setShowTemplate] = useState(false);
  const [templateBody, setTemplateBody] = useState("");
  const [templateSaving, setTemplateSaving] = useState(false);

  const authHeaders = { "x-admin-password": adminPassword };

  const fetchClients = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/clients${countryFilter !== "all" ? `?country=${countryFilter}` : ""}`, {
      headers: authHeaders,
    });
    if (res.ok) {
      const data = await res.json();
      setClients(data.clients || []);
    }
    setLoading(false);
  }, [adminPassword, countryFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const fetchTemplate = async () => {
    const res = await fetch("/api/admin/contract-template", { headers: authHeaders });
    if (res.ok) {
      const data = await res.json();
      setTemplateBody(data.template?.body || "");
    }
  };

  const handleCountryChange = (country: string) => {
    const match = COUNTRY_OPTIONS.find((o) => o.value === country);
    setForm((f) => ({ ...f, country, currency: match?.currency || "€" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    // If Paid in Full, use fullPaymentAmount as depositAmount and clear monthly fields
    const payload = { ...form };
    if (form.paymentType === "paid_in_full") {
      payload.depositAmount = form.fullPaymentAmount;
      payload.month1Remainder = "";
      payload.month2Amount = "";
      payload.month3Amount = "";
      payload.paymentDueDate = "";
    }

    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok) {
      const name = `${form.firstName} ${form.lastName}`.trim();
      setSuccess(`Client ${name} created. Welcome email sent to ${form.email}`);
      setForm(defaultForm);
      fetchClients();
    } else {
      setError(data.error || "Something went wrong");
    }
    setSubmitting(false);
  };

  const handleResendWelcome = async (clientId: string) => {
    await fetch("/api/clients", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({ action: "resend-welcome", clientId }),
    });
    alert("Password reset email sent to client.");
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDeleteClient = async (clientId: string) => {
    setDeleteLoading(true);
    const res = await fetch(`/api/clients?clientId=${clientId}`, {
      method: "DELETE",
      headers: authHeaders,
    });
    setDeleteLoading(false);
    if (res.ok) {
      setDeleteConfirmId(null);
      fetchClients();
    } else {
      const data = await res.json();
      alert(`Delete failed: ${data.error || "Unknown error"}`);
    }
  };

  const handleOverrideStep = async (mark: "complete" | "incomplete") => {
    if (!overrideClient) return;
    setOverrideLoading(true);
    await fetch("/api/clients", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({
        action: "override-step",
        clientId: overrideClient.id,
        stepNumber: overrideStep,
        mark,
      }),
    });
    setOverrideLoading(false);
    setOverrideClient(null);
    fetchClients();
  };

  const handleViewActivity = async (client: Client) => {
    setActivityClient(client);
    setActivityLoading(true);
    const res = await fetch(`/api/admin/activity-log?clientId=${client.id}`, {
      headers: authHeaders,
    });
    if (res.ok) {
      const data = await res.json();
      setActivityEvents(data.events || []);
    }
    setActivityLoading(false);
  };

  const handleSaveTemplate = async () => {
    setTemplateSaving(true);
    await fetch("/api/admin/contract-template", {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({ body: templateBody }),
    });
    setTemplateSaving(false);
    alert("Contract template saved.");
  };

  const getStepsComplete = (client: Client) => client.step_completions?.length || 0;

  const filteredClients = clients.filter((c) => {
    const steps = getStepsComplete(c);
    if (statusFilter === "complete" && steps < 5) return false;
    if (statusFilter === "in_progress" && (steps === 0 || steps >= 5)) return false;
    if (statusFilter === "not_started" && steps > 0) return false;
    return true;
  });

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  const countryLabel = (country: string | null) => {
    if (country === "ireland") return "IE 🇮🇪";
    if (country === "united_kingdom") return "UK 🇬🇧";
    if (country === "usa") return "US 🇺🇸";
    return country || "—";
  };

  const clientDisplayName = (c: Client) =>
    c.first_name && c.last_name ? `${c.first_name} ${c.last_name}` : c.name;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-[#1a1a1a] bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Green Growth Agency" className="h-8 w-auto" />
            <p className="text-[#555] text-xs">Admin Panel</p>
          </div>
          <button
            onClick={() => { setShowModal(true); setError(""); setSuccess(""); }}
            className="bg-[#ADFF00] hover:bg-[#8FCC00] text-black font-bold py-2 px-4 rounded-xl transition-all text-sm"
          >
            + Add New Client
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Clients", value: clients.length, icon: Users, color: "#ADFF00" },
            { label: "Fully Onboarded", value: clients.filter((c) => getStepsComplete(c) >= 5).length, icon: UserCheck, color: "#ADFF00" },
            { label: "In Progress", value: clients.filter((c) => { const s = getStepsComplete(c); return s > 0 && s < 5; }).length, icon: TrendingUp, color: "#f59e0b" },
            { label: "Not Started", value: clients.filter((c) => getStepsComplete(c) === 0).length, icon: Clock, color: "#555" },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-[#555] mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          {["all", "ireland", "united_kingdom", "usa"].map((v) => (
            <button
              key={v}
              onClick={() => setCountryFilter(v)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${countryFilter === v ? "border-[#ADFF00] bg-[#ADFF00]/10 text-[#ADFF00]" : "border-[#222] text-[#666] hover:border-[#333]"}`}
            >
              {v === "all" ? "All Countries" : v === "ireland" ? "Ireland 🇮🇪" : v === "united_kingdom" ? "UK 🇬🇧" : "USA 🇺🇸"}
            </button>
          ))}
          <div className="w-px bg-[#222] mx-1" />
          {["all", "complete", "in_progress", "not_started"].map((v) => (
            <button
              key={v}
              onClick={() => setStatusFilter(v)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${statusFilter === v ? "border-[#ADFF00] bg-[#ADFF00]/10 text-[#ADFF00]" : "border-[#222] text-[#666] hover:border-[#333]"}`}
            >
              {v === "all" ? "All Status" : v === "complete" ? "Complete" : v === "in_progress" ? "In Progress" : "Not Started"}
            </button>
          ))}
        </div>

        {/* Client table */}
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-[#1a1a1a] flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">
              All Clients ({filteredClients.length})
            </h2>
            <button onClick={fetchClients} className="text-[#555] hover:text-[#888] transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-5 h-5 text-[#555] animate-spin" />
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[#555] text-sm">No clients found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1a1a1a]">
                    {["Client", "Business", "Country", "Steps (0–4)", "Created", "Completed", "Actions"].map((h) => (
                      <th key={h} className="text-left text-xs font-medium text-[#444] px-4 py-3 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client) => {
                    const steps = getStepsComplete(client);
                    const completedNums = client.step_completions?.map((sc) => sc.step_number) || [];
                    return (
                      <tr key={client.id} className="border-b border-[#1a1a1a] last:border-0 hover:bg-[#111] transition-colors">
                        <td className="px-4 py-4">
                          <p className="text-sm font-medium text-white">{clientDisplayName(client)}</p>
                          <p className="text-xs text-[#555]">{client.email}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-[#888]">{client.business_name || client.company || "—"}</p>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-xs px-2 py-1 rounded-full bg-[#1a1a1a] text-[#777]">
                            {countryLabel(client.country)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              {[0, 1, 2, 3, 4].map((s) => (
                                <div
                                  key={s}
                                  title={`Step ${s}: ${STEP_LABELS[s]}`}
                                  className={`w-3 h-3 rounded-full border ${
                                    completedNums.includes(s)
                                      ? "bg-[#ADFF00] border-[#ADFF00]"
                                      : "bg-transparent border-[#333]"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className={`text-xs font-medium ${steps >= 5 ? "text-[#ADFF00]" : steps > 0 ? "text-amber-400" : "text-[#555]"}`}>
                              {steps}/5
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <p className="text-xs text-[#555]">{formatDate(client.created_at)}</p>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {client.onboarding_complete_at ? (
                            <p className="text-xs text-[#ADFF00]">{formatDate(client.onboarding_complete_at)}</p>
                          ) : (
                            <p className="text-xs text-[#444]">—</p>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex gap-1 flex-wrap">
                            <button
                              onClick={() => handleResendWelcome(client.id)}
                              title="Send password reset email"
                              className="text-xs px-2 py-1 rounded-lg bg-[#1a1a1a] hover:bg-[#222] text-[#777] hover:text-white border border-[#222] transition-colors"
                            >
                              Reset PW
                            </button>
                            <button
                              onClick={() => { setOverrideClient(client); setOverrideStep(0); }}
                              title="Manually override step status"
                              className="text-xs px-2 py-1 rounded-lg bg-[#1a1a1a] hover:bg-[#222] text-[#777] hover:text-white border border-[#222] transition-colors"
                            >
                              Override
                            </button>
                            <button
                              onClick={() => handleViewActivity(client)}
                              title="View activity log"
                              className="text-xs px-2 py-1 rounded-lg bg-[#1a1a1a] hover:bg-[#222] text-[#777] hover:text-white border border-[#222] transition-colors"
                            >
                              Log
                            </button>
                            {(client.drive_assets_folder_url || client.drive_folder_url) && (
                              <a
                                href={client.drive_assets_folder_url || client.drive_folder_url!}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs px-2 py-1 rounded-lg bg-[#1a1a1a] hover:bg-[#222] text-[#ADFF00] border border-[#222] transition-colors"
                              >
                                Drive
                              </a>
                            )}
                            <button
                              onClick={() => setDeleteConfirmId(client.id)}
                              title="Delete client"
                              className="text-xs px-2 py-1 rounded-lg bg-[#1a1a1a] hover:bg-red-900/40 text-[#555] hover:text-red-400 border border-[#222] transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Contract Template Editor */}
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl overflow-hidden">
          <button
            onClick={() => {
              setShowTemplate(!showTemplate);
              if (!showTemplate && !templateBody) fetchTemplate();
            }}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-[#111] transition-colors"
          >
            <h2 className="text-sm font-semibold text-white">Contract Template Editor</h2>
            <ChevronDown className={`w-4 h-4 text-[#555] transition-transform ${showTemplate ? "rotate-180" : ""}`} />
          </button>
          {showTemplate && (
            <div className="border-t border-[#1a1a1a] p-6">
              <p className="text-xs text-[#555] mb-3">
                Paste your contract HTML below. Variables:{" "}
                {["{ClientName}", "{BusinessName}", "{Country}", "{StartDate}", "{ContractEndDate}", "{Currency}", "{DepositAmount}", "{Month1Remainder}", "{Month2Amount}", "{Month3Amount}", "{DailyAdBudget}", "{PaymentDueDate}", "{SignatureDate}", "{SignatureIP}"].join(" · ")}
              </p>
              <textarea
                value={templateBody}
                onChange={(e) => setTemplateBody(e.target.value)}
                rows={20}
                placeholder="Paste contract HTML here..."
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl p-4 text-[#ccc] text-sm font-mono focus:outline-none focus:border-[#ADFF00] transition-colors resize-none"
              />
              <button
                onClick={handleSaveTemplate}
                disabled={templateSaving}
                className="mt-3 bg-[#ADFF00] hover:bg-[#8FCC00] disabled:opacity-50 text-black font-bold py-2 px-5 rounded-xl text-sm transition-colors flex items-center gap-2"
              >
                {templateSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                {templateSaving ? "Saving..." : "Save Template"}
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Add Client Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center px-4 py-8 overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-6 my-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Add New Client</h2>
              <button onClick={() => { setShowModal(false); setError(""); setSuccess(""); }} className="text-[#555] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {success ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-[#ADFF00] mx-auto mb-4" />
                <p className="text-white font-semibold mb-2">Client created successfully</p>
                <p className="text-sm text-[#888] mb-6">{success}</p>
                <button onClick={() => { setSuccess(""); setShowModal(false); }} className="text-sm text-[#ADFF00] hover:underline">
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Section 1: Client Details */}
                <div>
                  <h3 className="text-xs font-semibold text-[#555] uppercase tracking-wider mb-3">Client Details</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-[#888] mb-1.5">First Name *</label>
                      <input type="text" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="John" className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#444] focus:outline-none focus:border-[#ADFF00] transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs text-[#888] mb-1.5">Last Name *</label>
                      <input type="text" required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Smith" className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#444] focus:outline-none focus:border-[#ADFF00] transition-colors" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-[#888] mb-1.5">Business Name</label>
                      <input type="text" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} placeholder="Smith Insulation Ltd." className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#444] focus:outline-none focus:border-[#ADFF00] transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs text-[#888] mb-1.5">Email Address *</label>
                      <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@company.com" className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#444] focus:outline-none focus:border-[#ADFF00] transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs text-[#888] mb-1.5">Password *</label>
                      <div className="relative">
                        <input type={showPassword ? "text" : "password"} required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min. 8 characters" className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl px-3 py-2.5 pr-9 text-white text-sm placeholder-[#444] focus:outline-none focus:border-[#ADFF00] transition-colors" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] hover:text-[#888]">
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Location & Payment */}
                <div>
                  <h3 className="text-xs font-semibold text-[#555] uppercase tracking-wider mb-3">Location & Payment</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-[#888] mb-1.5">Country</label>
                      <select value={form.country} onChange={(e) => handleCountryChange(e.target.value)} className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#ADFF00] transition-colors">
                        {COUNTRY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-[#888] mb-1.5">Currency</label>
                      <input type="text" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#ADFF00] transition-colors" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-[#888] mb-1.5">Contract Length</label>
                      <div className="bg-[#0a0a0a] border border-[#222] rounded-xl px-3 py-2.5 text-[#555] text-sm">90 Days (fixed)</div>
                    </div>

                    {/* Payment type toggle */}
                    <div className="col-span-2">
                      <label className="block text-xs text-[#888] mb-1.5">Payment Structure</label>
                      <div className="flex gap-2">
                        {(["monthly", "paid_in_full"] as const).map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setForm({ ...form, paymentType: type })}
                            className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                              form.paymentType === type
                                ? "bg-[#ADFF00]/10 border-[#ADFF00] text-[#ADFF00]"
                                : "bg-[#0a0a0a] border-[#222] text-[#555] hover:border-[#333]"
                            }`}
                          >
                            {type === "monthly" ? "Monthly Payments" : "Paid in Full"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {form.paymentType === "paid_in_full" ? (
                      <div className="col-span-2">
                        <label className="block text-xs text-[#888] mb-1.5">Full Payment Amount</label>
                        <input type="number" step="0.01" value={form.fullPaymentAmount} onChange={(e) => setForm({ ...form, fullPaymentAmount: e.target.value })} placeholder="0.00" className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#444] focus:outline-none focus:border-[#ADFF00] transition-colors" />
                        <p className="text-xs text-[#555] mt-1">Paid in full — no monthly invoices. This amount will appear in the contract.</p>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="block text-xs text-[#888] mb-1.5">Deposit Amount</label>
                          <input type="number" step="0.01" value={form.depositAmount} onChange={(e) => setForm({ ...form, depositAmount: e.target.value })} placeholder="0.00" className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#444] focus:outline-none focus:border-[#ADFF00] transition-colors" />
                        </div>
                        <div>
                          <label className="block text-xs text-[#888] mb-1.5">Month 1 Remainder</label>
                          <input type="number" step="0.01" value={form.month1Remainder} onChange={(e) => setForm({ ...form, month1Remainder: e.target.value })} placeholder="0.00" className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#444] focus:outline-none focus:border-[#ADFF00] transition-colors" />
                        </div>
                        <div>
                          <label className="block text-xs text-[#888] mb-1.5">Month 2 Amount</label>
                          <input type="number" step="0.01" value={form.month2Amount} onChange={(e) => setForm({ ...form, month2Amount: e.target.value })} placeholder="0.00" className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#444] focus:outline-none focus:border-[#ADFF00] transition-colors" />
                        </div>
                        <div>
                          <label className="block text-xs text-[#888] mb-1.5">Month 3 Amount</label>
                          <input type="number" step="0.01" value={form.month3Amount} onChange={(e) => setForm({ ...form, month3Amount: e.target.value })} placeholder="0.00" className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#444] focus:outline-none focus:border-[#ADFF00] transition-colors" />
                        </div>
                        <div>
                          <label className="block text-xs text-[#888] mb-1.5">Payment Due Date <span className="text-[#444] normal-case">(day of month)</span></label>
                          <input type="number" min="1" max="31" value={form.paymentDueDate} onChange={(e) => setForm({ ...form, paymentDueDate: e.target.value })} placeholder="1–31" className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#444] focus:outline-none focus:border-[#ADFF00] transition-colors" />
                        </div>
                      </>
                    )}
                    <div>
                      <label className="block text-xs text-[#888] mb-1.5">Daily Ad Budget <span className="text-[#444] normal-case">(client pays Meta)</span></label>
                      <input type="number" step="0.01" value={form.dailyAdBudget} onChange={(e) => setForm({ ...form, dailyAdBudget: e.target.value })} placeholder="0.00" className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#444] focus:outline-none focus:border-[#ADFF00] transition-colors" />
                    </div>
                  </div>
                </div>

                {/* Section 3: Portal Setup */}
                <div>
                  <h3 className="text-xs font-semibold text-[#555] uppercase tracking-wider mb-3">Portal Setup</h3>
                  <div className="bg-[#ADFF00]/5 border border-[#ADFF00]/20 rounded-xl p-3 mb-3">
                    <p className="text-xs text-[#ADFF00]">📁 Google Drive folder, Lead Tracker sheet, and Contracts folder are created automatically when you add the client.</p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-[#888] mb-1.5">Contract / PandaDoc Notes</label>
                      <textarea value={form.pandadocNotes} onChange={(e) => setForm({ ...form, pandadocNotes: e.target.value })} placeholder="Any custom contract terms or notes..." rows={3} className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#444] focus:outline-none focus:border-[#ADFF00] transition-colors resize-none" />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-3">
                  <p className="text-xs text-[#555]">
                    This will automatically: create the Supabase auth user · create Google Drive folder structure (Assets, Contracts, Lead Tracker sheet) · send welcome email with login credentials
                  </p>
                </div>

                <button type="submit" disabled={submitting} className="w-full bg-[#ADFF00] hover:bg-[#8FCC00] disabled:opacity-40 text-black font-bold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Creating client...</> : "Create Client & Send Welcome Email"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Override Step Modal */}
      {/* Delete confirmation modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="w-full max-w-sm bg-[#0d0d0d] border border-red-900/40 rounded-2xl p-6">
            <h2 className="text-base font-bold text-white mb-3">Delete Client?</h2>
            <p className="text-sm text-[#888] mb-6">
              This will permanently delete the client record, all their step completions, activity log, and their login account. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDeleteClient(deleteConfirmId)}
                disabled={deleteLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
              >
                {deleteLoading ? "Deleting..." : "Yes, Delete"}
              </button>
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 bg-[#1a1a1a] hover:bg-[#222] border border-[#333] text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {overrideClient && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="w-full max-w-sm bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-white">Override Step</h2>
              <button onClick={() => setOverrideClient(null)} className="text-[#555] hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-sm text-[#888] mb-4">
              Manually mark a step as complete or incomplete for{" "}
              <strong className="text-white">{clientDisplayName(overrideClient)}</strong>.
            </p>
            <div className="mb-4">
              <label className="block text-xs text-[#888] mb-2">Step</label>
              <select
                value={overrideStep}
                onChange={(e) => setOverrideStep(Number(e.target.value))}
                className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#ADFF00]"
              >
                {STEP_LABELS.map((label, i) => (
                  <option key={i} value={i}>Step {i}: {label}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleOverrideStep("complete")} disabled={overrideLoading} className="flex-1 bg-[#ADFF00] hover:bg-[#8FCC00] disabled:opacity-40 text-black font-bold py-2.5 rounded-xl text-sm transition-colors">
                {overrideLoading ? "..." : "Mark Complete"}
              </button>
              <button onClick={() => handleOverrideStep("incomplete")} disabled={overrideLoading} className="flex-1 bg-[#1a1a1a] hover:bg-[#222] border border-[#333] text-white font-medium py-2.5 rounded-xl text-sm transition-colors">
                Mark Incomplete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Log Panel */}
      {activityClient && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-end">
          <div className="w-full max-w-md h-full bg-[#0d0d0d] border-l border-[#1a1a1a] flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#1a1a1a]">
              <div>
                <h2 className="text-base font-bold text-white">Activity Log</h2>
                <p className="text-xs text-[#555] mt-0.5">{clientDisplayName(activityClient)}</p>
              </div>
              <button onClick={() => setActivityClient(null)} className="text-[#555] hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {activityLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 text-[#555] animate-spin" />
                </div>
              ) : activityEvents.length === 0 ? (
                <p className="text-sm text-[#555] text-center py-8">No activity recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {activityEvents.map((event) => (
                    <div key={event.id} className="flex gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#ADFF00] mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-white font-medium">{event.event_type.replace(/_/g, " ")}</p>
                        <p className="text-xs text-[#555] mt-0.5">
                          {new Date(event.created_at).toLocaleString("en-IE", { dateStyle: "medium", timeStyle: "short" })}
                        </p>
                        {event.event_data && Object.keys(event.event_data).length > 0 && (
                          <pre className="text-xs text-[#444] mt-1 whitespace-pre-wrap break-all">
                            {JSON.stringify(event.event_data, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
