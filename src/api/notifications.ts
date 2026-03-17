import { apiClient } from './client';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  is_read: boolean;
  created_at: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
}

export async function fetchNotifications(page = 1, limit = 20): Promise<NotificationsResponse> {
  const { data } = await apiClient.get(`/notifications?page=${page}&limit=${limit}`);
  return data.data;
}

export async function markNotificationRead(id: string): Promise<void> {
  await apiClient.patch(`/notifications/${id}/read`);
}

export async function markAllRead(): Promise<void> {
  await apiClient.patch('/notifications/read-all');
}

export async function getUnreadCount(): Promise<number> {
  const { data } = await apiClient.get('/notifications/unread-count');
  return data.data.count;
}
