import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, BookOpen, CheckCircle, Award, Loader2, Calendar, FileText } from 'lucide-react';
import { COLORS } from '../../constants/theme';
import performanceApi from '../../api/modules/performance.api';
import contentApi from '../../api/modules/content.api';
import assignmentApi from '../../api/modules/assignment.api';
import { useAuth } from '../../contexts/AuthContext';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <motion.div
    className="bg-white p-6 rounded-3xl border shadow-sm transition-all hover:shadow-md"
    style={{ borderColor: COLORS.BORDER }}
    whileHover={{ y: -4 }}
  >
    <div className="flex items-start justify-between mb-4">
      <div className="p-3 rounded-2xl" style={{ backgroundColor: `${color}15`, color }}>
        <Icon size={24} />
      </div>
    </div>
    <p style={{ color: COLORS.TEXT_SECONDARY }} className="text-xs font-bold uppercase tracking-wider mb-1">
      {label}
    </p>
    <p style={{ color: COLORS.TEXT_PRIMARY }} className="text-3xl font-bold">
      {value}
    </p>
  </motion.div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, coursesRes, assignmentsRes] = await Promise.all([
          performanceApi.getStudentStats(),
          contentApi.getCourses(),
          assignmentApi.getStudentAssignments()
        ]);
        setStats(statsRes.data.data);
        setCourses(coursesRes.data.data);
        setAssignments(assignmentsRes.data.data.slice(0, 3)); // Only top 3
      } catch (error) {
        console.error("Dashboard fetch failed:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="p-8 pb-12 max-w-7xl mx-auto">
      {/* Hero */}
      <motion.div
        className="relative mb-10 p-10 rounded-[2rem] overflow-hidden shadow-2xl"
        style={{
          background: `linear-gradient(135deg, ${COLORS.PRIMARY_BLUE}, ${COLORS.INDIGO})`,
          color: '#FFFFFF',
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl font-black mb-4 leading-tight">
            Welcome back, {user?.full_name?.split(' ')[0]}!
          </h1>
          <p className="text-blue-100 text-lg font-medium opacity-90">
            You have {stats?.pending_assignments || 0} pending assignments. Your current attendance rate is {stats?.attendance_rate || 0}%.
          </p>
        </div>
        <div className="absolute -right-20 -top-20 opacity-10 text-white pointer-events-none">
          <BookOpen size={400} />
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard icon={BookOpen} label="Enrolled Courses" value={stats?.active_courses || 0} color={COLORS.PRIMARY_BLUE} />
        <StatCard icon={CheckCircle} label="To-Do Tasks" value={stats?.pending_assignments || 0} color={COLORS.WARNING} />
        <StatCard icon={Award} label="Attendance" value={`${stats?.attendance_rate || 0}%`} color={COLORS.EMERALD_GREEN} />
        <StatCard icon={TrendingUp} label="Avg Performance" value={`${stats?.avg_grade || 0}%`} color={COLORS.INDIGO} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Course Schedule */}
        <div className="lg:col-span-8 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Your Courses</h2>
              <button className="text-sm font-bold text-blue-600 hover:underline">View All</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((course) => (
                <motion.div
                  key={course.id}
                  className="p-5 bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all cursor-pointer"
                  style={{ borderColor: COLORS.BORDER }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <BookOpen size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{course.name}</h3>
                      <p className="text-xs text-slate-400 font-medium">{course.subject_code || 'Academic Course'}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Upcoming Deadlines</h2>
              <button className="text-sm font-bold text-blue-600 hover:underline">Full Schedule</button>
            </div>
            <div className="space-y-4">
              {assignments.length === 0 ? (
                <div className="p-10 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 font-medium">No upcoming assignments. Great job!</p>
                </div>
              ) : (
                assignments.map((asgn) => (
                  <div key={asgn.id} className="flex items-center justify-between p-5 bg-white rounded-2xl border shadow-sm" style={{ borderColor: COLORS.BORDER }}>
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                        <FileText size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{asgn.title}</h4>
                        <p className="text-xs text-slate-500">{asgn.course_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Due Date</p>
                      <p className="text-sm font-bold text-slate-700">{new Date(asgn.due_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-4">Daily Motivation</h3>
              <p className="text-slate-400 text-sm italic mb-6">
                "The beautiful thing about learning is that no one can take it away from you."
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-widest">
                <TrendingUp size={14} /> Keep Pushing
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Award size={120} />
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border shadow-sm" style={{ borderColor: COLORS.BORDER }}>
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Calendar size={20} className="text-blue-600" />
              Calendar
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-xs font-bold text-blue-600 mb-1">Upcoming Event</p>
                <p className="text-sm font-bold text-slate-900">Mid-term Examination Week</p>
                <p className="text-xs text-slate-500 mt-1">Starts in 5 days</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
