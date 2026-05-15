import { useEffect, useState } from 'react';
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
  Loader2,
} from 'lucide-react';
import { TEACHER_COLORS } from '../../constants/teacherTheme';
import assignmentApi from '../../api/modules/assignment.api';
import toast from 'react-hot-toast';

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
          backgroundColor: submission.status === 'graded' ? TEACHER_COLORS.SUCCESS : TEACHER_COLORS.WARNING,
        }}
      >
        {submission.student_name?.slice(0, 2).toUpperCase() || 'UN'}
      </div>
      <div className="flex-1 min-w-0">
        <p style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="font-medium truncate">
          {submission.student_name}
        </p>
        <p style={{ color: TEACHER_COLORS.PRIMARY_BLUE }} className="text-xs truncate font-semibold mb-1">
          {submission.assignment_title}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <Clock size={12} style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} />
          <span style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-xs">
            {new Date(submission.submitted_at || submission.created_at).toLocaleString()}
          </span>
        </div>
        {submission.status === 'graded' && (
          <div className="flex items-center gap-1 mt-1">
            <Check size={12} style={{ color: TEACHER_COLORS.SUCCESS }} />
            <span style={{ color: TEACHER_COLORS.SUCCESS }} className="text-xs font-medium">
              Graded ({submission.marks}/{submission.max_marks})
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
    className="bg-white rounded-xl border p-6 h-full"
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
          {submission.student_name?.slice(0, 2).toUpperCase() || 'UN'}
        </div>
        <div>
          <p style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="font-bold text-lg">
            {submission.student_name}
          </p>
          <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-sm">
            Submitted: {new Date(submission.submitted_at || submission.created_at).toLocaleString()}
          </p>
          <p className="text-sm text-blue-600 mt-1 font-semibold">{submission.assignment_title}</p>
        </div>
      </div>
    </div>

    {/* Submission Content */}
    <div className="mb-6">
      <h3 style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="font-bold mb-3 flex items-center justify-between">
        Submission Text
      </h3>
      <div
        className="p-4 rounded-lg text-sm min-h-[200px] whitespace-pre-wrap"
        style={{
          backgroundColor: TEACHER_COLORS.BACKGROUND,
          color: TEACHER_COLORS.TEXT_PRIMARY,
        }}
      >
        {submission.answer_text || 'No text provided.'}
      </div>
    </div>

    {/* Attached Files */}
    {submission.submission_file_url && (
      <div>
        <h3 style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="font-bold mb-3">
          Attachments (1)
        </h3>
        <div className="space-y-2">
            <motion.div
              className="flex items-center justify-between p-3 rounded-lg border"
              style={{
                borderColor: TEACHER_COLORS.BORDER,
                backgroundColor: TEACHER_COLORS.BACKGROUND,
              }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <Download size={16} />
                </div>
                <span style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-sm font-medium">
                  Student Attachment
                </span>
              </div>
              <a href={submission.submission_file_url} target="_blank" rel="noopener noreferrer">
                <motion.button
                  className="px-4 py-2 text-sm font-bold text-white rounded-lg transition-colors shadow-sm"
                  style={{ backgroundColor: TEACHER_COLORS.PRIMARY_BLUE }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View File
                </motion.button>
              </a>
            </motion.div>
        </div>
      </div>
    )}
  </motion.div>
);

// Grading Panel (Right Panel)
const GradingPanel = ({ submission, onPublish }) => {
  const [marks, setMarks] = useState(submission.marks || 0);
  const [feedback, setFeedback] = useState(submission.feedback || '');
  const [maxMarks, setMaxMarks] = useState(submission.max_marks || 100);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setMarks(submission.marks || 0);
    setFeedback(submission.feedback || '');
    setMaxMarks(submission.max_marks || 100);
  }, [submission]);

  const handlePublishClick = async () => {
    setSubmitting(true);
    await onPublish(marks, feedback);
    setSubmitting(false);
  };

  return (
    <motion.div
      className="bg-white rounded-xl border p-6 flex flex-col h-full"
      style={{ borderColor: TEACHER_COLORS.BORDER }}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="mb-4 flex items-center justify-between">
         <h3 className="font-bold text-lg" style={{ color: TEACHER_COLORS.TEXT_PRIMARY }}>Grading</h3>
         {submission.status === 'graded' && (
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wide">
                Graded
            </span>
         )}
      </div>

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
            className="flex-1 px-4 py-2 rounded-lg border outline-none font-bold text-lg text-center focus:ring-2 focus:ring-blue-500/20 transition-all"
            style={{ borderColor: TEACHER_COLORS.BORDER }}
            min="0"
            max={maxMarks}
          />
          <span style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="flex items-center text-lg font-bold">
            / {maxMarks}
          </span>
        </div>
        {/* Marks Bar */}
        <div
          className="h-2 rounded-full overflow-hidden mt-3 bg-slate-100"
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
      <div className="mb-6 flex-1 flex flex-col">
        <label style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="block text-sm font-bold mb-2">
          Feedback
        </label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="w-full flex-1 p-3 rounded-lg border resize-none outline-none focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[120px]"
          style={{
            borderColor: TEACHER_COLORS.BORDER,
            color: TEACHER_COLORS.TEXT_PRIMARY,
          }}
          placeholder="Provide constructive feedback to the student..."
        />
      </div>

      {/* Rubric Sections */}
      <div className="mb-6 pb-6 border-t pt-4" style={{ borderColor: TEACHER_COLORS.BORDER }}>
        <p style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-sm font-bold mb-3">
          Quick Comments
        </p>
        <div className="flex flex-wrap gap-2">
          {['Excellent work!', 'Good effort', 'Needs improvement', 'Missing parts'].map((comment) => (
            <motion.button
              key={comment}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all border hover:border-blue-400 hover:text-blue-600"
              style={{
                backgroundColor: TEACHER_COLORS.BACKGROUND,
                color: TEACHER_COLORS.TEXT_SECONDARY,
                borderColor: TEACHER_COLORS.BORDER,
              }}
              whileHover={{ scale: 1.05 }}
              onClick={() => setFeedback(feedback + (feedback ? '\n' : '') + comment)}
            >
              {comment}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 mt-auto">
        <motion.button
          className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-md disabled:opacity-70"
          style={{ backgroundColor: TEACHER_COLORS.PRIMARY_BLUE }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handlePublishClick}
          disabled={submitting}
        >
          {submitting ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
          {submission.status === 'graded' ? 'Update Grade' : 'Publish Grade'}
        </motion.button>
      </div>
    </motion.div>
  );
};

const TeacherGrading = () => {
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await assignmentApi.getTeacherSubmissions();
      const data = res.data?.data ?? res.data ?? [];
      setSubmissions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch teacher submissions:", error);
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  useEffect(() => {
    // Select first submission automatically if none selected or the selected one isn't in the new list
    if (submissions.length > 0) {
        if (!selectedSubmission || !submissions.find(s => s.id === selectedSubmission.id)) {
            setSelectedSubmission(submissions[0]);
        } else {
            // Update selected submission data if it was updated
            setSelectedSubmission(submissions.find(s => s.id === selectedSubmission.id));
        }
    } else {
        setSelectedSubmission(null);
    }
  }, [submissions]);

  const handlePublish = async (marks, feedback) => {
    if (!selectedSubmission) return;
    try {
      await assignmentApi.gradeSubmission(selectedSubmission.id, { marks, feedback });
      toast.success("Grade published successfully");
      fetchSubmissions(); // refresh list
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to publish grade");
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="text-slate-500 font-medium">Loading submissions...</p>
      </div>
    );
  }

  return (
    <motion.div className="p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-3xl font-extrabold tracking-tight">
          Global Grading Inbox
        </h1>
        <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="mt-2 text-lg">
          Review and grade all pending submissions across your courses.
        </p>
      </motion.div>

      {submissions.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed p-16 text-center max-w-3xl mx-auto shadow-sm">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check size={32} className="text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">All caught up!</h3>
            <p className="text-slate-500">There are no submissions waiting to be graded at the moment.</p>
          </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-200px)] min-h-[600px]">
            {/* Submissions List - Left Panel */}
            <motion.div
            className="lg:col-span-1 bg-white rounded-2xl border overflow-hidden flex flex-col shadow-sm"
            style={{ borderColor: TEACHER_COLORS.BORDER }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            >
            <div className="p-5 border-b bg-slate-50 flex items-center justify-between" style={{ borderColor: TEACHER_COLORS.BORDER }}>
                <p style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="font-bold text-sm uppercase tracking-wider">
                Submissions
                </p>
                <span className="bg-blue-100 text-blue-700 py-1 px-3 rounded-full text-xs font-bold">
                    {submissions.length} Total
                </span>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {submissions.map((submission) => (
                <SubmissionItem
                    key={submission.id}
                    submission={submission}
                    isSelected={selectedSubmission?.id === submission.id}
                    onSelect={setSelectedSubmission}
                />
                ))}
            </div>
            </motion.div>

            {/* Submission Viewer - Center Panel */}
            <motion.div className="lg:col-span-2 overflow-y-auto custom-scrollbar">
            {selectedSubmission && <SubmissionViewer submission={selectedSubmission} />}
            </motion.div>

            {/* Grading Panel - Right Panel */}
            <motion.div className="lg:col-span-1 h-full">
            {selectedSubmission && (
                <GradingPanel submission={selectedSubmission} onPublish={handlePublish} />
            )}
            </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default TeacherGrading;
