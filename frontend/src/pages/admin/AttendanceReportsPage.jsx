import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Download, CalendarDays, School, TrendingUp } from 'lucide-react';
import { AdminCard, AdminMetricCard, AdminSection } from '../../components/admin/AdminUI';

const attendanceData = [
  { month: 'Jan', rate: 91 },
  { month: 'Feb', rate: 92 },
  { month: 'Mar', rate: 89 },
  { month: 'Apr', rate: 93 },
  { month: 'May', rate: 95 },
  { month: 'Jun', rate: 94 },
];

const gradeData = [
  { grade: 'JSS 1', rate: 90 },
  { grade: 'JSS 2', rate: 92 },
  { grade: 'JSS 3', rate: 88 },
  { grade: 'SSS 1', rate: 94 },
  { grade: 'SSS 2', rate: 91 },
  { grade: 'SSS 3', rate: 93 },
];

const AttendanceReportsPage = () => (
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
        <AdminMetricCard title="School Attendance" value="92%" trend="+1.8%" icon={School} />
        <AdminMetricCard title="Late Arrivals" value="48" trend="-6" icon={CalendarDays} />
        <AdminMetricCard title="Improving Grades" value="4" trend="Upward" icon={TrendingUp} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminCard className="p-5">
          <h3 className="text-lg font-semibold text-slate-900">Monthly Attendance Trend</h3>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip />
                <Line type="monotone" dataKey="rate" stroke="#1E40AF" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </AdminCard>

        <AdminCard className="p-5">
          <h3 className="text-lg font-semibold text-slate-900">Grade-Based Attendance</h3>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="grade" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip />
                <Bar dataKey="rate" fill="#0F766E" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AdminCard>
      </div>
    </AdminSection>
  </div>
);

export default AttendanceReportsPage;
