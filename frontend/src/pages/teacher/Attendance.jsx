import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  X,
  Clock,
  Search,
  Calendar as CalendarIcon,
  Save,
  Loader2,
  AlertCircle,
  Users,
  ChevronDown,
  BarChart2,
} from 'lucide-react';
import { TEACHER_COLORS } from '../../constants/teacherTheme';
import attendanceApi from '../../api/modules/attendance.api';
import contentApi from '../../api/modules/content.api';
import toast from 'react-hot-toast';

// ─── Status button config ─────────────────────────────────────────────────────
const STATUS_CONFIG = {
  present: { label: 'Present', icon: Check,  color: 'bg-emerald-500 text-white', ring: 'ring-emerald-300' },
  absent:  { label: 'Absent',  icon: X,     color: 'bg-red-500 text-white',     ring: 'ring-red-300'     },
  late:    { label: 'Late',    icon: Clock,  color: 'bg-amber-500 text-white',   ring: 'ring-amber-300'  },
};

const AttendancePage = () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const [courseOptions, setCourseOptions]       = useState([]); // [{id, name, class_id, class_name, label}]
  const [selectedOption, setSelectedOption]     = useState(null); // full option object
  const [selectedDate, setSelectedDate]         = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents]                 = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [loading, setLoading]                   = useState(true);
  const [studentsLoading, setStudentsLoading]   = useState(false);
  const [submitting, setSubmitting]             = useState(false);
  const [searchTerm, setSearchTerm]             = useState('');
  const [reportStudent, setReportStudent]       = useState(null);
  const [reportData, setReportData]             = useState(null);
  const [reportLoading, setReportLoading]       = useState(false);
  const [reportModalOpen, setReportModalOpen]   = useState(false);

  // ── Load teacher's course+class options on mount ───────────────────────────
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await contentApi.getCourses();
        const raw = res.data?.data ?? res.data ?? [];
        const list = Array.isArray(raw) ? raw : [];

        // Each entry has id (course_id), class_id, name, class_name
        // Build unique dropdown options — if same course appears for multiple classes, show separate entries
        const options = list.map(c => ({
          id:         c.id,
          name:       c.name,
          class_id:   c.class_id,
          class_name: c.class_name || c.grade_name || '',
          label:      c.class_name ? `${c.name} — ${c.class_name}` : c.name,
        }));

        setCourseOptions(options);
        if (options.length > 0) setSelectedOption(options[0]);
      } catch {
        toast.error('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // ── Load students + existing attendance when option or date changes ─────────
  useEffect(() => {
    if (!selectedOption) return;

    const fetchClassData = async () => {
      setStudentsLoading(true);
      setStudents([]);
      setAttendanceRecords({});
      try {
        // 1. Fetch students scoped to the selected course+class
        const studRes = await contentApi.getCourseStudents(
          selectedOption.id,
          selectedOption.class_id || null
        );
        const studentList = studRes.data?.data ?? studRes.data ?? [];
        const students = Array.isArray(studentList) ? studentList : [];
        setStudents(students);

        // 2. Fetch existing attendance for this course + date
        const attRes = await attendanceApi.getCourseAttendance(selectedOption.id, selectedDate);
        const existing = attRes.data?.data ?? attRes.data ?? [];

        // Build record map: default everyone to 'present'
        const initialRecords = {};
        students.forEach(s => {
          const match = Array.isArray(existing)
            ? existing.find(e => String(e.student_id) === String(s.id))
            : null;
          initialRecords[s.id] = {
            status:  match ? match.status  : 'present',
            remarks: match ? match.remarks : '',
          };
        });
        setAttendanceRecords(initialRecords);
      } catch (err) {
        console.error('Failed to load class data:', err);
        toast.error('Failed to load student list');
      } finally {
        setStudentsLoading(false);
      }
    };

    fetchClassData();
  }, [selectedOption, selectedDate]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleViewReport = async (student) => {
    setReportStudent(student);
    setReportModalOpen(true);
    setReportLoading(true);
    setReportData(null);
    try {
      const res = await attendanceApi.getStudentAttendance(student.id);
      setReportData(res.data?.data ?? res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load attendance report');
    } finally {
      setReportLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));
  };

  const handleRemarksChange = (studentId, remarks) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], remarks },
    }));
  };

  const markAll = (status) => {
    const all = {};
    students.forEach(s => (all[s.id] = { status, remarks: '' }));
    setAttendanceRecords(all);
  };

  const handleSubmit = async () => {
    if (!selectedOption || students.length === 0) return;
    setSubmitting(true);
    try {
      const payload = {
        course_id:       selectedOption.id,
        attendance_date: selectedDate,
        records: Object.entries(attendanceRecords).map(([id, data]) => ({
          student_id: id,
          status:     data.status,
          remarks:    data.remarks || '',
        })),
      };
      await attendanceApi.bulkMark(payload);
      toast.success('Attendance saved successfully!');
    } catch {
      toast.error('Failed to save attendance');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Derived values ─────────────────────────────────────────────────────────
  const filteredStudents = students.filter(s =>
    s.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const presentCount = Object.values(attendanceRecords).filter(r => r.status === 'present').length;
  const absentCount  = Object.values(attendanceRecords).filter(r => r.status === 'absent').length;
  const lateCount    = Object.values(attendanceRecords).filter(r => r.status === 'late').length;

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  // ── Empty courses ──────────────────────────────────────────────────────────
  if (courseOptions.length === 0) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="py-32 text-center">
          <AlertCircle size={56} className="mx-auto mb-4 text-slate-200" />
          <p className="text-slate-500 font-medium text-lg">No courses assigned yet.</p>
          <p className="text-slate-400 text-sm mt-1">
            Ask your administrator to assign you to a course.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Class Attendance</h1>
          <p className="text-slate-500 mt-1">Mark daily attendance for your assigned courses.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date picker */}
          <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border shadow-sm">
            <CalendarIcon size={16} className="text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="outline-none text-sm font-semibold text-slate-700 cursor-pointer"
            />
          </div>

          {/* Course + class selector */}
          <div className="relative">
            <select
              value={courseOptions.findIndex(
                o => o.id === selectedOption?.id && o.class_id === selectedOption?.class_id
              )}
              onChange={e => setSelectedOption(courseOptions[Number(e.target.value)])}
              className="appearance-none pl-4 pr-10 py-2.5 rounded-xl border bg-white focus:ring-2 focus:ring-blue-500/20 outline-none font-semibold text-sm shadow-sm cursor-pointer"
              style={{ borderColor: TEACHER_COLORS.BORDER }}
            >
              {courseOptions.map((option, idx) => (
                <option key={`${option.id}-${option.class_id}-${idx}`} value={idx}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        </div>
      </header>

      {/* ── Summary bar ───────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl p-5 mb-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg"
        style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)' }}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <Users size={22} />
          </div>
          <div>
            <h3 className="font-bold text-lg">{students.length} Students</h3>
            <p className="text-blue-100 text-sm">
              {selectedOption?.label} &mdash;{' '}
              {selectedDate === new Date().toISOString().split('T')[0] ? "Today" : selectedDate}
            </p>
          </div>
        </div>

        {/* Live counts */}
        <div className="flex items-center gap-4 text-sm font-semibold">
          <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg">
            <Check size={14} /> {presentCount} Present
          </span>
          <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg">
            <X size={14} /> {absentCount} Absent
          </span>
          <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg">
            <Clock size={14} /> {lateCount} Late
          </span>
        </div>

        {/* Quick actions */}
        <div className="flex gap-2">
          <button
            onClick={() => markAll('present')}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/25 rounded-lg text-xs font-bold transition-all"
          >
            All Present
          </button>
          <button
            onClick={() => markAll('absent')}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/25 rounded-lg text-xs font-bold transition-all"
          >
            All Absent
          </button>
        </div>
      </div>

      {/* ── Student table ─────────────────────────────────────────────────── */}
      <div
        className="bg-white rounded-3xl border shadow-sm overflow-hidden"
        style={{ borderColor: TEACHER_COLORS.BORDER }}
      >
        {/* Table header */}
        <div
          className="p-5 border-b flex items-center justify-between gap-4"
          style={{ borderColor: TEACHER_COLORS.BORDER }}
        >
          <div className="relative max-w-xs w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border bg-slate-50 outline-none focus:ring-2 focus:ring-blue-400/30 text-sm transition-all"
            />
          </div>
          <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Present</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Absent</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Late</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {studentsLoading ? (
            <div className="py-24 flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-blue-500 mb-3" size={32} />
              <p className="text-slate-400 font-medium">Loading students…</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-24 text-center">
              <AlertCircle size={44} className="mx-auto mb-3 text-slate-200" />
              <p className="text-slate-400 font-medium">
                {searchTerm ? 'No students match your search.' : 'No students found in this class.'}
              </p>
              {!searchTerm && (
                <p className="text-slate-300 text-sm mt-2">
                  Students need to be assigned to this class before you can mark attendance.
                </p>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50 border-b" style={{ borderColor: TEACHER_COLORS.BORDER }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Remarks</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Report</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: TEACHER_COLORS.BORDER }}>
                {filteredStudents.map((student, idx) => {
                  const record = attendanceRecords[student.id] || { status: 'present', remarks: '' };
                  return (
                    <motion.tr
                      key={student.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      {/* Row number */}
                      <td className="px-6 py-4 text-slate-400 text-sm font-mono">{idx + 1}</td>

                      {/* Student info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-sm shrink-0">
                            {student.full_name?.charAt(0) ?? '?'}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-sm">{student.full_name}</p>
                            {student.student_code && (
                              <p className="text-[10px] text-slate-400 font-mono">{student.student_code}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status buttons */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
                            const Icon = cfg.icon;
                            const active = record.status === status;
                            return (
                              <button
                                key={status}
                                onClick={() => handleStatusChange(student.id, status)}
                                title={cfg.label}
                                className={`p-2 rounded-xl transition-all ring-2 ${
                                  active
                                    ? `${cfg.color} ${cfg.ring}`
                                    : 'bg-slate-100 text-slate-400 ring-transparent hover:bg-slate-200'
                                }`}
                              >
                                <Icon size={16} />
                              </button>
                            );
                          })}
                        </div>
                      </td>

                      {/* Remarks */}
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          placeholder="Add note…"
                          value={record.remarks}
                          onChange={e => handleRemarksChange(student.id, e.target.value)}
                          className="w-full bg-transparent border-none outline-none text-sm text-slate-600 placeholder:text-slate-300"
                        />
                      </td>

                      {/* Report action */}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleViewReport(student)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          title="View Attendance Report"
                        >
                          <BarChart2 size={18} />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Save button ────────────────────────────────────────────────────── */}
      <div className="mt-6 flex justify-end">
        <motion.button
          onClick={handleSubmit}
          disabled={submitting || students.length === 0}
          className="px-8 py-3.5 rounded-2xl font-bold text-white flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: TEACHER_COLORS.PRIMARY_BLUE }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {submitting ? (
            <><Loader2 className="animate-spin" size={20} /> Saving…</>
          ) : (
            <><Save size={20} /> Save Attendance Sheet</>
          )}
        </motion.button>
      </div>

      {/* Student Attendance Report Modal */}
      <StudentAttendanceReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        student={reportStudent}
        reportData={reportData}
        loading={reportLoading}
      />
    </div>
  );
};

// ─── Student Report Modal ───────────────────────────────────────────────────
const StudentAttendanceReportModal = ({ isOpen, onClose, student, reportData, loading }) => {
  if (!isOpen || !student) return null;

  const summary = reportData?.summary ?? {
    overall: { total: 0, present: 0, absent: 0, late: 0, percentage: 0 },
    by_course: []
  };
  const records = reportData?.records ?? [];

  const overall = summary.overall ?? { total: 0, present: 0, absent: 0, late: 0, percentage: 0 };
  const byCourse = summary.by_course ?? [];

  // Color logic for attendance rate percentage
  const getRateColor = (rate) => {
    const val = parseFloat(rate);
    if (val >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (val >= 75) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getRateProgressBarColor = (rate) => {
    const val = parseFloat(rate);
    if (val >= 90) return 'bg-emerald-500';
    if (val >= 75) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'present':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1 w-max"><Check size={12} /> Present</span>;
      case 'absent':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-red-50 text-red-700 border border-red-100 flex items-center gap-1 w-max"><X size={12} /> Absent</span>;
      case 'late':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-50 text-amber-700 border border-amber-100 flex items-center gap-1 w-max"><Clock size={12} /> Late</span>;
      case 'excused':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-1 w-max"><AlertCircle size={12} /> Excused</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-50 text-slate-700 border border-slate-100 w-max">{status}</span>;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal content */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="bg-slate-900 p-6 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-lg font-bold">
                {student.full_name?.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold">{student.full_name}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Code: {student.student_code || 'N/A'}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-blue-500 mb-3" size={36} />
                <p className="text-slate-500 font-medium">Generating student report...</p>
              </div>
            ) : (
              <>
                {/* General stats cards */}
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">General Report</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {/* Rate card */}
                    <div className={`p-4 rounded-2xl border text-center flex flex-col justify-center items-center ${getRateColor(overall.percentage)}`}>
                      <span className="text-xs font-bold uppercase tracking-wider opacity-85">Rate</span>
                      <span className="text-2xl font-black mt-1">{overall.percentage}%</span>
                    </div>

                    {/* Total days */}
                    <div className="p-4 rounded-2xl border bg-slate-50 border-slate-200 text-center flex flex-col justify-center items-center text-slate-700">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Days</span>
                      <span className="text-2xl font-black mt-1 text-slate-900">{overall.total}</span>
                    </div>

                    {/* Present count */}
                    <div className="p-4 rounded-2xl border bg-emerald-50/40 border-emerald-100 text-center flex flex-col justify-center items-center text-emerald-800">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">Present</span>
                      <span className="text-2xl font-black mt-1 text-emerald-700">{overall.present}</span>
                    </div>

                    {/* Absent count */}
                    <div className="p-4 rounded-2xl border bg-red-50/40 border-red-100 text-center flex flex-col justify-center items-center text-red-800">
                      <span className="text-xs font-bold uppercase tracking-wider text-red-500">Absent</span>
                      <span className="text-2xl font-black mt-1 text-red-700">{overall.absent}</span>
                    </div>

                    {/* Late count */}
                    <div className="p-4 rounded-2xl border bg-amber-50/40 border-amber-100 text-center flex flex-col justify-center items-center text-amber-800 col-span-2 md:col-span-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-500">Late</span>
                      <span className="text-2xl font-black mt-1 text-amber-700">{overall.late}</span>
                    </div>
                  </div>
                </div>

                {/* Per-Course breakdowns */}
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">Attendance by Course</h4>
                  {byCourse.length === 0 ? (
                    <p className="text-sm text-slate-400 bg-slate-50 p-4 rounded-xl text-center">No course records found.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {byCourse.map((course) => (
                        <div key={course.course_id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col gap-2">
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-semibold text-sm text-slate-900 line-clamp-1">{course.course_name}</span>
                            <span className="text-sm font-bold text-slate-700 shrink-0">{course.percentage}%</span>
                          </div>
                          
                          {/* Progress bar */}
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${getRateProgressBarColor(course.percentage)}`}
                              style={{ width: `${course.percentage}%` }}
                            />
                          </div>

                          <div className="flex justify-between text-[11px] text-slate-400 font-medium mt-1">
                            <span>Total: {course.total} days</span>
                            <div className="flex gap-2">
                              <span className="text-emerald-600 font-semibold">{course.present} P</span>
                              <span className="text-red-500 font-semibold">{course.absent} A</span>
                              <span className="text-amber-500 font-semibold">{course.late} L</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Attendance details history */}
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">Detailed Attendance Log</h4>
                  {records.length === 0 ? (
                    <p className="text-sm text-slate-400 bg-slate-50 p-4 rounded-xl text-center">No attendance history records logged.</p>
                  ) : (
                    <div className="border border-slate-100 rounded-2xl overflow-hidden">
                      <div className="max-h-64 overflow-y-auto">
                        <table className="w-full text-left text-sm border-collapse">
                          <thead className="bg-slate-50 sticky top-0 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                            <tr>
                              <th className="px-4 py-2.5">Date</th>
                              <th className="px-4 py-2.5">Course</th>
                              <th className="px-4 py-2.5">Status</th>
                              <th className="px-4 py-2.5">Remarks</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {records.map((rec) => (
                              <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-4 py-3 text-slate-600 font-medium whitespace-nowrap text-xs">
                                  {new Date(rec.attendance_date).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </td>
                                <td className="px-4 py-3 text-slate-800 font-medium text-xs max-w-[150px] truncate" title={rec.course_name}>
                                  {rec.course_name}
                                </td>
                                <td className="px-4 py-3">
                                  {getStatusBadge(rec.status)}
                                </td>
                                <td className="px-4 py-3 text-slate-500 text-xs max-w-[150px] truncate" title={rec.remarks}>
                                  {rec.remarks || <span className="text-slate-300 italic">—</span>}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AttendancePage;
