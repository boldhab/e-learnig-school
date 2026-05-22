import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, BookOpen, ClipboardList, GraduationCap, Mail, UserRound } from 'lucide-react';
import { parentApi } from '../../api/modules/parent.api';
import ParentChildNav from '../../components/parent/ParentChildNav';
import { ParentBadge, ParentEmptyState, ParentPageHero, ParentPanel, ParentSectionHeading, ParentStatCard } from '../../components/parent/ParentUI';

const metricCards = [
  { key: 'active_courses', label: 'Enrolled Courses', color: 'text-blue-600' },
  { key: 'average_grade', label: 'Average Grade', color: 'text-emerald-600', suffix: '%' },
  { key: 'attendance_percentage', label: 'Attendance', color: 'text-amber-600', suffix: '%' },
  { key: 'pending_assignments', label: 'Pending Tasks', color: 'text-rose-600' },
];

const ChildOverview = () => {
  const { id } = useParams();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  const display = (value, fallback = 'Not provided') => {
    if (value === null || value === undefined || value === '') return fallback;
    return value;
  };

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const response = await parentApi.getChildOverview(id);
        setOverview(response.data?.data ?? null);
      } catch (error) {
        console.error('Failed to fetch child overview', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, [id]);

  if (loading) return <div className="p-6 text-slate-500">Loading child overview...</div>;

  const child = overview?.child;
  const metrics = overview?.metrics ?? {};
  const alerts = overview?.alerts ?? [];
  const courses = overview?.courses ?? [];
  const assignments = overview?.assignments ?? [];

  return (
    <div className="space-y-6">
      <ParentPageHero
        eyebrow="Child Information"
        title={child?.full_name || 'Child Overview'}
        subtitle="A parent-friendly student profile with class placement, department, academic year, active courses, assignment load, and alerts."
        tone="blue"
      >
        <div className="flex flex-wrap gap-2">
          <ParentBadge tone="slate">{child?.class_name || 'Class pending'}</ParentBadge>
          <ParentBadge tone="amber">{child?.department_name || 'General department'}</ParentBadge>
          <ParentBadge tone="emerald">{child?.academic_year || 'Current academic year'}</ParentBadge>
        </div>
      </ParentPageHero>

      <ParentChildNav studentId={id} />

      <div className="grid gap-4 lg:grid-cols-4">
        {metricCards.map((item) => (
          <ParentStatCard
            key={item.key}
            label={item.label}
            value={`${metrics[item.key] ?? 0}${item.suffix || ''}`}
            tone={item.key === 'average_grade' ? 'emerald' : item.key === 'attendance_percentage' ? 'amber' : item.key === 'pending_assignments' ? 'rose' : 'blue'}
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <ParentPanel className="p-6">
          <ParentSectionHeading icon={UserRound} title="Child Information" subtitle="Only the linked child's profile is visible to this parent account." />

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Full Name</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{display(child?.full_name)}</p>
            </div>
            <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Student ID</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{display(child?.student_id)}</p>
            </div>
            <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Grade / Class</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{display(child?.class_name)}</p>
            </div>
            <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Department</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{display(child?.department_name, 'General')}</p>
            </div>
            <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Academic Year</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{display(child?.academic_year)}</p>
            </div>
            <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Email</p>
              <p className="mt-2 flex items-center gap-2 text-lg font-semibold text-slate-900">
                <Mail size={16} className="text-slate-400" />
                {display(child?.email)}
              </p>
            </div>
          </div>
        </ParentPanel>

        <ParentPanel className="p-6">
          <ParentSectionHeading icon={AlertTriangle} title="Parent Alerts" subtitle="Examples include overdue assignments, poor attendance, and newly graded work." />

          <div className="mt-6 space-y-3">
            {alerts.length > 0 ? (
              alerts.map((alert, index) => (
                <div key={`${alert}-${index}`} className="rounded-[1.4rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
                  {alert}
                </div>
              ))
            ) : (
              <div className="rounded-[1.4rem] bg-emerald-50 px-4 py-6 text-sm font-medium text-emerald-700">
                No urgent alerts right now.
              </div>
            )}
          </div>
        </ParentPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ParentPanel className="p-6">
          <ParentSectionHeading
            icon={BookOpen}
            title="Enrolled Courses"
            subtitle="Subjects, teachers, and progress snapshots."
            action={
              <Link to={`/parent/student/${id}/courses`} className="text-sm font-semibold text-blue-700 hover:text-blue-800">
              View all
              </Link>
            }
          />

          <div className="mt-6 space-y-3">
            {courses.length > 0 ? (
              courses.map((course) => (
                <div key={course.course_id} className="rounded-[1.4rem] border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-base font-semibold text-slate-900">{course.course_name}</p>
                      <p className="mt-1 text-sm text-slate-500">Teacher: {course.teacher_name}</p>
                    </div>
                    <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {(course.assignments_total ?? 0)} assignments
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <ParentEmptyState title="No enrolled courses found" description="Course assignments will appear here as soon as the student is enrolled." />
            )}
          </div>
        </ParentPanel>

        <ParentPanel className="p-6">
          <ParentSectionHeading
            icon={ClipboardList}
            title="Assignment Monitoring"
            subtitle="Due dates, submission status, and grading updates."
            action={
              <Link to={`/parent/student/${id}/assignments`} className="text-sm font-semibold text-blue-700 hover:text-blue-800">
              View all
              </Link>
            }
          />

          <div className="mt-6 space-y-3">
            {assignments.length > 0 ? (
              assignments.slice(0, 5).map((assignment) => (
                <div key={assignment.id} className="rounded-[1.4rem] border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">{assignment.title}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {assignment.course_name} • Due {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'TBD'}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
                      {assignment.parent_status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <ParentEmptyState title="No assignments available" description="New work, graded submissions, and alerts will show up here once teachers publish them." />
            )}
          </div>
        </ParentPanel>
      </div>
    </div>
  );
};

export default ChildOverview;
