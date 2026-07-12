export interface Notification {
  id?: string;
  title: string;
  message: string;
  category?: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  timestamp?: string;
  read?: boolean;
}

export function getNotifications(): Notification[] {
  const stored = localStorage.getItem('notifications');
  return stored ? JSON.parse(stored) : [];
}

export function addNotification(notification: Notification): void {
  const notifications = getNotifications();
  const newNotif = {
    id: `notif_${Date.now()}`,
    timestamp: new Date().toISOString(),
    read: false,
    ...notification
  };
  notifications.unshift(newNotif);
  localStorage.setItem('notifications', JSON.stringify(notifications));
  window.dispatchEvent(new Event('logiflow_notifications_update'));
}
