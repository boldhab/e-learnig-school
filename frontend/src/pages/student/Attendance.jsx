import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Loader2,
  Clock,
} from 'lucide-react';
import { COLORS } from '../../constants/theme';
import attendanceApi from '../../api/modules/attendance.api';

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color, delay = 0 }) => (
  <motion.div
    className="bg-white p-6 rounded-2xl border"
    style={{ borderColor: COLORS.BORDER }}
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ y: -4 }}
  >
    <div className="flex items-center justify-between mb-3">
      <p className="text-sm font-medium" style={{ color: COLORS.TEXT_SECONDARY }}>{label}</p>
      <div className="p-2.5 rounded-lg" style={{ backgroundColor: `${color}18` }}>
        <Icon size={20} style={{ color }} />
      </div>
    </div>
    <p className="text-3xl font-bold mb-1" style={{ color: COLORS.TEXT_PRIMARY }}>{value}</p>
    <p className="text-sm" style={{ color: COLORS.TEXT_SECONDARY }}>{sub}</p>
  </motion.div>
);

// ─── Calendar Heatmap ─────────────────────────────────────────────────────────
const AttendanceCalendar = ({ records }) => {
  const today = new Date();
  const year  = today.getFullYear();
  const month = today.getMonth(); // 0-indexed

  const monthName  = today.toLocaleString('default', { month: 'long' });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay    = new Date(year, month, 1).getDay(); // 0 = Sun

  // Build a map: "YYYY-MM-DD" → status
  const statusMap = useMemo(() => {
    const map = {};
    records.forEach(r => {
      const key = r.attendance_date?.split('T')[0] ?? r.attendance_date;
      if (key) map[key] = r.status;
    });
    return map;
  }, [records]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return COLORS.EMERALD_GREEN || '#10b981';
      case 'absent':  return COLORS.DANGER        || '#ef4444';
      case 'late':    return COLORS.WARNING        || '#f59e0b';
      default:        return null;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'present': return 'Present';
      case 'absent':  return 'Absent';
      case 'late':    return 'Late';
      default:        return '';
    }
  };

  // Array of day cells; null = empty padding
  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const day    = i + 1;
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const status  = statusMap[dateStr] || null;
      return { day, dateStr, status };
    }),
  ];

  return (
    <motion.div
      className="bg-white p-8 rounded-2xl border"
      style={{ borderColor: COLORS.BORDER }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <h3 className="text-xl font-bold mb-6" style={{ color: COLORS.TEXT_PRIMARY }}>
        {monthName} {year} — Attendance Calendar
      </h3>

      {/* Week day labels */}
      <div className="grid grid-cols-7 gap-1.5 mb-1.5">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-center text-xs font-semibold py-1.5"
            style={{ color: COLORS.TEXT_SECONDARY }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((cell, idx) => {
          if (!cell) {
            return <div key={`empty-${idx}`} className="aspect-square" />;
          }
          const bg = getStatusColor(cell.status);
          const isToday = cell.dateStr === today.toISOString().split('T')[0];

          return (
            <motion.div
              key={cell.dateStr}
              className="aspect-square rounded-lg flex items-center justify-center relative group cursor-default"
              style={{
                backgroundColor: bg || (COLORS.BORDER || '#e5e7eb') + '55',
                outline: isToday ? '2px solid #3b82f6' : 'none',
                outlineOffset: '1px',
              }}
              whileHover={bg ? { scale: 1.12 } : {}}
            >
              <span
                className="text-xs font-bold select-none"
                style={{ color: bg ? '#fff' : (COLORS.TEXT_SECONDARY || '#6b7280') }}
              >
                {cell.day}
              </span>

              {/* Tooltip */}
              {cell.status && (
                <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-semibold px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {getStatusLabel(cell.status)}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-5 justify-center flex-wrap mt-6">
        {[
          { label: 'Present', color: COLORS.EMERALD_GREEN || '#10b981' },
          { label: 'Absent',  color: COLORS.DANGER        || '#ef4444' },
          { label: 'Late',    color: COLORS.WARNING        || '#f59e0b' },
          { label: 'No data', color: (COLORS.BORDER || '#e5e7eb') },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded" style={{ backgroundColor: color }} />
            <span className="text-sm" style={{ color: COLORS.TEXT_SECONDARY }}>{label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// ─── Per-course breakdown ─────────────────────────────────────────────────────
const CourseBreakdown = ({ courses }) => (
  <motion.div
    className="bg-white p-6 rounded-2xl border"
    style={{ borderColor: COLORS.BORDER }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.25 }}
  >
    <h3 className="text-xl font-bold mb-6" style={{ color: COLORS.TEXT_PRIMARY }}>
      Subject-wise Attendance
    </h3>

    {courses.length === 0 ? (
      <p className="text-center py-8" style={{ color: COLORS.TEXT_SECONDARY }}>
        No attendance records yet.
      </p>
    ) : (
      <div className="space-y-5">
        {courses.map((course, idx) => {
          const pct = parseFloat(course.percentage) || 0;
          const barColor = pct >= 80
            ? (COLORS.EMERALD_GREEN || '#10b981')
            : pct >= 60
              ? (COLORS.WARNING || '#f59e0b')
              : (COLORS.DANGER  || '#ef4444');

          return (
            <motion.div
              key={course.course_id}
              className="pb-4 border-b last:border-b-0"
              style={{ borderColor: COLORS.BORDER }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + idx * 0.06 }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-sm" style={{ color: COLORS.TEXT_PRIMARY }}>
                  {course.course_name}
                </p>
                <p className="font-bold text-sm" style={{ color: barColor }}>
                  {pct}%
                </p>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                <motion.div
                  className="h-2 rounded-full"
                  style={{ backgroundColor: barColor }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.7, delay: 0.35 + idx * 0.06 }}
                />
              </div>
              <div className="flex gap-4 text-xs" style={{ color: COLORS.TEXT_SECONDARY }}>
                <span>
                  <span style={{ color: COLORS.EMERALD_GREEN || '#10b981' }} className="font-semibold">
                    {course.present}
                  </span>{' '}Present
                </span>
                <span>
                  <span style={{ color: COLORS.DANGER || '#ef4444' }} className="font-semibold">
                    {course.absent}
                  </span>{' '}Absent
                </span>
                <span>
                  <span style={{ color: COLORS.WARNING || '#f59e0b' }} className="font-semibold">
                    {course.late}
                  </span>{' '}Late
                </span>
                <span>Total: {course.total}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    )}
  </motion.div>
);

// ─── Attendance Policy ────────────────────────────────────────────────────────
const AttendancePolicy = ({ overallPct }) => {
  const meetsRequirement = overallPct >= 80;
  return (
    <motion.div
      className="bg-white p-6 rounded-2xl border"
      style={{ borderColor: COLORS.BORDER }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
    >
      <h3 className="text-lg font-bold mb-4" style={{ color: COLORS.TEXT_PRIMARY }}>
        Attendance Policy
      </h3>
      <div className="space-y-3">
        <div className="flex gap-3 p-3 rounded-lg" style={{ backgroundColor: COLORS.BACKGROUND || '#f8fafc' }}>
          <AlertCircle size={20} style={{ color: COLORS.WARNING || '#f59e0b', flexShrink: 0 }} />
          <div>
            <p className="font-semibold text-sm" style={{ color: COLORS.TEXT_PRIMARY }}>
              Minimum Requirement
            </p>
            <p className="text-sm mt-1" style={{ color: COLORS.TEXT_SECONDARY }}>
              80% attendance is required to sit for final exams.
            </p>
          </div>
        </div>
        <div className="flex gap-3 p-3 rounded-lg" style={{ backgroundColor: COLORS.BACKGROUND || '#f8fafc' }}>
          <AlertCircle
            size={20}
            style={{ color: meetsRequirement ? (COLORS.EMERALD_GREEN || '#10b981') : (COLORS.DANGER || '#ef4444'), flexShrink: 0 }}
          />
          <div>
            <p className="font-semibold text-sm" style={{ color: COLORS.TEXT_PRIMARY }}>Current Status</p>
            <p className="text-sm mt-1" style={{ color: COLORS.TEXT_SECONDARY }}>
              {overallPct > 0
                ? meetsRequirement
                  ? `You're at ${overallPct}% — meeting the requirement. Keep it up!`
                  : `You're at ${overallPct}% — below the 80% requirement. Attend more classes.`
                : 'No attendance data recorded yet.'}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Loading skeleton ─────────────────────────────────────────────────────────
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-slate-100 rounded-xl ${className}`} />
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const AttendancePage = () => {
  const [loading, setLoading] = useState(true);
  const [records, setRecords]   = useState([]);
  const [summary, setSummary]   = useState(null);
  const [error, setError]       = useState(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      setError(null);
      try {
        const res  = await attendanceApi.getStudentAttendance();
        const body = res.data?.data ?? res.data ?? {};

        // API returns { records: [...], summary: { overall: {...}, by_course: [...] } }
        setRecords(body.records  ?? []);
        setSummary(body.summary  ?? null);
      } catch (err) {
        console.error('Failed to fetch attendance:', err);
        setError('Could not load attendance data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  // ── Stats derived from summary ─────────────────────────────────────────────
  const overall    = summary?.overall   ?? { total: 0, present: 0, absent: 0, late: 0, percentage: 0 };
  const byCourse   = summary?.by_course ?? [];
  const overallPct = parseFloat(overall.percentage) || 0;

  // ── Skeleton loading ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-6 pb-12">
        <div className="mb-8">
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-80" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}
        </div>
        <Skeleton className="h-80 rounded-2xl mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-2xl lg:col-span-2" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  // ── Empty data state ───────────────────────────────────────────────────────
  if (!error && (!summary || summary.overall?.total === 0)) {
    return (
      <div className="p-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.TEXT_PRIMARY }}>
            Attendance Tracking
          </h1>
          <p className="text-lg" style={{ color: COLORS.TEXT_SECONDARY }}>
            Monitor your class attendance and participation
          </p>
        </motion.div>

        <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-2xl border" style={{ borderColor: COLORS.BORDER }}>
          <Calendar size={64} className="mb-4" style={{ color: COLORS.TEXT_SECONDARY }} />
          <h2 className="text-xl font-semibold mb-2" style={{ color: COLORS.TEXT_PRIMARY }}>
            No Attendance Records Yet
          </h2>
          <p className="text-center max-w-md mb-6" style={{ color: COLORS.TEXT_SECONDARY }}>
            Your teachers haven't recorded any attendance data yet. Attendance records will appear here once your teachers start marking attendance.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center max-w-lg">
            <div className="p-4 rounded-lg" style={{ backgroundColor: `${COLORS.EMERALD_GREEN}18` }}>
              <CheckCircle size={24} className="mx-auto mb-2" style={{ color: COLORS.EMERALD_GREEN }} />
              <p className="font-semibold text-sm" style={{ color: COLORS.TEXT_PRIMARY }}>Present</p>
              <p className="text-xs" style={{ color: COLORS.TEXT_SECONDARY }}>On-time attendance</p>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: `${COLORS.WARNING}18` }}>
              <Clock size={24} className="mx-auto mb-2" style={{ color: COLORS.WARNING }} />
              <p className="font-semibold text-sm" style={{ color: COLORS.TEXT_PRIMARY }}>Late</p>
              <p className="text-xs" style={{ color: COLORS.TEXT_SECONDARY }}>Delayed arrival</p>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: `${COLORS.DANGER}18` }}>
              <XCircle size={24} className="mx-auto mb-2" style={{ color: COLORS.DANGER }} />
              <p className="font-semibold text-sm" style={{ color: COLORS.TEXT_PRIMARY }}>Absent</p>
              <p className="text-xs" style={{ color: COLORS.TEXT_SECONDARY }}>Not present</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle size={48} className="mb-4 text-red-400" />
        <p className="text-lg font-semibold text-slate-700">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.TEXT_PRIMARY }}>
          Attendance Tracking
        </h1>
        <p className="text-lg" style={{ color: COLORS.TEXT_SECONDARY }}>
          Monitor your class attendance and participation
        </p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={CheckCircle}
          label="Overall Attendance"
          value={`${overallPct}%`}
          sub={`${overall.total} total classes`}
          color={COLORS.EMERALD_GREEN || '#10b981'}
          delay={0}
        />
        <StatCard
          icon={Calendar}
          label="Classes Present"
          value={overall.present ?? 0}
          sub={`${overallPct}% attendance rate`}
          color={COLORS.PRIMARY_BLUE || '#3b82f6'}
          delay={0.05}
        />
        <StatCard
          icon={XCircle}
          label="Classes Absent"
          value={overall.absent ?? 0}
          sub={overall.total > 0 ? `${Math.round((overall.absent / overall.total) * 100)}% absence rate` : '—'}
          color={COLORS.DANGER || '#ef4444'}
          delay={0.1}
        />
        <StatCard
          icon={Clock}
          label="Classes Late"
          value={overall.late ?? 0}
          sub={overall.total > 0 ? `${Math.round((overall.late / overall.total) * 100)}% late rate` : '—'}
          color={COLORS.WARNING || '#f59e0b'}
          delay={0.15}
        />
      </div>

      {/* Calendar Heatmap */}
      <div className="mb-8">
        <AttendanceCalendar records={records} />
      </div>

      {/* Subject breakdown + Policy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CourseBreakdown courses={byCourse} />
        </div>
        <div>
          <AttendancePolicy overallPct={overallPct} />
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
