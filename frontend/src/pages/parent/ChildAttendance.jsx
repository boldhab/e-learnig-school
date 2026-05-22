import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Download, Printer, ShieldAlert } from 'lucide-react';
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

const ChildAttendance = () => {
  const { id } = useParams();
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await parentApi.getChildAttendance(id);
        setAttendanceData(response.data?.data ?? null);
      } catch (error) {
        console.error('Failed to fetch attendance', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <div className="p-6 text-slate-500">Loading attendance...</div>;

  const child = attendanceData?.child;
  const summary = attendanceData?.summary ?? {};
  const overall = summary?.overall ?? {};
  const byCourse = summary?.by_course ?? [];
  const records = attendanceData?.records ?? [];
  const monthly = attendanceData?.monthly_breakdown ?? [];
  const alerts = attendanceData?.alerts ?? [];

  const handleExport = () => {
    downloadCsv(`${child?.full_name || 'student'}-attendance.csv`, [
      ['Student', child?.full_name],
      ['Attendance %', overall?.percentage ?? 0],
      ['Present', overall?.present ?? 0],
      ['Absent', overall?.absent ?? 0],
      ['Late', overall?.late ?? 0],
      [],
      ['Date', 'Course', 'Status', 'Remarks'],
      ...records.map((record) => [
        record.attendance_date,
        record.course_name,
        record.status,
        record.remarks || '',
      ]),
    ]);
  };

  return (
    <div className="space-y-6">
      <ParentPageHero
        eyebrow="Attendance Monitoring"
        title="Attendance Monitoring"
        subtitle={`Daily attendance, monthly attendance, attendance percentage, late arrivals, absence history, and parent alerts for ${child?.full_name || 'your child'}.`}
        tone="amber"
        action={
          <div className="flex flex-wrap gap-2">
            <button onClick={handleExport} className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              <Download size={16} />
              Weekly / Monthly CSV
            </button>
            <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
              <Printer size={16} />
              Save as PDF
            </button>
          </div>
        }
      >
        <div className="flex flex-wrap gap-2">
          <ParentBadge tone="amber">{alerts.length > 0 ? `${alerts.length} active alerts` : 'No active attendance alerts'}</ParentBadge>
        </div>
      </ParentPageHero>

      <ParentChildNav studentId={id} />

      <div className="grid gap-4 md:grid-cols-4">
        <ParentStatCard icon={ShieldAlert} label="Attendance %" value={`${overall?.percentage ?? 0}%`} tone="amber" />
        <ParentStatCard label="Present Days" value={overall?.present ?? 0} tone="emerald" />
        <ParentStatCard label="Absences" value={overall?.absent ?? 0} tone="rose" />
        <ParentStatCard label="Late Arrivals" value={overall?.late ?? 0} tone="blue" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <ParentPanel className="p-6">
          <ParentSectionHeading icon={ShieldAlert} title="Attendance Alerts" subtitle="Warnings such as low attendance, multiple late arrivals, or recurring absences." />
          <div className="mt-5 space-y-3">
            {alerts.length > 0 ? (
              alerts.map((alert, index) => (
                <div key={`${alert}-${index}`} className="rounded-[1.4rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
                  {alert}
                </div>
              ))
            ) : (
              <div className="rounded-[1.4rem] bg-emerald-50 px-4 py-6 text-sm font-medium text-emerald-700">
                No attendance alerts right now.
              </div>
            )}
          </div>
        </ParentPanel>

        <ParentPanel className="p-6">
          <ParentSectionHeading title="Attendance by Course" subtitle="Course-level present, absent, and late records for the linked child." />
          <div className="mt-5 space-y-3">
            {byCourse.map((course) => (
              <div key={course.course_id} className="rounded-[1.4rem] border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{course.course_name}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Present: {course.present} • Absent: {course.absent} • Late: {course.late}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-sm font-semibold text-white">
                    {course.percentage ?? 0}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ParentPanel>
      </div>

      <ParentPanel className="p-6">
        <ParentSectionHeading title="Monthly Attendance Report" subtitle="Use this section to produce weekly and monthly summaries for family follow-up." />
        <div className="mt-5 overflow-x-auto">
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
              {monthly.map((item) => (
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

      <ParentPanel className="p-6">
        <ParentSectionHeading title="Absence & Daily History" subtitle="Daily log of attendance, remarks, and absence history." />
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-[0.2em] text-slate-400">
              <tr>
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold">Course</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((record) => (
                <tr key={record.id}>
                  <td className="py-3 text-sm text-slate-600">{new Date(record.attendance_date).toLocaleDateString()}</td>
                  <td className="py-3 font-medium text-slate-900">{record.course_name}</td>
                  <td className="py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                      record.status === 'present'
                        ? 'bg-emerald-100 text-emerald-700'
                        : record.status === 'absent'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-slate-600">{record.remarks || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ParentPanel>
    </div>
  );
};

export default ChildAttendance;
