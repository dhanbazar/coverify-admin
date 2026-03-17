import { useState, useRef, useCallback } from "react";
import type { DragEvent, ChangeEvent } from "react";
import {
  HiOutlineUpload,
  HiOutlineX,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
} from "react-icons/hi";

interface CsvImporterProps {
  visible: boolean;
  onClose: () => void;
  onImportComplete: (results: ImportResults) => void;
}

interface ImportResults {
  imported: number;
  skipped: number;
  failed: number;
  errors: string[];
}

interface CsvRow {
  [key: string]: string;
}

interface ColumnMapping {
  case_id: string;
  agent_email: string;
  priority: string;
}

interface ValidationError {
  row: number;
  column: string;
  message: string;
}

const REQUIRED_FIELDS: (keyof ColumnMapping)[] = ["case_id", "agent_email", "priority"];
const VALID_PRIORITIES = ["low", "medium", "high", "critical"];

function parseCsv(text: string): { headers: string[]; rows: CsvRow[] } {
  const lines = text.trim().split("\n");
  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: CsvRow = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? "";
    });
    rows.push(row);
  }

  return { headers, rows };
}

function autoDetectMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = { case_id: "", agent_email: "", priority: "" };
  const lower = headers.map((h) => h.toLowerCase());

  for (const h of headers) {
    const l = h.toLowerCase();
    if (l.includes("case") && l.includes("id")) mapping.case_id = h;
    else if (l === "caseid" || l === "case_id") mapping.case_id = h;
    else if (l.includes("email") || l.includes("agent")) mapping.agent_email = h;
    else if (l.includes("priority")) mapping.priority = h;
  }

  // Fallback: assign by position if not detected
  if (!mapping.case_id && lower.length > 0) mapping.case_id = headers[0];
  if (!mapping.agent_email && lower.length > 1) mapping.agent_email = headers[1];
  if (!mapping.priority && lower.length > 2) mapping.priority = headers[2];

  return mapping;
}

