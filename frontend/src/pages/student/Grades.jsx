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
import { TrendingUp, Award, BookOpen, AlertCircle } from 'lucide-react';
import { COLORS } from '../../constants/theme';

// GPA Card
const GPACard = ({ gpa, targetGPA }) => (
  <motion.div
    className="bg-white p-6 rounded-2xl border"
    style={{ borderColor: COLORS.BORDER }}
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
  >
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-bold" style={{ color: COLORS.TEXT_PRIMARY }}>
        Your GPA
      </h3>
      <div
        className="p-3 rounded-lg"
        style={{
          backgroundColor: `${COLORS.EMERALD_GREEN}15`,
        }}
      >
        <Award size={24} style={{ color: COLORS.EMERALD_GREEN }} />
      </div>
    </div>
    <div className="mb-4">
      <p className="text-4xl font-bold" style={{ color: COLORS.PRIMARY_BLUE }}>
        {gpa}
      </p>
      <p style={{ color: COLORS.TEXT_SECONDARY }} className="text-sm mt-1">
        Target: {targetGPA}
      </p>
    </div>
    <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: COLORS.EMERALD_GREEN }}
        initial={{ width: 0 }}
        animate={{ width: `${(gpa / targetGPA) * 100}%` }}
        transition={{ duration: 1, delay: 0.3 }}
      />
    </div>
    <p style={{ color: COLORS.TEXT_SECONDARY }} className="text-xs mt-2">
      {Math.round((gpa / targetGPA) * 100)}% of target achieved
    </p>
  </motion.div>
);

