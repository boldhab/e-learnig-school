import { motion } from 'framer-motion';
import { TrendingUp, BookOpen, CheckCircle, Award } from 'lucide-react';
import { COLORS } from '../../constants/theme';

// Quick Stats Card Component
const StatCard = ({ icon: Icon, label, value, change, color = COLORS.PRIMARY_BLUE }) => (
  <motion.div
    className="bg-white p-6 rounded-2xl border transition-all hover:shadow-lg"
    style={{ borderColor: COLORS.BORDER }}
    whileHover={{ y: -4 }}
    transition={{ type: 'spring', stiffness: 300 }}
  >
    <div className="flex items-start justify-between mb-4">
      <div
        className="p-3 rounded-lg"
        style={{
          backgroundColor: `${color}15`,
        }}
      >
        <Icon size={24} style={{ color }} />
      </div>
      {change && (
        <span
          className="text-sm font-semibold px-2 py-1 rounded-full"
          style={{
            backgroundColor: `${COLORS.EMERALD_GREEN}15`,
            color: COLORS.EMERALD_GREEN,
          }}
        >
          +{change}%
        </span>
      )}
    </div>
    <p style={{ color: COLORS.TEXT_SECONDARY }} className="text-sm font-medium mb-1">
      {label}
    </p>
    <p
      style={{ color: COLORS.TEXT_PRIMARY }}
      className="text-2xl font-bold"
    >
      {value}
    </p>
  </motion.div>
);

