import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  ArrowRight, 
  Loader2, 
  Search,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { COLORS } from '../../constants/theme';
import assignmentApi from '../../api/modules/assignment.api';
import contentApi from '../../api/modules/content.api';
import toast from 'react-hot-toast';

// Assignment Card Component
const AssignmentCard = ({ assignment, onOpenSubmit }) => {
  const isPastDue = new Date(assignment.due_date) < new Date();
  const isSubmitted = assignment.submission_status === 'submitted' || assignment.submission_status === 'graded';
  
  return (
    <motion.div
      className="bg-white rounded-2xl border p-6 hover:shadow-md transition-all flex flex-col h-full"
      style={{ borderColor: COLORS.BORDER }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg ${isSubmitted ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
          <FileText size={20} />
        </div>
        <div className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
          isSubmitted ? 'bg-green-100 text-green-700' : 
          isPastDue ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
        }`}>
          {isSubmitted ? 'Submitted' : isPastDue ? 'Overdue' : 'Pending'}
        </div>
      </div>

      <h3 className="font-bold text-lg mb-2" style={{ color: COLORS.TEXT_PRIMARY }}>{assignment.title}</h3>
      <p className="text-sm text-gray-500 mb-4 line-clamp-2">{assignment.description}</p>

      <div className="mt-auto space-y-3">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Calendar size={14} />
          <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <CheckCircle2 size={14} />
          <span>Max Marks: {assignment.max_marks}</span>
        </div>

        <button
          onClick={() => onOpenSubmit(assignment)}
          disabled={isSubmitted && assignment.submission_status !== 'graded'}
          className="w-full py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all mt-4 disabled:opacity-50"
          style={{
            backgroundColor: isSubmitted ? COLORS.EMERALD_GREEN : COLORS.PRIMARY_BLUE,
            color: '#FFFFFF'
          }}
        >
          {isSubmitted ? 'View Submission' : 'Submit Work'}
          <ArrowRight size={16} />
        </button>
      </div>
    </motion.div>
  );
};

// Submission Modal Component
const SubmissionModal = ({ assignment, onClose, onRefresh }) => {
  const [file, setFile] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file && !answerText.trim()) {
      toast.error("Please provide an answer or upload a file");
      return;
    }

    const formData = new FormData();
    formData.append('answer_text', answerText);
    if (file) formData.append('submission_file', file);

    setSubmitting(true);
    try {
      await assignmentApi.submitAssignment(assignment.id, formData);
      toast.success("Assignment submitted successfully!");
      onRefresh();
      onClose();
    } catch (error) {
      toast.error("Submission failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        className="bg-white rounded-3xl w-full max-w-xl p-8"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <h2 className="text-2xl font-bold mb-2">Submit: {assignment.title}</h2>
        <p className="text-gray-500 text-sm mb-6">Deadline: {new Date(assignment.due_date).toLocaleString()}</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Write your answer (optional)</label>
            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              className="w-full p-4 rounded-xl border focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
              rows="4"
              placeholder="Enter your response here..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Upload File</label>
            <div className="border-2 border-dashed rounded-2xl p-8 text-center bg-slate-50 relative group">
              <input 
                type="file" 
                onChange={(e) => setFile(e.target.files[0])}
                className="absolute inset-0 opacity-0 cursor-pointer" 
              />
              <Upload className="mx-auto mb-2 text-gray-400 group-hover:text-blue-500 transition-colors" size={32} />
              <p className="text-sm font-medium">{file ? file.name : 'Select file (PDF, DOCX, etc.)'}</p>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-[2] py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2"
              style={{ backgroundColor: COLORS.PRIMARY_BLUE }}
            >
              {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Submit Now'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const AssignmentsPage = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('all');
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingAssignment, setSubmittingAssignment] = useState(null);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      // Get courses first to filter
      const coursesRes = await contentApi.getCourses();
      const courseList = coursesRes.data?.data ?? coursesRes.data ?? [];
      setCourses(Array.isArray(courseList) ? courseList : []);
      
      const res = await assignmentApi.getAssignments(selectedCourseId === 'all' ? '' : selectedCourseId);
      const assignmentList = res.data?.data ?? res.data ?? [];
      setAssignments(Array.isArray(assignmentList) ? assignmentList : []);
    } catch (error) {
      console.error("Failed to fetch assignments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [selectedCourseId]);

  return (
    <div className="p-6 pb-12 max-w-7xl mx-auto">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Assignments</h1>
          <p className="text-gray-500">Track your tasks and submit your academic work.</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Filter By Course:</span>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="px-4 py-2 rounded-xl border bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-medium"
          >
            <option value="all">All Courses</option>
            {Array.isArray(courses) && courses.map(course => (
              <option key={course.id} value={course.id}>{course.name}</option>
            ))}
          </select>
        </div>
      </header>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
      ) : !Array.isArray(assignments) || assignments.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed p-20 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
            <BookOpen size={40} />
          </div>
          <h2 className="text-xl font-semibold mb-2">No Assignments Yet</h2>
          <p className="text-gray-500">When your teachers assign tasks, they will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((assignment) => (
            <AssignmentCard 
              key={assignment.id} 
              assignment={assignment} 
              onOpenSubmit={setSubmittingAssignment}
            />
          ))}
        </div>
      )}

      {/* Submission Modal */}
      {submittingAssignment && (
        <SubmissionModal 
          assignment={submittingAssignment} 
          onClose={() => setSubmittingAssignment(null)} 
          onRefresh={fetchAssignments}
        />
      )}
    </div>
  );
};

export default AssignmentsPage;
