import { useState } from 'react';
import { Flag, MessageSquare, Trash2, Pin, Eye, AlertTriangle, Activity } from 'lucide-react';
import { AdminBadge, AdminCard, AdminSection } from '../../components/admin/AdminUI';

const threads = [
  { title: 'Exam schedule discussion', author: 'Class 12A', status: 'Clean', replies: 24 },
  { title: 'Reported message: offensive language', author: 'Grade 11B', status: 'Flagged', replies: 7 },
  { title: 'Course resources request', author: 'Grade 10C', status: 'Moderate', replies: 13 },
];

const DiscussionsMonitoringPage = () => {
  const [selected, setSelected] = useState(0);

  return (
    <div className="space-y-6">
      <AdminSection title="Discussion Monitoring" description="Review flagged content, engagement, and moderation actions across the LMS.">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { title: 'Flagged Posts', value: '18', icon: Flag, tone: 'red' },
            { title: 'Open Threads', value: '92', icon: MessageSquare, tone: 'blue' },
            { title: 'Moderation Queue', value: '6', icon: AlertTriangle, tone: 'amber' },
            { title: 'Engagement', value: 'High', icon: Activity, tone: 'green' },
          ].map((metric) => (
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
              {threads.map((thread, index) => (
                <button key={thread.title} type="button" onClick={() => setSelected(index)} className={`w-full rounded-2xl border p-4 text-left transition ${selected === index ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{thread.title}</p>
                      <p className="text-sm text-slate-500">{thread.author}</p>
                    </div>
                    <AdminBadge tone={thread.status === 'Flagged' ? 'red' : thread.status === 'Moderate' ? 'amber' : 'green'}>{thread.status}</AdminBadge>
                  </div>
                </button>
              ))}
            </div>
          </AdminCard>

          <AdminCard className="p-5">
            <h3 className="text-lg font-semibold text-slate-900">Selected Discussion</h3>
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500">Thread</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{threads[selected].title}</p>
                <p className="mt-2 text-sm text-slate-600">{threads[selected].author} • {threads[selected].replies} replies</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <button type="button" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white"><Pin size={16} /> Pin Thread</button>
                <button type="button" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"><Eye size={16} /> Review</button>
                <button type="button" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600"><Trash2 size={16} /> Delete</button>
                <button type="button" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-200 px-4 py-3 text-sm font-semibold text-amber-600"><Flag size={16} /> Report</button>
              </div>
            </div>
          </AdminCard>
        </div>
      </AdminSection>
    </div>
  );
};

export default DiscussionsMonitoringPage;
