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
  CheckCircle2
} from 'lucide-react';
import { TEACHER_COLORS } from '../../constants/teacherTheme';
import attendanceApi from '../../api/modules/attendance.api';
import contentApi from '../../api/modules/content.api';
import toast from 'react-hot-toast';

const AttendancePage = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await contentApi.getCourses();
        const courseList = res.data?.data ?? res.data ?? [];
        setCourses(Array.isArray(courseList) ? courseList : []);
        if (Array.isArray(courseList) && courseList.length > 0) {
          setSelectedCourseId(courseList[0].id);
        }
      } catch (error) {
        toast.error("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (!selectedCourseId) return;

    const fetchClassData = async () => {
      setStudentsLoading(true);
      try {
        // 1. Fetch Students
        const studentsRes = await contentApi.getCourseStudents(selectedCourseId);
        const studentList = studentsRes.data?.data ?? studentsRes.data ?? [];
        setStudents(Array.isArray(studentList) ? studentList : []);

        // 2. Fetch Existing Attendance for this date
        const existingRes = await attendanceApi.getCourseAttendance(selectedCourseId, selectedDate);
        const existing = existingRes.data?.data ?? existingRes.data ?? [];

        // Initialize records: merge existing or default to 'present'
        const initialRecords = {};
        studentList.forEach(student => {
          const match = existing.find(e => e.student_id === student.id);
          initialRecords[student.id] = {
            status: match ? match.status : 'present',
            remarks: match ? match.remarks : ''
          };
        });
        setAttendanceRecords(initialRecords);
      } catch (error) {
        console.error("Failed to load class data:", error);
      } finally {
        setStudentsLoading(false);
      }
    };
    fetchClassData();
  }, [selectedCourseId, selectedDate]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status }
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        course_id: selectedCourseId,
        attendance_date: selectedDate,
        records: Object.entries(attendanceRecords).map(([id, data]) => ({
          student_id: id,
          status: data.status,
          remarks: data.remarks
        }))
      };
      await attendanceApi.bulkMark(payload);
      toast.success("Attendance saved successfully!");
    } catch (error) {
      toast.error("Failed to save attendance");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStudents = Array.isArray(students) ? students.filter(s => 
    s.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Class Attendance</h1>
          <p className="text-slate-500">Mark daily engagement for your assigned courses.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border shadow-sm">
            <CalendarIcon size={18} className="text-slate-400" />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="outline-none text-sm font-semibold text-slate-700 cursor-pointer"
            />
          </div>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="px-4 py-2.5 rounded-xl border bg-white focus:ring-2 focus:ring-blue-500/20 outline-none font-bold text-sm shadow-sm"
            style={{ borderColor: TEACHER_COLORS.BORDER }}
          >
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.name}</option>
            ))}
          </select>
        </div>
      </header>

      {/* Quick Mark Bar */}
      <div className="bg-blue-600 rounded-2xl p-6 mb-8 text-white flex flex-col md:flex-row items-center justify-between shadow-lg">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <div className="p-3 bg-white/20 rounded-xl">
            <Users size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg">{students.length} Students Enrolled</h3>
            <p className="text-blue-100 text-sm">Managing {selectedDate === new Date().toISOString().split('T')[0] ? 'today\'s' : 'selected date\'s'} attendance</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => {
              const allPresent = {};
              students.forEach(s => allPresent[s.id] = { status: 'present', remarks: '' });
              setAttendanceRecords(allPresent);
            }}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold transition-all"
          >
            Mark All Present
          </button>
        </div>
      </div>

      {/* Student List */}
      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden" style={{ borderColor: TEACHER_COLORS.BORDER }}>
        <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: TEACHER_COLORS.BORDER }}>
          <div className="relative max-w-xs w-full">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-slate-50 outline-none focus:ring-2 transition-all text-sm"
            />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-xs font-bold text-slate-500">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-xs font-bold text-slate-500">Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-xs font-bold text-slate-500">Late</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {studentsLoading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
              <p className="text-slate-500 font-medium">Loading student list...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-20 text-center">
              <AlertCircle size={48} className="mx-auto mb-4 text-slate-200" />
              <p className="text-slate-400">No students found.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50 border-b" style={{ borderColor: TEACHER_COLORS.BORDER }}>
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-bold text-slate-400 uppercase">Student</th>
                  <th className="px-8 py-4 text-center text-xs font-bold text-slate-400 uppercase">Status</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-slate-400 uppercase">Remarks (Optional)</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: TEACHER_COLORS.BORDER }}>
                {filteredStudents.map((student) => {
                  const record = attendanceRecords[student.id] || { status: 'present', remarks: '' };
                  return (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs">
                            {student.full_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{student.full_name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{student.student_code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {['present', 'absent', 'late'].map((s) => (
                            <button
                              key={s}
                              onClick={() => handleStatusChange(student.id, s)}
                              className={`p-2 rounded-xl transition-all ${
                                record.status === s 
                                  ? (s === 'present' ? 'bg-green-500 text-white' : s === 'absent' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white')
                                  : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                              }`}
                            >
                              {s === 'present' ? <Check size={18} /> : s === 'absent' ? <X size={18} /> : <Clock size={18} />}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <input 
                          type="text" 
                          placeholder="Add a note..."
                          value={record.remarks}
                          onChange={(e) => setAttendanceRecords(prev => ({
                            ...prev,
                            [student.id]: { ...prev[student.id], remarks: e.target.value }
                          }))}
                          className="w-full bg-transparent border-none outline-none text-sm text-slate-600 placeholder:text-slate-300"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <motion.button
          onClick={handleSubmit}
          disabled={submitting || students.length === 0}
          className="px-10 py-4 rounded-2xl font-bold text-white flex items-center gap-2 shadow-lg disabled:opacity-50"
          style={{ backgroundColor: TEACHER_COLORS.PRIMARY_BLUE }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {submitting ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
          Save Attendance Sheet
        </motion.button>
      </div>
    </div>
  );
};

export default AttendancePage;
