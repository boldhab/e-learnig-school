import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Send,
  Download,
  Check,
  X,
  MessageSquare,
  Clock,
  User,
} from 'lucide-react';
import { TEACHER_COLORS } from '../../constants/teacherTheme';

// Submission Item (Left Panel)
const SubmissionItem = ({ submission, isSelected, onSelect }) => (
  <motion.button
    onClick={() => onSelect(submission)}
    className="w-full text-left p-4 border-b hover:bg-gray-50 transition-all"
    style={{
      borderColor: TEACHER_COLORS.BORDER,
      backgroundColor: isSelected ? `${TEACHER_COLORS.PRIMARY_BLUE}10` : 'transparent',
      borderLeft: isSelected ? `4px solid ${TEACHER_COLORS.PRIMARY_BLUE}` : 'none',
    }}
    whileHover={{ x: 4 }}
  >
    <div className="flex items-start gap-3">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
        style={{
          backgroundColor: submission.graded ? TEACHER_COLORS.SUCCESS : TEACHER_COLORS.WARNING,
        }}
      >
        {submission.name.slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="font-medium truncate">
          {submission.name}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <Clock size={12} style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} />
          <span style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-xs">
            {submission.submitted}
          </span>
        </div>
        {submission.graded && (
          <div className="flex items-center gap-1 mt-1">
            <Check size={12} style={{ color: TEACHER_COLORS.SUCCESS }} />
            <span style={{ color: TEACHER_COLORS.SUCCESS }} className="text-xs font-medium">
              Graded
            </span>
          </div>
        )}
      </div>
    </div>
  </motion.button>
);

