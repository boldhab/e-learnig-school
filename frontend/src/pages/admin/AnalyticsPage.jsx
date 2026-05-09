import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, BookOpen, Activity } from 'lucide-react';
import { ADMIN_COLORS } from '../../constants/adminTheme';
import { AdminCard, AdminMetricCard, AdminSection } from '../../components/admin/AdminUI';

const growthData = [
  { month: 'Jan', students: 1080, teachers: 78 },
  { month: 'Feb', students: 1110, teachers: 79 },
  { month: 'Mar', students: 1145, teachers: 81 },
  { month: 'Apr', students: 1190, teachers: 82 },
  { month: 'May', students: 1248, teachers: 84 },
];

const attendanceTrend = [
  { week: 'W1', rate: 90 },
  { week: 'W2', rate: 92 },
  { week: 'W3', rate: 91 },
  { week: 'W4', rate: 94 },
  { week: 'W5', rate: 95 },
];

const assignmentCompletion = [
  { name: 'Submitted', value: 74 },
  { name: 'Pending', value: 18 },
  { name: 'Overdue', value: 8 },
];

const engagementData = [
  { label: 'Teacher Posts', value: 85 },
  { label: 'Material Views', value: 92 },
  { label: 'Quiz Attempts', value: 71 },
  { label: 'Live Attendance', value: 88 },
];

const COLORS = ['#1E40AF', '#0F766E', '#F59E0B'];

const AnalyticsPage = () => (
  <div className="space-y-6">
    <AdminSection title="Performance Analytics" description="Enterprise-level analytics for growth, engagement, attendance, and system usage.">
      <div className="grid gap-4 md:grid-cols-4">
        <AdminMetricCard title="Student Growth" value="+8.4%" trend="YoY" icon={TrendingUp} />
        <AdminMetricCard title="Attendance Trend" value="94%" trend="Stable" icon={Users} />
        <AdminMetricCard title="Completion Rate" value="92%" trend="+3.1%" icon={BookOpen} />
        <AdminMetricCard title="System Usage" value="High" trend="Active" icon={Activity} />
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

export default AnalyticsPage;
