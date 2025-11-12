import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Notification } from '@/services/notifications';
import axios from 'axios';

const API_URL = 'http://localhost:4000';

export function useNotifications(userId: number | undefined) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('pyson_token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }, []);

  // Fetch initial unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!userId) return;

    try {
      console.log('[useNotifications] Fetching unread count for user:', userId);
      const response = await axios.get(
        `${API_URL}/notifications/user/${userId}/unread-count`,
        getAuthHeaders()
      );
      setUnreadCount(response.data.count);
      setError(null);
    } catch (error) {
      console.error('[useNotifications] Error fetching unread count:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    }
  }, [userId, getAuthHeaders]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!userId) {
      console.warn('[useNotifications] No userId provided');
      return;
    }

    console.log('[useNotifications] Initializing WebSocket for user:', userId);

    // Create socket connection
    const socket = io(API_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', async () => {
      console.log('[useNotifications] WebSocket connected:', socket.id);
      setIsConnected(true);
      setError(null);

      // Register socket with backend
      try {
        await axios.post(
          `${API_URL}/notifications/register-socket`,
          { userId, socketId: socket.id },
          getAuthHeaders()
        );
        console.log('[useNotifications] Socket registered with backend');
      } catch (error) {
        console.error('[useNotifications] Error registering socket:', error);
      }

      // Fetch initial count
      fetchUnreadCount();
    });

    socket.on('disconnect', () => {
      console.log('[useNotifications] WebSocket disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('[useNotifications] Connection error:', error);
      setError(error.message);
      setIsConnected(false);
    });

    // Listen for new notifications
    socket.on('newNotification', (notification: Notification) => {
      console.log('[useNotifications] New notification received:', notification);
      // The backend will also emit unread count update
    });

    // Listen for unread count updates
    socket.on('unreadCountUpdate', (data: { count: number }) => {
      console.log('[useNotifications] Unread count update:', data.count);
      setUnreadCount(data.count);
    });

    // Cleanup on unmount
    return () => {
      console.log('[useNotifications] Cleaning up WebSocket connection');
      socket.disconnect();
    };
  }, [userId, getAuthHeaders, fetchUnreadCount]);

  return {
    unreadCount,
    isConnected,
    error,
    refreshCount: fetchUnreadCount,
  };
}
