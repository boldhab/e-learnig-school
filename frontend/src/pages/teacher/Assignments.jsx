import { useState } from 'react';
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
} from 'lucide-react';
import { TEACHER_COLORS } from '../../constants/teacherTheme';

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    open: { bg: TEACHER_COLORS.CREATE, text: '#FFFFFF', icon: '◉' },
    dueSoon: { bg: TEACHER_COLORS.WARNING, text: '#FFFFFF', icon: '⚠' },
    closed: { bg: TEACHER_COLORS.TEXT_SECONDARY, text: '#FFFFFF', icon: '✕' },
    graded: { bg: TEACHER_COLORS.SUCCESS, text: '#FFFFFF', icon: '✓' },
  };

  const config = statusConfig[status] || statusConfig.open;

  return (
    <span
      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: `${config.bg}20`, color: config.bg }}
    >
      {config.icon} {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Assignment Card Component
const AssignmentCard = ({ assignment, index }) => (
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
          {assignment.course}
        </p>
      </div>
      <motion.button
        className="p-2 rounded-lg hover:bg-gray-100"
        whileHover={{ scale: 1.1 }}
      >
        <MoreVertical size={18} style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} />
      </motion.button>
    </div>

    {/* Info Grid */}
    <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b" style={{ borderColor: TEACHER_COLORS.BORDER }}>
      <div>
        <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-xs mb-1">
          Due Date
        </p>
        <div className="flex items-center gap-2">
          <Calendar size={14} style={{ color: TEACHER_COLORS.PRIMARY_BLUE }} />
          <span style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-sm font-medium">
            {assignment.dueDate}
          </span>
        </div>
      </div>
      <div>
        <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-xs mb-1">
          Submissions
        </p>
        <div className="flex items-center gap-2">
          <Users size={14} style={{ color: TEACHER_COLORS.SECONDARY_INDIGO }} />
          <span style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-sm font-medium">
            {assignment.submissions}/{assignment.totalStudents}
          </span>
        </div>
      </div>
    </div>

    {/* Grading Progress */}
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-xs">
          Grading Progress
        </p>
        <span style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-xs font-bold">
          {assignment.graded}/{assignment.submissions}
        </span>
      </div>
      <div
        className="h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: TEACHER_COLORS.BACKGROUND }}
      >
        <motion.div
          className="h-full"
          style={{
            backgroundColor: TEACHER_COLORS.GRADE,
          }}
          initial={{ width: 0 }}
          animate={{
            width: assignment.submissions > 0 ? `${(assignment.graded / assignment.submissions) * 100}%` : '0%',
          }}
          transition={{ duration: 1 }}
        />
      </div>
    </div>

    {/* Status and Points */}
    <div className="flex items-center justify-between mb-4">
      <StatusBadge status={assignment.status} />
      <span style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-sm font-bold">
        {assignment.points} pts
      </span>
    </div>

    {/* Action Buttons */}
    <div className="grid grid-cols-3 gap-2">
      <motion.button
        className="p-2.5 rounded-lg text-xs font-medium transition-all"
        style={{
          backgroundColor: `${TEACHER_COLORS.PRIMARY_BLUE}10`,
          color: TEACHER_COLORS.PRIMARY_BLUE,
        }}
        whileHover={{ backgroundColor: `${TEACHER_COLORS.PRIMARY_BLUE}20` }}
      >
        <Eye size={14} className="mx-auto" />
      </motion.button>
      <motion.button
        className="p-2.5 rounded-lg text-xs font-medium transition-all"
        style={{
          backgroundColor: `${TEACHER_COLORS.GRADE}10`,
          color: TEACHER_COLORS.GRADE,
        }}
        whileHover={{ backgroundColor: `${TEACHER_COLORS.GRADE}20` }}
      >
        <CheckCircle size={14} className="mx-auto" />
      </motion.button>
      <motion.button
        className="p-2.5 rounded-lg text-xs font-medium transition-all"
        style={{
          backgroundColor: `${TEACHER_COLORS.DANGER}10`,
          color: TEACHER_COLORS.DANGER,
        }}
        whileHover={{ backgroundColor: `${TEACHER_COLORS.DANGER}20` }}
      >
        <Edit size={14} className="mx-auto" />
      </motion.button>
    </div>
  </motion.div>
);

