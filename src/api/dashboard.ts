import { apiClient } from "./client";

export interface DashboardStats {
  totalCases: number;
  activeCases: number;
  completedToday: number;
  avgTatHours: number;
  tatBreachRate: number;
  activeAgents: number;
  pendingReview: number;
}

export interface CaseTrend {
  date: string;
  submitted: number;
  approved: number;
  rejected: number;
}

export interface AgentPerformance {
  agentId: string;
  agentName: string;
  casesCompleted: number;
  avgTatHours: number;
  tatBreachCount: number;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const { data } = await apiClient.get("/admin/dashboard/stats");
  return data.data;
}

export async function fetchCaseTrends(days: number = 30): Promise<CaseTrend[]> {
  const { data } = await apiClient.get(`/admin/dashboard/trends?days=${days}`);
  return data.data;
}

export async function fetchAgentPerformance(): Promise<AgentPerformance[]> {
  const { data } = await apiClient.get("/admin/dashboard/agents");
  return data.data;
}
