import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BellRing,
  CalendarClock,
  ClipboardList,
  Loader2,
  Megaphone,
  MessageSquareText,
  ServerCrash,
} from 'lucide-react';
import notificationApi from '../../api/modules/notification.api';
import { TEACHER_COLORS, TEACHER_SHADOWS } from '../../constants/teacherTheme';

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

const TeacherNotificationsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const cards = useMemo(() => {
    return items.map((item) => {
      const Icon = iconByType[item.type] || BellRing;
      const tone =
        item.priority === 'high' ? 'text-red-600 bg-red-50' :
        item.priority === 'medium' ? 'text-amber-600 bg-amber-50' :
        'text-blue-600 bg-blue-50';

      return {
        ...item,
        Icon,
        tone,
        createdAt: item.created_at ? new Date(item.created_at).toLocaleString() : 'Unknown time',
      };
    });
  }, [items]);

  const loadNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const [notificationsRes, unreadRes] = await Promise.all([
        notificationApi.getNotifications(),
        notificationApi.getUnreadCount(),
      ]);

      const notifications = notificationsRes.data?.data ?? notificationsRes.data ?? [];
      const unread = unreadRes.data?.data ?? unreadRes.data ?? {};

      setItems(Array.isArray(notifications) ? notifications : []);
      setUnreadCount(Number(unread.unread_count || 0));
    } catch (err) {
      setError(err.message || 'Failed to load notifications');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      await loadNotifications();
    } catch (err) {
      setError(err.message || 'Failed to mark notifications as read');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin" style={{ color: TEACHER_COLORS.PRIMARY_BLUE }} size={42} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl p-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-8 space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: TEACHER_COLORS.TEXT_PRIMARY }}>
            Notifications
          </h1>
          <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }}>
            Track new discussion activity, assignment alerts, and system reminders.
          </p>
        </div>
        <button
          type="button"
          onClick={handleMarkAllRead}
          className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-slate-50"
          style={{ borderColor: TEACHER_COLORS.BORDER, color: TEACHER_COLORS.TEXT_PRIMARY }}
        >
          Mark all as read
        </button>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5" style={{ borderColor: TEACHER_COLORS.BORDER, boxShadow: TEACHER_SHADOWS.SM }}>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: TEACHER_COLORS.TEXT_SECONDARY }}>Unread</p>
          <p className="mt-2 text-3xl font-bold" style={{ color: TEACHER_COLORS.TEXT_PRIMARY }}>{unreadCount}</p>
        </div>
        <div className="rounded-2xl border bg-white p-5" style={{ borderColor: TEACHER_COLORS.BORDER, boxShadow: TEACHER_SHADOWS.SM }}>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: TEACHER_COLORS.TEXT_SECONDARY }}>Total</p>
          <p className="mt-2 text-3xl font-bold" style={{ color: TEACHER_COLORS.TEXT_PRIMARY }}>{items.length}</p>
        </div>
        <div className="rounded-2xl border bg-white p-5" style={{ borderColor: TEACHER_COLORS.BORDER, boxShadow: TEACHER_SHADOWS.SM }}>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: TEACHER_COLORS.TEXT_SECONDARY }}>Status</p>
          <p className="mt-2 text-3xl font-bold" style={{ color: TEACHER_COLORS.TEXT_PRIMARY }}>
            {unreadCount > 0 ? 'Attention' : 'Clear'}
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {cards.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-white p-12 text-center" style={{ borderColor: TEACHER_COLORS.BORDER }}>
            <BellRing size={40} className="mx-auto mb-4 opacity-30" style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} />
            <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }}>No notifications available.</p>
          </div>
        ) : (
          cards.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border bg-white p-5"
              style={{ borderColor: TEACHER_COLORS.BORDER, boxShadow: TEACHER_SHADOWS.SM }}
            >
              <div className="flex items-start gap-4">
                <div className={`rounded-2xl p-3 ${item.tone}`}>
                  <item.Icon size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="font-semibold" style={{ color: TEACHER_COLORS.TEXT_PRIMARY }}>
                        {item.title || 'Notification'}
                      </p>
                      <p className="text-sm" style={{ color: TEACHER_COLORS.TEXT_SECONDARY }}>
                        {(item.type || 'system').toUpperCase()} • {item.createdAt}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${item.is_read ? 'bg-slate-100 text-slate-600' : 'bg-blue-50 text-blue-600'}`}
                    >
                      {item.is_read ? 'Read' : 'Unread'}
                    </span>
                  </div>
                  {item.message ? (
                    <p className="mt-3 text-sm" style={{ color: TEACHER_COLORS.TEXT_PRIMARY }}>
                      {item.message}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TeacherNotificationsPage;