// Filter Buttons Component
const FilterButtons = ({ activeFilter, setActiveFilter }) => {
  const filters = ['All', 'Open', 'Due Soon', 'Closed', 'Graded'];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {filters.map((filter) => (
        <motion.button
          key={filter}
          onClick={() => setActiveFilter(filter)}
          className="px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all"
          style={{
            backgroundColor:
              activeFilter === filter
                ? TEACHER_COLORS.PRIMARY_BLUE
                : TEACHER_COLORS.BACKGROUND,
            color:
              activeFilter === filter
                ? '#FFFFFF'
                : TEACHER_COLORS.TEXT_PRIMARY,
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {filter}
        </motion.button>
      ))}
    </div>
  );
};

const TeacherAssignments = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const assignments = [
    {
      title: 'Quadratic Equations Practice',
      course: 'Mathematics 101',
      dueDate: 'Mar 10, 2026',
      submissions: 28,
      totalStudents: 32,
      graded: 12,
      points: 50,
      status: 'open',
    },
    {
      title: 'Physics Lab Report',
      course: 'Physics 102',
      dueDate: 'Mar 8, 2026',
      submissions: 25,
      totalStudents: 28,
      graded: 18,
      points: 100,
      status: 'dueSoon',
    },
    {
      title: 'Chemistry Experiment Analysis',
      course: 'Chemistry 101',
      dueDate: 'Mar 15, 2026',
      submissions: 32,
      totalStudents: 35,
      graded: 32,
      points: 75,
      status: 'graded',
    },
    {
      title: 'Biology Essay - Evolution',
      course: 'Biology 103',
      dueDate: 'Mar 5, 2026',
      submissions: 28,
      totalStudents: 30,
      graded: 28,
      points: 60,
      status: 'closed',
    },
    {
      title: 'English Literature Analysis',
      course: 'English 201',
      dueDate: 'Mar 12, 2026',
      submissions: 31,
      totalStudents: 33,
      graded: 15,
      points: 80,
      status: 'open',
    },
    {
      title: 'History Research Project',
      course: 'History 104',
      dueDate: 'Mar 14, 2026',
      submissions: 26,
      totalStudents: 29,
      graded: 8,
      points: 90,
      status: 'open',
    },
  ];

  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch = assignment.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      activeFilter === 'All' || assignment.status === activeFilter.toLowerCase().replace(' ', '');
    return matchesSearch && matchesFilter;
  });

  return (
    <motion.div className="p-8">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-3xl font-bold">
              Assignments
            </h1>
            <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="mt-2">
              Manage {assignments.length} assignments
            </p>
          </div>
          <motion.button
            className="px-6 py-3 rounded-lg font-medium text-white flex items-center gap-2"
            style={{ backgroundColor: TEACHER_COLORS.CREATE }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={20} />
            Create Assignment
          </motion.button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="flex gap-3">
            <div
              className="flex-1 flex items-center gap-3 px-4 py-2 rounded-lg border"
              style={{
                borderColor: TEACHER_COLORS.BORDER,
                backgroundColor: TEACHER_COLORS.BACKGROUND,
              }}
            >
              <Search size={18} style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} />
              <input
                type="text"
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent outline-none w-full"
                style={{ color: TEACHER_COLORS.TEXT_PRIMARY }}
              />
            </div>
            <motion.button
              className="p-3 rounded-lg border transition-all"
              style={{
                borderColor: TEACHER_COLORS.BORDER,
                backgroundColor: TEACHER_COLORS.BACKGROUND,
              }}
              whileHover={{ scale: 1.05 }}
            >
              <Filter size={18} style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} />
            </motion.button>
          </div>

          <FilterButtons activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
        </div>
      </motion.div>

      {/* Assignments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssignments.map((assignment, index) => (
          <AssignmentCard key={index} assignment={assignment} index={index} />
        ))}
      </div>

      {/* Empty State */}
      {filteredAssignments.length === 0 && (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <AlertCircle
            size={48}
            style={{ color: TEACHER_COLORS.TEXT_SECONDARY }}
            className="mx-auto mb-4 opacity-50"
          />
          <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-lg">
            No assignments found
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default TeacherAssignments;
