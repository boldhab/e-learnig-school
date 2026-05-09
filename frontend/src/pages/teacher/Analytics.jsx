import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  Award, 
  Loader2, 
  Filter,
  ArrowUpRight,
  Target
} from 'lucide-react';
import { TEACHER_COLORS } from '../../constants/teacherTheme';
import performanceApi from '../../api/modules/performance.api';
import contentApi from '../../api/modules/content.api';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const StatCard = ({ title, value, icon: Icon, trend, color }) => (
  <motion.div
    className="bg-white p-6 rounded-2xl border shadow-sm"
    style={{ borderColor: TEACHER_COLORS.BORDER }}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 rounded-xl" style={{ backgroundColor: `${color}15`, color }}>
        <Icon size={24} />
      </div>
      {trend && (
        <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
          <TrendingUp size={12} className="mr-1" /> {trend}
        </span>
      )}
    </div>
    <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold text-slate-900">{value}</p>
  </motion.div>
);

const AnalyticsPage = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [performanceData, setPerformanceData] = useState(null);
  const [riskData, setRiskData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [coursesRes, riskRes] = await Promise.all([
          contentApi.getCourses(),
          performanceApi.getRiskReport()
        ]);
        setCourses(coursesRes.data.data);
        setRiskData(riskRes.data);
        if (coursesRes.data.data.length > 0) {
          setSelectedCourseId(coursesRes.data.data[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch initial analytics data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!selectedCourseId) return;
    const fetchCourseStats = async () => {
      try {
        const res = await performanceApi.getCoursePerformance(selectedCourseId);
        setPerformanceData(res.data);
      } catch (error) {
        console.error("Failed to fetch course performance:", error);
      }
    };
    fetchCourseStats();
  }, [selectedCourseId]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  // Sample data for charts (real data would be mapped from performanceData)
  const distributionData = [
    { name: 'Excellent (85+)', value: 12 },
    { name: 'Good (70-85)', value: 18 },
    { name: 'Average (50-70)', value: 15 },
    { name: 'Poor (<50)', value: 5 },
  ];

  const trendData = [
    { name: 'Week 1', avg: 65 },
    { name: 'Week 2', avg: 68 },
    { name: 'Week 3', avg: 72 },
    { name: 'Week 4', avg: 70 },
    { name: 'Week 5', avg: 75 },
    { name: 'Week 6', avg: 78 },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Performance Analytics</h1>
          <p className="text-slate-500">Real-time academic intelligence and student gap analysis.</p>
        </div>

        <div className="flex items-center gap-3">
          <Filter size={20} className="text-slate-400" />
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="px-4 py-2 rounded-xl border bg-white focus:ring-2 focus:ring-blue-500/20 outline-none font-medium shadow-sm"
            style={{ borderColor: TEACHER_COLORS.BORDER }}
          >
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.name}</option>
            ))}
          </select>
        </div>
      </header>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Class Average" value="76.4%" icon={Award} trend="+2.4%" color="#3B82F6" />
        <StatCard title="Submission Rate" value="92%" icon={Target} trend="+5%" color="#10B981" />
        <StatCard title="Active Students" value="48" icon={Users} color="#8B5CF6" />
        <StatCard title="At-Risk Students" value={riskData.length} icon={AlertTriangle} color="#EF4444" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Progress Chart */}
        <div className="lg:col-span-8 bg-white p-8 rounded-3xl border shadow-sm" style={{ borderColor: TEACHER_COLORS.BORDER }}>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold">Class Performance Trend</h3>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Weekly Average Score</span>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="avg" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorAvg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="lg:col-span-4 bg-white p-8 rounded-3xl border shadow-sm" style={{ borderColor: TEACHER_COLORS.BORDER }}>
          <h3 className="text-lg font-bold mb-8">Grade Distribution</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-4">
            {distributionData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-xs text-slate-500 font-medium">{item.name}</span>
                </div>
                <span className="text-xs font-bold text-slate-900">{item.value} students</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Alerts Table */}
        <div className="lg:col-span-12 bg-white rounded-3xl border shadow-sm overflow-hidden" style={{ borderColor: TEACHER_COLORS.BORDER }}>
          <div className="p-8 border-b" style={{ borderColor: TEACHER_COLORS.BORDER }}>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <AlertTriangle className="text-red-500" size={20} />
              Gap Analysis & High Risk Alerts
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b" style={{ borderColor: TEACHER_COLORS.BORDER }}>
                <tr>
                  <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase">Student Name</th>
                  <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase">Risk Level</th>
                  <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase">Attendance</th>
                  <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase">Avg Score</th>
                  <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase">Weak Topics</th>
                  <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: TEACHER_COLORS.BORDER }}>
                {riskData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-8 py-12 text-center text-slate-400 italic">No high-risk students identified.</td>
                  </tr>
                ) : (
                  riskData.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600 text-xs">
                            {student.student_name.charAt(0)}
                          </div>
                          <span className="font-bold text-slate-900">{student.student_name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                          student.risk_level === 'high' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                        }`}>
                          {student.risk_level}
                        </span>
                      </td>
                      <td className="px-8 py-4 font-medium text-slate-700">{student.attendance_percentage}%</td>
                      <td className="px-8 py-4 font-medium text-slate-700">{student.overall_score}%</td>
                      <td className="px-8 py-4 text-xs text-slate-500 max-w-xs truncate">{student.weak_topics}</td>
                      <td className="px-8 py-4">
                        <button className="text-blue-600 hover:text-blue-800 font-bold text-xs flex items-center gap-1">
                          Details <ArrowUpRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
