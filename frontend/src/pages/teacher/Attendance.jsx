import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
    </div>
  );
};

export default AttendancePage;
