import { useEffect, useMemo, useState } from 'react';
import { Search, Filter, ArrowUpDown, Loader2 } from 'lucide-react';
import { AdminBadge, AdminCard, AdminSection } from '../../components/admin/AdminUI';
import adminApi from '../../api/modules/admin.api';

const ActivityLogsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortDir, setSortDir] = useState('desc');

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await adminApi.getDetailedActivityLogs(120);
        const data = res.data?.data || res.data || [];
        setLogs(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'Failed to load activity logs');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const visibleLogs = useMemo(() => {
    const query = search.trim().toLowerCase();

    let rows = logs.filter((log) => {
      const matchStatus = statusFilter === 'all' || (log.status || '').toLowerCase() === statusFilter;
      if (!matchStatus) {
        return false;
      }
      if (!query) {
        return true;
      }
      const searchable = `${log.user || ''} ${log.action || ''} ${log.module || ''} ${log.ip || ''} ${log.status || ''}`.toLowerCase();
      return searchable.includes(query);
    });

    rows.sort((a, b) => {
      const ta = new Date(a.timestamp || 0).getTime();
      const tb = new Date(b.timestamp || 0).getTime();
      return sortDir === 'asc' ? ta - tb : tb - ta;
    });

    return rows;
  }, [logs, search, statusFilter, sortDir]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-blue-600" size={30} />
        <span className="ml-2 text-slate-600">Loading activity logs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="text-red-700">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminSection title="Activity Logs" description="Audit trail of login activity, user actions, uploads, moderation, and deletions.">
        <AdminCard className="p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Search size={16} className="text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search logs..."
                className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStatusFilter((prev) => (prev === 'all' ? 'success' : prev === 'success' ? 'warning' : 'all'))}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
              >
                <Filter size={16} /> Filter: {statusFilter}
              </button>
              <button
                type="button"
                onClick={() => setSortDir((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
              >
                <ArrowUpDown size={16} /> Sort: {sortDir === 'desc' ? 'Newest' : 'Oldest'}
              </button>
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
                {visibleLogs.length > 0 ? visibleLogs.map((log, idx) => (
                  <tr key={`${log.timestamp}-${log.user}-${idx}`}>
                    <td className="px-6 py-4 text-sm text-slate-600">{log.timestamp ? new Date(log.timestamp).toLocaleString() : '-'}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{log.user}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{log.action}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{log.module}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{log.ip || '-'}</td>
                    <td className="px-6 py-4"><AdminBadge tone={(log.status || '').toLowerCase() === 'warning' ? 'amber' : 'green'}>{log.status}</AdminBadge></td>
                  </tr>
                )) : (
                  <tr>
                    <td className="px-6 py-6 text-sm text-slate-500" colSpan={6}>No logs found for current filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </AdminCard>
      </AdminSection>
    </div>
  );
};

export default ActivityLogsPage;
