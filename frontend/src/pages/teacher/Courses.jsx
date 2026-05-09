import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Users,
  FileText,
  Zap,
  ChevronDown,
  Plus,
  MoreVertical,
  BarChart3,
  Video,
  MessageSquare,
} from 'lucide-react';
import { TEACHER_COLORS, TEACHER_SHADOWS } from '../../constants/teacherTheme';

// Course Card Component
const CourseCard = ({ course, index }) => (
  <motion.div
    className="bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-all"
    style={{ borderColor: TEACHER_COLORS.BORDER }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    whileHover={{ y: -4 }}
  >
    {/* Header with gradient */}
    <div
      className="h-24 p-6 text-white flex items-end justify-between"
      style={{
        background: `linear-gradient(135deg, ${course.color1}, ${course.color2})`,
      }}
    >
      <div>
        <h3 className="text-xl font-bold">{course.name}</h3>
        <p className="text-sm opacity-90">{course.section}</p>
      </div>
      <motion.button
        className="p-2 rounded-lg hover:bg-white hover:bg-opacity-20"
        whileHover={{ scale: 1.1 }}
      >
        <MoreVertical size={18} />
      </motion.button>
    </div>

    {/* Course Info */}
    <div className="p-6 space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 pb-4 border-b" style={{ borderColor: TEACHER_COLORS.BORDER }}>
        <div className="text-center">
          <Users size={18} style={{ color: TEACHER_COLORS.PRIMARY_BLUE }} className="mx-auto mb-2" />
          <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-xs">
            Students
          </p>
          <p style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-lg font-bold">
            {course.students}
          </p>
        </div>
        <div className="text-center">
          <FileText size={18} style={{ color: TEACHER_COLORS.SECONDARY_INDIGO }} className="mx-auto mb-2" />
          <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-xs">
            Materials
          </p>
          <p style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-lg font-bold">
            {course.materials}
          </p>
        </div>
        <div className="text-center">
          <BookOpen size={18} style={{ color: TEACHER_COLORS.ACCENT_TEAL }} className="mx-auto mb-2" />
          <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-xs">
            Assignments
          </p>
          <p style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-lg font-bold">
            {course.assignments}
          </p>
        </div>
      </div>

      {/* Course Details */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-sm">
            Next Class
          </span>
          <span style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="font-medium">
            {course.nextClass}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-sm">
            Enrollment
          </span>
          <span style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="font-medium">
            {course.enrolled}% enrolled
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div
        className="h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: TEACHER_COLORS.BACKGROUND }}
      >
        <motion.div
          className="h-full"
          style={{ backgroundColor: course.color1 }}
          initial={{ width: 0 }}
          animate={{ width: `${course.enrolled}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <motion.button
          className="p-3 rounded-lg flex items-center justify-center gap-2 text-sm font-medium text-white transition-all"
          style={{ backgroundColor: TEACHER_COLORS.CREATE }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FileText size={16} />
          Upload
        </motion.button>
        <motion.button
          className="p-3 rounded-lg flex items-center justify-center gap-2 text-sm font-medium text-white transition-all"
          style={{ backgroundColor: TEACHER_COLORS.PRIMARY_BLUE }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <BookOpen size={16} />
          Assign
        </motion.button>
      </div>

      {/* View Options */}
      <div className="grid grid-cols-3 gap-2 pt-2">
        <motion.button
          className="p-2 rounded-lg text-center text-xs font-medium transition-all"
          style={{
            color: TEACHER_COLORS.PRIMARY_BLUE,
            backgroundColor: `${TEACHER_COLORS.PRIMARY_BLUE}10`,
          }}
          whileHover={{
            backgroundColor: `${TEACHER_COLORS.PRIMARY_BLUE}20`,
          }}
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
          whileHover={{
            backgroundColor: `${TEACHER_COLORS.SECONDARY_INDIGO}20`,
          }}
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
          whileHover={{
            backgroundColor: `${TEACHER_COLORS.ACCENT_TEAL}20`,
          }}
        >
          <BarChart3 size={14} className="mx-auto mb-1" />
          Analytics
        </motion.button>
      </div>
    </div>
  </motion.div>
);

// Filter Tabs Component
const FilterTabs = ({ activeFilter, setActiveFilter }) => {
  const filters = ['All', 'Active', 'Drafts', 'Archived'];

  return (
    <div className="flex gap-2">
      {filters.map((filter) => (
        <motion.button
          key={filter}
          onClick={() => setActiveFilter(filter)}
          className="px-4 py-2 rounded-lg font-medium transition-all"
          style={{
            backgroundColor:
              activeFilter === filter
                ? TEACHER_COLORS.PRIMARY_BLUE
                : TEACHER_COLORS.BACKGROUND,
            color:
              activeFilter === filter
                ? '#FFFFFF'
                : TEACHER_COLORS.TEXT_PRIMARY,
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {filter}
        </motion.button>
      ))}
    </div>
  );
};

const TeacherCourses = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const courses = [
    {
      name: 'Mathematics 101',
      section: 'Section A',
      students: 32,
      materials: 15,
      assignments: 8,
      nextClass: 'Today at 10:00 AM',
      enrolled: 95,
      color1: '#3B82F6',
      color2: '#1D4ED8',
    },
    {
      name: 'Physics 102',
      section: 'Section B',
      students: 28,
      materials: 12,
      assignments: 6,
      nextClass: 'Tomorrow at 2:00 PM',
      enrolled: 88,
      color1: '#8B5CF6',
      color2: '#6D28D9',
    },
    {
      name: 'Chemistry 101',
      section: 'Section A',
      students: 35,
      materials: 18,
      assignments: 7,
      nextClass: 'Mar 12 at 9:00 AM',
      enrolled: 92,
      color1: '#EC4899',
      color2: '#BE185D',
    },
    {
      name: 'Biology 103',
      section: 'Section C',
      students: 30,
      materials: 14,
      assignments: 9,
      nextClass: 'Mar 13 at 1:00 PM',
      enrolled: 90,
      color1: '#10B981',
      color2: '#047857',
    },
    {
      name: 'English 201',
      section: 'Section B',
      students: 33,
      materials: 16,
      assignments: 10,
      nextClass: 'Mar 14 at 11:00 AM',
      enrolled: 91,
      color1: '#F59E0B',
      color2: '#D97706',
    },
    {
      name: 'History 104',
      section: 'Section A',
      students: 29,
      materials: 13,
      assignments: 7,
      nextClass: 'Mar 15 at 3:00 PM',
      enrolled: 86,
      color1: '#06B6D4',
      color2: '#0891B2',
    },
  ];

  const filteredCourses = courses.filter((course) =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.section.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div className="p-8">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-3xl font-bold">
              My Courses
            </h1>
            <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="mt-2">
              Manage your {courses.length} active courses
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

        {/* Search and Filter */}
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-3 rounded-lg border outline-none focus:ring-2 transition-all"
            style={{
              borderColor: TEACHER_COLORS.BORDER,
              focusRing: `${TEACHER_COLORS.PRIMARY_BLUE}20`,
            }}
          />
          <FilterTabs activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
        </div>
      </motion.div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course, index) => (
          <CourseCard key={index} course={course} index={index} />
        ))}
      </div>

      {/* Empty State */}
      {filteredCourses.length === 0 && (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <BookOpen size={48} style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="mx-auto mb-4 opacity-50" />
          <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-lg">
            No courses found
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default TeacherCourses;
