import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Calendar,
  Edit,
  Trash2,
  Eye,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TEACHER_COLORS } from '../../constants/teacherTheme';
import assignmentApi from '../../api/modules/assignment.api';
import toast from 'react-hot-toast';

// Status Badge Component
const StatusBadge = ({ assignment }) => {
  const isPastDue = new Date(assignment.due_date) < new Date();
  
  return (
    <span
      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
      style={{ 
        backgroundColor: isPastDue ? `${TEACHER_COLORS.DANGER}20` : `${TEACHER_COLORS.SUCCESS}20`, 
        color: isPastDue ? TEACHER_COLORS.DANGER : TEACHER_COLORS.SUCCESS 
      }}
    >
      {isPastDue ? '✕ Past Due' : '◉ Active'}
    </span>
  );
};

// Assignment Card Component
const AssignmentCard = ({ assignment, index, onGrade }) => (
  <motion.div
    className="bg-white p-6 rounded-xl border hover:shadow-lg transition-all"
    style={{ borderColor: TEACHER_COLORS.BORDER }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    whileHover={{ y: -4 }}
  >
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <h3 style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-lg font-bold">
          {assignment.title}
        </h3>
        <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-sm mt-1">
          {assignment.course_name || 'Academic Course'}
        </p>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b" style={{ borderColor: TEACHER_COLORS.BORDER }}>
      <div>
        <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-xs mb-1">Due Date</p>
        <div className="flex items-center gap-2">
          <Calendar size={14} style={{ color: TEACHER_COLORS.PRIMARY_BLUE }} />
          <span style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-sm font-medium">
            {new Date(assignment.due_date).toLocaleDateString()}
          </span>
        </div>
      </div>
      <div>
        <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-xs mb-1">Max Marks</p>
        <div className="flex items-center gap-2">
          <CheckCircle size={14} style={{ color: TEACHER_COLORS.GRADE }} />
          <span style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-sm font-medium">
            {assignment.max_marks}
          </span>
        </div>
      </div>
    </div>

    <div className="flex items-center justify-between mb-6">
      <StatusBadge assignment={assignment} />
      <span className="text-xs text-gray-400">Created {new Date(assignment.created_at).toLocaleDateString()}</span>
    </div>

    <div className="grid grid-cols-2 gap-3">
      <motion.button
        onClick={() => onGrade(assignment.id)}
        className="py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 text-white"
        style={{ backgroundColor: TEACHER_COLORS.PRIMARY_BLUE }}
        whileHover={{ scale: 1.05 }}
      >
        <Eye size={14} />
        View Submissions
      </motion.button>
      <motion.button
        className="py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 text-white"
        style={{ backgroundColor: TEACHER_COLORS.GRADE }}
        whileHover={{ scale: 1.05 }}
      >
        <Edit size={14} />
        Edit
      </motion.button>
    </div>
  </motion.div>
);

const TeacherAssignments = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAssignments = async () => {
    try {
      const res = await assignmentApi.getAssignments('');
      setAssignments(res.data);
    } catch (error) {
      console.error("Failed to fetch assignments:", error);
      toast.error("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const filteredAssignments = assignments.filter((assignment) =>
    assignment.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <motion.div className="p-8 max-w-7xl mx-auto">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-3xl font-bold">Assignments</h1>
          <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="mt-2">
            You have {assignments.length} assignments active.
          </p>
        </div>
        <motion.button
          onClick={() => navigate('/teacher/assignments/create')}
          className="px-6 py-3 rounded-xl font-bold text-white flex items-center gap-2 shadow-lg"
          style={{ backgroundColor: TEACHER_COLORS.CREATE }}
          whileHover={{ scale: 1.05 }}
        >
          <Plus size={20} />
          Create New
        </motion.button>
      </header>

      <div className="relative max-w-md mb-8">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search assignments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border outline-none focus:ring-2 transition-all shadow-sm"
          style={{ borderColor: TEACHER_COLORS.BORDER }}
        />
      </div>

      {filteredAssignments.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed p-20 text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-slate-300" />
          <p className="text-lg font-medium text-slate-500">No assignments found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssignments.map((assignment, index) => (
            <AssignmentCard 
              key={assignment.id} 
              assignment={assignment} 
              index={index} 
              onGrade={(id) => navigate(`/teacher/assignments/${id}/grade`)}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default TeacherAssignments;
