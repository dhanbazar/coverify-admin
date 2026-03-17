import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { HiOutlineDownload, HiOutlineEye, HiOutlineUpload, HiOutlineDocumentReport } from "react-icons/hi";
import { fetchAllCases, downloadReport } from "../api/cases";
import { generateReport } from "../api/reports";
import { formatTimeRemaining, calculateTatStatus } from "@coanfiss/coverify-shared";
import { CsvImporter } from "../components/CsvImporter";

const STATUS_STYLES: Record<string, string> = {
  assigned: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  submitted: "bg-green-100 text-green-700",
  under_review: "bg-purple-100 text-purple-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

const TAT_STYLES = {
  on_time: "text-green-600",
  at_risk: "text-amber-600",
  breached: "text-red-600 font-bold",
};

export function CasesPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showImporter, setShowImporter] = useState(false);

  const generateMutation = useMutation({
    mutationFn: (caseId: string) => generateReport(caseId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });

  const { data } = useQuery({
    queryKey: ["admin-cases", statusFilter, search, page],
    queryFn: () => fetchAllCases({ status: statusFilter || undefined, search: search || undefined, page, pageSize: 20 }),
  });

  // Mock data for display
  const mockCases = data?.items ?? [
    { id: "1", caseId: "CV-2026-00042", clientName: "HDFC Bank", loanType: "BL", verificationType: "Business", status: "in_progress", tatStatus: "on_time", syncStatus: "synced", deadline: new Date(Date.now() + 4 * 3600000).toISOString(), applicantName: "Rajesh Patel", locationCity: "Ahmedabad", assignedAt: "2026-03-17T10:00:00Z" },
    { id: "2", caseId: "CV-2026-00043", clientName: "Bajaj Finance", loanType: "SME", verificationType: "FI", status: "assigned", tatStatus: "at_risk", syncStatus: "synced", deadline: new Date(Date.now() + 1 * 3600000).toISOString(), applicantName: "Suresh Kumar", locationCity: "Surat", assignedAt: "2026-03-17T09:00:00Z" },
    { id: "3", caseId: "CV-2026-00044", clientName: "ICICI Bank", loanType: "CPV", verificationType: "Residence", status: "submitted", tatStatus: "on_time", syncStatus: "synced", deadline: new Date(Date.now() - 1 * 3600000).toISOString(), applicantName: "Priya Sharma", locationCity: "Mumbai", assignedAt: "2026-03-16T14:00:00Z" },
  ];

  const handleDownload = async (caseId: string) => {
    try {
      const blob = await downloadReport(caseId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report_${caseId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Report not available yet");
    }
  };

  const handleGenerateReport = (caseId: string) => {
    generateMutation.mutate(caseId);
  };

  return (
    <div className="space-y-4">
      <CsvImporter
        visible={showImporter}
        onClose={() => setShowImporter(false)}
        onImportComplete={() => {
          void queryClient.invalidateQueries({ queryKey: ["admin-cases"] });
        }}
      />

      {/* Filters */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search by case ID, applicant, or client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Statuses</option>
          <option value="assigned">Assigned</option>
          <option value="in_progress">In Progress</option>
          <option value="submitted">Submitted</option>
          <option value="under_review">Under Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <button
          onClick={() => setShowImporter(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          <HiOutlineUpload size={16} />
          Bulk Import
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Case ID</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Applicant</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Client</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">City</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">TAT</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mockCases.map((c) => {
              const tatStatus = calculateTatStatus(c.deadline);
              return (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-indigo-600">{c.caseId}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{c.applicantName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{c.clientName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{c.verificationType}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{c.locationCity}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[c.status] ?? "bg-gray-100 text-gray-700"}`}>
                      {c.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-sm ${TAT_STYLES[tatStatus]}`}>
                    {formatTimeRemaining(c.deadline)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="p-1 text-gray-400 hover:text-indigo-600" title="View">
                        <HiOutlineEye size={18} />
                      </button>
                      <button
                        className="p-1 text-gray-400 hover:text-green-600"
                        title="Download Report"
                        onClick={() => handleDownload(c.id)}
                      >
                        <HiOutlineDownload size={18} />
                      </button>
                      <button
                        className="p-1 text-gray-400 hover:text-purple-600"
                        title="Generate Report"
                        onClick={() => handleGenerateReport(c.id)}
                        disabled={generateMutation.isPending}
                      >
                        <HiOutlineDocumentReport size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Showing {mockCases.length} cases</span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 rounded border border-gray-200 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
