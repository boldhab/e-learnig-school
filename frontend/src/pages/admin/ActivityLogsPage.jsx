import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { AdminBadge, AdminCard, AdminSection } from '../../components/admin/AdminUI';

const logs = [
  { timestamp: '10:14 AM', user: 'Victoria James', action: 'Created user account', module: 'User Management', ip: '10.0.0.12', status: 'Success' },
  { timestamp: '09:46 AM', user: 'Amina Yusuf', action: 'Uploaded file', module: 'Materials', ip: '10.0.0.18', status: 'Success' },
  { timestamp: '09:11 AM', user: 'System', action: 'Backup completed', module: 'Backups', ip: '127.0.0.1', status: 'Success' },
  { timestamp: '08:57 AM', user: 'Unknown', action: 'Suspicious login blocked', module: 'Security', ip: '172.16.8.4', status: 'Warning' },
];

const ActivityLogsPage = () => (
  <div className="space-y-6">
    <AdminSection title="Activity Logs" description="Audit trail of login activity, user actions, uploads, moderation, and deletions.">
      <AdminCard className="p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Search size={16} className="text-slate-400" />
            <input placeholder="Search logs..." className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none" />
          </div>
          <div className="flex gap-3">
            <button type="button" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"><Filter size={16} /> Filter</button>
            <button type="button" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"><ArrowUpDown size={16} /> Sort</button>
          </div>
        </div>
      </AdminCard>

      <AdminCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Timestamp</th>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Action</th>
                <th className="px-6 py-4 font-semibold">Module</th>
                <th className="px-6 py-4 font-semibold">IP Address</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {logs.map((log) => (
                <tr key={`${log.timestamp}-${log.user}`}>
                  <td className="px-6 py-4 text-sm text-slate-600">{log.timestamp}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{log.user}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{log.action}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{log.module}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{log.ip}</td>
                  <td className="px-6 py-4"><AdminBadge tone={log.status === 'Warning' ? 'amber' : 'green'}>{log.status}</AdminBadge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </AdminSection>
  </div>
);

export default ActivityLogsPage;
