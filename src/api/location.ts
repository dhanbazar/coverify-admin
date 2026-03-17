import { apiClient } from './client';

export interface AgentLocation {
  id: string;
  full_name: string;
  email: string;
  last_known_lat: number;
  last_known_lng: number;
  last_location_at: string;
  is_active: boolean;
  assigned_city: string | null;
}

export async function fetchAgentLocations(): Promise<AgentLocation[]> {
  const { data } = await apiClient.get('/location/agents');
  return data.data;
}