// Hero Section Component
const HeroSection = () => (
  <motion.div
    className="relative mb-8 p-8 rounded-2xl overflow-hidden"
    style={{
      background: `linear-gradient(135deg, ${COLORS.PRIMARY_BLUE}, ${COLORS.INDIGO})`,
      color: '#FFFFFF',
    }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
  >
    <div className="relative z-10">
      <h1 className="text-4xl font-bold mb-2">Ready to continue your learning today?</h1>
      <p className="text-blue-100 text-lg">You have 3 pending assignments and 2 new discussions</p>
    </div>
    <div className="absolute top-0 right-0 opacity-10 text-white">
      <BookOpen size={300} />
    </div>
  </motion.div>
);

// Today's Classes Component
const TodaysClasses = () => (
  <motion.div
    className="bg-white p-6 rounded-2xl border mb-8"
    style={{ borderColor: COLORS.BORDER }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
  >
    <h2 className="text-xl font-bold mb-4" style={{ color: COLORS.TEXT_PRIMARY }}>
      Today's Classes
    </h2>
    <div className="space-y-3">
      {[
        { time: '10:00 AM', course: 'Web Development', teacher: 'Mr. Smith', room: 'Room 101' },
        { time: '01:00 PM', course: 'Data Structures', teacher: 'Dr. Johnson', room: 'Online' },
        { time: '03:30 PM', course: 'Database Design', teacher: 'Prof. Williams', room: 'Lab 5' },
      ].map((cls, idx) => (
        <motion.div
          key={idx}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          whileHover={{ x: 4 }}
        >
          <div>
            <p className="font-semibold" style={{ color: COLORS.TEXT_PRIMARY }}>
              {cls.course}
            </p>
            <p style={{ color: COLORS.TEXT_SECONDARY }} className="text-sm">
              {cls.teacher} • {cls.room}
            </p>
          </div>
          <span className="font-semibold" style={{ color: COLORS.PRIMARY_BLUE }}>
            {cls.time}
          </span>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

// Upcoming Assignments Component
const UpcomingAssignments = () => (
  <motion.div
    className="bg-white p-6 rounded-2xl border mb-8"
    style={{ borderColor: COLORS.BORDER }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4 }}
  >
    <h2 className="text-xl font-bold mb-4" style={{ color: COLORS.TEXT_PRIMARY }}>
      Upcoming Assignments
    </h2>
    <div className="space-y-3">
      {[
        { title: 'React Project', due: 'May 12, 2026', subject: 'Web Development', status: 'pending' },
        { title: 'Database Design Doc', due: 'May 15, 2026', subject: 'Database Design', status: 'pending' },
        { title: 'Algorithm Analysis', due: 'May 18, 2026', subject: 'Data Structures', status: 'submitted' },
      ].map((assignment, idx) => (
        <motion.div
          key={idx}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          whileHover={{ x: 4 }}
        >
          <div className="flex-1">
            <p className="font-semibold" style={{ color: COLORS.TEXT_PRIMARY }}>
              {assignment.title}
            </p>
            <p style={{ color: COLORS.TEXT_SECONDARY }} className="text-sm">
              {assignment.subject}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span style={{ color: COLORS.TEXT_SECONDARY }} className="text-sm">
              {assignment.due}
            </span>
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                backgroundColor:
                  assignment.status === 'pending'
                    ? `${COLORS.WARNING}15`
                    : `${COLORS.EMERALD_GREEN}15`,
                color:
                  assignment.status === 'pending'
                    ? COLORS.WARNING
                    : COLORS.EMERALD_GREEN,
              }}
            >
              {assignment.status === 'pending' ? 'Pending' : 'Submitted'}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

// Recent Materials Component
const RecentMaterials = () => (
  <motion.div
    className="bg-white p-6 rounded-2xl border mb-8"
    style={{ borderColor: COLORS.BORDER }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5 }}
  >
    <h2 className="text-xl font-bold mb-4" style={{ color: COLORS.TEXT_PRIMARY }}>
      Recent Learning Materials
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[
        { title: 'React Hooks Guide', type: 'PDF', course: 'Web Development', date: '2 days ago' },
        { title: 'Database Normalization', type: 'Video', course: 'Database Design', date: '3 days ago' },
        { title: 'Algorithm Complexity', type: 'PDF', course: 'Data Structures', date: '4 days ago' },
        { title: 'REST API Design', type: 'Article', course: 'Web Development', date: '5 days ago' },
      ].map((material, idx) => (
        <motion.div
          key={idx}
          className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          whileHover={{ y: -4 }}
        >
          <div className="flex items-start justify-between mb-2">
            <p className="font-semibold" style={{ color: COLORS.TEXT_PRIMARY }}>
              {material.title}
            </p>
            <span
              className="text-xs font-semibold px-2 py-1 rounded"
              style={{
                backgroundColor: `${COLORS.PRIMARY_BLUE}15`,
                color: COLORS.PRIMARY_BLUE,
              }}
            >
              {material.type}
            </span>
          </div>
          <p style={{ color: COLORS.TEXT_SECONDARY }} className="text-sm">
            {material.course}
          </p>
          <p style={{ color: COLORS.TEXT_SECONDARY }} className="text-xs mt-2">
            {material.date}
          </p>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

// Performance Summary Component
const PerformanceSummary = () => (
  <motion.div
    className="bg-white p-6 rounded-2xl border"
    style={{ borderColor: COLORS.BORDER }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.6 }}
  >
    <h2 className="text-xl font-bold mb-4" style={{ color: COLORS.TEXT_PRIMARY }}>
      Performance Summary
    </h2>
    <div className="space-y-4">
      {[
        { subject: 'Web Development', score: 92, target: 100 },
        { subject: 'Database Design', score: 88, target: 100 },
        { subject: 'Data Structures', score: 85, target: 100 },
      ].map((performance, idx) => (
        <div key={idx}>
          <div className="flex justify-between mb-2">
            <p className="text-sm font-semibold" style={{ color: COLORS.TEXT_PRIMARY }}>
              {performance.subject}
            </p>
            <p className="text-sm font-semibold" style={{ color: COLORS.PRIMARY_BLUE }}>
              {performance.score}/{performance.target}
            </p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="h-2 rounded-full"
              style={{ backgroundColor: COLORS.PRIMARY_BLUE }}
              initial={{ width: 0 }}
              animate={{ width: `${(performance.score / performance.target) * 100}%` }}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
            />
          </div>
        </div>
      ))}
    </div>
  </motion.div>
);

// Main Dashboard Component
const Dashboard = () => {
  return (
    <div className="p-6 pb-12">
      {/* Hero Section */}
      <HeroSection />

      {/* Quick Stats */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
      >
        <StatCard
          icon={BookOpen}
          label="Active Courses"
          value="5"
          change={20}
          color={COLORS.PRIMARY_BLUE}
        />
        <StatCard
          icon={CheckCircle}
          label="Pending Assignments"
          value="3"
          change={-10}
          color={COLORS.WARNING}
        />
        <StatCard
          icon={Award}
          label="Attendance Rate"
          value="92%"
          change={5}
          color={COLORS.EMERALD_GREEN}
        />
        <StatCard
          icon={TrendingUp}
          label="Average Grade"
          value="3.8 GPA"
          change={8}
          color={COLORS.INDIGO}
        />
      </motion.div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <TodaysClasses />
          <UpcomingAssignments />
        </div>

        {/* Sidebar Content */}
        <div>
          <RecentMaterials />
        </div>
      </div>

      {/* Performance Summary */}
      <div className="mt-8">
        <PerformanceSummary />
      </div>
    </div>
  );
};

export default Dashboard;
