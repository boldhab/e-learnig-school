import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BookOpen, GraduationCap, UserRound } from 'lucide-react';
import { parentApi } from '../../api/modules/parent.api';
import ParentChildNav from '../../components/parent/ParentChildNav';
import { ParentBadge, ParentEmptyState, ParentPageHero, ParentPanel } from '../../components/parent/ParentUI';

const ChildCourses = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await parentApi.getChildCourses(id);
        setData(response.data?.data ?? null);
      } catch (error) {
        console.error('Failed to fetch child courses', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [id]);

  if (loading) return <div className="p-6 text-slate-500">Loading courses...</div>;

  const child = data?.child;
  const courses = data?.courses ?? [];

  return (
    <div className="space-y-6">
      <ParentPageHero
        eyebrow="Course Monitoring"
        title="Student Courses"
        subtitle={`Monitor enrolled courses, assigned teachers, course progress, assignment volume, and attendance indicators for ${child?.full_name || 'your child'}.`}
        tone="amber"
      >
        <div className="flex flex-wrap gap-2">
          <ParentBadge tone="slate">{child?.full_name || 'Linked student'}</ParentBadge>
          <ParentBadge tone="blue">{child?.class_name || 'Class pending'}</ParentBadge>
          <ParentBadge tone="amber">{child?.department_name || 'General department'}</ParentBadge>
        </div>
      </ParentPageHero>

      <ParentChildNav studentId={id} />

      <ParentPanel className="p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Student</p>
            <p className="mt-2 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <UserRound size={16} className="text-slate-400" />
              {child?.full_name || '-'}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Grade</p>
            <p className="mt-2 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <GraduationCap size={16} className="text-slate-400" />
              {child?.class_name || '-'}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Department</p>
            <p className="mt-2 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <BookOpen size={16} className="text-slate-400" />
              {child?.department_name || 'General'}
            </p>
          </div>
        </div>
      </ParentPanel>

      <div className="grid gap-4 xl:grid-cols-2">
        {courses.length > 0 ? (
          courses.map((course) => {
            const assignmentsTotal = Number(course.assignments_total || 0);
            const submissionsTotal = Number(course.submissions_total || 0);
            const progress = assignmentsTotal > 0 ? Math.round((submissionsTotal / assignmentsTotal) * 100) : 0;

            return (
              <ParentPanel key={course.course_id} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">{course.course_name}</h2>
                    <p className="mt-1 text-sm text-slate-500">Teacher: {course.teacher_name}</p>
                  </div>
                  <span className="rounded-md bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                    {progress}% progress
                  </span>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Assignments</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{assignmentsTotal}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Submitted</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{submissionsTotal}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Average Grade</p>
                    <p className="mt-2 text-2xl font-semibold text-emerald-700">{course.average_grade ?? 0}%</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Attendance</p>
                    <p className="mt-2 text-2xl font-semibold text-amber-700">{course.attendance_percentage ?? 0}%</p>
                  </div>
                </div>
              </ParentPanel>
            );
          })
        ) : (
          <ParentEmptyState title="No course data found" description="Course assignments, teacher names, and progress metrics will appear here as soon as the student is enrolled." />
        )}
      </div>
    </div>
  );
};

export default ChildCourses;
