import { apiClient } from './client';

export interface ReportMeta {
  id: string;
  case_id: string;
  type: string;
  status: string;
  remote_url: string;
  sha256_hash: string;
  file_size_bytes: number;
  generated_by: string;
  created_at: string;
  // Joined fields
  case_display_id?: string;
  applicant_name?: string;
  generator_name?: string;
}

export async function fetchReports(params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}): Promise<{ reports: ReportMeta[]; total: number }> {
  const { data } = await apiClient.get('/reports', { params });
  return data.data;
}

export async function generateReport(caseId: string): Promise<{ id: string; url: string }> {
  const { data } = await apiClient.post(`/reports/${caseId}/generate`);
  return data.data;
}

export async function getReportDownloadUrl(caseId: string): Promise<string> {
  const { data } = await apiClient.get(`/reports/${caseId}/download`);
  return data.data.url;
}
