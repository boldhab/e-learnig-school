import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Download, CalendarDays, School, TrendingUp, Loader2 } from 'lucide-react';
import { AdminCard, AdminMetricCard, AdminSection } from '../../components/admin/AdminUI';
import adminApi from '../../api/modules/admin.api';

const AttendanceReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({
    school_attendance: 0,
    late_arrivals: 0,
    improving_grades: 0,
  });
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [gradeAttendance, setGradeAttendance] = useState([]);
  const [subjectAttendance, setSubjectAttendance] = useState([]);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await adminApi.getAttendanceReports();
        const data = response.data?.data || response.data || {};

        if (data && data.metrics) {
          setMetrics(data.metrics);
          setMonthlyTrend(data.monthly_trend || []);
          setGradeAttendance(data.grade_attendance || []);
          setSubjectAttendance(data.subject_attendance || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to load attendance reports');
        console.error('Error fetching attendance reports:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <span className="ml-2 text-slate-600">Loading attendance reports...</span>
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
      <AdminSection
        title="Attendance Reports"
        description="Track school-wide attendance, compare grade-level performance, and export monthly reporting."
        action={
          <button type="button" className="inline-flex items-center gap-2 rounded-2xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white">
            <Download size={16} /> Export Report
          </button>
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          <AdminMetricCard
            title="School Attendance"
            value={metrics.school_attendance + '%'}
            trend={metrics.school_attendance > 90 ? '+1.8%' : metrics.school_attendance > 85 ? '-0.5%' : '-2.1%'}
            icon={School}
          />
          <AdminMetricCard
            title="Late Arrivals"
            value={metrics.late_arrivals.toString()}
            trend={metrics.late_arrivals < 50 ? '-6' : '+3'}
            icon={CalendarDays}
          />
          <AdminMetricCard
            title="Improving Grades"
            value={metrics.improving_grades.toString()}
            trend="Upward"
            icon={TrendingUp}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <AdminCard className="p-5">
            <h3 className="text-lg font-semibold text-slate-900">Monthly Attendance Trend</h3>
            <div className="mt-4 h-80">
              {monthlyTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="month" stroke="#64748B" />
                    <YAxis stroke="#64748B" />
                    <Tooltip />
                    <Line type="monotone" dataKey="rate" stroke="#1E40AF" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-slate-500">No attendance data available</p>
                </div>
              )}
            </div>
          </AdminCard>

          <AdminCard className="p-5">
            <h3 className="text-lg font-semibold text-slate-900">Grade-Based Attendance</h3>
            <div className="mt-4 h-80">
              {gradeAttendance.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gradeAttendance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="grade" stroke="#64748B" />
                    <YAxis stroke="#64748B" />
                    <Tooltip />
                    <Bar dataKey="rate" fill="#0F766E" radius={[12, 12, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-slate-500">No grade data available</p>
                </div>
              )}
            </div>
          </AdminCard>
        </div>

        <AdminCard className="p-5">
          <h3 className="text-lg font-semibold text-slate-900">Subject-Based Attendance</h3>
          <div className="mt-4 h-80">
            {subjectAttendance.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectAttendance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="subject" stroke="#64748B" />
                  <YAxis stroke="#64748B" />
                  <Tooltip />
                  <Bar dataKey="rate" fill="#7C3AED" radius={[12, 12, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-slate-500">No subject data available</p>
              </div>
            )}
          </div>
        </AdminCard>
      </AdminSection>
    </div>
  );
};

export default AttendanceReportsPage;
