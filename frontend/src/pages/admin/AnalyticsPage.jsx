import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, BookOpen, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ADMIN_COLORS } from '../../constants/adminTheme';
import { AdminCard, AdminMetricCard, AdminSection } from '../../components/admin/AdminUI';
import adminApi from '../../api/modules/admin.api';

const COLORS = ['#1E40AF', '#0F766E', '#F59E0B'];

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({
    student_growth: 0,
    attendance_trend: 0,
    completion_rate: 0,
    system_usage: 'Low',
  });
  const [growthData, setGrowthData] = useState([]);
  const [attendanceTrend, setAttendanceTrend] = useState([]);
  const [assignmentCompletion, setAssignmentCompletion] = useState([]);
  const [engagementData, setEngagementData] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await adminApi.getPerformanceAnalytics();
        const data = response.data?.data || response.data || {};

        if (data && data.metrics) {
          setMetrics((prev) => ({ ...prev, ...(data.metrics || {}) }));
          setGrowthData(data.growth_data || []);
          setAttendanceTrend(data.attendance_trend_data || []);
          setAssignmentCompletion(data.assignment_completion || []);
          setEngagementData(data.engagement_data || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to load performance analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="py-8 text-sm text-slate-600">Loading performance analytics...</div>;
  }

  if (error) {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <AdminSection title="Performance Analytics" description="Enterprise-level analytics for growth, engagement, attendance, and system usage.">
        <div className="grid gap-4 md:grid-cols-4">
          <AdminMetricCard title="Student Growth" value={`${metrics.student_growth >= 0 ? '+' : ''}${metrics.student_growth}%`} trend="30d" icon={TrendingUp} />
          <AdminMetricCard title="Attendance Trend" value={`${metrics.attendance_trend}%`} trend="Current" icon={Users} />
          <AdminMetricCard title="Completion Rate" value={`${metrics.completion_rate}%`} trend="Graded" icon={BookOpen} />
          <AdminMetricCard title="System Usage" value={metrics.system_usage} trend="Last 7 days" icon={Activity} />
        </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminCard className="p-5">
          <h3 className="text-lg font-semibold text-slate-900">Student Growth</h3>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="students" stroke={ADMIN_COLORS.PRIMARY_BLUE} strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="teachers" stroke={ADMIN_COLORS.ACCENT_TEAL} strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </AdminCard>

        <AdminCard className="p-5">
          <h3 className="text-lg font-semibold text-slate-900">Attendance Trends</h3>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="week" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip />
                <Area type="monotone" dataKey="rate" stroke={ADMIN_COLORS.ACCENT_TEAL} fill="#CCFBF1" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </AdminCard>

        <AdminCard className="p-5">
          <h3 className="text-lg font-semibold text-slate-900">Assignment Completion</h3>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={assignmentCompletion} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={4}>
                  {assignmentCompletion.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </AdminCard>

        <AdminCard className="p-5">
          <h3 className="text-lg font-semibold text-slate-900">Teacher Engagement</h3>
          <div className="mt-4 space-y-4">
            {engagementData.map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-slate-600">{item.label}</span>
                  <span className="font-semibold text-slate-900">{item.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full" style={{ width: `${item.value}%`, backgroundColor: ADMIN_COLORS.PRIMARY_BLUE }} />
                </div>
              </div>
            ))}
          </div>
        </AdminCard>
      </div>
      </AdminSection>
    </div>
  );
};

export default AnalyticsPage;
