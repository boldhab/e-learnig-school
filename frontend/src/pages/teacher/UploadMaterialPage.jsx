import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle2, Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TEACHER_COLORS } from '../../constants/teacherTheme';
import contentApi from '../../api/modules/content.api';
import teacherApi from '../../api/modules/teacher.api';
import toast from 'react-hot-toast';

const UploadMaterialPage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course_id: '',
    class_id: '',
    file: null
  });

  const [assignedSections, setAssignedSections] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await teacherApi.getDashboard();
        const data = response.data?.data ?? response.data;
        const sections = data?.courses ?? [];
        setAssignedSections(sections);
        
        // Get unique courses from assigned sections
        const uniqueCourses = [];
        const courseIds = new Set();
        
        sections.forEach(section => {
          if (!courseIds.has(section.id)) {
            courseIds.add(section.id);
            uniqueCourses.push({
              id: section.id,
              name: section.name
            });
          }
        });
        
        setCourses(uniqueCourses);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to load your assigned courses");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Update available grades when course changes
  useEffect(() => {
    if (formData.course_id) {
      const availableGrades = assignedSections
        .filter(section => section.id == formData.course_id)
        .map(section => ({
          id: section.class_id || section.grade_id,
          name: section.class_name || section.grade_name || 'Assigned Class'
        }));
      
      // Only update if grades actually changed
      if (JSON.stringify(availableGrades) !== JSON.stringify(grades)) {
        setGrades(availableGrades);
      }
      
      // Clear class_id if not in available grades
      const gradeExists = availableGrades.find(g => g.id == formData.class_id);
      if (formData.class_id && !gradeExists) {
        setFormData(prev => ({ ...prev, class_id: '' }));
      }
    } else {
      if (grades.length > 0) setGrades([]);
      if (formData.class_id) setFormData(prev => ({ ...prev, class_id: '' }));
    }
  }, [formData.course_id, assignedSections]);

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.file || !formData.course_id || !formData.class_id || !formData.title) {
      toast.error("Please fill all required fields");
      return;
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('course_id', formData.course_id);
    data.append('class_id', formData.class_id);
    data.append('material', formData.file);

    setUploading(true);
    try {
      await contentApi.uploadMaterial(data);
      toast.success("Material uploaded successfully!");
      navigate('/teacher/materials');
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error(error.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 mb-8 hover:text-slate-900 transition-all"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <header className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Upload Course Material</h1>
        <p className="text-slate-500">Share resources, documents, or videos with your students.</p>
      </header>

      <motion.form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border p-8 space-y-6 shadow-sm"
        style={{ borderColor: TEACHER_COLORS.BORDER }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-slate-700">Material Title *</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Introduction to Quantum Physics"
            className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-slate-700">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief overview of the material..."
            rows="3"
            className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Course Selection */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-700">Select Course *</label>
            <select
              required
              value={formData.course_id}
              onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-slate-50"
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>{course.name}</option>
              ))}
            </select>
          </div>

          {/* Grade Selection */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-700">Target Grade *</label>
            <select
              required
              value={formData.class_id}
              onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-slate-50"
            >
              <option value="">Select a grade</option>
              {grades.map((grade) => (
                <option key={grade.id} value={grade.id}>{grade.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* File Upload Area */}
        <div className="relative group">
          <label className="block text-sm font-semibold mb-2 text-slate-700">Upload File *</label>
          <div
            className={`h-40 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all ${
              formData.file ? 'border-green-500 bg-green-50' : 'border-slate-300 bg-slate-50 group-hover:border-blue-400 group-hover:bg-blue-50'
            }`}
          >
            <input
              type="file"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            {formData.file ? (
              <>
                <CheckCircle2 className="text-green-600 mb-2" size={32} />
                <p className="text-sm font-medium text-green-700">{formData.file.name}</p>
                <p className="text-xs text-green-600">Click to replace</p>
              </>
            ) : (
              <>
                <Upload className="text-slate-400 mb-2 group-hover:text-blue-500 transition-colors" size={32} />
                <p className="text-sm font-medium text-slate-600">Click or drag to upload</p>
                <p className="text-xs text-slate-400">PDF, DOCX, PPTX, MP4 (Max 10MB)</p>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 flex gap-4">
          <motion.button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 py-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Cancel
          </motion.button>
          <motion.button
            type="submit"
            disabled={uploading}
            className="flex-[2] py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            style={{ backgroundColor: TEACHER_COLORS.PRIMARY_BLUE }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {uploading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Uploading to Cloudinary...
              </>
            ) : (
              <>
                <Upload size={20} />
                Publish Material
              </>
            )}
          </motion.button>
        </div>
      </motion.form>
    </div>
  );
};

export default UploadMaterialPage;
