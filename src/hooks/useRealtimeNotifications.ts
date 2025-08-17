import { useEffect, useState, useCallback } from 'react';
import { subscribeToDashboardNotifications } from '~/lib/supabase';

interface Notification {
  id: string;
  type: 'new_booking' | 'urgent_chat' | 'new_feedback' | 'job_update';
  title: string;
  message: string;
  data: any;
  timestamp: Date;
  read: boolean;
}

interface UseRealtimeNotificationsProps {
  organizationId: string;
  onNotification?: (notification: Notification) => void;
  maxNotifications?: number;
}

export function useRealtimeNotifications({
  organizationId,
  onNotification,
  maxNotifications = 50,
}: UseRealtimeNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  const addNotification = useCallback((notificationData: Omit<Notification, 'id' | 'read'>) => {
    const notification: Notification = {
      ...notificationData,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      read: false,
    };

    setNotifications(prev => {
      const updated = [notification, ...prev];
      // Keep only the latest notifications
      return updated.slice(0, maxNotifications);
    });

    setUnreadCount(prev => prev + 1);
    
    // Call external callback
    onNotification?.(notification);

    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
      });
    }
  }, [onNotification, maxNotifications]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!organizationId) return;

    setIsConnected(true);

    const unsubscribe = subscribeToDashboardNotifications(
      organizationId,
      addNotification
    );

    return () => {
      unsubscribe();
      setIsConnected(false);
    };
  }, [organizationId, addNotification]);

  // Request notification permission on mount
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
    
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const clearNotification = useCallback((notificationId: string) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(count => Math.max(0, count - 1));
      }
      return prev.filter(n => n.id !== notificationId);
    });
  }, []);

  const getNotificationsByType = useCallback((type: Notification['type']) => {
    return notifications.filter(notification => notification.type === type);
  }, [notifications]);

  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(notification => !notification.read);
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    clearNotification,
    getNotificationsByType,
    getUnreadNotifications,
    addNotification, // For manual testing
  };
}

/**
 * Hook for chat-specific real-time updates
 */
export function useRealtimeChatUpdates(organizationId: string) {
  const [activeSessions, setActiveSessions] = useState(0);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [urgentChats, setUrgentChats] = useState<any[]>([]);

  useEffect(() => {
    if (!organizationId) return;

    const unsubscribe = subscribeToDashboardNotifications(
      organizationId,
      (notification) => {
        if (notification.type === 'urgent_chat') {
          setUrgentChats(prev => [notification.data, ...prev.slice(0, 9)]);
        }
        
        // Add to recent messages
        if (notification.data && notification.data.userMessage) {
          setRecentMessages(prev => [notification.data, ...prev.slice(0, 19)]);
        }
      }
    );

    return unsubscribe;
  }, [organizationId]);

  const clearUrgentChats = useCallback(() => {
    setUrgentChats([]);
  }, []);

  return {
    activeSessions,
    recentMessages,
    urgentChats,
    clearUrgentChats,
  };
}

/**
 * Hook for booking real-time updates
 */
export function useRealtimeBookings(organizationId: string) {
  const [newBookings, setNewBookings] = useState<any[]>([]);
  const [urgentBookings, setUrgentBookings] = useState<any[]>([]);

  useEffect(() => {
    if (!organizationId) return;

    const unsubscribe = subscribeToDashboardNotifications(
      organizationId,
      (notification) => {
        if (notification.type === 'new_booking') {
          const booking = notification.data;
          setNewBookings(prev => [booking, ...prev.slice(0, 19)]);
          
          if (booking.urgency === 'emergency' || booking.urgency === 'urgent') {
            setUrgentBookings(prev => [booking, ...prev.slice(0, 9)]);
          }
        }
      }
    );

    return unsubscribe;
  }, [organizationId]);

  const clearNewBookings = useCallback(() => {
    setNewBookings([]);
  }, []);

  const clearUrgentBookings = useCallback(() => {
    setUrgentBookings([]);
  }, []);

  return {
    newBookings,
    urgentBookings,
    clearNewBookings,
    clearUrgentBookings,
  };
}