import { useState } from "react";
import {
  HiOutlineDownload,
  HiOutlineDocumentReport,
  HiOutlineEye,
} from "react-icons/hi";

interface ReportItem {
  id: string;
  caseId: string;
  clientName: string;
  applicantName: string;
  reportType: string;
  status: string;
  generatedAt: string;
  pageCount: number;
}

const STATUS_STYLES: Record<string, string> = {
  Positive: "bg-green-100 text-green-700",
  Negative: "bg-red-100 text-red-700",
  "Refer to Credit": "bg-amber-100 text-amber-700",
};

export function ReportsPage() {
  const [typeFilter, setTypeFilter] = useState("");
  const [search, setSearch] = useState("");

  // Mock data — wired to API when report generation is complete
  const mockReports: ReportItem[] = [
    {
      id: "1",
      caseId: "CV-2026-00001",
      clientName: "HDFC Bank",
      applicantName: "Rajesh Patel",
      reportType: "PD",
      status: "Positive",
      generatedAt: "2026-03-16T14:30:00Z",
      pageCount: 8,
    },
    {
      id: "2",
      caseId: "CV-2026-00003",
      clientName: "ICICI Bank",
      applicantName: "Priya Sharma",
      reportType: "FI_CPV",
      status: "Negative",
      generatedAt: "2026-03-15T11:20:00Z",
      pageCount: 6,
    },
    {
      id: "3",
      caseId: "CV-2026-00005",
      clientName: "Bajaj Finance",
      applicantName: "Amit Desai",
      reportType: "PD",
      status: "Refer to Credit",
      generatedAt: "2026-03-14T09:45:00Z",
      pageCount: 10,
    },
    {
      id: "4",
      caseId: "CV-2026-00008",
      clientName: "Axis Bank",
      applicantName: "Sneha Mehta",
      reportType: "FI_CPV",
      status: "Positive",
      generatedAt: "2026-03-13T16:10:00Z",
      pageCount: 5,
    },
  ];

  const filtered = mockReports.filter((r) => {
    if (typeFilter && r.reportType !== typeFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        r.caseId.toLowerCase().includes(s) ||
        r.applicantName.toLowerCase().includes(s) ||
        r.clientName.toLowerCase().includes(s)
      );
    }
    return true;
  });

  const handleDownload = (_reportId: string, caseId: string) => {
    alert(`PDF download for ${caseId} not yet available — report generation is in Phase 4`);
  };

  return (
    <div className="space-y-4">
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
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Types</option>
          <option value="PD">PD Report</option>
          <option value="FI_CPV">FI/CPV Report</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              <HiOutlineDocumentReport className="text-indigo-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{mockReports.length}</p>
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
                {mockReports.filter((r) => r.status === "Positive").length}
              </p>
              <p className="text-sm text-gray-500">Positive</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <HiOutlineDocumentReport className="text-red-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {mockReports.filter((r) => r.status === "Negative").length}
              </p>
              <p className="text-sm text-gray-500">Negative</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Case ID</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Applicant</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Client</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Generated</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Pages</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-indigo-600">{r.caseId}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{r.applicantName}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{r.clientName}</td>
                <td className="px-4 py-3">
                  <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    {r.reportType === "PD" ? "PD Report" : "FI/CPV"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[r.status] ?? "bg-gray-100 text-gray-700"}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(r.generatedAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{r.pageCount}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button className="p-1 text-gray-400 hover:text-indigo-600" title="View">
                      <HiOutlineEye size={18} />
                    </button>
                    <button
                      className="p-1 text-gray-400 hover:text-green-600"
                      title="Download PDF"
                      onClick={() => handleDownload(r.id, r.caseId)}
                    >
                      <HiOutlineDownload size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-8 text-center text-gray-400">
            No reports found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
}
