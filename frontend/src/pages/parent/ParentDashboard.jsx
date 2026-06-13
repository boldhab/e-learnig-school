import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Bell, BookOpen, ClipboardList, LineChart, ShieldAlert, TrendingUp, Users } from 'lucide-react';
import { parentApi } from '../../api/modules/parent.api';
import { ParentBadge, ParentEmptyState, ParentPageHero, ParentPanel, ParentSectionHeading, ParentStatCard } from '../../components/parent/ParentUI';

const childActions = [
  { label: 'Courses', icon: BookOpen, suffix: 'courses', tone: 'primary' },
  { label: 'Assignments', icon: ClipboardList, suffix: 'assignments' },
  { label: 'Attendance', icon: AlertTriangle, suffix: 'attendance' },
  { label: 'Performance', icon: TrendingUp, suffix: 'performance' },
  { label: 'Reports', icon: LineChart, suffix: 'reports' },
];

const ParentDashboard = () => {
  const [children, setChildren] = useState([]);
  const [overviews, setOverviews] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError('');
        const childrenResponse = await parentApi.getChildren();
        const childList = childrenResponse.data?.data ?? [];
        setChildren(childList);

        const [overviewList, notificationsResponse] = await Promise.all([
          Promise.all(
            childList.map(async (child) => {
              try {
                const overviewResponse = await parentApi.getChildOverview(child.id);
                return [child.id, overviewResponse.data?.data ?? null];
              } catch (error) {
                console.error(`Failed to fetch overview for child ${child.id}`, error);
                return [child.id, null];
              }
            })
          ),
          parentApi.getNotifications().catch(() => ({ data: { data: [] } })),
        ]);

        setOverviews(Object.fromEntries(overviewList));
        setNotifications(notificationsResponse.data?.data ?? []);
      } catch (error) {
        console.error('Failed to fetch parent dashboard data', error);
        setError('We could not load the parent dashboard. Please check the connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <ParentPanel className="p-6">
        <div className="h-2 w-32 rounded-md bg-slate-200" />
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-28 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      </ParentPanel>
    );
  }

  if (error) {
    return (
      <ParentEmptyState
        title="Parent dashboard unavailable"
        description={error}
        action={
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Retry
          </button>
        }
      />
    );
  }

  const totalPending = Object.values(overviews).reduce((sum, overview) => sum + Number(overview?.metrics?.pending_assignments || 0), 0);
  const attentionChildren = Object.values(overviews).filter((overview) => (overview?.alerts?.length || 0) > 0).length;

  return (
    <div className="space-y-6">
      <ParentPageHero
        eyebrow="Parent Dashboard"
        title="Parent Dashboard"
        subtitle="A calm command center for child information, course visibility, assignment tracking, attendance monitoring, alerts, and printable reports."
        tone="slate"
      >
        <div className="flex flex-wrap gap-2">
          <ParentBadge tone="blue">Child information</ParentBadge>
          <ParentBadge tone="emerald">Course monitoring</ParentBadge>
          <ParentBadge tone="amber">Attendance alerts</ParentBadge>
          <ParentBadge tone="rose">Assignment follow-up</ParentBadge>
        </div>
      </ParentPageHero>

      <div className="grid gap-4 md:grid-cols-3">
        <ParentStatCard icon={Users} label="Linked Children" value={children.length} caption="Securely connected" tone="blue" />
        <ParentStatCard icon={ShieldAlert} label="Unread Alerts" value={notifications.filter((item) => !item.is_read).length} caption="Needs your attention" tone="amber" />
        <ParentStatCard icon={ClipboardList} label="Pending Assignments" value={totalPending} caption="Across linked children" tone="rose" />
      </div>

      <div className="grid gap-6">
        {children.map((child) => {
          const overview = overviews[child.id];
          const metrics = overview?.metrics ?? {};
          const alerts = overview?.alerts ?? [];

          return (
            <ParentPanel key={child.id} className="overflow-hidden p-0">
              <div className="border-b border-slate-200 bg-gradient-to-r from-white via-slate-50 to-cyan-50 px-6 py-6">
                <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm">
                      <Users size={24} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{child.full_name}</h2>
                        <ParentBadge tone="slate">{child.class_name || 'Class pending'}</ParentBadge>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {child.department_name || 'General'} - Student ID: {child.student_id || 'Pending'} - Academic year {child.academic_year || 'current'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-4">
                    <div className="rounded-lg border border-slate-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Courses</p>
                      <p className="mt-2 text-2xl font-semibold text-blue-700">{metrics.active_courses ?? 0}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Average Grade</p>
                      <p className="mt-2 text-2xl font-semibold text-emerald-700">{metrics.average_grade ?? 0}%</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Attendance</p>
                      <p className="mt-2 text-2xl font-semibold text-amber-700">{metrics.attendance_percentage ?? 0}%</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Pending</p>
                      <p className="mt-2 text-2xl font-semibold text-rose-700">{metrics.pending_assignments ?? 0}</p>
                    </div>
                  </div>
                </div>

                <div className="w-full xl:max-w-sm">
                  <div className="rounded-lg border border-amber-200/80 bg-white/75 p-5 backdrop-blur-sm">
                    <ParentSectionHeading icon={AlertTriangle} title="Active Alerts" subtitle="Parent-facing reminders and risk warnings." />
                    <div className="mt-4 space-y-3">
                      {alerts.length > 0 ? (
                        alerts.slice(0, 4).map((alert, index) => (
                          <div key={`${child.id}-${index}`} className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
                            {alert}
                          </div>
                        ))
                      ) : (
                        <div className="rounded-lg bg-emerald-50 px-4 py-6 text-sm font-medium text-emerald-700">
                          No urgent alerts for this child.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                </div>
              </div>

              <div className="px-6 py-5">
                <div className="flex flex-wrap gap-3">
                  {childActions.map((action) => {
                    const Icon = action.icon;
                    const primary = action.tone === 'primary';

                    return (
                      <Link
                        key={action.suffix}
                        to={`/parent/student/${child.id}/${action.suffix}`}
                        className={`inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition ${
                          primary
                            ? 'bg-slate-900 text-white shadow-sm hover:bg-slate-800'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <Icon size={16} />
                        {action.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </ParentPanel>
          );
        })}

        {children.length === 0 && (
          <ParentEmptyState
            title="No linked children yet"
            description="Once a student is linked to this parent account, the dashboard will surface child information, assignments, attendance trends, notifications, and reports here."
          />
        )}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <ParentPanel className="p-6">
          <ParentSectionHeading
            icon={Bell}
            title="Recent notifications"
            subtitle="Academic, attendance, and risk alerts delivered to the parent account."
            action={
              <Link to="/parent/notifications" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
                Open center
              </Link>
            }
          />
          <div className="mt-5 space-y-3">
            {notifications.length > 0 ? (
              notifications.slice(0, 4).map((notification) => (
                <div key={notification.id} className="rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-900">{notification.title}</p>
                    <ParentBadge tone={notification.is_read ? 'slate' : 'blue'}>
                      {notification.is_read ? 'Read' : 'New'}
                    </ParentBadge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{notification.message}</p>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                No parent notifications yet.
              </div>
            )}
          </div>
        </ParentPanel>

        <ParentPanel className="p-6">
          <ParentSectionHeading
            icon={ShieldAlert}
            title="Snapshot"
            subtitle="A quick pulse of the parent workspace."
          />
          <div className="mt-5 grid gap-4">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Children with alerts</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{attentionChildren}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Latest notice</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">{notifications[0]?.title || 'No notifications yet'}</p>
            </div>
          </div>
        </ParentPanel>
      </div>
    </div>
  );
};

export default ParentDashboard;
