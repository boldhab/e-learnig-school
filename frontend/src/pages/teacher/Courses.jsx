import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  BookOpen,
  Clock,
  FileText,
  Loader2,
  MessageCircle,
  Search,
  Users,
} from 'lucide-react';
import { TEACHER_COLORS } from '../../constants/teacherTheme';
import contentApi from '../../api/modules/content.api';

const CourseCard = ({ course, index, onClick }) => {
  const palette = [
    { c1: '#2563EB', c2: '#1D4ED8' },
    { c1: '#0F766E', c2: '#115E59' },
    { c1: '#7C3AED', c2: '#6D28D9' },
    { c1: '#C2410C', c2: '#9A3412' },
    { c1: '#0369A1', c2: '#075985' },
  ];
  const colors = palette[index % palette.length];

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      className="overflow-hidden rounded-2xl border bg-white transition-all hover:shadow-lg cursor-pointer"
      style={{ borderColor: TEACHER_COLORS.BORDER }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -3 }}
    >
      <div
        className="flex items-end justify-between p-5 text-white"
        style={{ background: `linear-gradient(135deg, ${colors.c1}, ${colors.c2})` }}
      >
        <div>
          <h3 className="text-xl font-bold">{course.name}</h3>
          <p className="text-sm opacity-90">{course.class_name || course.grade_name || 'Assigned section'}</p>
        </div>
        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
          Real data
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 p-5">
        <div className="rounded-2xl bg-slate-50 p-4 text-center">
          <Users size={18} style={{ color: TEACHER_COLORS.ACCENT_TEAL }} className="mx-auto mb-2" />
          <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-xs">Students</p>
          <p style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-lg font-bold">
            {course.students_count || 0}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4 text-center">
          <FileText size={18} style={{ color: TEACHER_COLORS.PRIMARY_BLUE }} className="mx-auto mb-2" />
          <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-xs">Materials</p>
          <p style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-lg font-bold">
            {course.materials_count || 0}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4 text-center">
          <BarChart3 size={18} style={{ color: TEACHER_COLORS.GRADE }} className="mx-auto mb-2" />
          <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-xs">Assignments</p>
          <p style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-lg font-bold">
            {course.assignments_count || 0}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4 text-center">
          <Clock size={18} style={{ color: TEACHER_COLORS.WARNING }} className="mx-auto mb-2" />
          <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-xs">Pending</p>
          <p style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-lg font-bold">
            {course.pending_submissions_count || 0}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 border-t p-4" style={{ borderColor: TEACHER_COLORS.BORDER }}>
        <button
          type="button"
          className="rounded-xl px-3 py-2 text-xs font-medium transition-all"
          style={{ color: TEACHER_COLORS.PRIMARY_BLUE, backgroundColor: `${TEACHER_COLORS.PRIMARY_BLUE}10` }}
        >
          Materials
        </button>
        <button
          type="button"
          className="rounded-xl px-3 py-2 text-xs font-medium transition-all"
          style={{ color: TEACHER_COLORS.GRADE, backgroundColor: `${TEACHER_COLORS.GRADE}10` }}
        >
          Grading
        </button>
        <button
          type="button"
          className="rounded-xl px-3 py-2 text-xs font-medium transition-all"
          style={{ color: TEACHER_COLORS.ACCENT_TEAL, backgroundColor: `${TEACHER_COLORS.ACCENT_TEAL}10` }}
        >
          Discuss
        </button>
      </div>
    </motion.div>
  );
};

const TeacherCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await contentApi.getCourses();
        setCourses(Array.isArray(response?.data?.data) ? response.data.data : []);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const courseGroups = useMemo(() => {
    const map = new Map();
    courses.forEach((course) => {
      const key = String(course.id);
      if (!map.has(key)) {
        map.set(key, {
          ...course,
          sections: [],
          students_count: 0,
          materials_count: 0,
          assignments_count: 0,
          pending_submissions_count: 0,
        });
      }
      const entry = map.get(key);
      entry.sections.push(course);
      entry.students_count += Number(course.students_count || 0);
      entry.materials_count += Number(course.materials_count || 0);
      entry.assignments_count += Number(course.assignments_count || 0);
      entry.pending_submissions_count += Number(course.pending_submissions_count || 0);
      if (!entry.class_name && course.class_name) entry.class_name = course.class_name;
      if (!entry.grade_name && course.grade_name) entry.grade_name = course.grade_name;
    });
    return Array.from(map.values());
  }, [courses]);

  const filteredCourses = Array.isArray(courseGroups)
    ? courseGroups.filter((course) => {
        const courseName = (course?.name || '').toLowerCase();
        const classNames = (course?.sections || []).map((section) => (section.class_name || section.grade_name || '')).join(' ').toLowerCase();
        const term = searchTerm.toLowerCase();
        return courseName.includes(term) || classNames.includes(term);
      })
    : [];

  const totalStudents = courses.reduce((sum, course) => sum + Number(course.students_count || 0), 0);
  const totalPending = courses.reduce((sum, course) => sum + Number(course.pending_submissions_count || 0), 0);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <motion.div className="mx-auto max-w-7xl p-8">
      <header className="mb-8">
        <div className="mb-6 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <h1 style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-3xl font-bold">
              My Courses
            </h1>
            <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="mt-2 max-w-2xl">
              Every card below is populated from your assigned courses and class sections in the database.
            </p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: TEACHER_COLORS.BORDER }}>
            <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-xs font-bold uppercase tracking-wider">
              Assigned Sections
            </p>
            <p style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="mt-2 text-2xl font-bold">
              {courses.length}
            </p>
          </div>
          <div className="rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: TEACHER_COLORS.BORDER }}>
            <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-xs font-bold uppercase tracking-wider">
              Enrolled Students
            </p>
            <p style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="mt-2 text-2xl font-bold">
              {totalStudents}
            </p>
          </div>
          <div className="rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: TEACHER_COLORS.BORDER }}>
            <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-xs font-bold uppercase tracking-wider">
              Pending Submissions
            </p>
            <p style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="mt-2 text-2xl font-bold">
              {totalPending}
            </p>
          </div>
        </div>

        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search your sections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border py-3 pl-10 pr-4 shadow-sm outline-none transition-all focus:ring-2"
            style={{ borderColor: TEACHER_COLORS.BORDER }}
          />
        </div>
      </header>

      <AnimatePresence>
        {filteredCourses.length === 0 ? (
          <motion.div
            className="rounded-3xl border border-dashed bg-white py-20 text-center"
            style={{ borderColor: TEACHER_COLORS.BORDER }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <BookOpen size={48} style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="mx-auto mb-4 opacity-30" />
            <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-lg font-medium">
              No assigned courses match your search.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredCourses.map((course, index) => (
              <CourseCard
                key={course.id}
                course={course}
                index={index}
                onClick={() => navigate(`/teacher/courses/${course.id}`)}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TeacherCourses;
