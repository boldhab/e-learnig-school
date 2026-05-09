import { BellRing, ServerCrash, Upload, ShieldAlert, ClipboardList } from 'lucide-react';
import { AdminBadge, AdminCard, AdminSection } from '../../components/admin/AdminUI';

const notifications = [
  { title: 'Server issue detected', meta: 'Infrastructure', tone: 'red', icon: ServerCrash },
  { title: 'Failed upload retry required', meta: 'Content Delivery', tone: 'amber', icon: Upload },
  { title: 'Suspicious login attempt blocked', meta: 'Security', tone: 'red', icon: ShieldAlert },
  { title: 'Overdue grading reminder', meta: 'Assignments', tone: 'blue', icon: ClipboardList },
];

const NotificationsPage = () => (
  <div className="space-y-6">
    <AdminSection title="Notification Center" description="Monitor issues, alerts, and system reminders from across the LMS.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {notifications.map((item) => (
          <AdminCard key={item.title} className="p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-blue-50 p-3 text-blue-700"><item.icon size={18} /></div>
              <div>
                <p className="font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-sm text-slate-500">{item.meta}</p>
                <div className="mt-3"><AdminBadge tone={item.tone}>{item.meta}</AdminBadge></div>
              </div>
            </div>
          </AdminCard>
        ))}
      </div>

      <AdminCard className="p-5">
        <div className="flex items-center gap-3">
          <BellRing className="text-slate-400" size={18} />
          <div>
            <p className="font-semibold text-slate-900">Notification preferences</p>
            <p className="text-sm text-slate-500">Route alerts to email, in-app, and system logs.</p>
          </div>
        </div>
      </AdminCard>
    </AdminSection>
  </div>
);

export default NotificationsPage;
