import axios from 'axios';

const API_URL = 'http://localhost:4000';

export interface Notification {
  id: number;
  userId: number;
  topicId: number;
  action: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('pyson_token');
  console.log('[Notifications Service] Token found:', token ? 'Yes' : 'No');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getUnreadNotifications = async (userId: number): Promise<Notification[]> => {
  const response = await axios.get(
    `${API_URL}/notifications/user/${userId}/unread`,
    getAuthHeaders()
  );
  return response.data;
};

export const getAllNotifications = async (userId: number): Promise<Notification[]> => {
  const response = await axios.get(
    `${API_URL}/notifications/user/${userId}`,
    getAuthHeaders()
  );
  return response.data;
};

export const markAsRead = async (notificationId: number): Promise<Notification> => {
  const response = await axios.patch(
    `${API_URL}/notifications/${notificationId}/read`,
    {},
    getAuthHeaders()
  );
  return response.data;
};

export const markAllAsRead = async (userId: number): Promise<{ count: number }> => {
  const response = await axios.patch(
    `${API_URL}/notifications/user/${userId}/read-all`,
    {},
    getAuthHeaders()
  );
  return response.data;
};

export const getUnreadCount = async (userId: number): Promise<number> => {
  const response = await axios.get(
    `${API_URL}/notifications/user/${userId}/unread-count`,
    getAuthHeaders()
  );
  return response.data.count;
};
