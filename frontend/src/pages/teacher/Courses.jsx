import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Users,
  FileText,
  ChevronDown,
  Plus,
  MoreVertical,
  BarChart3,
  Video,
  MessageSquare,
  Loader2,
  Search
} from 'lucide-react';
import { TEACHER_COLORS } from '../../constants/teacherTheme';
import contentApi from '../../api/modules/content.api';

// Course Card Component
const CourseCard = ({ course, index }) => {
  // Fallback colors for courses
  const colors = [
    { c1: '#3B82F6', c2: '#1D4ED8' },
    { c1: '#8B5CF6', c2: '#6D28D9' },
    { c1: '#EC4899', c2: '#BE185D' },
    { c1: '#10B981', c2: '#047857' },
    { c1: '#F59E0B', c2: '#D97706' },
  ];
  const colorPair = colors[index % colors.length];

  return (
    <motion.div
      className="bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-all"
      style={{ borderColor: TEACHER_COLORS.BORDER }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
    >
      <div
        className="h-24 p-6 text-white flex items-end justify-between"
        style={{
          background: `linear-gradient(135deg, ${colorPair.c1}, ${colorPair.c2})`,
        }}
      >
        <div>
          <h3 className="text-xl font-bold">{course.name}</h3>
          <p className="text-sm opacity-90">{course.grade_name || 'Academic Course'}</p>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4 pb-4 border-b" style={{ borderColor: TEACHER_COLORS.BORDER }}>
          <div className="text-center">
            <FileText size={18} style={{ color: TEACHER_COLORS.PRIMARY_BLUE }} className="mx-auto mb-2" />
            <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-xs">Materials</p>
            <p style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-lg font-bold">
              {course.materials_count || 0}
            </p>
          </div>
          <div className="text-center">
            <Users size={18} style={{ color: TEACHER_COLORS.ACCENT_TEAL }} className="mx-auto mb-2" />
            <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-xs">Students</p>
            <p style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-lg font-bold">
              Enrolled
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2">
          <motion.button
            className="p-2 rounded-lg text-center text-xs font-medium transition-all"
            style={{
              color: TEACHER_COLORS.PRIMARY_BLUE,
              backgroundColor: `${TEACHER_COLORS.PRIMARY_BLUE}10`,
            }}
            whileHover={{ backgroundColor: `${TEACHER_COLORS.PRIMARY_BLUE}20` }}
          >
            <Video size={14} className="mx-auto mb-1" />
            Live
          </motion.button>
          <motion.button
            className="p-2 rounded-lg text-center text-xs font-medium transition-all"
            style={{
              color: TEACHER_COLORS.SECONDARY_INDIGO,
              backgroundColor: `${TEACHER_COLORS.SECONDARY_INDIGO}10`,
            }}
            whileHover={{ backgroundColor: `${TEACHER_COLORS.SECONDARY_INDIGO}20` }}
          >
            <MessageSquare size={14} className="mx-auto mb-1" />
            Discuss
          </motion.button>
          <motion.button
            className="p-2 rounded-lg text-center text-xs font-medium transition-all"
            style={{
              color: TEACHER_COLORS.ACCENT_TEAL,
              backgroundColor: `${TEACHER_COLORS.ACCENT_TEAL}10`,
            }}
            whileHover={{ backgroundColor: `${TEACHER_COLORS.ACCENT_TEAL}20` }}
          >
            <BarChart3 size={14} className="mx-auto mb-1" />
            Stats
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const TeacherCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await contentApi.getCourses();
        setCourses(response.data.data);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter((course) =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <motion.div className="p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-3xl font-bold">
              My Courses
            </h1>
            <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="mt-2">
              Managing {courses.length} assigned courses
            </p>
          </div>
          <motion.button
            className="px-6 py-3 rounded-lg font-medium text-white flex items-center gap-2"
            style={{ backgroundColor: TEACHER_COLORS.CREATE }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={20} />
            New Course
          </motion.button>
        </div>

        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search your courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border outline-none focus:ring-2 transition-all shadow-sm"
            style={{
              borderColor: TEACHER_COLORS.BORDER,
            }}
          />
        </div>
      </header>

      <AnimatePresence>
        {filteredCourses.length === 0 ? (
          <motion.div
            className="text-center py-20 bg-white rounded-3xl border border-dashed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <BookOpen size={48} style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="mx-auto mb-4 opacity-30" />
            <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-lg font-medium">
              No courses found.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => (
              <CourseCard key={course.id} course={course} index={index} />
            ))}
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TeacherCourses;
