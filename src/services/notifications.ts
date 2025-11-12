import api from './api';

export interface Notification {
  id: number;
  userId: number;
  topicId: number;
  action: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const getUnreadNotifications = async (userId: number): Promise<Notification[]> => {
  const response = await api.get(`/notifications/user/${userId}/unread`);
  return response.data;
};

export const getAllNotifications = async (userId: number): Promise<Notification[]> => {
  const response = await api.get(`/notifications/user/${userId}`);
  return response.data;
};

export const markAsRead = async (notificationId: number): Promise<Notification> => {
  const response = await api.patch(`/notifications/${notificationId}/read`);
  return response.data;
};

export const markAllAsRead = async (userId: number): Promise<{ count: number }> => {
  const response = await api.patch(`/notifications/user/${userId}/read-all`);
  return response.data;
};

export const getUnreadCount = async (userId: number): Promise<number> => {
  const response = await api.get(`/notifications/user/${userId}/unread-count`);
  return response.data.count;
};
