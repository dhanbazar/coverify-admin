import { apiClient } from "./client";
import type { Agent, ApiResponse } from "@coanfiss/coverify-shared";

export interface AgentWithStats extends Agent {
  activeCases: number;
  completedCases: number;
  avgTatHours: number;
}

export async function fetchAgents(): Promise<AgentWithStats[]> {
  const { data } = await apiClient.get<ApiResponse<AgentWithStats[]>>("/admin/agents");
  return data.data;
}

export async function createAgent(agent: {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  assignedCity: string;
}): Promise<string> {
  const { data } = await apiClient.post("/auth/register", {
    ...agent,
    role: "agent",
  });
  return data.data.userId;
}

export async function toggleAgentStatus(agentId: string, isActive: boolean): Promise<void> {
  await apiClient.patch(`/admin/agents/${agentId}`, { isActive });
}
