import { useEffect, useState } from 'react';
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
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Award, BookOpen, MessageSquareText, Loader2, FileText } from 'lucide-react';
import { COLORS } from '../../constants/theme';
import assignmentApi from '../../api/modules/assignment.api';

const formatPercent = (value) => `${Number.isFinite(value) ? value.toFixed(1) : '0.0'}%`;

const GPACard = ({ gpa, targetGPA, averageScore }) => (
  <motion.div
    className="bg-white p-6 rounded-2xl border"
    style={{ borderColor: COLORS.BORDER }}
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
  >
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-bold" style={{ color: COLORS.TEXT_PRIMARY }}>
        Grade Summary
      </h3>
      <div className="p-3 rounded-lg" style={{ backgroundColor: `${COLORS.EMERALD_GREEN}15` }}>
        <Award size={24} style={{ color: COLORS.EMERALD_GREEN }} />
      </div>
    </div>
    <div className="mb-4">
      <p className="text-4xl font-bold" style={{ color: COLORS.PRIMARY_BLUE }}>
        {gpa.toFixed(2)}
      </p>
      <p style={{ color: COLORS.TEXT_SECONDARY }} className="text-sm mt-1">
        Based on an average score of {formatPercent(averageScore)}
      </p>
    </div>
    <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: COLORS.EMERALD_GREEN }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min((gpa / targetGPA) * 100, 100)}%` }}
        transition={{ duration: 0.8, delay: 0.2 }}
      />
    </div>
    <p style={{ color: COLORS.TEXT_SECONDARY }} className="text-xs mt-2">
      GPA target reference: {targetGPA.toFixed(1)}
    </p>
  </motion.div>
);

const SummaryCard = ({ icon: Icon, title, value, helper, tone = 'blue' }) => {
  const colors = {
    blue: { bg: `${COLORS.PRIMARY_BLUE}15`, fg: COLORS.PRIMARY_BLUE },
    green: { bg: `${COLORS.EMERALD_GREEN}15`, fg: COLORS.EMERALD_GREEN },
    amber: { bg: `${COLORS.WARNING}15`, fg: COLORS.WARNING },
  };
  const scheme = colors[tone];

  return (
    <motion.div
      className="bg-white p-5 rounded-2xl border"
      style={{ borderColor: COLORS.BORDER }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold" style={{ color: COLORS.TEXT_PRIMARY }}>
          {title}
        </h3>
        <div className="p-2 rounded-lg" style={{ backgroundColor: scheme.bg }}>
          <Icon size={18} style={{ color: scheme.fg }} />
        </div>
      </div>
      <p className="text-2xl font-bold" style={{ color: COLORS.TEXT_PRIMARY }}>
        {value}
      </p>
      <p className="text-sm mt-1" style={{ color: COLORS.TEXT_SECONDARY }}>
        {helper}
      </p>
    </motion.div>
  );
};

const ChartCard = ({ title, children, delay = 0 }) => (
  <motion.div
    className="bg-white p-6 rounded-2xl border"
    style={{ borderColor: COLORS.BORDER }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
  >
    <h3 className="text-lg font-bold mb-6" style={{ color: COLORS.TEXT_PRIMARY }}>
      {title}
    </h3>
    {children}
  </motion.div>
);

const EmptyState = () => (
  <div className="bg-white rounded-3xl border border-dashed p-20 text-center">
    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
      <FileText size={40} />
    </div>
    <h2 className="text-xl font-semibold mb-2">No graded work yet</h2>
    <p className="text-gray-500">Your grades and teacher feedback will appear here after assignments are marked.</p>
  </div>
);

const GradesPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      try {
        const res = await assignmentApi.getMySubmissions();
        const data = res.data?.data ?? res.data ?? [];
        setSubmissions(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load grades:', error);
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  const gradedSubmissions = submissions.filter((submission) => submission.marks !== null && submission.marks !== undefined);

  if (!gradedSubmissions.length) {
    return (
      <div className="p-6 pb-12 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.TEXT_PRIMARY }}>
            Grades & Performance
          </h1>
          <p style={{ color: COLORS.TEXT_SECONDARY }} className="text-lg">
            Track your academic progress and review teacher feedback.
          </p>
        </motion.div>
        <EmptyState />
      </div>
    );
  }

  const averageScore = gradedSubmissions.reduce((sum, item) => {
    const maxMarks = Number(item.max_marks) || 0;
    const marks = Number(item.marks) || 0;
    return sum + (maxMarks > 0 ? (marks / maxMarks) * 100 : 0);
  }, 0) / gradedSubmissions.length;

  const gpa = Math.min((averageScore / 100) * 4, 4);

  const courseMap = gradedSubmissions.reduce((acc, item) => {
    const key = item.course_name || 'Uncategorized';
    const marks = Number(item.marks) || 0;
    const maxMarks = Number(item.max_marks) || 0;
    if (!acc[key]) {
      acc[key] = { course: key, earned: 0, max: 0, assignments: 0 };
    }
    acc[key].earned += marks;
    acc[key].max += maxMarks;
    acc[key].assignments += 1;
    return acc;
  }, {});

  const subjectPerformance = Object.values(courseMap).map((course) => ({
    subject: course.course,
    score: course.max > 0 ? Number(((course.earned / course.max) * 100).toFixed(1)) : 0,
    assignments: course.assignments,
  }));

  const gradeTrend = [...gradedSubmissions]
    .sort((a, b) => new Date(a.submitted_at || a.created_at) - new Date(b.submitted_at || b.created_at))
    .map((item) => {
      const maxMarks = Number(item.max_marks) || 0;
      const marks = Number(item.marks) || 0;
      return {
        name: (item.title || item.assignment_title || 'Assignment').slice(0, 16),
        score: maxMarks > 0 ? Number(((marks / maxMarks) * 100).toFixed(1)) : 0,
      };
    });

  const breakdownData = [
    { name: 'Graded', value: submissions.filter((item) => item.status === 'graded').length, fill: COLORS.EMERALD_GREEN },
    { name: 'Pending', value: submissions.filter((item) => item.status === 'pending').length, fill: COLORS.WARNING },
    { name: 'Submitted', value: submissions.filter((item) => item.status === 'submitted').length, fill: COLORS.INFO },
    { name: 'Late', value: submissions.filter((item) => item.status === 'late').length, fill: COLORS.DANGER },
  ].filter((item) => item.value > 0);

  const feedbackItems = gradedSubmissions
    .filter((item) => item.feedback)
    .slice(0, 6);

  return (
    <div className="p-6 pb-12 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.TEXT_PRIMARY }}>
          Grades & Performance
        </h1>
        <p style={{ color: COLORS.TEXT_SECONDARY }} className="text-lg">
          Track your academic progress and review teacher feedback.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1">
          <GPACard gpa={gpa} targetGPA={4.0} averageScore={averageScore} />
        </div>
        <SummaryCard
          icon={TrendingUp}
          title="Average Score"
          value={formatPercent(averageScore)}
          helper={`${gradedSubmissions.length} graded submission${gradedSubmissions.length === 1 ? '' : 's'}`}
          tone="green"
        />
        <SummaryCard
          icon={BookOpen}
          title="Courses Graded"
          value={subjectPerformance.length}
          helper="Courses with published marks"
          tone="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Subject Performance" delay={0.1}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={subjectPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.BORDER} />
              <XAxis dataKey="subject" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Bar dataKey="score" fill={COLORS.PRIMARY_BLUE} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Grade Trend" delay={0.2}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={gradeTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.BORDER} />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Line type="monotone" dataKey="score" stroke={COLORS.EMERALD_GREEN} strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Submission Breakdown" delay={0.3}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={breakdownData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                dataKey="value"
              >
                {breakdownData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Graded Assignments" delay={0.4}>
          <div className="space-y-3">
            {gradedSubmissions.slice(0, 6).map((submission) => {
              const maxMarks = Number(submission.max_marks) || 0;
              const marks = Number(submission.marks) || 0;
              const percent = maxMarks > 0 ? (marks / maxMarks) * 100 : 0;

              return (
                <motion.div
                  key={submission.id}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ backgroundColor: COLORS.BACKGROUND }}
                  whileHover={{ x: 4 }}
                >
                  <div className="flex-1">
                    <p className="font-semibold text-sm" style={{ color: COLORS.TEXT_PRIMARY }}>
                      {submission.title || submission.assignment_title}
                    </p>
                    <p className="text-xs" style={{ color: COLORS.TEXT_SECONDARY }}>
                      {submission.course_name || 'Course not set'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold" style={{ color: COLORS.PRIMARY_BLUE }}>
                      {marks}/{maxMarks || '-'}
                    </p>
                    <p className="text-xs font-semibold" style={{ color: COLORS.EMERALD_GREEN }}>
                      {formatPercent(percent)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Teacher Feedback" delay={0.5}>
        {feedbackItems.length === 0 ? (
          <p className="text-sm" style={{ color: COLORS.TEXT_SECONDARY }}>
            No written feedback has been added yet.
          </p>
        ) : (
          <div className="space-y-4">
            {feedbackItems.map((item) => (
              <motion.div
                key={item.id}
                className="p-4 rounded-lg border-l-4"
                style={{
                  borderLeftColor: COLORS.INDIGO,
                  backgroundColor: `${COLORS.INDIGO}05`,
                }}
                whileHover={{ x: 4 }}
              >
                <div className="flex justify-between gap-4 mb-2">
                  <div>
                    <p className="font-semibold text-sm" style={{ color: COLORS.TEXT_PRIMARY }}>
                      {item.title || item.assignment_title}
                    </p>
                    <p className="text-xs" style={{ color: COLORS.PRIMARY_BLUE }}>
                      {item.course_name || 'Course not set'}
                    </p>
                  </div>
                  <div className="flex items-start gap-2 text-xs" style={{ color: COLORS.TEXT_SECONDARY }}>
                    <MessageSquareText size={14} />
                    <span>{item.published_at ? new Date(item.published_at).toLocaleDateString() : 'Recently graded'}</span>
                  </div>
                </div>
                <p className="text-sm" style={{ color: COLORS.TEXT_PRIMARY }}>
                  {item.feedback}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </ChartCard>
    </div>
  );
};

export default GradesPage;
