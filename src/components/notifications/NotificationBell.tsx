'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getUnreadCount } from '@/services/notifications';
import { NotificationModal } from './NotificationModal';

interface NotificationBellProps {
  userId: number;
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUnreadCount = async () => {
    try {
      console.log('[NotificationBell] Fetching unread count for user:', userId);
      const count = await getUnreadCount(userId);
      console.log('[NotificationBell] Unread count:', count);
      setUnreadCount(count);
      setError(null);
    } catch (error) {
      console.error('[NotificationBell] Error fetching unread count:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  useEffect(() => {
    if (!userId) {
      console.warn('[NotificationBell] No userId provided');
      return;
    }

    console.log('[NotificationBell] Initializing with userId:', userId);
    fetchUnreadCount();

    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, [userId]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Refresh count when modal closes
      fetchUnreadCount();
    }
  };

  if (error) {
    console.error('[NotificationBell] Rendering with error:', error);
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(true)}
        title={error ? `Error: ${error}` : 'Notificaciones'}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      <NotificationModal
        userId={userId}
        isOpen={isOpen}
        onOpenChange={handleOpenChange}
        onNotificationRead={fetchUnreadCount}
      />
    </>
  );
}
