import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  FileText,
  Loader2,
  Search,
  Users,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { TEACHER_COLORS } from '../../constants/teacherTheme';
import contentApi from '../../api/modules/content.api';

const TeacherCourseDetails = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await contentApi.getCourses();
        setCourses(Array.isArray(response?.data?.data) ? response.data.data : []);
      } catch (error) {
        console.error('Failed to fetch teacher courses:', error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const courseSections = useMemo(() => {
    return courses.filter((course) => String(course.id) === String(courseId));
  }, [courses, courseId]);

  const courseSummary = useMemo(() => {
    return courseSections.reduce(
      (acc, section) => ({
        students_count: acc.students_count + Number(section.students_count || 0),
        materials_count: acc.materials_count + Number(section.materials_count || 0),
        assignments_count: acc.assignments_count + Number(section.assignments_count || 0),
        pending_submissions_count: acc.pending_submissions_count + Number(section.pending_submissions_count || 0),
      }),
      { students_count: 0, materials_count: 0, assignments_count: 0, pending_submissions_count: 0 }
    );
  }, [courseSections]);

  const courseName = courseSections[0]?.name || 'Course details';

  const filteredSections = courseSections.filter((section) => {
    const className = (section.class_name || section.grade_name || '').toLowerCase();
    const term = searchTerm.toLowerCase();
    return className.includes(term);
  });

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (!courseSections.length) {
    return (
      <motion.div className="mx-auto max-w-5xl p-8">
        <button
          type="button"
          onClick={() => navigate('/teacher/courses')}
          className="mb-4 inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
        >
          <ArrowLeft size={16} />
          Back To My Courses
        </button>
        <div className="rounded-3xl border border-dashed bg-white py-20 text-center" style={{ borderColor: TEACHER_COLORS.BORDER }}>
          <BookOpen size={48} style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="mx-auto mb-4 opacity-30" />
          <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-lg font-medium">
            Course not found.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div className="mx-auto max-w-7xl p-8">
      <header className="mb-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={() => navigate('/teacher/courses')}
              className="mb-4 inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
            >
              <ArrowLeft size={16} />
              Back To My Courses
            </button>
            <h1 style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-3xl font-bold">
              {courseName}
            </h1>
            <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="mt-2 max-w-3xl">
              View every class section you teach for this course, along with the teaching load for each section.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: TEACHER_COLORS.BORDER }}>
            <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-xs font-bold uppercase tracking-wider">Sections</p>
            <p style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="mt-2 text-2xl font-bold">{courseSections.length}</p>
          </div>
          <div className="rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: TEACHER_COLORS.BORDER }}>
            <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-xs font-bold uppercase tracking-wider">Students</p>
            <p style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="mt-2 text-2xl font-bold">{courseSummary.students_count}</p>
          </div>
          <div className="rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: TEACHER_COLORS.BORDER }}>
            <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-xs font-bold uppercase tracking-wider">Assignments</p>
            <p style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="mt-2 text-2xl font-bold">{courseSummary.assignments_count}</p>
          </div>
          <div className="rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: TEACHER_COLORS.BORDER }}>
            <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-xs font-bold uppercase tracking-wider">Pending</p>
            <p style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="mt-2 text-2xl font-bold">{courseSummary.pending_submissions_count}</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search assigned classes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border py-3 pl-10 pr-4 shadow-sm outline-none transition-all focus:ring-2"
            style={{ borderColor: TEACHER_COLORS.BORDER }}
          />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Users size={18} style={{ color: TEACHER_COLORS.PRIMARY_BLUE }} />
            <h2 style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-xl font-bold">
              Assigned Classes
            </h2>
          </div>

          {filteredSections.length === 0 ? (
            <div className="rounded-3xl border border-dashed bg-white py-14 text-center" style={{ borderColor: TEACHER_COLORS.BORDER }}>
              <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-base font-medium">
                No assigned class matches your search.
              </p>
            </div>
          ) : (
            filteredSections.map((section, index) => (
              <motion.div
                key={`${section.id}-${section.class_name || section.grade_name || index}`}
                className="overflow-hidden rounded-3xl border bg-white"
                style={{ borderColor: TEACHER_COLORS.BORDER }}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: TEACHER_COLORS.BORDER }}>
                  <div>
                    <p style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-lg font-bold">
                      {section.class_name || section.grade_name || 'Assigned section'}
                    </p>
                    <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-sm">
                      Section assigned to you for {section.name}
                    </p>
                  </div>
                  <span className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide" style={{ backgroundColor: `${TEACHER_COLORS.PRIMARY_BLUE}10`, color: TEACHER_COLORS.PRIMARY_BLUE }}>
                    Active
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 p-5 text-center md:grid-cols-4">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <Users size={18} style={{ color: TEACHER_COLORS.ACCENT_TEAL }} className="mx-auto mb-2" />
                    <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-xs">Students</p>
                    <p style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-lg font-bold">{section.students_count || 0}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <FileText size={18} style={{ color: TEACHER_COLORS.PRIMARY_BLUE }} className="mx-auto mb-2" />
                    <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-xs">Materials</p>
                    <p style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-lg font-bold">{section.materials_count || 0}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <Clock size={18} style={{ color: TEACHER_COLORS.GRADE }} className="mx-auto mb-2" />
                    <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-xs">Assignments</p>
                    <p style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-lg font-bold">{section.assignments_count || 0}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <BookOpen size={18} style={{ color: TEACHER_COLORS.WARNING }} className="mx-auto mb-2" />
                    <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-xs">Pending</p>
                    <p style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-lg font-bold">{section.pending_submissions_count || 0}</p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </section>

        <aside className="space-y-4">
          <div className="rounded-3xl border bg-white p-5" style={{ borderColor: TEACHER_COLORS.BORDER }}>
            <div className="flex items-center gap-2">
              <BookOpen size={18} style={{ color: TEACHER_COLORS.PRIMARY_BLUE }} />
              <h2 style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-xl font-bold">
                Course Overview
              </h2>
            </div>
            <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="mt-3 text-sm leading-6">
              This view groups your assigned rows by class, so you can jump into the exact section you teach for this course.
            </p>
          </div>

          <div className="rounded-3xl border bg-white p-5" style={{ borderColor: TEACHER_COLORS.BORDER }}>
            <div className="flex items-center gap-2">
              <FileText size={18} style={{ color: TEACHER_COLORS.PRIMARY_BLUE }} />
              <h2 style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-xl font-bold">
                Quick Actions
              </h2>
            </div>
            <div className="mt-4 grid gap-3">
              <button
                type="button"
                onClick={() => navigate('/teacher/materials')}
                className="rounded-2xl px-4 py-3 text-left text-sm font-semibold transition-all"
                style={{ color: TEACHER_COLORS.PRIMARY_BLUE, backgroundColor: `${TEACHER_COLORS.PRIMARY_BLUE}10` }}
              >
                Upload or review materials for this course
              </button>
              <button
                type="button"
                onClick={() => navigate('/teacher/assignments')}
                className="rounded-2xl px-4 py-3 text-left text-sm font-semibold transition-all"
                style={{ color: TEACHER_COLORS.GRADE, backgroundColor: `${TEACHER_COLORS.GRADE}10` }}
              >
                Manage assignments for this course
              </button>
            </div>
          </div>
        </aside>
      </div>
    </motion.div>
  );
};

export default TeacherCourseDetails;
