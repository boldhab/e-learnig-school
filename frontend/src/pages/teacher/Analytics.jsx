import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { TrendingUp, Users, Award, Calendar } from 'lucide-react';
import { TEACHER_COLORS } from '../../constants/teacherTheme';

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, change, color }) => (
  <motion.div
    className="bg-white p-6 rounded-xl border"
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
          <p className="text-xs mt-2" style={{ color: TEACHER_COLORS.SUCCESS }}>
            {change}
          </p>
        )}
      </div>
      <div className="p-3 rounded-lg" style={{ backgroundColor: `${color}20` }}>
        <Icon size={24} style={{ color }} />
      </div>
    </div>
  </motion.div>
);

const TeacherAnalytics = () => {
  // Mock data
  const assignmentCompletionData = [
    { name: 'Mon', completed: 24, submitted: 18 },
    { name: 'Tue', completed: 28, submitted: 22 },
    { name: 'Wed', completed: 32, submitted: 26 },
    { name: 'Thu', completed: 30, submitted: 25 },
    { name: 'Fri', completed: 35, submitted: 32 },
    { name: 'Sat', completed: 28, submitted: 24 },
    { name: 'Sun', completed: 20, submitted: 18 },
  ];

  const attendanceTrendData = [
    { name: 'Week 1', attendance: 92 },
    { name: 'Week 2', attendance: 89 },
    { name: 'Week 3', attendance: 95 },
    { name: 'Week 4', attendance: 88 },
    { name: 'Week 5', attendance: 93 },
    { name: 'Week 6', attendance: 91 },
  ];

  const performanceDistribution = [
    { name: 'A (90-100)', value: 8, color: TEACHER_COLORS.SUCCESS },
    { name: 'B (80-89)', value: 14, color: TEACHER_COLORS.PRIMARY_BLUE },
    { name: 'C (70-79)', value: 7, color: TEACHER_COLORS.WARNING },
    { name: 'D (60-69)', value: 2, color: TEACHER_COLORS.DANGER },
    { name: 'F (<60)', value: 1, color: TEACHER_COLORS.TEXT_SECONDARY },
  ];

  const engagementData = [
    { name: 'Discussion Posts', value: 245 },
    { name: 'Assignments', value: 189 },
    { name: 'Quiz Attempts', value: 156 },
    { name: 'Live Class', value: 128 },
    { name: 'Material Views', value: 467 },
  ];

  return (
    <motion.div className="p-8">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-3xl font-bold">
          Analytics
        </h1>
        <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="mt-2">
          Comprehensive insights into your classroom
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Users}
          label="Active Students"
          value="127"
          change="+8 this week"
          color={TEACHER_COLORS.PRIMARY_BLUE}
        />
        <StatCard
          icon={TrendingUp}
          label="Average Score"
          value="82%"
          change="+5% trend"
          color={TEACHER_COLORS.SUCCESS}
        />
        <StatCard
          icon={Award}
          label="Completion Rate"
          value="94%"
          change="+3% this week"
          color={TEACHER_COLORS.ACCENT_TEAL}
        />
        <StatCard
          icon={Calendar}
          label="Avg Attendance"
          value="91%"
          change="-2% this week"
          color={TEACHER_COLORS.SECONDARY_INDIGO}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Assignment Completion Chart */}
        <motion.div
          className="bg-white p-6 rounded-xl border"
          style={{ borderColor: TEACHER_COLORS.BORDER }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="font-bold mb-4">
            Assignment Completion
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={assignmentCompletionData}>
              <CartesianGrid stroke={TEACHER_COLORS.BORDER} />
              <XAxis stroke={TEACHER_COLORS.TEXT_SECONDARY} />
              <YAxis stroke={TEACHER_COLORS.TEXT_SECONDARY} />
              <Tooltip
                contentStyle={{
                  backgroundColor: TEACHER_COLORS.CARD,
                  border: `1px solid ${TEACHER_COLORS.BORDER}`,
                }}
              />
              <Legend />
              <Bar dataKey="completed" fill={TEACHER_COLORS.PRIMARY_BLUE} radius={[8, 8, 0, 0]} />
              <Bar dataKey="submitted" fill={TEACHER_COLORS.SUCCESS} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Attendance Trend Chart */}
        <motion.div
          className="bg-white p-6 rounded-xl border"
          style={{ borderColor: TEACHER_COLORS.BORDER }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="font-bold mb-4">
            Attendance Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={attendanceTrendData}>
              <defs>
                <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={TEACHER_COLORS.SUCCESS} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={TEACHER_COLORS.SUCCESS} stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={TEACHER_COLORS.BORDER} />
              <XAxis stroke={TEACHER_COLORS.TEXT_SECONDARY} />
              <YAxis stroke={TEACHER_COLORS.TEXT_SECONDARY} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: TEACHER_COLORS.CARD,
                  border: `1px solid ${TEACHER_COLORS.BORDER}`,
                }}
              />
              <Area
                type="monotone"
                dataKey="attendance"
                stroke={TEACHER_COLORS.SUCCESS}
                fillOpacity={1}
                fill="url(#colorAttendance)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Performance and Engagement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Distribution */}
        <motion.div
          className="bg-white p-6 rounded-xl border"
          style={{ borderColor: TEACHER_COLORS.BORDER }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="font-bold mb-4">
            Grade Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={performanceDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {performanceDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: TEACHER_COLORS.CARD,
                  border: `1px solid ${TEACHER_COLORS.BORDER}`,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Engagement Metrics */}
        <motion.div
          className="bg-white p-6 rounded-xl border"
          style={{ borderColor: TEACHER_COLORS.BORDER }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="font-bold mb-4">
            Student Engagement
          </h3>
          <div className="space-y-4">
            {engagementData.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-sm font-medium">
                    {item.name}
                  </span>
                  <span style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="font-bold">
                    {item.value}
                  </span>
                </div>
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: TEACHER_COLORS.BACKGROUND }}
                >
                  <motion.div
                    className="h-full"
                    style={{
                      backgroundColor: TEACHER_COLORS.PRIMARY_BLUE,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.value / 467) * 100}%` }}
                    transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TeacherAnalytics;
