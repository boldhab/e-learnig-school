import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ClipboardList, Clock3 } from 'lucide-react';
import { parentApi } from '../../api/modules/parent.api';
import ParentChildNav from '../../components/parent/ParentChildNav';
import { ParentBadge, ParentEmptyState, ParentPageHero, ParentPanel, ParentSectionHeading, ParentStatCard } from '../../components/parent/ParentUI';

const statusOptions = ['all', 'pending', 'submitted', 'late', 'missing', 'graded'];

const statusTone = {
  pending: 'bg-slate-100 text-slate-700',
  submitted: 'bg-blue-100 text-blue-700',
  late: 'bg-amber-100 text-amber-700',
  missing: 'bg-rose-100 text-rose-700',
  graded: 'bg-emerald-100 text-emerald-700',
};

const ChildAssignments = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await parentApi.getChildAssignments(id);
        setData(response.data?.data ?? null);
      } catch (error) {
        console.error('Failed to fetch child assignments', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [id]);

  const assignments = data?.assignments ?? [];
  const child = data?.child;
  const summary = data?.summary ?? {};

  const filteredAssignments = useMemo(() => {
    if (statusFilter === 'all') return assignments;
    return assignments.filter((assignment) => assignment.parent_status === statusFilter);
  }, [assignments, statusFilter]);

  if (loading) return <div className="p-6 text-slate-500">Loading assignments...</div>;

  return (
    <div className="space-y-6">
      <ParentPageHero
        eyebrow="Assignment Tracking"
        title="Assignment Monitoring"
        subtitle={`Watch assignment titles, due dates, submission status, grades, teacher feedback, and late or missing work for ${child?.full_name || 'your child'}.`}
        tone="rose"
      >
        <div className="flex flex-wrap gap-2">
          <ParentBadge tone="rose">Status types: pending, submitted, late, missing, graded</ParentBadge>
        </div>
      </ParentPageHero>

      <ParentChildNav studentId={id} />

      <div className="grid gap-4 md:grid-cols-5">
        {statusOptions.slice(1).map((status) => (
          <ParentStatCard
            key={status}
            icon={status === 'graded' ? ClipboardList : Clock3}
            label={status}
            value={summary[status] ?? 0}
            tone={status === 'graded' ? 'emerald' : status === 'late' ? 'amber' : status === 'missing' ? 'rose' : 'slate'}
          />
        ))}
      </div>

      <ParentPanel className="p-6">
        <ParentSectionHeading
          icon={ClipboardList}
          title="Assignment table"
          subtitle="Filter by status to focus on new work, overdue tasks, or recently graded submissions."
        />

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {statusOptions.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                statusFilter === status ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status === 'all' ? 'All Assignments' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="pb-3 font-semibold">Assignment</th>
                <th className="pb-3 font-semibold">Course</th>
                <th className="pb-3 font-semibold">Due Date</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Grade</th>
                <th className="pb-3 font-semibold">Teacher Feedback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAssignments.map((assignment) => (
                <tr key={assignment.id} className="align-top">
                  <td className="py-4">
                    <p className="font-semibold text-slate-900">{assignment.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{assignment.teacher_name}</p>
                  </td>
                  <td className="py-4 text-sm text-slate-600">{assignment.course_name}</td>
                  <td className="py-4 text-sm text-slate-600">
                    {assignment.due_date ? new Date(assignment.due_date).toLocaleString() : 'TBD'}
                  </td>
                  <td className="py-4">
                    <span className={`rounded-md px-3 py-1 text-xs font-semibold uppercase ${statusTone[assignment.parent_status] || statusTone.pending}`}>
                      {assignment.parent_status}
                    </span>
                  </td>
                  <td className="py-4 text-sm font-semibold text-slate-900">
                    {assignment.marks != null ? `${assignment.marks} / ${assignment.max_marks}` : '-'}
                  </td>
                  <td className="py-4 text-sm text-slate-600">
                    {assignment.feedback || 'No feedback yet'}
                  </td>
                </tr>
              ))}
              {filteredAssignments.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-sm text-slate-500">
                    No assignments match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </ParentPanel>

      {assignments.length === 0 ? (
        <ParentEmptyState
          title="No assignments published yet"
          description="When teachers post new assignments, this page will track due dates, submission states, marks, and feedback for the linked child."
        />
      ) : null}
    </div>
  );
};

export default ChildAssignments;
