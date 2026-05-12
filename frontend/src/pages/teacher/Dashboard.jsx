import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  BookOpen,
  CheckCircle,
  Clock,
  FileText,
  Loader2,
  MessageCircle,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TEACHER_COLORS } from '../../constants/teacherTheme';
import { useAuth } from '../../contexts/AuthContext';
import teacherApi from '../../api/modules/teacher.api';

const StatCard = ({ icon: Icon, label, value, helper, color = TEACHER_COLORS.PRIMARY_BLUE }) => (
  <motion.div
    className="rounded-3xl border bg-white p-6 transition-all hover:shadow-lg"
    style={{ borderColor: TEACHER_COLORS.BORDER }}
    whileHover={{ y: -4 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div className="mb-4 flex items-start justify-between">
      <div className="rounded-2xl p-3" style={{ backgroundColor: `${color}15`, color }}>
        <Icon size={24} />
      </div>
    </div>
    <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="mb-1 text-xs font-bold uppercase tracking-wider">
      {label}
    </p>
    <p style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-3xl font-bold">{value}</p>
    {helper ? (
      <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="mt-2 text-sm">
        {helper}
      </p>
    ) : null}
  </motion.div>
);

const SectionCard = ({ section, index }) => {
  const palette = [
    { c1: '#2563EB', c2: '#1D4ED8' },
    { c1: '#0F766E', c2: '#115E59' },
    { c1: '#7C3AED', c2: '#6D28D9' },
    { c1: '#C2410C', c2: '#9A3412' },
  ];
  const colors = palette[index % palette.length];

  return (
    <motion.div
      className="rounded-2xl border overflow-hidden bg-white transition-all hover:shadow-lg"
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
          <h3 className="text-lg font-bold">{section.name}</h3>
          <p className="text-sm opacity-90">{section.class_name || section.grade_name || 'Assigned section'}</p>
        </div>
        <div className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
          {section.type || 'Course'}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 p-5 text-center">
        <div className="rounded-2xl bg-slate-50 p-4">
          <Users size={18} style={{ color: TEACHER_COLORS.ACCENT_TEAL }} className="mx-auto mb-2" />
          <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-xs">Students</p>
          <p style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-lg font-bold">
            {section.students_count || 0}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <FileText size={18} style={{ color: TEACHER_COLORS.PRIMARY_BLUE }} className="mx-auto mb-2" />
          <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-xs">Materials</p>
          <p style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-lg font-bold">
            {section.materials_count || 0}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <CheckCircle size={18} style={{ color: TEACHER_COLORS.GRADE }} className="mx-auto mb-2" />
          <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-xs">Assignments</p>
          <p style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-lg font-bold">
            {section.assignments_count || 0}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <Clock size={18} style={{ color: TEACHER_COLORS.WARNING }} className="mx-auto mb-2" />
          <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-xs">Pending</p>
          <p style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-lg font-bold">
            {section.pending_submissions_count || 0}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const QueueItem = ({ item }) => {
  const overdue = item.due_date ? new Date(item.due_date).getTime() < Date.now() : false;

  return (
    <motion.div
      className="flex items-center justify-between gap-4 rounded-2xl border bg-white p-4 transition-all hover:shadow-md"
      style={{ borderColor: TEACHER_COLORS.BORDER }}
      whileHover={{ x: 4 }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="flex-1">
        <p style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="font-semibold">
          {item.student_name}
        </p>
        <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-sm">
          {item.assignment_title} • {item.course_name} {item.class_name ? `• ${item.class_name}` : ''}
        </p>
        <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="mt-1 text-xs">
          Submitted {formatRelativeTime(item.submitted_at)}
        </p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <span
          className="rounded-full px-3 py-1 text-xs font-semibold"
          style={{
            backgroundColor: overdue ? `${TEACHER_COLORS.DANGER}18` : `${TEACHER_COLORS.WARNING}18`,
            color: overdue ? TEACHER_COLORS.DANGER : TEACHER_COLORS.WARNING,
          }}
        >
          {overdue ? 'Overdue' : 'Pending'}
        </span>
        <span style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-xs">
          Max {item.max_marks} marks
        </span>
      </div>
    </motion.div>
  );
};

const ActivityItem = ({ item }) => {
  const icon =
    item.type === 'submission' ? (
      <CheckCircle size={18} style={{ color: TEACHER_COLORS.CREATE }} />
    ) : item.type === 'material' ? (
      <FileText size={18} style={{ color: TEACHER_COLORS.PRIMARY_BLUE }} />
    ) : item.type === 'assignment' ? (
      <Zap size={18} style={{ color: TEACHER_COLORS.GRADE }} />
    ) : (
      <Clock size={18} style={{ color: TEACHER_COLORS.ACCENT_TEAL }} />
    );

  const backgroundColor =
    item.type === 'submission'
      ? `${TEACHER_COLORS.CREATE}18`
      : item.type === 'material'
      ? `${TEACHER_COLORS.PRIMARY_BLUE}18`
      : item.type === 'assignment'
      ? `${TEACHER_COLORS.GRADE}18`
      : `${TEACHER_COLORS.ACCENT_TEAL}18`;

  return (
    <motion.div
      className="flex items-center gap-4 border-b p-4 last:border-b-0"
      style={{ borderColor: TEACHER_COLORS.BORDER }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor }}>
        {icon}
      </div>
      <div className="flex-1">
        <p style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-sm font-medium">
          {item.details}
        </p>
        <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-xs">
          {item.actor} • {item.course_name}
        </p>
      </div>
      <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-xs whitespace-nowrap">
        {formatRelativeTime(item.timestamp)}
      </p>
    </motion.div>
  );
};

const formatRelativeTime = (value) => {
  if (!value) return 'Just now';

  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return 'Just now';

  const diffSeconds = Math.max(1, Math.floor((Date.now() - timestamp) / 1000));
  if (diffSeconds < 60) return `${diffSeconds}s ago`;

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

const TeacherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await teacherApi.getDashboard();
        setDashboardData(response.data?.data ?? response.data ?? null);
      } catch (requestError) {
        console.error('Failed to load teacher dashboard:', requestError);
        setError('Unable to load your dashboard data right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex h-[60vh] max-w-2xl flex-col items-center justify-center gap-4 p-8 text-center">
        <AlertCircle size={40} style={{ color: TEACHER_COLORS.DANGER }} />
        <h1 style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-2xl font-bold">
          Dashboard unavailable
        </h1>
        <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }}>{error}</p>
      </div>
    );
  }

  const summary = dashboardData?.summary ?? {};
  const courses = dashboardData?.courses ?? [];
  const gradingQueue = dashboardData?.grading_queue ?? [];
  const recentActivity = dashboardData?.recent_activity ?? [];
  const firstName = user?.full_name?.split(' ')?.[0] || 'Teacher';

  return (
    <motion.div className="mx-auto max-w-7xl p-8 pb-12">
      <motion.div
        className="mb-8 overflow-hidden rounded-[2rem] p-8 text-white shadow-2xl"
        style={{
          background: `linear-gradient(135deg, ${TEACHER_COLORS.PRIMARY_BLUE}, ${TEACHER_COLORS.SECONDARY_INDIGO})`,
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="mb-2 text-3xl font-bold">Welcome back, {firstName}</h1>
        <p className="flex items-center gap-2 text-blue-100">
          <AlertCircle size={18} />
          Real data from your assigned courses, submissions, and activity.
        </p>
      </motion.div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={BookOpen}
          label="Active Sections"
          value={summary.active_sections ?? courses.length}
          helper="Assigned classes and subjects"
          color={TEACHER_COLORS.PRIMARY_BLUE}
        />
        <StatCard
          icon={Users}
          label="Enrolled Students"
          value={summary.enrolled_students ?? 0}
          helper="Across your assigned sections"
          color={TEACHER_COLORS.SECONDARY_INDIGO}
        />
        <StatCard
          icon={CheckCircle}
          label="Pending Submissions"
          value={summary.pending_submissions ?? 0}
          helper="Waiting for grading"
          color={TEACHER_COLORS.DANGER}
        />
        <StatCard
          icon={FileText}
          label="Materials Uploaded"
          value={summary.materials_uploaded ?? 0}
          helper="Active resources in class"
          color={TEACHER_COLORS.ACCENT_TEAL}
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-xl font-bold">
              Pending Grading Queue
            </h2>
            <span style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-sm">
              {gradingQueue.length} items
            </span>
          </div>

          <div className="space-y-4">
            {gradingQueue.length > 0 ? (
              gradingQueue.map((item) => <QueueItem key={item.submission_id} item={item} />)
            ) : (
              <div className="rounded-3xl border border-dashed bg-white p-10 text-center" style={{ borderColor: TEACHER_COLORS.BORDER }}>
                <CheckCircle size={40} style={{ color: TEACHER_COLORS.SUCCESS }} className="mx-auto mb-3" />
                <p style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-lg font-semibold">
                  No pending submissions right now.
                </p>
                <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="mt-2 text-sm">
                  Grading queue is up to date for your assigned sections.
                </p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div>
            <h3 style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="mb-4 text-lg font-bold">
              Assigned Sections
            </h3>
            <div className="space-y-3">
              {courses.length > 0 ? (
                courses.map((course, index) => <SectionCard key={`${course.id}-${course.class_name || course.grade_name || index}`} section={course} index={index} />)
              ) : (
                <div className="rounded-3xl border bg-white p-6 text-center" style={{ borderColor: TEACHER_COLORS.BORDER }}>
                  <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-sm">
                    No assigned sections were found.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="mb-4 text-lg font-bold">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <motion.button
                className="flex w-full items-center justify-center gap-2 rounded-lg py-3 font-medium text-white transition-all"
                style={{ backgroundColor: TEACHER_COLORS.CREATE }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Zap size={18} />
                Create Assignment
              </motion.button>
              <motion.button
                className="flex w-full items-center justify-center gap-2 rounded-lg py-3 font-medium text-white transition-all"
                style={{ backgroundColor: TEACHER_COLORS.GRADE }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <CheckCircle size={18} />
                Start Grading
              </motion.button>
              <motion.button
                onClick={() => navigate('/teacher/materials/upload')}
                className="flex w-full items-center justify-center gap-2 rounded-lg py-3 font-medium text-white transition-all"
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

      <motion.div
        className="mt-8 overflow-hidden rounded-3xl border bg-white"
        style={{ borderColor: TEACHER_COLORS.BORDER }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="border-b p-6" style={{ borderColor: TEACHER_COLORS.BORDER }}>
          <h3 style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-lg font-bold">
            Recent Activity
          </h3>
        </div>
        <div>
          {recentActivity.length > 0 ? (
            recentActivity.map((item, index) => <ActivityItem key={`${item.type}-${item.timestamp}-${index}`} item={item} />)
          ) : (
            <div className="p-8 text-center">
              <MessageCircle size={36} style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="mx-auto mb-3" />
              <p style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-base font-semibold">
                No recent activity yet.
              </p>
              <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="mt-2 text-sm">
                Activity will appear here as students submit work, you post materials, and attendance is marked.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TeacherDashboard;
