import { apiClient } from './client';

export interface AuditLogEntry {
  id: string;
  user_id: string;
  action: string;
  resource: string;
  method: string;
  ip_address: string;
  user_agent: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

export async function fetchAuditLogs(params: {
  page?: number;
  limit?: number;
  userId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}): Promise<{ logs: AuditLogEntry[]; total: number }> {
  const { data } = await apiClient.get('/admin/audit-logs', { params });
  return data.data;
}
