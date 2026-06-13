import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AlertTriangle, ClipboardList, LineChart, TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { parentApi } from '../../api/modules/parent.api';
import ParentChildNav from '../../components/parent/ParentChildNav';
import { ParentBadge, ParentEmptyState, ParentPageHero, ParentPanel, ParentSectionHeading, ParentStatCard } from '../../components/parent/ParentUI';

const ChildPerformance = () => {
  const { id } = useParams();
  const [performance, setPerformance] = useState(null);
  const [riskReport, setRiskReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError('');
        const [perfRes, riskRes] = await Promise.all([
          parentApi.getChildPerformance(id),
          parentApi.getChildRiskReport(id).catch(() => ({ data: { data: null } })),
        ]);
        setPerformance(perfRes.data?.data ?? null);
        setRiskReport(riskRes.data?.data ?? null);
      } catch (error) {
        console.error('Failed to fetch child performance', error);
        setError('Performance data could not be loaded right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <ParentPanel className="p-6 text-sm text-slate-500">Loading performance data...</ParentPanel>;

  if (error) {
    return <ParentEmptyState title="Performance unavailable" description={error} />;
  }

  const child = performance?.child;
  const summary = performance?.summary ?? {};
  const courseAverages = performance?.course_averages ?? [];
  const recentSubmissions = performance?.recent_submissions ?? [];
  const riskLevel = String(riskReport?.risk_level || 'low').toLowerCase();

  return (
    <div className="space-y-6">
      <ParentPageHero
        eyebrow="Academic Performance"
        title="Student Performance"
        subtitle={`Track grades, subject averages, GPA, recent submissions, and academic risk indicators for ${child?.full_name || 'your child'}.`}
        tone="emerald"
      >
        <div className="flex flex-wrap gap-2">
          <ParentBadge tone="slate">{child?.full_name || 'Linked student'}</ParentBadge>
          <ParentBadge tone={riskLevel === 'high' ? 'rose' : riskLevel === 'medium' ? 'amber' : 'emerald'}>
            {riskLevel} risk
          </ParentBadge>
        </div>
      </ParentPageHero>

      <ParentChildNav studentId={id} />

      {riskLevel === 'high' ? (
        <ParentPanel className="border-rose-200 bg-rose-50 p-5">
          <ParentSectionHeading
            icon={AlertTriangle}
            title="High academic risk"
            subtitle={riskReport?.improvement_recommendations || 'Review grades, attendance, and missing work with the student and teachers.'}
          />
        </ParentPanel>
      ) : null}

      <div className="grid gap-4 md:grid-cols-4">
        <ParentStatCard icon={TrendingUp} label="Average Grade" value={`${summary.average_grade ?? 0}%`} tone="emerald" />
        <ParentStatCard label="GPA" value={summary.gpa ?? 0} tone="blue" />
        <ParentStatCard icon={LineChart} label="Courses Tracked" value={courseAverages.length} tone="slate" />
        <ParentStatCard icon={ClipboardList} label="Graded Work" value={summary.graded_count ?? 0} tone="amber" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <ParentPanel className="p-6">
          <ParentSectionHeading title="Grade Overview" subtitle="Average grade by enrolled course." />
          <div className="mt-6 h-72">
            {courseAverages.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={courseAverages}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="course_name" stroke="#64748b" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#64748b" domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: 8, borderColor: '#e2e8f0' }} />
                  <Bar dataKey="average_percentage" fill="#059669" radius={[4, 4, 0, 0]} name="Average (%)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-slate-300 text-sm text-slate-500">
                No grade averages are available yet.
              </div>
            )}
          </div>
        </ParentPanel>

        <ParentPanel className="p-6">
          <ParentSectionHeading title="Recent Submissions" subtitle="Latest submitted or graded assignments." />
          <div className="mt-5 space-y-3">
            {recentSubmissions.length > 0 ? (
              recentSubmissions.map((submission) => (
                <div key={submission.id} className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <p className="font-semibold text-slate-900">{submission.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{submission.course_name}</p>
                  </div>
                  <p className="text-sm font-semibold text-emerald-700">
                    {submission.marks ?? '-'} / {submission.max_marks ?? '-'}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                No recent graded submissions.
              </div>
            )}
          </div>
        </ParentPanel>
      </div>
    </div>
  );
};

export default ChildPerformance;
