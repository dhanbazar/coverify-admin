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