// Submission Viewer (Center Panel)
const SubmissionViewer = ({ submission }) => (
  <motion.div
    className="bg-white rounded-xl border p-6"
    style={{ borderColor: TEACHER_COLORS.BORDER }}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    {/* Student Info */}
    <div className="mb-6 pb-6 border-b" style={{ borderColor: TEACHER_COLORS.BORDER }}>
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
          style={{ backgroundColor: TEACHER_COLORS.PRIMARY_BLUE }}
        >
          {submission.name.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="font-bold">
            {submission.name}
          </p>
          <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-sm">
            Submitted: {submission.submitted}
          </p>
        </div>
      </div>
    </div>

    {/* Submission Content */}
    <div className="mb-6">
      <h3 style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="font-bold mb-3">
        Submission Content
      </h3>
      <div
        className="p-4 rounded-lg text-sm min-h-[200px]"
        style={{
          backgroundColor: TEACHER_COLORS.BACKGROUND,
          color: TEACHER_COLORS.TEXT_PRIMARY,
        }}
      >
        <p>{submission.content}</p>
      </div>
    </div>

    {/* Attached Files */}
    {submission.files && submission.files.length > 0 && (
      <div>
        <h3 style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="font-bold mb-3">
          Attachments ({submission.files.length})
        </h3>
        <div className="space-y-2">
          {submission.files.map((file, index) => (
            <motion.div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg border"
              style={{
                borderColor: TEACHER_COLORS.BORDER,
                backgroundColor: TEACHER_COLORS.BACKGROUND,
              }}
              whileHover={{ scale: 1.02 }}
            >
              <span style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-sm">
                {file}
              </span>
              <motion.button
                className="p-2 rounded hover:bg-gray-200 transition-colors"
                whileHover={{ scale: 1.1 }}
              >
                <Download size={16} style={{ color: TEACHER_COLORS.PRIMARY_BLUE }} />
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    )}
  </motion.div>
);

// Grading Panel (Right Panel)
const GradingPanel = ({ submission, onPublish }) => {
  const [marks, setMarks] = useState(submission.marks || 0);
  const [feedback, setFeedback] = useState(submission.feedback || '');
  const [maxMarks] = useState(100);

  return (
    <motion.div
      className="bg-white rounded-xl border p-6 flex flex-col h-full"
      style={{ borderColor: TEACHER_COLORS.BORDER }}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      {/* Marks Input */}
      <div className="mb-6">
        <label style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="block text-sm font-bold mb-2">
          Marks
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            value={marks}
            onChange={(e) => setMarks(Math.min(maxMarks, Math.max(0, Number(e.target.value))))}
            className="flex-1 px-4 py-2 rounded-lg border outline-none"
            style={{ borderColor: TEACHER_COLORS.BORDER }}
            min="0"
            max={maxMarks}
          />
          <span style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="flex items-center">
            / {maxMarks}
          </span>
        </div>
        {/* Marks Bar */}
        <div
          className="h-2 rounded-full overflow-hidden mt-3"
          style={{ backgroundColor: TEACHER_COLORS.BACKGROUND }}
        >
          <motion.div
            className="h-full"
            style={{
              backgroundColor:
                marks >= maxMarks * 0.8
                  ? TEACHER_COLORS.SUCCESS
                  : marks >= maxMarks * 0.5
                  ? TEACHER_COLORS.WARNING
                  : TEACHER_COLORS.DANGER,
            }}
            animate={{ width: `${(marks / maxMarks) * 100}%` }}
            transition={{ type: 'spring', stiffness: 100 }}
          />
        </div>
      </div>

      {/* Feedback Textarea */}
      <div className="mb-6 flex-1">
        <label style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="block text-sm font-bold mb-2">
          Feedback
        </label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="w-full h-full p-3 rounded-lg border resize-none outline-none"
          style={{
            borderColor: TEACHER_COLORS.BORDER,
            color: TEACHER_COLORS.TEXT_PRIMARY,
          }}
          placeholder="Provide constructive feedback to the student..."
        />
      </div>

      {/* Rubric Sections */}
      <div className="mb-6 pb-6 border-t" style={{ borderColor: TEACHER_COLORS.BORDER }}>
        <p style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-sm font-bold mb-3">
          Quick Comments
        </p>
        <div className="space-y-2">
          {['Excellent work!', 'Good effort', 'Needs improvement', 'Missing parts'].map((comment) => (
            <motion.button
              key={comment}
              className="w-full p-2 rounded-lg text-sm transition-all text-left"
              style={{
                backgroundColor: TEACHER_COLORS.BACKGROUND,
                color: TEACHER_COLORS.TEXT_PRIMARY,
              }}
              whileHover={{
                backgroundColor: `${TEACHER_COLORS.PRIMARY_BLUE}20`,
              }}
              onClick={() => setFeedback(feedback + (feedback ? '\n' : '') + comment)}
            >
              {comment}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <motion.button
          className="w-full py-3 rounded-lg font-medium text-white flex items-center justify-center gap-2"
          style={{ backgroundColor: TEACHER_COLORS.SUCCESS }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onPublish(marks, feedback)}
        >
          <Check size={18} />
          Publish Grade
        </motion.button>
        <motion.button
          className="w-full py-3 rounded-lg font-medium transition-all"
          style={{
            backgroundColor: TEACHER_COLORS.BACKGROUND,
            color: TEACHER_COLORS.TEXT_PRIMARY,
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <MessageSquare size={18} className="inline mr-2" />
          Save Draft
        </motion.button>
      </div>
    </motion.div>
  );
};

const TeacherGrading = () => {
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const submissions = [
    {
      id: 1,
      name: 'Zainab Hassan',
      submitted: '2 hours ago',
      graded: false,
      marks: 0,
      feedback: '',
      content: 'I learned about quadratic equations by practicing several problems. First, I solved them using factorization, then using the quadratic formula. I found that the quadratic formula is more reliable when factorization is difficult.',
      files: ['Solution.pdf', 'Work_in_Progress.docx'],
    },
    {
      id: 2,
      name: 'Ahmed Ibrahim',
      submitted: '4 hours ago',
      graded: true,
      marks: 85,
      feedback: 'Great work! Your solution was clear and correct. Well done!',
      content: 'My approach was to first identify the coefficients a, b, and c. Then I used the quadratic formula to find the roots. The solution method was systematic and well-organized.',
      files: ['Solution.pdf'],
    },
    {
      id: 3,
      name: 'Fatima Yusuf',
      submitted: '6 hours ago',
      graded: false,
      marks: 0,
      feedback: '',
      content: 'I solved the quadratic equations by completing the square. This method helps me understand the vertex form better. I verified my solutions by substituting back into the original equation.',
      files: ['Solution.pdf', 'Verification.xlsx'],
    },
    {
      id: 4,
      name: 'Karim Ali',
      submitted: '1 day ago',
      graded: true,
      marks: 92,
      feedback: 'Excellent! Your solutions are accurate and your explanations are clear. Keep it up!',
      content: 'I used three different methods to solve these equations and compared the results. All methods gave the same solutions, which shows the equations are solved correctly.',
      files: ['Solution.pdf', 'Comparative_Analysis.docx'],
    },
  ];

  if (!selectedSubmission && submissions.length > 0) {
    setSelectedSubmission(submissions[0]);
  }

  const handlePublish = (marks, feedback) => {
    alert(`Published grade: ${marks}/100\nFeedback: ${feedback}`);
  };

  return (
    <motion.div className="p-8">
      {/* Header */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-3xl font-bold">
          Grade Submissions
        </h1>
        <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="mt-2">
          Mathematics 101 - Quadratic Equations Practice
        </p>
      </motion.div>

      {/* Main Grading Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
        {/* Submissions List - Left Panel */}
        <motion.div
          className="lg:col-span-1 bg-white rounded-xl border overflow-y-auto"
          style={{ borderColor: TEACHER_COLORS.BORDER }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="p-4 border-b sticky top-0 bg-white" style={{ borderColor: TEACHER_COLORS.BORDER }}>
            <p style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="font-bold">
              Submissions ({submissions.length})
            </p>
          </div>
          {submissions.map((submission) => (
            <SubmissionItem
              key={submission.id}
              submission={submission}
              isSelected={selectedSubmission?.id === submission.id}
              onSelect={setSelectedSubmission}
            />
          ))}
        </motion.div>

        {/* Submission Viewer - Center Panel */}
        <motion.div className="lg:col-span-2 overflow-y-auto">
          {selectedSubmission && <SubmissionViewer submission={selectedSubmission} />}
        </motion.div>

        {/* Grading Panel - Right Panel */}
        <motion.div className="lg:col-span-1">
          {selectedSubmission && (
            <GradingPanel submission={selectedSubmission} onPublish={handlePublish} />
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TeacherGrading;
