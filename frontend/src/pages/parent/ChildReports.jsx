import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Download, FileDown, LineChart, Printer } from 'lucide-react';
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

  if (loading) return <div className="p-6 text-slate-500">Loading reports...</div>;

  const child = data?.child;
  const academic = data?.academic_report ?? {};
  const attendance = data?.attendance_report ?? {};
  const overallAttendance = attendance?.overall ?? {};
  const subjectAverages = academic?.subject_averages ?? [];
  const monthlyBreakdown = attendance?.monthly_breakdown ?? [];

  const handleAcademicExport = () => {
    downloadCsv(`${child?.full_name || 'student'}-academic-report.csv`, [
      ['Student', child?.full_name],
      ['Student ID', child?.student_id],
      ['Grade/Class', child?.class_name],
      ['Department', child?.department_name],
      ['Academic Year', child?.academic_year],
      ['Average Grade', academic?.average_grade ?? 0],
      ['GPA', academic?.gpa ?? 0],
      [],
      ['Course', 'Teacher', 'Average Grade', 'Progress'],
      ...subjectAverages.map((item) => [
        item.course_name,
        item.teacher_name,
        `${item.average_grade ?? 0}%`,
        `${item.progress_percentage ?? 0}%`,
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
            <button onClick={handleAcademicExport} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900">
              <Download size={16} />
              Academic CSV
            </button>
            <button onClick={handleAttendanceExport} className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900">
              <FileDown size={16} />
              Attendance CSV
            </button>
            <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
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
        <ParentStatCard icon={LineChart} label="Average Grade" value={`${academic?.average_grade ?? 0}%`} tone="emerald" />
        <ParentStatCard label="GPA" value={academic?.gpa ?? 0} tone="blue" />
        <ParentStatCard label="Attendance %" value={`${overallAttendance?.percentage ?? 0}%`} tone="amber" />
        <ParentStatCard label="Absence Count" value={overallAttendance?.absent ?? 0} tone="rose" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ParentPanel className="p-6">
          <ParentSectionHeading title="Academic Report" subtitle="Subject averages, teacher list, and progress across enrolled courses." />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Average Grade</p>
              <p className="mt-2 text-3xl font-semibold text-emerald-700">{academic?.average_grade ?? 0}%</p>
            </div>
            <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">GPA</p>
              <p className="mt-2 text-3xl font-semibold text-blue-700">{academic?.gpa ?? 0}</p>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-[0.2em] text-slate-400">
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
                    <td className="py-3 text-sm text-slate-600">{item.average_grade ?? 0}%</td>
                    <td className="py-3 text-sm text-slate-600">{item.progress_percentage ?? 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ParentPanel>

        <ParentPanel className="p-6">
          <ParentSectionHeading title="Attendance Report" subtitle="Attendance percentage, absence count, and monthly attendance patterns." />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Attendance %</p>
              <p className="mt-2 text-3xl font-semibold text-amber-700">{overallAttendance?.percentage ?? 0}%</p>
            </div>
            <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Absence Count</p>
              <p className="mt-2 text-3xl font-semibold text-rose-700">{overallAttendance?.absent ?? 0}</p>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-[0.2em] text-slate-400">
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
              </tbody>
            </table>
          </div>
        </ParentPanel>
      </div>
    </div>
  );
};

export default ChildReports;
