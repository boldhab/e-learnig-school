import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  CheckCircle2, 
  FileText, 
  Download, 
  Search, 
  Loader2, 
  ExternalLink,
  MessageSquare,
  Trophy
} from 'lucide-react';
import { TEACHER_COLORS } from '../../constants/teacherTheme';
import assignmentApi from '../../api/modules/assignment.api';
import toast from 'react-hot-toast';

const GradeSubmissionsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradingData, setGradingData] = useState({ marks: '', feedback: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [assignmentRes, submissionsRes] = await Promise.all([
        assignmentApi.getAssignmentDetails(id),
        assignmentApi.getAssignmentSubmissions(id)
      ]);
      setAssignment(assignmentRes.data);
      setSubmissions(submissionsRes.data.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleGrade = async (e) => {
    e.preventDefault();
    if (!selectedSubmission || !gradingData.marks) return;

    setSubmitting(true);
    try {
      await assignmentApi.gradeSubmission(selectedSubmission.id, gradingData);
      toast.success("Submission graded successfully!");
      fetchData(); // Refresh list
      setSelectedSubmission(null);
      setGradingData({ marks: '', feedback: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || "Grading failed");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSubmissions = submissions.filter(s => 
    s.student_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <button
          onClick={() => navigate('/teacher/assignments')}
          className="flex items-center gap-2 text-slate-500 mb-6 hover:text-slate-900 transition-all"
        >
          <ArrowLeft size={20} />
          Back to Assignments
        </button>

        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{assignment?.title}</h1>
            <p className="text-slate-500">Grading Portal • {submissions.length} Submissions</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-blue-50 px-6 py-3 rounded-2xl border border-blue-100 text-center">
              <p className="text-[10px] uppercase font-bold text-blue-600 mb-1">Total Submissions</p>
              <p className="text-2xl font-bold text-blue-900">{submissions.length}</p>
            </div>
            <div className="bg-green-50 px-6 py-3 rounded-2xl border border-green-100 text-center">
              <p className="text-[10px] uppercase font-bold text-green-600 mb-1">Graded</p>
              <p className="text-2xl font-bold text-green-900">
                {submissions.filter(s => s.status === 'graded').length}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Submissions List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative mb-6">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border outline-none focus:ring-2 transition-all shadow-sm"
              style={{ borderColor: TEACHER_COLORS.BORDER }}
            />
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredSubmissions.map((sub) => (
              <motion.div
                key={sub.id}
                onClick={() => setSelectedSubmission(sub)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  selectedSubmission?.id === sub.id ? 'border-blue-500 bg-blue-50 shadow-md' : 'bg-white hover:border-blue-300'
                }`}
                whileHover={{ x: 4 }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                    {sub.student_name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{sub.student_name}</h4>
                    <p className="text-xs text-slate-400">Submitted {new Date(sub.submitted_at).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {sub.status === 'graded' ? (
                    <div className="text-right">
                      <p className="text-xs font-bold text-green-600">{sub.marks} / {assignment.max_marks}</p>
                      <p className="text-[10px] text-green-500 uppercase font-bold">Graded</p>
                    </div>
                  ) : (
                    <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-bold uppercase">
                      Pending
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Grading Panel */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            {selectedSubmission ? (
              <motion.div
                key={selectedSubmission.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-3xl border p-8 shadow-sm sticky top-8"
                style={{ borderColor: TEACHER_COLORS.BORDER }}
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold">Grade Submission</h3>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    selectedSubmission.status === 'graded' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {selectedSubmission.status.toUpperCase()}
                  </div>
                </div>

                {/* Submission Content */}
                <div className="space-y-6 mb-8">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Student Answer</p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                      {selectedSubmission.answer_text || "No text provided."}
                    </p>
                  </div>

                  {selectedSubmission.submission_file_url && (
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl border border-blue-100">
                      <div className="flex items-center gap-3">
                        <FileText className="text-blue-600" size={24} />
                        <div>
                          <p className="text-xs font-bold text-blue-900">Attachment Provided</p>
                          <p className="text-[10px] text-blue-600">Cloudinary Secure File</p>
                        </div>
                      </div>
                      <a
                        href={selectedSubmission.submission_file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white rounded-lg shadow-sm hover:scale-110 transition-transform text-blue-600"
                      >
                        <ExternalLink size={20} />
                      </a>
                    </div>
                  )}
                </div>

                {/* Grading Form */}
                <form onSubmit={handleGrade} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center justify-between">
                      Marks (Max {assignment.max_marks})
                      {gradingData.marks && (
                        <span className="text-blue-600">
                          {((gradingData.marks / assignment.max_marks) * 100).toFixed(0)}%
                        </span>
                      )}
                    </label>
                    <input
                      type="number"
                      required
                      max={assignment.max_marks}
                      min="0"
                      value={gradingData.marks}
                      onChange={(e) => setGradingData({ ...gradingData, marks: e.target.value })}
                      placeholder="Enter marks..."
                      className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Feedback</label>
                    <textarea
                      value={gradingData.feedback}
                      onChange={(e) => setGradingData({ ...gradingData, feedback: e.target.value })}
                      placeholder="Enter feedback for student..."
                      rows="4"
                      className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 shadow-lg disabled:opacity-70"
                    style={{ backgroundColor: TEACHER_COLORS.PRIMARY_BLUE }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {submitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                    {selectedSubmission.status === 'graded' ? 'Update Grade' : 'Save & Notify Student'}
                  </motion.button>
                </form>
              </motion.div>
            ) : (
              <div className="bg-slate-50 rounded-3xl border border-dashed p-12 text-center h-full flex flex-col items-center justify-center">
                <Trophy size={48} className="text-slate-300 mb-4" />
                <h4 className="text-slate-600 font-bold mb-2">Ready to Grade?</h4>
                <p className="text-sm text-slate-400 max-w-xs">
                  Select a student from the left to view their submission and assign marks.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default GradeSubmissionsPage;
