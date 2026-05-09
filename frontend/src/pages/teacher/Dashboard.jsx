import { motion } from 'framer-motion';
import { TrendingUp, BookOpen, CheckCircle, Clock, AlertCircle, Zap } from 'lucide-react';
import { TEACHER_COLORS, TEACHER_SHADOWS } from '../../constants/teacherTheme';

// Quick Stats Card Component
const StatCard = ({ icon: Icon, label, value, change, color = TEACHER_COLORS.PRIMARY_BLUE }) => (
  <motion.div
    className="bg-white p-6 rounded-2xl border transition-all hover:shadow-lg"
    style={{ borderColor: TEACHER_COLORS.BORDER }}
    whileHover={{ y: -4 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div className="flex items-start justify-between">
      <div>
        <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-sm font-medium">
          {label}
        </p>
        <p style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-3xl font-bold mt-2">
          {value}
        </p>
        {change && (
          <p className="text-xs mt-2 flex items-center gap-1" style={{ color: TEACHER_COLORS.SUCCESS }}>
            <TrendingUp size={14} /> {change}
          </p>
        )}
      </div>
      <div className="p-3 rounded-lg" style={{ backgroundColor: `${color}20` }}>
        <Icon size={24} style={{ color }} />
      </div>
    </div>
  </motion.div>
);

// Pending Grading Item
const GradingItem = ({ studentName, course, submissions, daysLeft }) => (
  <motion.div
    className="p-4 bg-white rounded-lg border flex items-center justify-between hover:shadow-md transition-all"
    style={{ borderColor: TEACHER_COLORS.BORDER }}
    whileHover={{ x: 4 }}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
  >
    <div className="flex-1">
      <p style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="font-medium">
        {studentName}
      </p>
      <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-sm">
        {course} • {submissions} submission{submissions !== 1 ? 's' : ''}
      </p>
    </div>
    <div className="flex items-center gap-3">
      {daysLeft <= 1 ? (
        <span
          className="px-3 py-1 rounded-full text-xs font-semibold"
          style={{ backgroundColor: `${TEACHER_COLORS.DANGER}20`, color: TEACHER_COLORS.DANGER }}
        >
          Due Today
        </span>
      ) : (
        <span
          className="px-3 py-1 rounded-full text-xs font-semibold"
          style={{ backgroundColor: `${TEACHER_COLORS.WARNING}20`, color: TEACHER_COLORS.WARNING }}
        >
          {daysLeft} days left
        </span>
      )}
      <motion.button
        className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all"
        style={{ backgroundColor: TEACHER_COLORS.GRADE }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Grade
      </motion.button>
    </div>
  </motion.div>
);

// Upcoming Classes Item
const ClassItem = ({ courseName, section, time, students }) => (
  <motion.div
    className="p-4 bg-white rounded-lg border flex items-center gap-4 hover:shadow-md transition-all"
    style={{ borderColor: TEACHER_COLORS.BORDER }}
    whileHover={{ y: -2 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div
      className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
      style={{ backgroundColor: TEACHER_COLORS.CREATE }}
    >
      {section.slice(0, 2).toUpperCase()}
    </div>
    <div className="flex-1">
      <p style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="font-medium">
        {courseName}
      </p>
      <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-sm">
        {section} • {students} students
      </p>
    </div>
    <div className="flex items-center gap-2">
      <Clock size={16} style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} />
      <span style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="font-medium">
        {time}
      </span>
    </div>
  </motion.div>
);

// Recent Activity Item
const ActivityItem = ({ type, student, course, time }) => (
  <motion.div
    className="p-4 border-b flex items-center gap-4"
    style={{ borderColor: TEACHER_COLORS.BORDER }}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
  >
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center"
      style={{
        backgroundColor:
          type === 'submission'
            ? `${TEACHER_COLORS.CREATE}20`
            : type === 'discussion'
            ? `${TEACHER_COLORS.SECONDARY_INDIGO}20`
            : `${TEACHER_COLORS.SUCCESS}20`,
      }}
    >
      {type === 'submission' ? (
        <CheckCircle size={18} style={{ color: TEACHER_COLORS.CREATE }} />
      ) : type === 'discussion' ? (
        <MessageCircle size={18} style={{ color: TEACHER_COLORS.SECONDARY_INDIGO }} />
      ) : (
        <TrendingUp size={18} style={{ color: TEACHER_COLORS.SUCCESS }} />
      )}
    </div>
    <div className="flex-1">
      <p style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-sm font-medium">
        {type === 'submission'
          ? `${student} submitted in ${course}`
          : type === 'discussion'
          ? `${student} replied in ${course}`
          : `${student} improved in ${course}`}
      </p>
      <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-xs">
        {time}
      </p>
    </div>
  </motion.div>
);

const TeacherDashboard = () => {
  // Mock data
  const gradingQueue = [
    { studentName: 'Zainab Hassan', course: 'Mathematics 101', submissions: 3, daysLeft: 0 },
    { studentName: 'Ahmed Ibrahim', course: 'Physics 102', submissions: 2, daysLeft: 1 },
    { studentName: 'Fatima Yusuf', course: 'Chemistry 101', submissions: 1, daysLeft: 2 },
    { studentName: 'Karim Ali', course: 'Biology 103', submissions: 4, daysLeft: 3 },
  ];

  const upcomingClasses = [
    { courseName: 'Mathematics 101', section: 'Section A', time: '10:00 AM', students: 32 },
    { courseName: 'Physics 102', section: 'Section B', time: '11:30 AM', students: 28 },
    { courseName: 'Chemistry 101', section: 'Section A', time: '2:00 PM', students: 35 },
  ];

  const recentActivity = [
    { type: 'submission', student: 'Zainab Hassan', course: 'Mathematics 101', time: '2 min ago' },
    { type: 'discussion', student: 'Ahmed Ibrahim', course: 'Physics 102', time: '15 min ago' },
    { type: 'milestone', student: 'Fatima Yusuf', course: 'Chemistry 101', time: '1 hour ago' },
    { type: 'submission', student: 'Karim Ali', course: 'Biology 103', time: '3 hours ago' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <motion.div className="p-8" variants={containerVariants} initial="hidden" animate="visible">
      {/* Welcome Banner */}
      <motion.div
        className="mb-8 p-8 rounded-2xl text-white"
        style={{
          background: `linear-gradient(135deg, ${TEACHER_COLORS.PRIMARY_BLUE}, ${TEACHER_COLORS.SECONDARY_INDIGO})`,
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">Welcome back, Dr. Daniel 👋</h1>
        <p className="text-blue-100 flex items-center gap-2">
          <AlertCircle size={18} />
          You have 24 submissions waiting for grading
        </p>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={BookOpen}
          label="Active Courses"
          value="8"
          change="2 new this semester"
          color={TEACHER_COLORS.PRIMARY_BLUE}
        />
        <StatCard
          icon={Users}
          label="Total Students"
          value="127"
          change="+12 this week"
          color={TEACHER_COLORS.SECONDARY_INDIGO}
        />
        <StatCard
          icon={CheckCircle}
          label="Pending Submissions"
          value="24"
          change="5 overdue"
          color={TEACHER_COLORS.DANGER}
        />
        <StatCard
          icon={Clock}
          label="Upcoming Classes"
          value="3"
          change="Today"
          color={TEACHER_COLORS.ACCENT_TEAL}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Grading Queue - Left Column (spans 2 on desktop) */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-xl font-bold">
              Pending Grading Queue
            </h2>
            <motion.button
              className="text-sm font-medium px-4 py-2 rounded-lg transition-all"
              style={{
                color: TEACHER_COLORS.PRIMARY_BLUE,
                backgroundColor: `${TEACHER_COLORS.PRIMARY_BLUE}10`,
              }}
              whileHover={{ backgroundColor: `${TEACHER_COLORS.PRIMARY_BLUE}20` }}
            >
              View All
            </motion.button>
          </div>

          <div className="space-y-4">
            {gradingQueue.map((item, index) => (
              <GradingItem key={index} {...item} />
            ))}
          </div>
        </motion.div>

        {/* Right Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Upcoming Classes */}
          <div>
            <h3 style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-lg font-bold mb-4">
              Today's Classes
            </h3>
            <div className="space-y-3">
              {upcomingClasses.map((classItem, index) => (
                <ClassItem key={index} {...classItem} />
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-lg font-bold mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <motion.button
                className="w-full py-3 rounded-lg font-medium transition-all text-white flex items-center justify-center gap-2"
                style={{ backgroundColor: TEACHER_COLORS.CREATE }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Zap size={18} />
                Create Assignment
              </motion.button>
              <motion.button
                className="w-full py-3 rounded-lg font-medium transition-all text-white flex items-center justify-center gap-2"
                style={{ backgroundColor: TEACHER_COLORS.GRADE }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <CheckCircle size={18} />
                Start Grading
              </motion.button>
              <motion.button
                className="w-full py-3 rounded-lg font-medium transition-all text-white flex items-center justify-center gap-2"
                style={{ backgroundColor: TEACHER_COLORS.ACCENT_TEAL }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FileText size={18} />
                Upload Material
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity - Full Width */}
      <motion.div
        className="mt-8 bg-white rounded-2xl border overflow-hidden"
        style={{ borderColor: TEACHER_COLORS.BORDER }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="p-6 border-b" style={{ borderColor: TEACHER_COLORS.BORDER }}>
          <h3 style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-lg font-bold">
            Recent Student Activity
          </h3>
        </div>
        <div>
          {recentActivity.map((activity, index) => (
            <ActivityItem key={index} {...activity} />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Import missing icon
import { MessageCircle, Users } from 'lucide-react';

export default TeacherDashboard;
