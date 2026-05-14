import { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Eye,
  Flag,
  Loader2,
  Lock,
  MessageSquare,
  RefreshCcw,
  Trash2,
  Unlock,
} from 'lucide-react';
import { AdminBadge, AdminCard, AdminSection } from '../../components/admin/AdminUI';
import adminApi from '../../api/modules/admin.api';
import communicationApi from '../../api/modules/communication.api';

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
  const [messages, setMessages] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDiscussionsData = useCallback(async (preferredThreadId = null) => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getDiscussionsMonitoring();
      const data = response.data?.data || response.data || {};

      if (data && data.metrics) {
        const nextThreads = Array.isArray(data.threads) ? data.threads : [];
        setMetrics(data.metrics);
        setThreads(nextThreads);
        setSelected((current) => {
          const preferredIndex = nextThreads.findIndex((thread) => thread.id === preferredThreadId);
          if (preferredIndex >= 0) return preferredIndex;
          return current >= 0 && current < nextThreads.length ? current : 0;
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to load discussions monitoring data');
      console.error('Error fetching discussions monitoring:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchThreadMessages = useCallback(async (topicId) => {
    if (!topicId) {
      setMessages([]);
      return;
    }

    try {
      setDetailsLoading(true);
      const response = await communicationApi.getMessages(topicId);
      const data = response.data?.data || response.data || [];
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load discussion messages:', err);
      setMessages([]);
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDiscussionsData();
  }, [fetchDiscussionsData]);

  const selectedThread = threads.length > 0 ? threads[selected] : null;

  useEffect(() => {
    fetchThreadMessages(selectedThread?.id);
  }, [selectedThread, fetchThreadMessages]);

  const handleRefresh = async () => {
    await fetchDiscussionsData(selectedThread?.id ?? null);
    if (selectedThread?.id) {
      await fetchThreadMessages(selectedThread.id);
    }
  };

  const handleToggleThreadStatus = async () => {
    if (!selectedThread) return;

    const nextStatus = selectedThread.raw_status === 'open' ? 'close' : 'open';

    try {
      setActionLoading(true);
      await communicationApi.updateTopicStatus(selectedThread.id, nextStatus);
      await fetchDiscussionsData(selectedThread.id);
    } catch (err) {
      console.error(`Failed to ${nextStatus} thread:`, err);
      alert(err.response?.data?.message || `Failed to ${nextStatus} thread.`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteThread = async () => {
    if (!selectedThread) return;
    if (!window.confirm(`Delete "${selectedThread.title}" and all of its messages?`)) return;

    try {
      setActionLoading(true);
      await communicationApi.deleteTopic(selectedThread.id);
      setMessages([]);
      await fetchDiscussionsData();
    } catch (err) {
      console.error('Failed to delete thread:', err);
      alert(err.response?.data?.message || 'Failed to delete thread.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Delete this message from the discussion?')) return;

    try {
      setActionLoading(true);
      await communicationApi.deleteMessage(messageId);
      await fetchThreadMessages(selectedThread?.id);
      await fetchDiscussionsData(selectedThread?.id);
    } catch (err) {
      console.error('Failed to delete message:', err);
      alert(err.response?.data?.message || 'Failed to delete message.');
    } finally {
      setActionLoading(false);
    }
  };

  const metricData = [
    { title: 'Flagged Posts', value: metrics.flagged_posts.toString(), icon: Flag, tone: 'red' },
    { title: 'Open Threads', value: metrics.open_threads.toString(), icon: MessageSquare, tone: 'blue' },
    { title: 'Moderation Queue', value: metrics.moderation_queue.toString(), icon: AlertTriangle, tone: 'amber' },
    {
      title: 'Engagement',
      value: metrics.engagement,
      icon: Activity,
      tone: metrics.engagement === 'High' ? 'green' : metrics.engagement === 'Medium' ? 'amber' : 'blue',
    },
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
                        <p className="text-sm text-slate-500">{thread.author} • {thread.group_title}</p>
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
                      {selectedThread.author} • {selectedThread.replies} replies • {selectedThread.group_title}
                    </p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <button
                      type="button"
                      onClick={handleToggleThreadStatus}
                      disabled={actionLoading}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      {selectedThread.raw_status === 'open' ? <Lock size={16} /> : <Unlock size={16} />}
                      {selectedThread.raw_status === 'open' ? 'Close Thread' : 'Reopen Thread'}
                    </button>
                    <button
                      type="button"
                      onClick={handleRefresh}
                      disabled={actionLoading}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 disabled:opacity-60"
                    >
                      <Eye size={16} /> Review
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteThread(selectedThread.id)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                    <button
                      type="button"
                      onClick={handleRefresh}
                      disabled={actionLoading}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-200 px-4 py-3 text-sm font-semibold text-amber-600 disabled:opacity-60"
                    >
                      <RefreshCcw size={16} /> Refresh
                    </button>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-slate-900">Messages</h4>
                      {detailsLoading && <Loader2 size={16} className="animate-spin text-blue-600" />}
                    </div>
                    <div className="max-h-[320px] space-y-3 overflow-y-auto">
                      {!detailsLoading && messages.length === 0 ? (
                        <p className="text-sm text-slate-500">No visible messages in this discussion.</p>
                      ) : (
                        messages.map((message) => (
                          <div key={message.id} className="rounded-xl bg-slate-50 p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-slate-900">
                                  {message.author_name}
                                  {message.author_role === 'TEACHER' ? ' (Teacher)' : ''}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {new Date(message.created_at).toLocaleString()}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDeleteMessage(message.id)}
                                disabled={actionLoading}
                                className="rounded-lg border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 disabled:opacity-60"
                              >
                                Remove
                              </button>
                            </div>
                            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{message.message}</p>
                          </div>
                        ))
                      )}
                    </div>
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
