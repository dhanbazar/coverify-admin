import { useState, useEffect, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { HiOutlineX } from "react-icons/hi";
import { updateCase, fetchAgentsList } from "../api/cases";
import type { UpdateCasePayload } from "../api/cases";
import type { CaseListItem } from "@coanfiss/coverify-shared";

interface Props {
  visible: boolean;
  caseData: CaseListItem | null;
  onClose: () => void;
  onUpdated: () => void;
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

const STATUS_OPTIONS = [
  { value: "assigned", label: "Assigned" },
  { value: "in_progress", label: "In Progress" },
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under Review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export function EditCaseModal({ visible, caseData, onClose, onUpdated }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<UpdateCasePayload>({});

  const { data: agents } = useQuery({
    queryKey: ["agents-list"],
    queryFn: fetchAgentsList,
    enabled: visible,
  });

  // Populate form when caseData changes
  useEffect(() => {
    if (caseData) {
      setForm({
        client_name: caseData.clientName ?? "",
        applicant_name: caseData.applicantName ?? "",
        loan_type: caseData.loanType ?? "",
        verification_type: caseData.verificationType ?? "",
        location_city: caseData.locationCity ?? "",
        status: caseData.status ?? "",
        deadline: caseData.deadline ? caseData.deadline.slice(0, 16) : "",
      });
      setError("");
    }
  }, [caseData]);

  const update = (field: keyof UpdateCasePayload, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!caseData) return;
    setError("");
    setLoading(true);

    try {
      // Only send changed fields
      const payload: UpdateCasePayload = {};
      if (form.client_name !== caseData.clientName) payload.client_name = form.client_name;
      if (form.applicant_name !== caseData.applicantName) payload.applicant_name = form.applicant_name;
      if (form.loan_type !== caseData.loanType) payload.loan_type = form.loan_type;
      if (form.verification_type !== caseData.verificationType) payload.verification_type = form.verification_type;
      if (form.location_city !== caseData.locationCity) payload.location_city = form.location_city;
      if (form.status !== caseData.status) payload.status = form.status;
      if (form.deadline && form.deadline !== caseData.deadline?.slice(0, 16)) payload.deadline = new Date(form.deadline).toISOString();
      if (form.assigned_agent_id) payload.assigned_agent_id = form.assigned_agent_id;
      if (form.product) payload.product = form.product;
      if (form.client_branch) payload.client_branch = form.client_branch;

      if (Object.keys(payload).length === 0) {
        onClose();
        return;
      }

      await updateCase(caseData.id, payload);
      onUpdated();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error ?? err?.message ?? "Failed to update case");
    } finally {
      setLoading(false);
    }
  };

  if (!visible || !caseData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Edit Case</h2>
            <p className="text-sm text-gray-500">{caseData.caseId}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <HiOutlineX size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Client / Bank</label>
              <input
                type="text"
                value={form.client_name ?? ""}
                onChange={(e) => update("client_name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Applicant Name</label>
              <input
                type="text"
                value={form.applicant_name ?? ""}
                onChange={(e) => update("applicant_name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Loan Type</label>
              <select
                value={form.loan_type ?? ""}
                onChange={(e) => update("loan_type", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {LOAN_TYPES.map((lt) => (
                  <option key={lt.value} value={lt.value}>{lt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Verification Type</label>
              <select
                value={form.verification_type ?? ""}
                onChange={(e) => update("verification_type", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {VERIFICATION_TYPES.map((vt) => (
                  <option key={vt.value} value={vt.value}>{vt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">City</label>
              <input
                type="text"
                value={form.location_city ?? ""}
                onChange={(e) => update("location_city", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Status</label>
              <select
                value={form.status ?? ""}
                onChange={(e) => update("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Reassign Agent</label>
              <select
                value={form.assigned_agent_id ?? ""}
                onChange={(e) => update("assigned_agent_id", e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">No change</option>
                {(agents ?? []).map((a) => (
                  <option key={a.id} value={a.id}>{a.full_name} ({a.email})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Deadline</label>
              <input
                type="datetime-local"
                value={form.deadline ?? ""}
                onChange={(e) => update("deadline", e.target.value)}
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
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
