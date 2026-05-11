import { useState, useEffect } from 'react';
import { Flag, MessageSquare, Trash2, Pin, Eye, AlertTriangle, Activity, Loader2 } from 'lucide-react';
import { AdminBadge, AdminCard, AdminSection } from '../../components/admin/AdminUI';
import adminApi from '../../api/modules/admin.api';

const DiscussionsMonitoringPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(0);
  const [metrics, setMetrics] = useState({
    flagged_posts: 0,
    open_threads: 0,
    moderation_queue: 0,
    engagement: 'Low',
  });
  const [threads, setThreads] = useState([]);

  useEffect(() => {
    const fetchDiscussionsData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await adminApi.getDiscussionsMonitoring();
        const data = response.data?.data || response.data || {};

        if (data && data.metrics) {
          setMetrics(data.metrics);
          setThreads(data.threads || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to load discussions monitoring data');
        console.error('Error fetching discussions monitoring:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscussionsData();
  }, []);

  const metricData = [
    { title: 'Flagged Posts', value: metrics.flagged_posts.toString(), icon: Flag, tone: 'red' },
    { title: 'Open Threads', value: metrics.open_threads.toString(), icon: MessageSquare, tone: 'blue' },
    { title: 'Moderation Queue', value: metrics.moderation_queue.toString(), icon: AlertTriangle, tone: 'amber' },
    { title: 'Engagement', value: metrics.engagement, icon: Activity, tone: metrics.engagement === 'High' ? 'green' : metrics.engagement === 'Medium' ? 'amber' : 'blue' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <span className="ml-2 text-slate-600">Loading discussions monitoring...</span>
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

  const selectedThread = threads.length > 0 ? threads[selected] : null;

  return (
    <div className="space-y-6">
      <AdminSection title="Discussion Monitoring" description="Review flagged content, engagement, and moderation actions across the LMS.">
        <div className="grid gap-4 md:grid-cols-4">
          {metricData.map((metric) => (
            <AdminCard key={metric.title} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">{metric.title}</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{metric.value}</p>
                </div>
                <metric.icon size={18} className="text-slate-500" />
              </div>
            </AdminCard>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <AdminCard className="p-5">
            <h3 className="text-lg font-semibold text-slate-900">Moderation Queue</h3>
            <div className="mt-4 space-y-3">
              {threads.length > 0 ? (
                threads.map((thread, index) => (
                  <button
                    key={thread.id}
                    type="button"
                    onClick={() => setSelected(index)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      selected === index ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{thread.title}</p>
                        <p className="text-sm text-slate-500">{thread.author}</p>
                      </div>
                      <AdminBadge
                        tone={thread.status === 'Flagged' ? 'red' : thread.status === 'Moderate' ? 'amber' : 'green'}
                      >
                        {thread.status}
                      </AdminBadge>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-center text-slate-500">No discussions found</p>
              )}
            </div>
          </AdminCard>

          <AdminCard className="p-5">
            <h3 className="text-lg font-semibold text-slate-900">Selected Discussion</h3>
            <div className="mt-4 space-y-4">
              {selectedThread ? (
                <>
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-sm text-slate-500">Thread</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">{selectedThread.title}</p>
                    <p className="mt-2 text-sm text-slate-600">
                      {selectedThread.author} • {selectedThread.replies} replies
                    </p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white"
                    >
                      <Pin size={16} /> Pin Thread
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
                    >
                      <Eye size={16} /> Review
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-200 px-4 py-3 text-sm font-semibold text-amber-600"
                    >
                      <Flag size={16} /> Report
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-center text-slate-500">No discussion selected</p>
              )}
            </div>
          </AdminCard>
        </div>
      </AdminSection>
    </div>
  );
};

export default DiscussionsMonitoringPage;
