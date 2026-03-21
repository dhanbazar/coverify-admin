import { apiClient } from "./client";

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: string;
  assigned_city?: string;
  employee_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role: string;
  assignedCity?: string;
  employeeId?: string;
}

export interface UpdateUserPayload {
  fullName?: string;
  phone?: string;
  role?: string;
  assignedCity?: string;
  employeeId?: string;
  isActive?: boolean;
}

export async function fetchUsers(params: {
  page?: number;
  pageSize?: number;
  role?: string;
  is_active?: string;
  search?: string;
}): Promise<UsersResponse> {
  const { data } = await apiClient.get("/admin/users", { params });
  return data.data ?? data;
}

export async function fetchUser(id: string): Promise<User> {
  const { data } = await apiClient.get(`/admin/users/${id}`);
  return data.data ?? data;
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
  const { data } = await apiClient.post("/admin/users", payload);
  return data.data ?? data;
}

export async function updateUser(id: string, payload: UpdateUserPayload): Promise<User> {
  const { data } = await apiClient.put(`/admin/users/${id}`, payload);
  return data.data ?? data;
}

export async function deleteUser(id: string): Promise<void> {
  await apiClient.delete(`/admin/users/${id}`);
}

export async function resetUserPassword(id: string): Promise<{ tempPassword: string }> {
  const { data } = await apiClient.post(`/admin/users/${id}/reset-password`);
  return data.data ?? data;
}
