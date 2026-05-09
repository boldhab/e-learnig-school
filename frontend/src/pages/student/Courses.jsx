import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, FileText, Calendar, ChevronRight } from 'lucide-react';
import { COLORS } from '../../constants/theme';

// Course Card Component
const CourseCard = ({ course, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="bg-white rounded-2xl overflow-hidden border transition-all hover:shadow-lg cursor-pointer h-full flex flex-col"
      style={{ borderColor: COLORS.BORDER }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -8 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      {/* Course Banner */}
      <div
        className="h-32 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${course.color1}, ${course.color2})`,
        }}
      >
        <motion.div
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full"
        />
      </div>

      {/* Course Content */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Course Title and Badge */}
        <div className="mb-3">
          <h3 className="text-lg font-bold mb-2" style={{ color: COLORS.TEXT_PRIMARY }}>
            {course.title}
          </h3>
          <p style={{ color: COLORS.TEXT_SECONDARY }} className="text-sm">
            {course.teacher}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-xs font-semibold" style={{ color: COLORS.TEXT_SECONDARY }}>
              Progress
            </span>
            <span className="text-xs font-bold" style={{ color: COLORS.PRIMARY_BLUE }}>
              {course.progress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="h-2 rounded-full"
              style={{ backgroundColor: COLORS.PRIMARY_BLUE }}
              initial={{ width: 0 }}
              animate={{ width: `${course.progress}%` }}
              transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
            />
          </div>
        </div>

        {/* Course Info */}
        <div className="grid grid-cols-2 gap-3 mb-4 py-3 border-t border-b" style={{ borderColor: COLORS.BORDER }}>
          <div className="flex items-center gap-2">
            <FileText size={16} style={{ color: COLORS.TEXT_SECONDARY }} />
            <span className="text-xs" style={{ color: COLORS.TEXT_SECONDARY }}>
              {course.materials} Materials
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={16} style={{ color: COLORS.TEXT_SECONDARY }} />
            <span className="text-xs" style={{ color: COLORS.TEXT_SECONDARY }}>
              {course.students} Students
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} style={{ color: COLORS.TEXT_SECONDARY }} />
            <span className="text-xs" style={{ color: COLORS.TEXT_SECONDARY }}>
              {course.duration}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={16} style={{ color: COLORS.TEXT_SECONDARY }} />
            <span className="text-xs" style={{ color: COLORS.TEXT_SECONDARY }}>
              {course.nextClass}
            </span>
          </div>
        </div>

        {/* Next Class */}
        <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: COLORS.BACKGROUND }}>
          <p className="text-xs font-semibold mb-1" style={{ color: COLORS.TEXT_SECONDARY }}>
            Next Class
          </p>
          <p className="text-sm font-bold" style={{ color: COLORS.PRIMARY_BLUE }}>
            {course.nextClassTime}
          </p>
        </div>

        {/* Action Button */}
        <motion.button
          className="mt-auto w-full py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
          style={{
            backgroundColor: COLORS.PRIMARY_BLUE,
            color: '#FFFFFF',
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Go to Course
          <ChevronRight size={16} />
        </motion.button>
      </div>
    </motion.div>
  );
};

// Filter Tabs Component
const FilterTabs = ({ activeTab, setActiveTab }) => (
  <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
    {['All Courses', 'Active', 'Completed', 'Archived'].map((tab) => (
      <motion.button
        key={tab}
        onClick={() => setActiveTab(tab)}
        className="px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all"
        style={{
          backgroundColor: activeTab === tab ? COLORS.PRIMARY_BLUE : COLORS.BACKGROUND,
          color: activeTab === tab ? '#FFFFFF' : COLORS.TEXT_PRIMARY,
          border: activeTab === tab ? 'none' : `1px solid ${COLORS.BORDER}`,
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {tab}
      </motion.button>
    ))}
  </div>
);

// Main Courses Page Component
const CoursesPage = () => {
  const [activeTab, setActiveTab] = useState('All Courses');

  const courses = [
    {
      title: 'Advanced Web Development',
      teacher: 'Prof. John Smith',
      progress: 75,
      materials: 24,
      students: 45,
      duration: '12 weeks',
      nextClass: 'Today',
      nextClassTime: 'Today at 10:00 AM',
      color1: COLORS.PRIMARY_BLUE,
      color2: COLORS.INDIGO,
    },
    {
      title: 'Database Design & SQL',
      teacher: 'Dr. Sarah Johnson',
      progress: 60,
      materials: 18,
      students: 38,
      duration: '8 weeks',
      nextClass: 'Tomorrow',
      nextClassTime: 'Tomorrow at 2:00 PM',
      color1: COLORS.EMERALD_GREEN,
      color2: '#06B6D4',
    },
    {
      title: 'Data Structures & Algorithms',
      teacher: 'Prof. Michael Brown',
      progress: 85,
      materials: 32,
      students: 52,
      duration: '16 weeks',
      nextClass: '2 days',
      nextClassTime: 'May 11 at 11:00 AM',
      color1: '#F59E0B',
      color2: '#EC4899',
    },
    {
      title: 'UI/UX Design Principles',
      teacher: 'Emma Wilson',
      progress: 45,
      materials: 15,
      students: 28,
      duration: '6 weeks',
      nextClass: '3 days',
      nextClassTime: 'May 12 at 3:00 PM',
      color1: '#8B5CF6',
      color2: '#6366F1',
    },
    {
      title: 'Cloud Computing with AWS',
      teacher: 'Alex Kumar',
      progress: 30,
      materials: 20,
      students: 35,
      duration: '10 weeks',
      nextClass: '4 days',
      nextClassTime: 'May 13 at 9:00 AM',
      color1: '#EF4444',
      color2: '#F97316',
    },
    {
      title: 'Machine Learning Basics',
      teacher: 'Dr. Lisa Anderson',
      progress: 55,
      materials: 28,
      students: 42,
      duration: '14 weeks',
      nextClass: '5 days',
      nextClassTime: 'May 14 at 1:00 PM',
      color1: '#10B981',
      color2: '#14B8A6',
    },
  ];

  return (
    <div className="p-6 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.TEXT_PRIMARY }}>
          My Courses
        </h1>
        <p style={{ color: COLORS.TEXT_SECONDARY }} className="text-lg">
          You are enrolled in {courses.length} courses
        </p>
      </motion.div>

      {/* Filter Tabs */}
      <FilterTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Courses Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.05 }}
      >
        {courses.map((course, index) => (
          <CourseCard key={course.title} course={course} index={index} />
        ))}
      </motion.div>
    </div>
  );
};

export default CoursesPage;
