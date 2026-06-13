import React, { useState, useEffect } from 'react';
import { parentApi } from '../../api/modules/parent.api';
import { AlertTriangle, Bell, CheckCircle, GraduationCap } from 'lucide-react';
import api from '../../api/axios.config';
import { ParentBadge, ParentEmptyState, ParentPageHero, ParentPanel, ParentSectionHeading, ParentStatCard } from '../../components/parent/ParentUI';

const ParentNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const response = await parentApi.getNotifications();
      setNotifications(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  if (loading) return <ParentPanel className="p-6 text-sm text-slate-500">Loading notifications...</ParentPanel>;

  const unreadCount = notifications.filter((notification) => !notification.is_read).length;
  const academicCount = notifications.filter((notification) => ['grade', 'assignment'].includes(notification.type)).length;
  const attendanceCount = notifications.filter((notification) => notification.type === 'attendance').length;

  return (
    <div className="space-y-6">
      <ParentPageHero
        eyebrow="Notifications & Alerts"
        title="Notifications"
        subtitle="A real-time parent alert center for academic updates, grade publications, attendance issues, risk warnings, and assignment changes."
        tone="slate"
      >
        <div className="flex flex-wrap gap-2">
          <ParentBadge tone="blue">Academic</ParentBadge>
          <ParentBadge tone="amber">Attendance</ParentBadge>
          <ParentBadge tone="rose">Risk</ParentBadge>
        </div>
      </ParentPageHero>

      <div className="grid gap-4 md:grid-cols-3">
        <ParentStatCard icon={Bell} label="Unread alerts" value={unreadCount} tone="blue" />
        <ParentStatCard icon={GraduationCap} label="Academic notices" value={academicCount} tone="emerald" />
        <ParentStatCard icon={AlertTriangle} label="Attendance notices" value={attendanceCount} tone="amber" />
      </div>

      <ParentPanel className="p-6">
        <ParentSectionHeading
          icon={Bell}
          title="Alerts Center"
          subtitle="Parents receive grade-published notices, assignment alerts, student absence alerts, late-attendance warnings, and at-risk messages here."
        />

        <div className="mt-6 space-y-4">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`rounded-lg border p-5 transition-colors ${
              !notif.is_read ? 'border-blue-200 bg-blue-50/60' : 'border-slate-200 bg-slate-50/60'
            }`}
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex gap-4">
                <div className={`mt-1 ${!notif.is_read ? 'text-blue-500' : 'text-slate-400'}`}>
                  <Bell size={20} />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-semibold text-slate-900">{notif.title}</h4>
                    <ParentBadge tone={!notif.is_read ? 'blue' : 'slate'}>
                      {!notif.is_read ? 'new' : 'read'}
                    </ParentBadge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{notif.message}</p>
                  <span className="mt-3 block text-xs font-medium uppercase tracking-wide text-slate-400">
                    {new Date(notif.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
              {!notif.is_read && (
                <button
                  onClick={() => markAsRead(notif.id)}
                  className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                >
                  <CheckCircle size={14} /> Mark Read
                </button>
              )}
            </div>
          </div>
        ))}
        {notifications.length === 0 && (
          <ParentEmptyState
            title="You are all caught up"
            description="No notifications are waiting right now. New assignment, grade, attendance, and risk alerts will appear here automatically."
          />
        )}
        </div>
      </ParentPanel>
    </div>
  );
};

export default ParentNotifications;
