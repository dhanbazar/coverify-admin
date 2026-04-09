import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  HiOutlineDownload,
  HiOutlineDocumentReport,
  HiOutlineRefresh,
  HiOutlineClipboardCopy,
  HiOutlineSearch,
} from "react-icons/hi";
import { fetchReports, generateReport, getReportDownloadUrl } from "../api/reports";
import type { ReportMeta } from "../api/reports";

const STATUS_STYLES: Record<string, string> = {
  generated: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  failed: "bg-red-100 text-red-700",
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function truncateHash(hash: string): string {
  if (!hash) return "-";
  return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
}

export function ReportsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [generateCaseId, setGenerateCaseId] = useState("");
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const limit = 20;

  const { data, isLoading } = useQuery({
    queryKey: ["reports", search, statusFilter, page],
    queryFn: () =>
      fetchReports({
        page,
        limit,
        status: statusFilter || undefined,
        search: search || undefined,
      }),
  });

  const reports = data?.reports ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  const generateMutation = useMutation({
    mutationFn: (caseId: string) => generateReport(caseId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["reports"] });
      setGenerateCaseId("");
    },
  });

  const handleDownload = async (report: ReportMeta) => {
    try {
      const url = await getReportDownloadUrl(report.case_id);
      window.open(url, "_blank");
    } catch {
      alert("Failed to get download URL");
    }
  };

  const handleCopyHash = (hash: string) => {
    void navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleGenerate = () => {
    const caseId = generateCaseId.trim();
    if (!caseId) return;
    generateMutation.mutate(caseId);
  };

  return (
    <div className="space-y-4">
      {/* Generate Report + Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <HiOutlineSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search by case ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Statuses</option>
          <option value="generated">Generated</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Generate Report Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Generate Report</h3>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Enter Case ID (e.g. CV-2026-00001)"
            value={generateCaseId}
            onChange={(e) => setGenerateCaseId(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleGenerate}
            disabled={generateMutation.isPending || !generateCaseId.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <HiOutlineDocumentReport size={16} />
            {generateMutation.isPending ? "Generating..." : "Generate PDF"}
          </button>
        </div>
        {generateMutation.isError && (
          <p className="text-sm text-red-600 mt-2">
            Failed to generate report. Please check the case ID and try again.
          </p>
        )}
        {generateMutation.isSuccess && (
          <p className="text-sm text-green-600 mt-2">
            Report generation initiated successfully.
          </p>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              <HiOutlineDocumentReport className="text-indigo-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{total}</p>
              <p className="text-sm text-gray-500">Total Reports</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <HiOutlineDocumentReport className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {reports.filter((r) => r.status === "generated").length}
              </p>
              <p className="text-sm text-gray-500">Generated</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <HiOutlineRefresh className="text-amber-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">
                {reports.filter((r) => r.status === "pending").length}
              </p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading reports...</div>
        ) : (
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Case ID
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Applicant
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Type
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Size
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Generated By
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Date
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  SHA-256
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reports.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-indigo-600">
                    {r.case_number ?? r.case_id}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {r.applicant_name ?? "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {r.report_type ?? "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[r.status] ?? "bg-gray-100 text-gray-700"}`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {r.file_size_bytes ? formatFileSize(r.file_size_bytes) : "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {r.generated_by ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {r.generated_at ? new Date(r.generated_at).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }) : "-"}
                  </td>
                  <td className="px-4 py-3">
                    {(r as any).sha256_hash ? (
                      <button
                        onClick={() => handleCopyHash((r as any).sha256_hash)}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-600 font-mono"
                        title="Click to copy full hash"
                      >
                        {truncateHash((r as any).sha256_hash)}
                        <HiOutlineClipboardCopy size={14} />
                        {copiedHash === (r as any).sha256_hash && (
                          <span className="text-green-600 ml-1">Copied!</span>
                        )}
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="p-1 text-gray-400 hover:text-green-600 disabled:opacity-30"
                      title="Download PDF"
                      disabled={r.status !== "generated"}
                      onClick={() => void handleDownload(r)}
                    >
                      <HiOutlineDownload size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!isLoading && reports.length === 0 && (
          <div className="p-8 text-center text-gray-400">
            No reports found matching your filters.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Showing {(page - 1) * limit + 1}-{Math.min(page * limit, total)} of {total} reports
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
