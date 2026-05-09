import { ClipboardList, Clock3, CircleCheck, TriangleAlert, UserCog } from 'lucide-react';
import { AdminBadge, AdminCard, AdminMetricCard, AdminSection } from '../../components/admin/AdminUI';

const data = [
  { label: 'Overdue Assignments', value: '12', tone: 'red', icon: TriangleAlert },
  { label: 'Submission Rate', value: '96%', tone: 'green', icon: CircleCheck },
  { label: 'Grading Completion', value: '84%', tone: 'blue', icon: ClipboardList },
  { label: 'Teacher Activity', value: 'High', tone: 'teal', icon: UserCog },
];

const assignments = [
  { title: 'Calculus Quiz 4', course: 'Mathematics', teacher: 'Amina Yusuf', status: 'Overdue', submitted: '38/42' },
  { title: 'Essay Draft Review', course: 'English Literature', teacher: 'Grace Mensah', status: 'In Progress', submitted: '28/38' },
  { title: 'Physics Lab Report', course: 'Integrated Science', teacher: 'Daniel Okoro', status: 'Awaiting Grade', submitted: '40/44' },
  { title: 'Spreadsheet Assignment', course: 'Computer Studies', teacher: 'Victoria James', status: 'Completed', submitted: '35/36' },
];

const AssignmentsOverviewPage = () => (
  <div className="space-y-6">
    <AdminSection title="Assignment Monitoring" description="Monitor system-wide activity without grading individual submissions.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.map((item) => <AdminMetricCard key={item.label} title={item.label} value={item.value} icon={item.icon} trend="Live" trendColor={item.tone === 'red' ? '#EF4444' : item.tone === 'green' ? '#22C55E' : item.tone === 'teal' ? '#0F766E' : '#1E40AF'} />)}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <AdminCard className="p-5">
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <div key={assignment.title} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{assignment.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{assignment.course} • {assignment.teacher}</p>
                  </div>
                  <AdminBadge tone={assignment.status === 'Overdue' ? 'red' : assignment.status === 'Completed' ? 'green' : 'amber'}>{assignment.status}</AdminBadge>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                  <span>Submissions</span>
                  <span className="font-semibold text-slate-900">{assignment.submitted}</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-blue-700" style={{ width: '78%' }} />
                </div>
              </div>
            ))}
          </div>
        </AdminCard>

        <AdminCard className="p-5">
          <h3 className="text-lg font-semibold text-slate-900">Teacher Activity</h3>
          <div className="mt-4 space-y-3">
            {[
              '2 teachers uploaded new assessments today',
              '6 classes currently awaiting grading',
              '4 assignments exceeded due date this week',
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-600">
                <div className="flex items-start gap-3">
                  <Clock3 className="mt-0.5 text-slate-400" size={16} />
                  <span>{item}</span>
                </div>
              </div>
            ))}
          </div>
        </AdminCard>
      </div>
    </AdminSection>
  </div>
);

export default AssignmentsOverviewPage;
