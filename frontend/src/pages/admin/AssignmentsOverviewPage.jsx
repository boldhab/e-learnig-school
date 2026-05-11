import { ClipboardList, Clock3, CircleCheck, TriangleAlert, UserCog, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AdminBadge, AdminCard, AdminMetricCard, AdminSection } from '../../components/admin/AdminUI';
import adminApi from '../../api/modules/admin.api';

const AssignmentsOverviewPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({
    overdue_assignments: 0,
    submission_rate: 0,
    grading_completion: 0,
    teacher_activity: 'Low',
  });
  const [assignments, setAssignments] = useState([]);
  const [teacherActivitySummary, setTeacherActivitySummary] = useState([]);

  useEffect(() => {
    const fetchAssignmentsData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await adminApi.getAssignmentsOverview();
        const data = response.data?.data || response.data || {};
        
        if (data && data.metrics) {
          setMetrics(data.metrics);
          setAssignments(data.assignments || []);
          setTeacherActivitySummary(data.teacher_activity_summary || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to load assignments overview');
        console.error('Error fetching assignments overview:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignmentsData();
  }, []);

  const metricData = [
    { label: 'Overdue Assignments', value: metrics.overdue_assignments.toString(), tone: 'red', icon: TriangleAlert },
    { label: 'Submission Rate', value: metrics.submission_rate + '%', tone: metrics.submission_rate > 80 ? 'green' : 'amber', icon: CircleCheck },
    { label: 'Grading Completion', value: metrics.grading_completion + '%', tone: 'blue', icon: ClipboardList },
    { label: 'Teacher Activity', value: metrics.teacher_activity, tone: metrics.teacher_activity === 'High' ? 'teal' : 'amber', icon: UserCog },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <span className="ml-2 text-slate-600">Loading assignments overview...</span>
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
      <AdminSection title="Assignment Monitoring" description="Monitor system-wide activity without grading individual submissions.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metricData.map((item) => (
            <AdminMetricCard
              key={item.label}
              title={item.label}
              value={item.value}
              icon={item.icon}
              trend="Live"
              trendColor={
                item.tone === 'red'
                  ? '#EF4444'
                  : item.tone === 'green'
                  ? '#22C55E'
                  : item.tone === 'teal'
                  ? '#0F766E'
                  : '#FBBF24'
              }
            />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
          <AdminCard className="p-5">
            <div className="space-y-4">
              {assignments.length > 0 ? (
                assignments.map((assignment) => (
                  <div key={assignment.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{assignment.title}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {assignment.course} • {assignment.teacher}
                        </p>
                      </div>
                      <AdminBadge
                        tone={
                          assignment.status === 'Overdue'
                            ? 'red'
                            : assignment.status === 'Completed'
                            ? 'green'
                            : assignment.status === 'In Progress'
                            ? 'amber'
                            : 'blue'
                        }
                      >
                        {assignment.status}
                      </AdminBadge>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                      <span>Submissions</span>
                      <span className="font-semibold text-slate-900">{assignment.submitted}</span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-blue-700"
                        style={{
                          width:
                            assignment.total_possible > 0
                              ? Math.round(
                                  (parseInt(assignment.submitted.split('/')[0]) /
                                    parseInt(assignment.submitted.split('/')[1])) *
                                    100
                                ) + '%'
                              : '0%',
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-500">No assignments found</p>
              )}
            </div>
          </AdminCard>

          <AdminCard className="p-5">
            <h3 className="text-lg font-semibold text-slate-900">Teacher Activity</h3>
            <div className="mt-4 space-y-3">
              {teacherActivitySummary.length > 0 ? (
                teacherActivitySummary.map((item) => (
                  <div key={item} className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-600">
                    <div className="flex items-start gap-3">
                      <Clock3 className="mt-0.5 text-slate-400" size={16} />
                      <span>{item}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-500">No teacher activity</p>
              )}
            </div>
          </AdminCard>
        </div>
      </AdminSection>
    </div>
  );
};

export default AssignmentsOverviewPage;
