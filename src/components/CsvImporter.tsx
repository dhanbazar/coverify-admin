import { useState, useRef, useCallback } from "react";
import type { DragEvent, ChangeEvent } from "react";
import {
  HiOutlineUpload,
  HiOutlineX,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
} from "react-icons/hi";
import { bulkImportCases } from "../api/cases";
import type { BulkImportRow, BulkImportResult } from "../api/cases";

interface CsvImporterProps {
  visible: boolean;
  onClose: () => void;
  onImportComplete: (results: BulkImportResult) => void;
}

interface CsvRow {
  [key: string]: string;
}

const EXPECTED_COLUMNS = [
  "client_name", "applicant_name", "loan_type", "loan_reference_no",
  "verification_type", "report_type", "location_city",
  "deadline", "product", "client_branch",
];

const REQUIRED_COLUMNS = [
  "client_name", "loan_type", "loan_reference_no",
  "verification_type", "report_type", "location_city",
];

function parseCsv(text: string): { headers: string[]; rows: CsvRow[] } {
  const lines = text.trim().split("\n");
  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: CsvRow = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? "";
    });
    rows.push(row);
  }

  return { headers, rows };
}

function validateRows(rows: CsvRow[]): string[] {
  const errors: string[] = [];
  rows.forEach((row, idx) => {
    const rowNum = idx + 2;
    for (const col of REQUIRED_COLUMNS) {
      if (!row[col]?.trim()) {
        errors.push(`Row ${rowNum}: "${col}" is required`);
      }
    }
  });
  return errors;
}

export function CsvImporter({ visible, onClose, onImportComplete }: CsvImporterProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [results, setResults] = useState<BulkImportResult | null>(null);
  const [apiError, setApiError] = useState("");

  const resetState = () => {
    setFileName(null);
    setHeaders([]);
    setRows([]);
    setValidationErrors([]);
    setIsImporting(false);
    setResults(null);
    setApiError("");
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const processFile = useCallback((file: File) => {
    if (!file.name.endsWith(".csv")) {
      alert("Please upload a CSV file");
      return;
    }

    setFileName(file.name);
    setResults(null);
    setApiError("");

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCsv(text);
      setHeaders(parsed.headers);
      setRows(parsed.rows);

      // Check for missing expected columns
      const missing = REQUIRED_COLUMNS.filter((c) => !parsed.headers.includes(c));
      if (missing.length > 0) {
        setValidationErrors([`Missing required columns: ${missing.join(", ")}`]);
      } else {
        setValidationErrors(validateRows(parsed.rows));
      }
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleImport = async () => {
    if (validationErrors.length > 0) return;

    setIsImporting(true);
    setApiError("");

    try {
      const payload: BulkImportRow[] = rows.map((row) => ({
        client_name: row.client_name?.trim() ?? "",
        applicant_name: row.applicant_name?.trim(),
        loan_type: row.loan_type?.trim() ?? "",
        loan_reference_no: row.loan_reference_no?.trim() ?? "",
        verification_type: row.verification_type?.trim() ?? "",
        report_type: row.report_type?.trim() ?? "",
        location_city: row.location_city?.trim() ?? "",
        deadline: row.deadline?.trim() || undefined,
        product: row.product?.trim() || undefined,
        client_branch: row.client_branch?.trim() || undefined,
      }));

      const result = await bulkImportCases(payload);
      setResults(result);
      onImportComplete(result);
    } catch (err: any) {
      setApiError(err?.response?.data?.error ?? err?.message ?? "Import failed");
    } finally {
      setIsImporting(false);
    }
  };

  const previewRows = rows.slice(0, 5);
  const displayHeaders = headers.filter((h) => EXPECTED_COLUMNS.includes(h));

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Bulk CSV Import</h2>
          <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <HiOutlineX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Results */}
          {results && (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-2">
              <h3 className="text-sm font-semibold text-gray-700">Import Results</h3>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="text-green-600 font-medium">
                  <HiOutlineCheckCircle className="inline mr-1" size={16} />
                  {results.imported} imported
                </span>
                <span className="text-indigo-600 font-medium">
                  {results.autoAssigned} auto-assigned
                </span>
                {results.unassigned > 0 && (
                  <span className="text-amber-600 font-medium">
                    {results.unassigned} unassigned (no agent in city)
                  </span>
                )}
                <span className="text-red-600 font-medium">{results.failed} failed</span>
              </div>
              {results.errors.length > 0 && (
                <div className="mt-2 text-xs text-red-600 space-y-1 max-h-32 overflow-y-auto">
                  {results.errors.map((err, i) => (
                    <div key={i}>Row {err.row}: {err.message}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {apiError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{apiError}</div>
          )}

          {/* Drop Zone */}
          {!fileName && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                isDragging ? "border-indigo-500 bg-indigo-50" : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <HiOutlineUpload className="mx-auto text-gray-400 mb-3" size={36} />
              <p className="text-sm text-gray-600">
                Drop your CSV file here, or <span className="text-indigo-600 font-medium">browse</span>
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Required columns: {REQUIRED_COLUMNS.join(", ")}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Optional: applicant_name, deadline, product, client_branch
              </p>
              <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileSelect} className="hidden" />
            </div>
          )}

          {/* File info */}
          {fileName && (
            <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
              <div className="text-sm">
                <span className="font-medium text-gray-700">{fileName}</span>
                <span className="text-gray-400 ml-2">({rows.length} rows)</span>
              </div>
              <button onClick={resetState} className="text-sm text-gray-500 hover:text-red-500">Remove</button>
            </div>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 rounded-lg border border-red-200 p-4">
              <div className="flex items-center gap-2 text-sm text-red-700 font-medium mb-2">
                <HiOutlineExclamationCircle size={16} />
                {validationErrors.length} validation error{validationErrors.length > 1 ? "s" : ""}
              </div>
              <div className="text-xs text-red-600 space-y-1 max-h-32 overflow-y-auto">
                {validationErrors.slice(0, 10).map((err, i) => (
                  <div key={i}>{err}</div>
                ))}
                {validationErrors.length > 10 && <div>...and {validationErrors.length - 10} more</div>}
              </div>
            </div>
          )}

          {/* Preview Table */}
          {previewRows.length > 0 && validationErrors.length === 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Preview (first {previewRows.length} rows)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">#</th>
                      {displayHeaders.map((h) => (
                        <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">
                          {h.replace(/_/g, " ")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {previewRows.map((row, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2 text-gray-400">{idx + 2}</td>
                        {displayHeaders.map((h) => (
                          <td key={h} className="px-3 py-2 text-gray-700 whitespace-nowrap">{row[h] || "—"}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {rows.length > 5 && <p className="text-xs text-gray-400 mt-2">...and {rows.length - 5} more rows</p>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button onClick={handleClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
            {results ? "Close" : "Cancel"}
          </button>
          {!results && rows.length > 0 && (
            <button
              onClick={() => void handleImport()}
              disabled={isImporting || validationErrors.length > 0}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              <HiOutlineUpload size={16} />
              {isImporting ? "Importing..." : `Import ${rows.length} cases`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
