'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NotificationModal } from './NotificationModal';
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationBellProps {
  userId: number;
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount, isConnected, error, refreshCount } = useNotifications(userId);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Refresh count when modal closes
      refreshCount();
    }
  };

  if (error) {
    console.error('[NotificationBell] Error:', error);
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(true)}
        title={error ? `Error: ${error}` : isConnected ? 'Notificaciones (En tiempo real)' : 'Notificaciones'}
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
        {isConnected && (
          <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-background" />
        )}
      </Button>

      <NotificationModal
        userId={userId}
        isOpen={isOpen}
        onOpenChange={handleOpenChange}
        onNotificationRead={refreshCount}
      />
    </>
  );
}
