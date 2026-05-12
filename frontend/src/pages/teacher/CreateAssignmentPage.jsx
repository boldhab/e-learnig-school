import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2, UploadCloud, Calendar, Clock, BookOpen, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { TEACHER_COLORS } from '../../constants/teacherTheme';
import teacherApi from '../../api/modules/teacher.api';
import assignmentApi from '../../api/modules/assignment.api';

const CreateAssignmentPage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course_id: '',
    due_date: '',
    max_marks: '100',
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await teacherApi.getDashboard();
        // The API returns courses assigned to the teacher
        const dashboardData = response.data?.data ?? response.data ?? {};
        const assignedCourses = dashboardData.courses || [];
        setCourses(assignedCourses);
        if (assignedCourses.length > 0) {
          setFormData(prev => ({ ...prev, course_id: assignedCourses[0].course_id || assignedCourses[0].id }));
        }
      } catch (error) {
        console.error('Failed to load courses:', error);
        toast.error('Unable to load your assigned courses.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.course_id || !formData.due_date || !formData.max_marks) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('course_id', formData.course_id);
    
    // Format the date string properly for MySQL DATETIME
    const isoDate = new Date(formData.due_date).toISOString().slice(0, 19).replace('T', ' ');
    data.append('due_date', isoDate);
    
    data.append('max_marks', formData.max_marks);
    if (selectedFile) {
      data.append('attachment', selectedFile);
    }

    try {
      await assignmentApi.createAssignment(data);
      toast.success('Assignment created successfully!');
      navigate('/teacher/assignments');
    } catch (error) {
      console.error('Failed to create assignment:', error);
      toast.error(error.response?.data?.message || 'Failed to create assignment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <motion.div className="mx-auto max-w-4xl p-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <button
        onClick={() => navigate('/teacher/assignments')}
        className="mb-6 flex items-center gap-2 font-medium text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft size={18} /> Back to Assignments
      </button>

      <div className="mb-8 border-b pb-4" style={{ borderColor: TEACHER_COLORS.BORDER }}>
        <h1 style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-3xl font-bold">Create New Assignment</h1>
        <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="mt-2 text-sm">
          Distribute a new task to your students. It will immediately appear on their dashboard.
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-10 text-center bg-slate-50">
          <AlertCircle size={48} className="mx-auto mb-4 text-orange-400" />
          <h2 className="text-lg font-bold text-slate-800">No Assigned Sections</h2>
          <p className="text-slate-500 mt-2">You cannot create an assignment because you have no assigned courses or classes.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold" style={{ color: TEACHER_COLORS.TEXT_PRIMARY }}>Assignment Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Final Semester Project"
                className="w-full rounded-xl border p-3 outline-none focus:ring-2 transition-all shadow-sm"
                style={{ borderColor: TEACHER_COLORS.BORDER, focusRing: TEACHER_COLORS.PRIMARY_BLUE }}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold flex items-center gap-2" style={{ color: TEACHER_COLORS.TEXT_PRIMARY }}>
                <BookOpen size={16} /> Select Course Section *
              </label>
              <select
                name="course_id"
                value={formData.course_id}
                onChange={handleChange}
                className="w-full rounded-xl border p-3 outline-none focus:ring-2 transition-all shadow-sm bg-white"
                style={{ borderColor: TEACHER_COLORS.BORDER }}
                required
              >
                {courses.map(course => (
                  <option key={course.course_id || course.id} value={course.course_id || course.id}>
                    {course.name || course.course_name || 'Course'} - {course.class_name || course.grade_name || ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold flex items-center gap-2" style={{ color: TEACHER_COLORS.TEXT_PRIMARY }}>
                <Calendar size={16} /> Due Date *
              </label>
              <input
                type="datetime-local"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                className="w-full rounded-xl border p-3 outline-none focus:ring-2 transition-all shadow-sm"
                style={{ borderColor: TEACHER_COLORS.BORDER }}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold flex items-center gap-2" style={{ color: TEACHER_COLORS.TEXT_PRIMARY }}>
                Max Marks *
              </label>
              <input
                type="number"
                name="max_marks"
                value={formData.max_marks}
                onChange={handleChange}
                min="1"
                className="w-full rounded-xl border p-3 outline-none focus:ring-2 transition-all shadow-sm"
                style={{ borderColor: TEACHER_COLORS.BORDER }}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold flex items-center gap-2" style={{ color: TEACHER_COLORS.TEXT_PRIMARY }}>
                <UploadCloud size={16} /> Attachment (Optional)
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full rounded-xl border p-2 outline-none focus:ring-2 transition-all shadow-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                style={{ borderColor: TEACHER_COLORS.BORDER }}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold" style={{ color: TEACHER_COLORS.TEXT_PRIMARY }}>Description & Instructions</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide detailed instructions for the assignment..."
                rows="5"
                className="w-full rounded-xl border p-3 outline-none focus:ring-2 transition-all shadow-sm resize-none"
                style={{ borderColor: TEACHER_COLORS.BORDER }}
              ></textarea>
            </div>
          </div>

          <div className="pt-6 border-t flex justify-end" style={{ borderColor: TEACHER_COLORS.BORDER }}>
            <motion.button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 rounded-xl font-bold text-white flex items-center gap-2 shadow-lg disabled:opacity-70"
              style={{ backgroundColor: TEACHER_COLORS.CREATE }}
              whileHover={{ scale: submitting ? 1 : 1.02 }}
              whileTap={{ scale: submitting ? 1 : 0.98 }}
            >
              {submitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" /> Creating...
                </>
              ) : (
                <>
                  <Save size={20} /> Publish Assignment
                </>
              )}
            </motion.button>
          </div>
        </form>
      )}
    </motion.div>
  );
};

export default CreateAssignmentPage;
