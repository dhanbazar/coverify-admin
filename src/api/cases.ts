import { apiClient } from "./client";
import type { Case, CaseListItem, PaginatedResponse, ApiResponse } from "@coanfiss/coverify-shared";

export interface CaseFilters {
  status?: string;
  agentId?: string;
  city?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function fetchAllCases(filters: CaseFilters = {}): Promise<PaginatedResponse<CaseListItem>> {
  const { data } = await apiClient.get<ApiResponse<PaginatedResponse<CaseListItem>>>("/admin/cases", {
    params: filters,
  });
  return data.data;
}

export async function fetchCaseDetail(id: string): Promise<Case> {
  const { data } = await apiClient.get<ApiResponse<Case>>(`/cases/${id}`);
  return data.data;
}

export async function assignCase(caseId: string, agentId: string, deadline: string): Promise<void> {
  await apiClient.post("/cases", { caseId, assignedAgentId: agentId, deadline });
}

export async function bulkAssignCases(
  caseIds: string[],
  agentId: string,
  deadline: string,
): Promise<void> {
  await apiClient.post("/admin/cases/bulk-assign", { caseIds, agentId, deadline });
}

export async function downloadReport(caseId: string): Promise<Blob> {
  const { data } = await apiClient.get(`/admin/cases/${caseId}/report`, {
    responseType: "blob",
  });
  return data;
}

export interface CreateCasePayload {
  clientName: string;
  applicantName: string;
  loanType: string;
  loanReferenceNo: string;
  verificationType: string;
  reportType: string;
  locationCity: string;
  assignedAgentId?: string;   // omit to auto-assign on the server
  deadline?: string;
  product?: string;
  clientBranch?: string;
}

export interface CreateCaseResponse {
  id: string;
  caseId: string;
  assignedAgentId: string | null;
  assignedTo: { id: string; fullName: string } | null;
  status: "assigned" | "unassigned";
  assignmentReason: string | null;
}

export async function createCase(
  payload: CreateCasePayload,
): Promise<CreateCaseResponse> {
  const { data } = await apiClient.post("/cases", payload);
  return data.data as CreateCaseResponse;
}

export interface UpdateCasePayload {
  client_name?: string;
  applicant_name?: string;
  loan_type?: string;
  loan_reference_no?: string;
  verification_type?: string;
  report_type?: string;
  location_city?: string;
  product?: string;
  client_branch?: string;
  assigned_agent_id?: string;
  deadline?: string;
  status?: string;
}

export async function updateCase(id: string, payload: UpdateCasePayload): Promise<void> {
  await apiClient.put(`/admin/cases/${id}`, payload);
}

export interface BulkImportRow {
  client_name: string;
  applicant_name?: string;
  loan_type: string;
  loan_reference_no: string;
  verification_type: string;
  report_type: string;
  location_city: string;
  // agent_email is no longer required or used — server auto-assigns every row.
  // Kept optional so pre-existing CSVs with this column still parse.
  agent_email?: string;
  deadline?: string;
  product?: string;
  client_branch?: string;
}

export interface BulkImportResult {
  imported: number;
  failed: number;
  autoAssigned: number;
  unassigned: number;
  errors: Array<{ row: number; message: string }>;
}

export async function bulkImportCases(cases: BulkImportRow[]): Promise<BulkImportResult> {
  const { data } = await apiClient.post("/admin/cases/bulk-import", { cases });
  return data.data;
}

export interface AgentOption {
  id: string;
  email: string;
  full_name: string;
}

export async function fetchAgentsList(): Promise<AgentOption[]> {
  const { data } = await apiClient.get("/admin/agents");
  const agents = data.data ?? data;
  return Array.isArray(agents) ? agents : [];
}
