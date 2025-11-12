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

  const fetchUnreadCount = async () => {
    try {
      const count = await getUnreadCount(userId);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  useEffect(() => {
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

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(true)}
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
