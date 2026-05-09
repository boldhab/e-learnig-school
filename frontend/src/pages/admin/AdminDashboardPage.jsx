import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  BookOpen, 
  MessageSquare, 
  ShieldCheck, 
  TrendingUp, 
  Activity, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { ADMIN_COLORS } from '../../constants/adminTheme';
import adminApi from '../../api/modules/admin.api';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const StatCard = ({ title, value, icon: Icon, trend, color }) => (
  <motion.div
    className="bg-white p-6 rounded-3xl border shadow-sm"
    style={{ borderColor: '#E2E8F0' }}
    whileHover={{ y: -5 }}
  >
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 rounded-2xl" style={{ backgroundColor: `${color}10`, color }}>
        <Icon size={24} />
      </div>
      {trend && (
        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
          {trend}
        </span>
      )}
    </div>
    <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
    <p className="text-3xl font-bold text-slate-900">{value}</p>
  </motion.div>
);

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminApi.getDashboardStats();
        setStats(res.data.data);
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  const chartData = [
    { name: 'Students', value: parseInt(stats?.total_students || 0) },
    { name: 'Teachers', value: parseInt(stats?.total_teachers || 0) },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">System Overview</h1>
        <p className="text-slate-500">Millennium School E-Learning Platform Administration</p>
      </header>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats?.total_users} icon={Users} trend="+12%" color="#2563EB" />
        <StatCard title="Academic Courses" value={stats?.total_courses} icon={BookOpen} color="#10B981" />
        <StatCard title="Active Discussions" value={stats?.active_discussions} icon={MessageSquare} color="#8B5CF6" />
        <StatCard title="System Integrity" value="99.9%" icon={ShieldCheck} color="#059669" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* User Distribution */}
        <div className="lg:col-span-4 bg-white p-8 rounded-3xl border shadow-sm">
          <h3 className="text-lg font-bold mb-8">User Distribution</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-600" />
                <span className="text-sm text-slate-600 font-medium">Students</span>
              </div>
              <span className="font-bold">{stats?.total_students}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-sm text-slate-600 font-medium">Teachers</span>
              </div>
              <span className="font-bold">{stats?.total_teachers}</span>
            </div>
          </div>
        </div>

        {/* System Activity */}
        <div className="lg:col-span-8 bg-white p-8 rounded-3xl border shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold">Recent System Activity</h3>
            <button className="text-sm text-blue-600 font-bold hover:underline">View All Logs</button>
          </div>
          <div className="space-y-6">
            {[
              { type: 'USER', msg: 'New teacher account created: Sarah Connor', time: '10 mins ago', icon: Users, color: 'blue' },
              { type: 'COURSE', msg: 'New course material uploaded in Physics 101', time: '45 mins ago', icon: BookOpen, color: 'emerald' },
              { type: 'SECURITY', msg: 'Database backup successfully completed', time: '2 hours ago', icon: ShieldCheck, color: 'purple' },
              { type: 'SYSTEM', msg: 'Pusher real-time connection stable', time: '3 hours ago', icon: Activity, color: 'slate' },
            ].map((log, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-xl bg-white text-${log.color}-600 shadow-sm`}>
                    <log.icon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{log.msg}</p>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{log.type} • {log.time}</p>
                  </div>
                </div>
                <button className="p-2 text-slate-400 hover:text-slate-600">
                  <AlertCircle size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
