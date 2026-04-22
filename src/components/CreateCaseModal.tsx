import { useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { HiOutlineX } from "react-icons/hi";
import { createCase, fetchAgentsList } from "../api/cases";
import type { CreateCasePayload } from "../api/cases";

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const LOAN_TYPES = [
  { value: "home_loan", label: "Home Loan" },
  { value: "business_loan", label: "Business Loan" },
  { value: "personal_loan", label: "Personal Loan" },
];

const VERIFICATION_TYPES = [
  { value: "RV", label: "Residence Verification (RV)" },
  { value: "BV", label: "Business Verification (BV)" },
];

const REPORT_TYPES = [
  { value: "PD", label: "Personal Discussion (PD)" },
  { value: "FI", label: "Financial Institution (FI)" },
  { value: "CPV", label: "Contact Point Verification (CPV)" },
];

export function CreateCaseModal({ visible, onClose, onCreated }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<CreateCasePayload>({
    clientName: "",
    applicantName: "",
    loanType: "home_loan",
    loanReferenceNo: "",
    verificationType: "RV",
    reportType: "PD",
    locationCity: "",
    assignedAgentId: "",
    deadline: "",
    product: "",
    clientBranch: "",
  });

  const { data: agents } = useQuery({
    queryKey: ["agents-list"],
    queryFn: fetchAgentsList,
    enabled: visible,
  });

  const update = (field: keyof CreateCasePayload, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.clientName || !form.loanReferenceNo || !form.locationCity) {
      setError("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const result = await createCase({
        ...form,
        assignedAgentId: form.assignedAgentId || undefined,  // empty → auto-assign
        deadline: form.deadline || undefined,
        product: form.product || undefined,
        clientBranch: form.clientBranch || undefined,
      });

      // Surface the outcome so the admin knows whether auto-assign landed.
      // No toast library is wired into this app yet; use window.alert until one is.
      if (result.status === "unassigned") {
        window.alert(
          `Case ${result.caseId} created — no agent available in ${form.locationCity}. Moved to Unassigned queue.`,
        );
      } else if (result.assignedTo && !form.assignedAgentId) {
        window.alert(
          `Case ${result.caseId} auto-assigned to ${result.assignedTo.fullName}.`,
        );
      }

      onCreated();
      onClose();
      // Reset form
      setForm({
        clientName: "", applicantName: "", loanType: "home_loan", loanReferenceNo: "",
        verificationType: "RV", reportType: "PD", locationCity: "",
        assignedAgentId: "", deadline: "", product: "", clientBranch: "",
      });
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? err?.message ?? "Failed to create case");
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="text-lg font-bold text-gray-900">Add New Case</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <HiOutlineX size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Client Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Client / Bank *</label>
              <input
                type="text"
                value={form.clientName}
                onChange={(e) => update("clientName", e.target.value)}
                placeholder="e.g. HDFC Bank"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Applicant Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Applicant Name *</label>
              <input
                type="text"
                value={form.applicantName}
                onChange={(e) => update("applicantName", e.target.value)}
                placeholder="e.g. Suresh Patel"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Loan Type */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Loan Type *</label>
              <select
                value={form.loanType}
                onChange={(e) => update("loanType", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {LOAN_TYPES.map((lt) => (
                  <option key={lt.value} value={lt.value}>{lt.label}</option>
                ))}
              </select>
            </div>

            {/* Loan Reference No */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Loan Reference No *</label>
              <input
                type="text"
                value={form.loanReferenceNo}
                onChange={(e) => update("loanReferenceNo", e.target.value)}
                placeholder="e.g. HL-2026-98001"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Verification Type */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Verification Type *</label>
              <select
                value={form.verificationType}
                onChange={(e) => update("verificationType", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {VERIFICATION_TYPES.map((vt) => (
                  <option key={vt.value} value={vt.value}>{vt.label}</option>
                ))}
              </select>
            </div>

            {/* Report Type */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Report Type *</label>
              <select
                value={form.reportType}
                onChange={(e) => update("reportType", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {REPORT_TYPES.map((rt) => (
                  <option key={rt.value} value={rt.value}>{rt.label}</option>
                ))}
              </select>
            </div>

            {/* Location City */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">City *</label>
              <input
                type="text"
                value={form.locationCity}
                onChange={(e) => update("locationCity", e.target.value)}
                placeholder="e.g. Ahmedabad"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Assigned Agent */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Assign to Agent</label>
              <select
                value={form.assignedAgentId ?? ""}
                onChange={(e) => update("assignedAgentId", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">— Auto-assign (nearest available) —</option>
                {(agents ?? []).map((a) => (
                  <option key={a.id} value={a.id}>{a.full_name} ({a.email})</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Leave on "Auto-assign" to let the system pick the least-loaded agent in {form.locationCity || "the selected city"}.
              </p>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Deadline</label>
              <input
                type="datetime-local"
                value={form.deadline}
                onChange={(e) => update("deadline", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-400 mt-1">Defaults to 7 days if empty</p>
            </div>

            {/* Product */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Product</label>
              <input
                type="text"
                value={form.product}
                onChange={(e) => update("product", e.target.value)}
                placeholder="e.g. Home Loan, MSME Loan"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Client Branch */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Client Branch</label>
              <input
                type="text"
                value={form.clientBranch}
                onChange={(e) => update("clientBranch", e.target.value)}
                placeholder="e.g. SG Highway Branch"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Case"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
