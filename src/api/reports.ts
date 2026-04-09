import { apiClient } from './client';

export interface ReportMeta {
  id: string;
  case_id: string;
  case_number?: string;
  report_type?: string;
  status: string;
  file_size_bytes?: number;
  generated_by?: string;
  generated_at?: string;
  // Joined fields
  applicant_name?: string;
  client_name?: string;
}

export async function fetchReports(params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}): Promise<{ reports: ReportMeta[]; total: number }> {
  const { data } = await apiClient.get('/reports', { params });
  // API returns { success, data: [...reports], pagination: { total } }
  const reports = Array.isArray(data.data) ? data.data : data.data?.reports ?? [];
  const total = data.pagination?.total ?? reports.length;
  return { reports, total };
}

export async function generateReport(caseId: string): Promise<{ id: string; url: string }> {
  const { data } = await apiClient.post(`/reports/${caseId}/generate`);
  return data.data;
}

export async function getReportDownloadUrl(caseId: string): Promise<string> {
  const { data } = await apiClient.get(`/reports/${caseId}/download`);
  return data.data.downloadUrl ?? data.data.url ?? data.data;
}
