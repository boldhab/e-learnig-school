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
import toast from 'react-hot-toast';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const unwrapApiData = (response) => response?.data?.data ?? response?.data ?? null;

const toArray = (value) => Array.isArray(value) ? value : [];

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

        // Deduplicate courses by id — a teacher may be assigned to the same course
        // across multiple classes, causing the API to return duplicate entries.
        const rawCourses = toArray(unwrapApiData(coursesRes));
        const nextCourses = [...new Map(rawCourses.map(c => [c.id, c])).values()];
        const nextRiskData = toArray(unwrapApiData(riskRes));

        setCourses(nextCourses);
        setRiskData(nextRiskData);

        if (nextCourses.length > 0) {
          setSelectedCourseId(nextCourses[0].id);
        } else {
          setSelectedCourseId('');
        }
      } catch (error) {
        const resp = error?.response?.data;
        console.error("Failed to fetch initial analytics data:", resp || error.message || error);
        const msg = resp?.message || resp?.status || error.message || 'Failed to load analytics data. Try reloading.';
        toast.error(msg);
        setCourses([]);
        setRiskData([]);
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
        setPerformanceData(toArray(unwrapApiData(res)));
      } catch (error) {
        console.error("Failed to fetch course performance:", error);
        toast.error('Failed to load course performance.');
        setPerformanceData([]);
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

  // Derive chart data from real performanceData
  const computeDistribution = (rows) => {
    const buckets = { excellent: 0, good: 0, average: 0, poor: 0 };
    rows.forEach((r) => {
      const score = Number(r.overall_score || 0);
      if (score >= 85) buckets.excellent += 1;
      else if (score >= 70) buckets.good += 1;
      else if (score >= 50) buckets.average += 1;
      else buckets.poor += 1;
    });
    return [
      { name: 'Excellent (85+)', value: buckets.excellent },
      { name: 'Good (70-85)', value: buckets.good },
      { name: 'Average (50-70)', value: buckets.average },
      { name: 'Poor (<50)', value: buckets.poor },
    ];
  };

  const computeTrend = (rows, maxPoints = 6) => {
    // Group by UTC date (avoid timezone shift) and compute average overall_score per date
    const map = new Map();
    rows.forEach((r) => {
      const dt = r.generated_at || r.created_at || null;
      if (!dt) return;
      const d = new Date(dt);
      if (isNaN(d)) return;
      // Use UTC date components to avoid local timezone shifts
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
      const cur = map.get(key) || { sum: 0, count: 0, dateKey: key };
      cur.sum += Number(r.overall_score || 0);
      cur.count += 1;
      map.set(key, cur);
    });

    // Sort keys ascending and pick last `maxPoints`
    const sorted = Array.from(map.entries()).sort((a, b) => new Date(a[0]) - new Date(b[0]));
    const last = sorted.slice(-maxPoints);

    return last.map(([key, v]) => {
      // Create a UTC date for display
      const [y, m, d] = key.split('-').map((n) => Number(n));
      const date = new Date(Date.UTC(y, m - 1, d));
      return { name: date.toLocaleDateString(), avg: v.count ? +(v.sum / v.count).toFixed(1) : 0 };
    });
  };

  const performanceRows = toArray(performanceData);
  const activeStudents = performanceRows.length;
  const classAverage = activeStudents > 0
    ? `${(performanceRows.reduce((sum, row) => sum + Number(row.overall_score || 0), 0) / activeStudents).toFixed(1)}%`
    : '0.0%';
  const submissionRate = activeStudents > 0
    ? `${Math.round((performanceRows.filter((row) => Number(row.overall_score || 0) > 0).length / activeStudents) * 100)}%`
    : '0%';

  const distributionData = computeDistribution(performanceRows);
  const trendData = computeTrend(performanceRows, 6);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Performance Analytics</h1>
          <p className="text-slate-500">Real-time academic intelligence and student gap analysis.</p>
        </div>

        <div className="flex items-center gap-3">
          <Filter size={20} className="text-slate-400" />
          {courses && courses.length > 0 ? (
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="px-4 py-2 rounded-xl border bg-white focus:ring-2 focus:ring-blue-500/20 outline-none font-medium shadow-sm"
              style={{ borderColor: TEACHER_COLORS.BORDER }}
            >
              {courses.map(course => (
                <option key={`course-${course.id}`} value={course.id}>{course.name}</option>
              ))}
            </select>
          ) : (
            <div className="px-4 py-2 rounded-xl border bg-white text-slate-500" style={{ borderColor: TEACHER_COLORS.BORDER }}>
              No courses assigned
            </div>
          )}
        </div>
      </header>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Class Average" value={classAverage} icon={Award} color="#3B82F6" />
        <StatCard title="Submission Rate" value={submissionRate} icon={Target} color="#10B981" />
        <StatCard title="Active Students" value={activeStudents} icon={Users} color="#8B5CF6" />
        <StatCard title="At-Risk Students" value={riskData.length} icon={AlertTriangle} color="#EF4444" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Progress Chart */}
        <div className="lg:col-span-8 bg-white p-8 rounded-3xl border shadow-sm" style={{ borderColor: TEACHER_COLORS.BORDER }}>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold">Class Performance Trend</h3>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Weekly Average Score</span>
          </div>
            <div className="h-80 w-full" style={{ minHeight: 240 }}>
            <ResponsiveContainer width="100%" height={300}>
              {trendData && trendData.length > 0 ? (
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
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 italic">Not enough data to render trend chart.</div>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="lg:col-span-4 bg-white p-8 rounded-3xl border shadow-sm" style={{ borderColor: TEACHER_COLORS.BORDER }}>
          <h3 className="text-lg font-bold mb-8">Grade Distribution</h3>
          <div className="h-64 w-full" style={{ minHeight: 200 }}>
            {distributionData && distributionData.reduce((s, d) => s + (d.value || 0), 0) > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={distributionData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 italic">No distribution data available.</div>
            )}
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
                    <tr key={`gap-${student.id}`} className="hover:bg-slate-50 transition-colors">
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
                      {(() => {
                        const perf = performanceRows.find(p => Number(p.student_id) === Number(student.student_id) || Number(p.student_id) === Number(student.id));
                        const attendanceDisplay = perf && perf.attendance_percentage !== undefined ? `${perf.attendance_percentage}%` : 'N/A';
                        const overallDisplay = perf ? `${Number(perf.overall_score || 0).toFixed(1)}%` : 'N/A';
                        return (
                          <>
                            <td className="px-8 py-4 font-medium text-slate-700">{attendanceDisplay}</td>
                            <td className="px-8 py-4 font-medium text-slate-700">{overallDisplay}</td>
                          </>
                        );
                      })()}
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