function validateRows(
  rows: CsvRow[],
  mapping: ColumnMapping,
): ValidationError[] {
  const errors: ValidationError[] = [];

  rows.forEach((row, idx) => {
    const caseId = row[mapping.case_id]?.trim();
    const email = row[mapping.agent_email]?.trim();
    const priority = row[mapping.priority]?.trim().toLowerCase();

    if (!caseId) {
      errors.push({ row: idx + 2, column: "case_id", message: "Case ID is required" });
    }

    if (!email) {
      errors.push({ row: idx + 2, column: "agent_email", message: "Agent email is required" });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push({ row: idx + 2, column: "agent_email", message: "Invalid email format" });
    }

    if (priority && !VALID_PRIORITIES.includes(priority)) {
      errors.push({
        row: idx + 2,
        column: "priority",
        message: `Invalid priority: "${priority}". Must be one of: ${VALID_PRIORITIES.join(", ")}`,
      });
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
  const [mapping, setMapping] = useState<ColumnMapping>({
    case_id: "",
    agent_email: "",
    priority: "",
  });
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [results, setResults] = useState<ImportResults | null>(null);

  const resetState = () => {
    setFileName(null);
    setHeaders([]);
    setRows([]);
    setMapping({ case_id: "", agent_email: "", priority: "" });
    setValidationErrors([]);
    setIsImporting(false);
    setImportProgress(0);
    setResults(null);
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

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCsv(text);
      setHeaders(parsed.headers);
      setRows(parsed.rows);

      const detectedMapping = autoDetectMapping(parsed.headers);
      setMapping(detectedMapping);

      const errors = validateRows(parsed.rows, detectedMapping);
      setValidationErrors(errors);
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleMappingChange = (field: keyof ColumnMapping, value: string) => {
    const newMapping = { ...mapping, [field]: value };
    setMapping(newMapping);
    setValidationErrors(validateRows(rows, newMapping));
  };

  const handleImport = async () => {
    if (validationErrors.length > 0) return;

    setIsImporting(true);
    setImportProgress(0);

    let imported = 0;
    let skipped = 0;
    let failed = 0;
    const errors: string[] = [];

    // Simulate batch import — in production this would call an API
    const batchSize = 10;
    const totalRows = rows.length;

    for (let i = 0; i < totalRows; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      for (const row of batch) {
        const caseId = row[mapping.case_id]?.trim();
        const email = row[mapping.agent_email]?.trim();

        if (!caseId || !email) {
          skipped++;
          continue;
        }

        // Simulate random success/failure for demo
        if (Math.random() > 0.05) {
          imported++;
        } else {
          failed++;
          errors.push(`Row with case ${caseId}: Assignment failed`);
        }
      }

      setImportProgress(Math.min(100, Math.round(((i + batch.length) / totalRows) * 100)));
    }

    const importResults: ImportResults = { imported, skipped, failed, errors };
    setResults(importResults);
    setIsImporting(false);
    onImportComplete(importResults);
  };

  const previewRows = rows.slice(0, 5);
  const errorRowNumbers = new Set(validationErrors.map((e) => e.row));

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Bulk CSV Import</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <HiOutlineX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Results Summary */}
          {results && (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-2">
              <h3 className="text-sm font-semibold text-gray-700">Import Results</h3>
              <div className="flex gap-4 text-sm">
                <span className="text-green-600 font-medium">
                  <HiOutlineCheckCircle className="inline mr-1" size={16} />
                  {results.imported} imported
                </span>
                <span className="text-amber-600 font-medium">{results.skipped} skipped</span>
                <span className="text-red-600 font-medium">{results.failed} failed</span>
              </div>
              {results.errors.length > 0 && (
                <div className="mt-2 text-xs text-red-600 space-y-1">
                  {results.errors.slice(0, 5).map((err, i) => (
                    <div key={i}>{err}</div>
                  ))}
                  {results.errors.length > 5 && (
                    <div>...and {results.errors.length - 5} more errors</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Drop Zone */}
          {!fileName && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                isDragging
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <HiOutlineUpload className="mx-auto text-gray-400 mb-3" size={36} />
              <p className="text-sm text-gray-600">
                Drop your CSV file here, or{" "}
                <span className="text-indigo-600 font-medium">browse</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Expected columns: case_id, agent_email, priority
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {/* File Info */}
          {fileName && (
            <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
              <div className="text-sm">
                <span className="font-medium text-gray-700">{fileName}</span>
                <span className="text-gray-400 ml-2">({rows.length} rows)</span>
              </div>
              <button
                onClick={resetState}
                className="text-sm text-gray-500 hover:text-red-500"
              >
                Remove
              </button>
            </div>
          )}

          {/* Column Mapping */}
          {headers.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Column Mapping</h3>
              <div className="grid grid-cols-3 gap-4">
                {REQUIRED_FIELDS.map((field) => (
                  <div key={field}>
                    <label className="block text-xs text-gray-500 mb-1">
                      {field.replace("_", " ")}
                    </label>
                    <select
                      value={mapping[field]}
                      onChange={(e) => handleMappingChange(field, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">-- Select --</option>
                      {headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
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
                  <div key={i}>
                    Row {err.row}, {err.column}: {err.message}
                  </div>
                ))}
                {validationErrors.length > 10 && (
                  <div>...and {validationErrors.length - 10} more errors</div>
                )}
              </div>
            </div>
          )}

          {/* CSV Preview */}
          {previewRows.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Preview (first {previewRows.length} rows)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">
                        Row
                      </th>
                      {headers.map((h) => (
                        <th
                          key={h}
                          className="px-3 py-2 text-left text-xs font-semibold text-gray-500"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {previewRows.map((row, idx) => {
                      const rowNum = idx + 2;
                      const hasError = errorRowNumbers.has(rowNum);
                      return (
                        <tr
                          key={idx}
                          className={hasError ? "bg-red-50" : ""}
                        >
                          <td className="px-3 py-2 text-gray-400">{rowNum}</td>
                          {headers.map((h) => {
                            const cellErrors = validationErrors.filter(
                              (e) => e.row === rowNum && h === mapping[e.column as keyof ColumnMapping],
                            );
                            return (
                              <td
                                key={h}
                                className={`px-3 py-2 ${cellErrors.length > 0 ? "text-red-600 font-medium" : "text-gray-700"}`}
                                title={cellErrors.map((e) => e.message).join(", ")}
                              >
                                {row[h] || "-"}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {rows.length > 5 && (
                <p className="text-xs text-gray-400 mt-2">
                  ...and {rows.length - 5} more rows
                </p>
              )}
            </div>
          )}

          {/* Import Progress */}
          {isImporting && (
            <div>
              <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                <span>Importing...</span>
                <span>{importProgress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${importProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            {results ? "Close" : "Cancel"}
          </button>
          {!results && rows.length > 0 && (
            <button
              onClick={() => void handleImport()}
              disabled={isImporting || validationErrors.length > 0 || rows.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <HiOutlineUpload size={16} />
              {isImporting ? "Importing..." : `Import ${rows.length} rows`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
