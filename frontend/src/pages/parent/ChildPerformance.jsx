import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { parentApi } from '../../api/modules/parent.api';
import { Card, PageHeader } from '../../components/common/UIComponents';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ChildPerformance = () => {
  const { id } = useParams();
  const [performance, setPerformance] = useState(null);
  const [riskReport, setRiskReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [perfRes, riskRes] = await Promise.all([
          parentApi.getChildPerformance(id),
          parentApi.getChildRiskReport(id).catch(() => ({ data: { data: null } }))
        ]);
        setPerformance(perfRes.data.data);
        setRiskReport(riskRes.data?.data);
      } catch (error) {
        console.error("Failed to fetch child performance", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="text-white p-6">Loading performance data...</div>;

  return (
    <div className="space-y-6 text-white">
      <PageHeader
        title="Student Performance"
        subtitle="Detailed academic overview"
      />

      {riskReport && riskReport.risk_level === 'high' && (
        <div className="bg-red-500/20 border border-red-500/50 p-4 rounded-xl">
          <h3 className="text-red-400 font-bold flex items-center gap-2">⚠️ High Academic Risk</h3>
          <p className="mt-1 text-sm text-red-200">{riskReport.improvement_recommendations}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Grade Overview</h3>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={performance?.course_averages || []}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                 <XAxis dataKey="course_name" stroke="#888" />
                 <YAxis stroke="#888" domain={[0, 100]} />
                 <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                 <Bar dataKey="average_percentage" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Average (%)" />
               </BarChart>
             </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Recent Submissions</h3>
          <div className="space-y-4">
            {performance?.recent_submissions?.length > 0 ? (
               performance.recent_submissions.map(sub => (
                 <div key={sub.id} className="p-3 bg-white/5 rounded-lg border border-white/10 flex justify-between items-center">
                   <div>
                     <p className="font-semibold">{sub.title}</p>
                     <p className="text-xs text-gray-400">{sub.course_name}</p>
                   </div>
                   <div className="text-right">
                     <p className="font-bold text-blue-400">{sub.marks} / {sub.max_marks}</p>
                   </div>
                 </div>
               ))
            ) : (
              <p className="text-gray-400 text-sm">No recent graded submissions.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ChildPerformance;
