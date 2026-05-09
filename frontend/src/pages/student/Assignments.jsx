import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, FileText, AlertCircle, CheckCircle, Upload, ChevronRight } from 'lucide-react';
import { COLORS } from '../../constants/theme';

// Assignment Status Badge
const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { bg: `${COLORS.WARNING}15`, color: COLORS.WARNING, label: 'Pending', icon: AlertCircle },
    submitted: { bg: `${COLORS.INFO}15`, color: COLORS.INFO, label: 'Submitted', icon: CheckCircle },
    graded: { bg: `${COLORS.EMERALD_GREEN}15`, color: COLORS.EMERALD_GREEN, label: 'Graded', icon: CheckCircle },
    overdue: { bg: `${COLORS.DANGER}15`, color: COLORS.DANGER, label: 'Overdue', icon: AlertCircle },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: config.bg, color: config.color }}>
      <Icon size={14} />
      {config.label}
    </span>
  );
};

// Assignment Card Component
const AssignmentCard = ({ assignment, index }) => {
  const isDue = assignment.daysLeft <= 3;

  return (
    <motion.div
      className="bg-white p-6 rounded-xl border overflow-hidden transition-all hover:shadow-lg cursor-pointer"
      style={{ borderColor: COLORS.BORDER }}
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold mb-1" style={{ color: COLORS.TEXT_PRIMARY }}>
            {assignment.title}
          </h3>
          <p style={{ color: COLORS.TEXT_SECONDARY }} className="text-sm">
            {assignment.course}
          </p>
        </div>
        <StatusBadge status={assignment.status} />
      </div>

      {/* Assignment Details */}
      <div className="space-y-2 mb-4 pb-4 border-b" style={{ borderColor: COLORS.BORDER }}>
        <div className="flex items-center gap-2 text-sm" style={{ color: COLORS.TEXT_SECONDARY }}>
          <Calendar size={16} />
          <span>Due: {assignment.dueDate}</span>
        </div>
        <div className="flex items-center gap-2 text-sm" style={{ color: isDue ? COLORS.DANGER : COLORS.TEXT_SECONDARY }}>
          <Clock size={16} />
          <span>{assignment.daysLeft} days left</span>
        </div>
        {assignment.description && (
          <div className="flex items-start gap-2 text-sm" style={{ color: COLORS.TEXT_SECONDARY }}>
            <FileText size={16} className="flex-shrink-0 mt-0.5" />
            <span>{assignment.description}</span>
          </div>
        )}
      </div>

      {/* Assignment Info */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-lg" style={{ backgroundColor: COLORS.BACKGROUND }}>
          <p className="text-xs font-semibold mb-1" style={{ color: COLORS.TEXT_SECONDARY }}>
            Points
          </p>
          <p className="text-lg font-bold" style={{ color: COLORS.TEXT_PRIMARY }}>
            {assignment.points}
          </p>
        </div>
        {assignment.status === 'graded' && (
          <div className="p-3 rounded-lg" style={{ backgroundColor: `${COLORS.EMERALD_GREEN}15` }}>
            <p className="text-xs font-semibold mb-1" style={{ color: COLORS.EMERALD_GREEN }}>
              Score
            </p>
            <p className="text-lg font-bold" style={{ color: COLORS.EMERALD_GREEN }}>
              {assignment.score}/{assignment.points}
            </p>
          </div>
        )}
        {assignment.attachments && (
          <div className="p-3 rounded-lg" style={{ backgroundColor: COLORS.BACKGROUND }}>
            <p className="text-xs font-semibold mb-1" style={{ color: COLORS.TEXT_SECONDARY }}>
              Files
            </p>
            <p className="text-lg font-bold" style={{ color: COLORS.TEXT_PRIMARY }}>
              {assignment.attachments}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {assignment.status === 'pending' && (
          <motion.button
            className="flex-1 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
            style={{
              backgroundColor: COLORS.PRIMARY_BLUE,
              color: '#FFFFFF',
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Upload size={16} />
            Submit
          </motion.button>
        )}
        {assignment.status === 'submitted' && (
          <motion.button
            className="flex-1 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2"
            style={{
              backgroundColor: COLORS.BACKGROUND,
              color: COLORS.PRIMARY_BLUE,
              border: `1px solid ${COLORS.BORDER}`,
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Edit Submission
          </motion.button>
        )}
        <motion.button
          className="flex-1 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
          style={{
            backgroundColor: COLORS.BACKGROUND,
            color: COLORS.PRIMARY_BLUE,
            border: `1px solid ${COLORS.BORDER}`,
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          View Details
          <ChevronRight size={16} />
        </motion.button>
      </div>

      {/* Feedback */}
      {assignment.feedback && (
        <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-100">
          <p className="text-xs font-semibold mb-1" style={{ color: COLORS.INFO }}>
            Teacher Feedback
          </p>
          <p className="text-sm" style={{ color: COLORS.TEXT_SECONDARY }}>
            {assignment.feedback}
          </p>
        </div>
      )}
    </motion.div>
  );
};

// Filter Component
const FilterButtons = ({ activeFilter, setActiveFilter }) => {
  const filters = ['All', 'Pending', 'Submitted', 'Graded', 'Overdue'];

  return (
    <motion.div
      className="flex gap-2 mb-8 overflow-x-auto pb-2"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {filters.map((filter) => (
        <motion.button
          key={filter}
          onClick={() => setActiveFilter(filter)}
          className="px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all"
          style={{
            backgroundColor: activeFilter === filter ? COLORS.PRIMARY_BLUE : COLORS.BACKGROUND,
            color: activeFilter === filter ? '#FFFFFF' : COLORS.TEXT_PRIMARY,
            border: activeFilter === filter ? 'none' : `1px solid ${COLORS.BORDER}`,
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {filter}
        </motion.button>
      ))}
    </motion.div>
  );
};

// Main Assignments Page
const AssignmentsPage = () => {
  const [activeFilter, setActiveFilter] = useState('All');

  const assignments = [
    {
      id: 1,
      title: 'React Component Library',
      course: 'Advanced Web Development',
      status: 'pending',
      dueDate: 'May 12, 2026',
      daysLeft: 2,
      points: 100,
      description: 'Build a reusable component library with 10+ components',
      attachments: 3,
    },
    {
      id: 2,
      title: 'Database Schema Design',
      course: 'Database Design & SQL',
      status: 'submitted',
      dueDate: 'May 10, 2026',
      daysLeft: 0,
      points: 80,
      description: 'Design and normalize a database for an e-commerce platform',
    },
    {
      id: 3,
      title: 'Algorithm Analysis Paper',
      course: 'Data Structures & Algorithms',
      status: 'graded',
      dueDate: 'May 5, 2026',
      daysLeft: -3,
      points: 100,
      score: 95,
      feedback: 'Excellent analysis! Your time complexity calculations were spot-on.',
    },
    {
      id: 4,
      title: 'UI Design Mockups',
      course: 'UI/UX Design Principles',
      status: 'pending',
      dueDate: 'May 15, 2026',
      daysLeft: 5,
      points: 100,
      description: 'Create 5 high-fidelity mockups for a mobile banking app',
      attachments: 2,
    },
    {
      id: 5,
      title: 'AWS Infrastructure Setup',
      course: 'Cloud Computing with AWS',
      status: 'overdue',
      dueDate: 'May 8, 2026',
      daysLeft: -1,
      points: 90,
      description: 'Deploy a multi-tier application on AWS',
    },
    {
      id: 6,
      title: 'Machine Learning Model',
      course: 'Machine Learning Basics',
      status: 'submitted',
      dueDate: 'May 11, 2026',
      daysLeft: 1,
      points: 100,
      description: 'Build and train a classification model on provided dataset',
      attachments: 5,
    },
  ];

  // Filter assignments
  const filteredAssignments = assignments.filter((assignment) => {
    if (activeFilter === 'All') return true;
    return assignment.status === activeFilter.toLowerCase();
  });

  return (
    <div className="p-6 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.TEXT_PRIMARY }}>
          Assignments
        </h1>
        <p style={{ color: COLORS.TEXT_SECONDARY }} className="text-lg">
          {filteredAssignments.length} assignment{filteredAssignments.length !== 1 ? 's' : ''}
        </p>
      </motion.div>

      {/* Filter Buttons */}
      <FilterButtons activeFilter={activeFilter} setActiveFilter={setActiveFilter} />

      {/* Assignments List */}
      {filteredAssignments.length > 0 ? (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.05 }}
        >
          {filteredAssignments.map((assignment, index) => (
            <AssignmentCard key={assignment.id} assignment={assignment} index={index} />
          ))}
        </motion.div>
      ) : (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <CheckCircle size={48} style={{ color: COLORS.TEXT_SECONDARY }} className="mx-auto mb-4 opacity-20" />
          <p style={{ color: COLORS.TEXT_SECONDARY }} className="text-lg">
            No assignments in this category
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default AssignmentsPage;
