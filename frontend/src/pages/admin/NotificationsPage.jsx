import { useEffect, useMemo, useState } from 'react';
import { BellRing, ServerCrash, Upload, ShieldAlert, ClipboardList, Loader2, Megaphone, MessageSquareText, CalendarClock, AlertTriangle } from 'lucide-react';
import { AdminBadge, AdminCard, AdminSection } from '../../components/admin/AdminUI';
import notificationApi from '../../api/modules/notification.api';

const iconByType = {
  system: ServerCrash,
  warning: AlertTriangle,
  assignment: ClipboardList,
  attendance: CalendarClock,
  announcement: Megaphone,
  discussion: MessageSquareText,
  grade: ClipboardList,
  event: BellRing,
};

const NotificationsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const mappedItems = useMemo(() => {
    return items.slice(0, 8).map((n) => {
      const icon = iconByType[n.type] || BellRing;
      const tone = n.priority === 'high' ? 'red' : n.priority === 'medium' ? 'amber' : 'blue';
      const createdAt = n.created_at ? new Date(n.created_at).toLocaleString() : 'Unknown time';
      const meta = `${(n.type || 'system').toUpperCase()} • ${createdAt}`;
      return {
        id: n.id,
        title: n.title || 'Notification',
        message: n.message || '',
        meta,
        tone,
        icon,
        isRead: !!n.is_read,
      };
    });
  }, [items]);

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const [notificationsRes, unreadRes] = await Promise.all([
        notificationApi.getNotifications(),
        notificationApi.getUnreadCount(),
      ]);

      const notificationsData = notificationsRes.data?.data || notificationsRes.data || [];
      const unreadData = unreadRes.data?.data || unreadRes.data || {};

      setItems(Array.isArray(notificationsData) ? notificationsData : []);
      setUnreadCount(Number(unreadData.unread_count || 0));
    } catch (err) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      await fetchNotifications();
    } catch (err) {
      setError(err.message || 'Failed to mark notifications as read');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-blue-600" size={28} />
        <span className="ml-2 text-slate-600">Loading notifications...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="text-red-800">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminSection
        title="Notification Center"
        description="Monitor issues, alerts, and system reminders from across the LMS."
        action={
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Mark all as read
          </button>
        }
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {mappedItems.length > 0 ? mappedItems.map((item) => (
            <AdminCard key={item.id} className="p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-blue-50 p-3 text-blue-700"><item.icon size={18} /></div>
                <div>
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.meta}</p>
                  {item.message ? <p className="mt-2 text-sm text-slate-600 line-clamp-2">{item.message}</p> : null}
                  <div className="mt-3 flex items-center gap-2">
                    <AdminBadge tone={item.tone}>{item.isRead ? 'Read' : 'Unread'}</AdminBadge>
                    <AdminBadge tone="slate">{item.tone === 'red' ? 'High' : item.tone === 'amber' ? 'Medium' : 'Low'}</AdminBadge>
                  </div>
                </div>
              </div>
            </AdminCard>
          )) : (
            <AdminCard className="p-5 md:col-span-2 xl:col-span-4">
              <p className="text-sm text-slate-500">No notifications found.</p>
            </AdminCard>
          )}
        </div>

        <AdminCard className="p-5">
          <div className="flex items-center gap-3">
            <BellRing className="text-slate-400" size={18} />
            <div>
              <p className="font-semibold text-slate-900">Notification preferences</p>
              <p className="text-sm text-slate-500">Unread notifications: {unreadCount}. Route alerts to email, in-app, and system logs.</p>
            </div>
          </div>
        </AdminCard>
      </AdminSection>
    </div>
  );
};

export default NotificationsPage;
