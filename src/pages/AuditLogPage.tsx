import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  HiOutlineDownload,
  HiOutlineChevronDown,
  HiOutlineChevronRight,
  HiOutlineSearch,
} from "react-icons/hi";
import { fetchAuditLogs } from "../api/audit";
import type { AuditLogEntry } from "../api/audit";

const ACTION_STYLES: Record<string, string> = {
  LOGIN: "bg-blue-100 text-blue-700",
  LOGOUT: "bg-gray-100 text-gray-700",
  UPLOAD_PHOTO: "bg-purple-100 text-purple-700",
  SUBMIT_CASE: "bg-green-100 text-green-700",
  APPROVE_CASE: "bg-emerald-100 text-emerald-700",
  REJECT_CASE: "bg-red-100 text-red-700",
  ASSIGN_CASE: "bg-indigo-100 text-indigo-700",
  GENERATE_REPORT: "bg-amber-100 text-amber-700",
  UPDATE_SETTINGS: "bg-cyan-100 text-cyan-700",
  CREATE_AGENT: "bg-teal-100 text-teal-700",
  DELETE_AGENT: "bg-rose-100 text-rose-700",
};

function getActionStyle(action: string): string {
  return ACTION_STYLES[action] ?? "bg-gray-100 text-gray-700";
}

const METHOD_STYLES: Record<string, string> = {
  GET: "text-blue-600",
  POST: "text-green-600",
  PUT: "text-amber-600",
  PATCH: "text-amber-600",
  DELETE: "text-red-600",
};

function exportToCsv(logs: AuditLogEntry[]) {
  const headers = ["Timestamp", "User", "Email", "Action", "Resource", "Method", "IP Address"];
  const rows = logs.map((l) => [
    l.created_at,
    l.user_name ?? l.user_id,
    l.user_email ?? "",
    l.action,
    l.resource,
    l.method,
    l.ip_address,
  ]);

  const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function AuditLogPage() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const limit = 25;

  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs", page, actionFilter, userFilter, startDate, endDate],
    queryFn: () =>
      fetchAuditLogs({
        page,
        limit,
        action: actionFilter || undefined,
        userId: userFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
  });

  const logs = data?.logs ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <HiOutlineSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Filter by user ID..."
            value={userFilter}
            onChange={(e) => {
              setUserFilter(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Actions</option>
          <option value="LOGIN">Login</option>
          <option value="LOGOUT">Logout</option>
          <option value="UPLOAD_PHOTO">Upload Photo</option>
          <option value="SUBMIT_CASE">Submit Case</option>
          <option value="APPROVE_CASE">Approve Case</option>
          <option value="REJECT_CASE">Reject Case</option>
          <option value="ASSIGN_CASE">Assign Case</option>
          <option value="GENERATE_REPORT">Generate Report</option>
          <option value="UPDATE_SETTINGS">Update Settings</option>
          <option value="CREATE_AGENT">Create Agent</option>
          <option value="DELETE_AGENT">Delete Agent</option>
        </select>

        <input
          type="date"
          value={startDate}
          onChange={(e) => {
            setStartDate(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Start date"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => {
            setEndDate(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="End date"
        />

        <button
          onClick={() => exportToCsv(logs)}
          disabled={logs.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 disabled:opacity-50"
        >
          <HiOutlineDownload size={16} />
          Export CSV
        </button>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading audit logs...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-8 px-2 py-3" />
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Timestamp
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  User
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Action
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Resource
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Method
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                  IP
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log) => (
                <LogRow
                  key={log.id}
                  log={log}
                  isExpanded={expandedRow === log.id}
                  onToggle={() => toggleRow(log.id)}
                />
              ))}
            </tbody>
          </table>
        )}

        {!isLoading && logs.length === 0 && (
          <div className="p-8 text-center text-gray-400">
            No audit logs found matching your filters.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Showing {(page - 1) * limit + 1}-{Math.min(page * limit, total)} of {total} entries
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

function LogRow({
  log,
  isExpanded,
  onToggle,
}: {
  log: AuditLogEntry;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const hasMetadata = log.metadata && Object.keys(log.metadata).length > 0;

  return (
    <>
      <tr className="hover:bg-gray-50 transition-colors">
        <td className="px-2 py-3">
          {hasMetadata && (
            <button onClick={onToggle} className="text-gray-400 hover:text-gray-600">
              {isExpanded ? (
                <HiOutlineChevronDown size={14} />
              ) : (
                <HiOutlineChevronRight size={14} />
              )}
            </button>
          )}
        </td>
        <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
          {new Date(log.created_at).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </td>
        <td className="px-4 py-3 text-sm">
          <div className="text-gray-900">{log.user_name ?? log.user_id}</div>
          {log.user_email && (
            <div className="text-xs text-gray-400">{log.user_email}</div>
          )}
        </td>
        <td className="px-4 py-3">
          <span
            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getActionStyle(log.action)}`}
          >
            {log.action}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-gray-600 font-mono text-xs max-w-[200px] truncate">
          {log.resource}
        </td>
        <td className="px-4 py-3">
          <span
            className={`text-xs font-semibold ${METHOD_STYLES[log.method] ?? "text-gray-600"}`}
          >
            {log.method}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-gray-500 font-mono text-xs">
          {log.ip_address}
        </td>
      </tr>
      {isExpanded && hasMetadata && (
        <tr>
          <td colSpan={7} className="px-8 py-4 bg-gray-50">
            <div className="text-xs font-semibold text-gray-500 mb-2">Metadata</div>
            <pre className="text-xs text-gray-700 bg-white rounded-lg border border-gray-200 p-3 overflow-auto max-h-60">
              {JSON.stringify(log.metadata, null, 2)}
            </pre>
            {log.user_agent && (
              <div className="mt-2 text-xs text-gray-400">
                <span className="font-semibold text-gray-500">User Agent: </span>
                {log.user_agent}
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}
