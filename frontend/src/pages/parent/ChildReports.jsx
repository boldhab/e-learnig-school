import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ClipboardList, Download, FileDown, LineChart, Printer, ShieldAlert } from 'lucide-react';
import { parentApi } from '../../api/modules/parent.api';
import ParentChildNav from '../../components/parent/ParentChildNav';
import { ParentBadge, ParentPageHero, ParentPanel, ParentSectionHeading, ParentStatCard } from '../../components/parent/ParentUI';

const downloadCsv = (filename, rows) => {
  const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const hasValue = (value) => value !== null && value !== undefined && value !== '';
const percentOrEmpty = (value) => (hasValue(value) ? `${value}%` : '');
const percentOrNoData = (value, fallback = 'No grades yet') => (hasValue(value) ? `${value}%` : fallback);

const ChildReports = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await parentApi.getChildReports(id);
        setData(response.data?.data ?? null);
      } catch (error) {
        console.error('Failed to fetch child reports', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [id]);

  if (loading) return <ParentPanel className="p-6 text-sm text-slate-500">Loading reports...</ParentPanel>;

  const child = data?.child;
  const academic = data?.academic_report ?? {};
  const attendance = data?.attendance_report ?? {};
  const overallAttendance = attendance?.overall ?? {};
  const subjectAverages = academic?.subject_averages ?? [];
  const monthlyBreakdown = attendance?.monthly_breakdown ?? [];
  const gradeRows = academic?.grade_rows ?? [];
  const performanceReports = academic?.performance_reports ?? data?.generated_reports ?? [];
  const attendanceRows = attendance?.recent_records ?? [];
  const attendanceByCourse = attendance?.by_course ?? [];
  const gradedCount = Number(academic?.graded_assignments ?? academic?.graded_count ?? 0);
  const missingCount = Number(academic?.missing_assignments ?? 0);
  const submittedCount = Number(academic?.submitted_assignments ?? 0);
  const displayAverageGrade = gradedCount > 0 ? `${academic?.average_grade ?? 0}%` : 'No grades yet';
  const displayGpa = gradedCount > 0 ? (academic?.gpa ?? 0) : 'No GPA yet';

  const handleAcademicExport = () => {
    downloadCsv(`${child?.full_name || 'student'}-academic-report.csv`, [
      ['Student', child?.full_name],
      ['Student ID', child?.student_id],
      ['Grade/Class', child?.class_name],
      ['Department', child?.department_name],
      ['Academic Year', child?.academic_year],
      ['Average Grade', gradedCount > 0 ? academic?.average_grade ?? 0 : 'No grades yet'],
      ['GPA', gradedCount > 0 ? academic?.gpa ?? 0 : 'No GPA yet'],
      ['Graded Assignments', gradedCount],
      ['Missing Assignments', missingCount],
      ['Submitted Assignments', submittedCount],
      [],
      ['Course', 'Teacher', 'Average Grade', 'Progress'],
      ...subjectAverages.map((item) => [
        item.course_name,
        item.teacher_name,
        Number(item.graded_total ?? 0) > 0 ? `${item.average_grade ?? 0}%` : 'No grades yet',
        `${item.progress_percentage ?? 0}%`,
      ]),
      [],
      ['Assignment', 'Course', 'Teacher', 'Status', 'Marks', 'Max Marks', 'Percentage', 'Submitted At', 'Feedback'],
      ...gradeRows.map((item) => [
        item.assignment_title,
        item.course_name,
        item.teacher_name,
        item.report_status,
        item.marks ?? '',
        item.max_marks ?? '',
        percentOrEmpty(item.percentage),
        item.submitted_at ?? '',
        item.feedback ?? '',
      ]),
      [],
      ['Generated Report', 'Course', 'Overall Score', 'Performance Level', 'Generated At'],
      ...performanceReports.map((item) => [
        item.id,
        item.course_name,
        percentOrEmpty(item.overall_score),
        item.performance_level,
        item.generated_at,
      ]),
    ]);
  };

  const handleAttendanceExport = () => {
    downloadCsv(`${child?.full_name || 'student'}-attendance-report.csv`, [
      ['Student', child?.full_name],
      ['Attendance %', overallAttendance?.percentage ?? 0],
      ['Present', overallAttendance?.present ?? 0],
      ['Absent', overallAttendance?.absent ?? 0],
      ['Late', overallAttendance?.late ?? 0],
      [],
      ['Month', 'Attendance %', 'Present', 'Absent', 'Late'],
      ...monthlyBreakdown.map((item) => [
        item.month_label,
        `${item.attendance_percentage ?? 0}%`,
        item.present_count ?? 0,
        item.absent_count ?? 0,
        item.late_count ?? 0,
      ]),
      [],
      ['Date', 'Course', 'Teacher', 'Status', 'Remarks'],
      ...attendanceRows.map((item) => [
        item.attendance_date,
        item.course_name,
        item.teacher_name,
        item.status,
        item.remarks ?? '',
      ]),
    ]);
  };

  return (
    <div className="space-y-6">
      <ParentPageHero
        eyebrow="Reports & Analytics"
        title="Reports & Analytics"
        subtitle={`Generate academic and attendance reports for ${child?.full_name || 'your child'}, including grades, GPA, subject averages, attendance percentage, and absence count.`}
        tone="slate"
        action={
          <div className="flex flex-wrap gap-2">
            <button onClick={handleAcademicExport} className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900">
              <Download size={16} />
              Academic CSV
            </button>
            <button onClick={handleAttendanceExport} className="inline-flex items-center gap-2 rounded-md bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900">
              <FileDown size={16} />
              Attendance CSV
            </button>
            <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-md bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
              <Printer size={16} />
              Save as PDF
            </button>
          </div>
        }
      >
        <div className="flex flex-wrap gap-2">
          <ParentBadge tone="blue">Academic report</ParentBadge>
          <ParentBadge tone="amber">Attendance report</ParentBadge>
          <ParentBadge tone="emerald">CSV export ready</ParentBadge>
        </div>
      </ParentPageHero>

      <ParentChildNav studentId={id} />

      <div className="grid gap-4 md:grid-cols-4">
        <ParentStatCard icon={LineChart} label="Average Grade" value={displayAverageGrade} tone="emerald" />
        <ParentStatCard label="GPA" value={displayGpa} tone="blue" />
        <ParentStatCard label="Attendance %" value={`${overallAttendance?.percentage ?? 0}%`} tone="amber" />
        <ParentStatCard icon={ClipboardList} label="Missing Work" value={missingCount} tone="rose" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ParentPanel className="p-6">
          <ParentSectionHeading title="Academic Report" subtitle="Subject averages, teacher list, and progress across enrolled courses." />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Average Grade</p>
              <p className="mt-2 text-3xl font-semibold text-emerald-700">{displayAverageGrade}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">GPA</p>
              <p className="mt-2 text-3xl font-semibold text-blue-700">{displayGpa}</p>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="pb-3 font-semibold">Subject</th>
                  <th className="pb-3 font-semibold">Teacher</th>
                  <th className="pb-3 font-semibold">Average</th>
                  <th className="pb-3 font-semibold">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjectAverages.map((item) => (
                  <tr key={item.course_name}>
                    <td className="py-3 font-medium text-slate-900">{item.course_name}</td>
                    <td className="py-3 text-sm text-slate-600">{item.teacher_name}</td>
                    <td className="py-3 text-sm text-slate-600">
                      {Number(item.graded_total ?? 0) > 0 ? `${item.average_grade ?? 0}%` : 'No grades yet'}
                    </td>
                    <td className="py-3 text-sm text-slate-600">{item.progress_percentage ?? 0}%</td>
                  </tr>
                ))}
                {subjectAverages.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-6 text-center text-sm text-slate-500">
                      No academic report rows yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </ParentPanel>

        <ParentPanel className="p-6">
          <ParentSectionHeading title="Attendance Report" subtitle="Attendance percentage, absence count, and monthly attendance patterns." />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Attendance %</p>
              <p className="mt-2 text-3xl font-semibold text-amber-700">{overallAttendance?.percentage ?? 0}%</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Absence Count</p>
              <p className="mt-2 text-3xl font-semibold text-rose-700">{overallAttendance?.absent ?? 0}</p>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="pb-3 font-semibold">Month</th>
                  <th className="pb-3 font-semibold">Attendance %</th>
                  <th className="pb-3 font-semibold">Present</th>
                  <th className="pb-3 font-semibold">Absent</th>
                  <th className="pb-3 font-semibold">Late</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {monthlyBreakdown.map((item) => (
                  <tr key={item.month_key}>
                    <td className="py-3 font-medium text-slate-900">{item.month_label}</td>
                    <td className="py-3 text-sm text-slate-600">{item.attendance_percentage ?? 0}%</td>
                    <td className="py-3 text-sm text-slate-600">{item.present_count ?? 0}</td>
                    <td className="py-3 text-sm text-slate-600">{item.absent_count ?? 0}</td>
                    <td className="py-3 text-sm text-slate-600">{item.late_count ?? 0}</td>
                  </tr>
                ))}
                {monthlyBreakdown.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-sm text-slate-500">
                      No monthly attendance report rows yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </ParentPanel>
      </div>

      <ParentPanel className="p-6">
        <ParentSectionHeading
          icon={ClipboardList}
          title="Real Assignment & Grade Report"
          subtitle="Every assignment connected to this child, including submission status, marks, percentage, and teacher feedback."
        />
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="pb-3 font-semibold">Assignment</th>
                <th className="pb-3 font-semibold">Course</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Marks</th>
                <th className="pb-3 font-semibold">Submitted</th>
                <th className="pb-3 font-semibold">Feedback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {gradeRows.map((item) => (
                <tr key={`${item.assignment_id}-${item.submission_id || 'pending'}`}>
                  <td className="py-3">
                    <p className="font-medium text-slate-900">{item.assignment_title}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.teacher_name}</p>
                  </td>
                  <td className="py-3 text-sm text-slate-600">{item.course_name}</td>
                  <td className="py-3">
                    <span className={`rounded-md px-3 py-1 text-xs font-semibold uppercase ${
                      item.report_status === 'graded'
                        ? 'bg-emerald-100 text-emerald-700'
                        : item.report_status === 'missing'
                          ? 'bg-rose-100 text-rose-700'
                          : item.report_status === 'late'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-700'
                    }`}>
                      {item.report_status}
                    </span>
                  </td>
                  <td className="py-3 text-sm font-semibold text-slate-900">
                    {hasValue(item.marks) ? `${item.marks} / ${item.max_marks} (${percentOrNoData(item.percentage, '0%')})` : 'Not graded yet'}
                  </td>
                  <td className="py-3 text-sm text-slate-600">
                    {item.submitted_at ? new Date(item.submitted_at).toLocaleString() : '-'}
                  </td>
                  <td className="py-3 text-sm text-slate-600">{item.feedback || 'No feedback yet'}</td>
                </tr>
              ))}
              {gradeRows.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-sm text-slate-500">
                    No assignment or grade records found for this child.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </ParentPanel>

      <div className="grid gap-6 xl:grid-cols-2">
        <ParentPanel className="p-6">
          <ParentSectionHeading
            icon={LineChart}
            title="Generated Performance Reports"
            subtitle="Saved performance reports generated from grades and attendance."
          />
          <div className="mt-5 space-y-3">
            {performanceReports.length > 0 ? (
              performanceReports.map((report) => (
                <div key={report.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{report.course_name}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Generated {report.generated_at ? new Date(report.generated_at).toLocaleString() : '-'}
                      </p>
                    </div>
                    <ParentBadge tone={report.performance_level === 'poor' ? 'rose' : report.performance_level === 'average' ? 'amber' : 'emerald'}>
                      {report.performance_level}
                    </ParentBadge>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Overall</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{report.overall_score ?? 0}%</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Assignments</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{report.assignment_average ?? 0}%</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Attendance</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{report.attendance_percentage ?? 0}%</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                No generated performance reports yet.
              </div>
            )}
          </div>
        </ParentPanel>

        <ParentPanel className="p-6">
          <ParentSectionHeading
            icon={ShieldAlert}
            title="Real Attendance Records"
            subtitle="Recent attendance entries recorded by course and teacher."
          />
          <div className="mt-5 space-y-3">
            {attendanceRows.length > 0 ? (
              attendanceRows.slice(0, 10).map((record) => (
                <div key={record.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <p className="font-semibold text-slate-900">{record.course_name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {record.attendance_date ? new Date(record.attendance_date).toLocaleDateString() : '-'} - {record.teacher_name || 'Teacher'}
                    </p>
                  </div>
                  <span className={`rounded-md px-3 py-1 text-xs font-semibold uppercase ${
                    record.status === 'present'
                      ? 'bg-emerald-100 text-emerald-700'
                      : record.status === 'absent'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-amber-100 text-amber-700'
                  }`}>
                    {record.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                No attendance records found for this child.
              </div>
            )}
          </div>
        </ParentPanel>
      </div>
    </div>
  );
};

export default ChildReports;