// Subject Performance Component
const SubjectPerformance = () => {
  const data = [
    { subject: 'Web Dev', score: 92, average: 85 },
    { subject: 'Database', score: 88, average: 82 },
    { subject: 'Algorithms', score: 85, average: 80 },
    { subject: 'UI/UX', score: 90, average: 83 },
    { subject: 'Cloud', score: 78, average: 77 },
    { subject: 'ML', score: 82, average: 78 },
  ];

  return (
    <motion.div
      className="bg-white p-6 rounded-2xl border"
      style={{ borderColor: COLORS.BORDER }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <h3 className="text-lg font-bold mb-6" style={{ color: COLORS.TEXT_PRIMARY }}>
        Subject Performance
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.BORDER} />
          <XAxis dataKey="subject" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="score" fill={COLORS.PRIMARY_BLUE} name="Your Score" />
          <Bar dataKey="average" fill={COLORS.BORDER} name="Class Average" />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

// Grade Trend Component
const GradeTrend = () => {
  const data = [
    { month: 'Jan', grade: 78 },
    { month: 'Feb', grade: 81 },
    { month: 'Mar', grade: 79 },
    { month: 'Apr', grade: 85 },
    { month: 'May', grade: 88 },
  ];

  return (
    <motion.div
      className="bg-white p-6 rounded-2xl border"
      style={{ borderColor: COLORS.BORDER }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <h3 className="text-lg font-bold mb-6" style={{ color: COLORS.TEXT_PRIMARY }}>
        Grade Trend
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorGrade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.PRIMARY_BLUE} stopOpacity={0.3} />
              <stop offset="95%" stopColor={COLORS.PRIMARY_BLUE} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.BORDER} />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="grade"
            stroke={COLORS.PRIMARY_BLUE}
            fillOpacity={1}
            fill="url(#colorGrade)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

// Assignment Breakdown Component
const AssignmentBreakdown = () => {
  const data = [
    { name: 'Graded', value: 12, fill: COLORS.EMERALD_GREEN },
    { name: 'Pending', value: 3, fill: COLORS.WARNING },
    { name: 'Submitted', value: 5, fill: COLORS.INFO },
  ];

  return (
    <motion.div
      className="bg-white p-6 rounded-2xl border"
      style={{ borderColor: COLORS.BORDER }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h3 className="text-lg font-bold mb-6" style={{ color: COLORS.TEXT_PRIMARY }}>
        Assignment Breakdown
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

// Subject Score List Component
const SubjectScoreList = () => {
  const subjects = [
    {
      name: 'Web Development',
      score: 92,
      letterGrade: 'A',
      status: 'excellent',
    },
    {
      name: 'Database Design',
      score: 88,
      letterGrade: 'B+',
      status: 'very good',
    },
    {
      name: 'Data Structures',
      score: 85,
      letterGrade: 'B',
      status: 'good',
    },
    {
      name: 'UI/UX Design',
      score: 90,
      letterGrade: 'A-',
      status: 'excellent',
    },
  ];

  return (
    <motion.div
      className="bg-white p-6 rounded-2xl border"
      style={{ borderColor: COLORS.BORDER }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <h3 className="text-lg font-bold mb-4" style={{ color: COLORS.TEXT_PRIMARY }}>
        Subject Scores
      </h3>
      <div className="space-y-3">
        {subjects.map((subject, idx) => (
          <motion.div
            key={idx}
            className="flex items-center justify-between p-3 rounded-lg"
            style={{ backgroundColor: COLORS.BACKGROUND }}
            whileHover={{ x: 4 }}
          >
            <div className="flex-1">
              <p className="font-semibold text-sm" style={{ color: COLORS.TEXT_PRIMARY }}>
                {subject.name}
              </p>
              <p className="text-xs" style={{ color: COLORS.TEXT_SECONDARY }}>
                {subject.status}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold" style={{ color: COLORS.PRIMARY_BLUE }}>
                {subject.score}%
              </p>
              <p className="text-xs font-semibold" style={{ color: COLORS.EMERALD_GREEN }}>
                {subject.letterGrade}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// Teacher Feedback Panel
const TeacherFeedback = () => {
  const feedback = [
    {
      teacher: 'Prof. John Smith',
      subject: 'Web Development',
      message: 'Excellent work on your React project! Your component organization is very clean.',
      date: '2 days ago',
    },
    {
      teacher: 'Dr. Sarah Johnson',
      subject: 'Database Design',
      message: 'Good effort on the normalization. Work on optimizing your indexes further.',
      date: '4 days ago',
    },
  ];

  return (
    <motion.div
      className="bg-white p-6 rounded-2xl border"
      style={{ borderColor: COLORS.BORDER }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <h3 className="text-lg font-bold mb-4" style={{ color: COLORS.TEXT_PRIMARY }}>
        Teacher Feedback
      </h3>
      <div className="space-y-4">
        {feedback.map((item, idx) => (
          <motion.div
            key={idx}
            className="p-4 rounded-lg border-l-4"
            style={{
              borderLeftColor: COLORS.INDIGO,
              backgroundColor: `${COLORS.INDIGO}05`,
            }}
            whileHover={{ x: 4 }}
          >
            <div className="flex justify-between mb-2">
              <p className="font-semibold text-sm" style={{ color: COLORS.TEXT_PRIMARY }}>
                {item.teacher}
              </p>
              <p className="text-xs" style={{ color: COLORS.TEXT_SECONDARY }}>
                {item.date}
              </p>
            </div>
            <p className="text-xs font-medium mb-2" style={{ color: COLORS.PRIMARY_BLUE }}>
              {item.subject}
            </p>
            <p className="text-sm" style={{ color: COLORS.TEXT_PRIMARY }}>
              {item.message}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// Main Grades Page
const GradesPage = () => {
  return (
    <div className="p-6 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.TEXT_PRIMARY }}>
          Grades & Performance
        </h1>
        <p style={{ color: COLORS.TEXT_SECONDARY }} className="text-lg">
          Track your academic progress and achievements
        </p>
      </motion.div>

      {/* GPA Card */}
      <div className="mb-8">
        <GPACard gpa={3.8} targetGPA={4.0} />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <SubjectPerformance />
        <GradeTrend />
      </div>

      {/* Secondary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <AssignmentBreakdown />
        <SubjectScoreList />
      </div>

      {/* Full Width Sections */}
      <div className="space-y-6">
        <TeacherFeedback />
      </div>
    </div>
  );
};

export default GradesPage;
