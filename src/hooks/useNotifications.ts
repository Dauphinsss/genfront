import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';

const API_URL = API_BASE_URL;

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
      return;
    }

    // Create socket connection
    const socket = io(API_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', async () => {
      setIsConnected(true);
      setError(null);

      // Register socket with backend
      try {
        await axios.post(
          `${API_URL}/notifications/register-socket`,
          { userId, socketId: socket.id },
          getAuthHeaders()
        );
      } catch (error) {
        console.error('[useNotifications] Error registering socket:', error);
      }

      // Fetch initial count
      fetchUnreadCount();
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('[useNotifications] Connection error:', error);
      setError(error.message);
      setIsConnected(false);
    });

    // Listen for new notifications
    socket.on('newNotification', () => {
      // The backend will also emit unread count update
    });

    // Listen for unread count updates
    socket.on('unreadCountUpdate', (data: { count: number }) => {
      setUnreadCount(data.count);
    });

    // Cleanup on unmount
    return () => {
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
