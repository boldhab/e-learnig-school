import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Users, FileText, Calendar, ChevronRight, Loader2, BookOpen, ArrowLeft, Download, ExternalLink } from 'lucide-react';
import { COLORS } from '../../constants/theme';
import contentApi from '../../api/modules/content.api';

// Material Card Component
const MaterialCard = ({ material }) => (
  <motion.div
    className="bg-white p-4 rounded-xl border flex items-center justify-between hover:shadow-md transition-all"
    style={{ borderColor: COLORS.BORDER }}
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
  >
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-lg ${
        material.file_type === 'pdf' ? 'bg-red-50 text-red-600' :
        material.file_type === 'mp4' ? 'bg-blue-50 text-blue-600' :
        'bg-gray-50 text-gray-600'
      }`}>
        <FileText size={20} />
      </div>
      <div>
        <h4 className="font-semibold text-sm" style={{ color: COLORS.TEXT_PRIMARY }}>{material.title}</h4>
        <p className="text-[10px] text-gray-400">
          Uploaded by {material.author_name} • {new Date(material.created_at).toLocaleDateString()}
        </p>
      </div>
    </div>
    <div className="flex gap-2">
      <a
        href={material.cloudinary_url}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg hover:bg-gray-100 transition-all text-gray-500"
      >
        <ExternalLink size={18} />
      </a>
    </div>
  </motion.div>
);

// Course Card Component
const CourseCard = ({ course, index, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);

  const colors = [
    { c1: COLORS.PRIMARY_BLUE, c2: COLORS.INDIGO },
    { c1: COLORS.EMERALD_GREEN, c2: '#06B6D4' },
    { c1: '#F59E0B', c2: '#EC4899' },
    { c1: '#8B5CF6', c2: '#6366F1' },
    { c1: '#EF4444', c2: '#F97316' },
  ];
  const colorPair = colors[index % colors.length];

  return (
    <motion.div
      className="bg-white rounded-2xl overflow-hidden border transition-all hover:shadow-lg cursor-pointer h-full flex flex-col"
      style={{ borderColor: COLORS.BORDER }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(course)}
      whileHover={{ y: -8 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div
        className="h-32 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${colorPair.c1}, ${colorPair.c2})`,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <BookOpen size={64} className="text-white" />
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="mb-3">
          <h3 className="text-lg font-bold mb-1" style={{ color: COLORS.TEXT_PRIMARY }}>
            {course.name}
          </h3>
          <p style={{ color: COLORS.TEXT_SECONDARY }} className="text-sm">
            {course.teacher_name || 'Assigned Teacher'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4 py-3 border-t border-b" style={{ borderColor: COLORS.BORDER }}>
          <div className="flex items-center gap-2">
            <FileText size={16} style={{ color: COLORS.TEXT_SECONDARY }} />
            <span className="text-xs" style={{ color: COLORS.TEXT_SECONDARY }}>
              {course.materials_count || 0} Materials
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={16} style={{ color: COLORS.TEXT_SECONDARY }} />
            <span className="text-xs" style={{ color: COLORS.TEXT_SECONDARY }}>
              Enrolled
            </span>
          </div>
        </div>

        <button
          className="mt-auto w-full py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 bg-blue-600 text-white"
        >
          View Materials
          <ChevronRight size={16} />
        </button>
      </div>
    </motion.div>
  );
};

// Main Courses Page Component
const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [materialsLoading, setMaterialsLoading] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await contentApi.getCourses();
        setCourses(response.data.data);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleSelectCourse = async (course) => {
    setSelectedCourse(course);
    setMaterialsLoading(true);
    try {
      const response = await contentApi.getMaterials(course.id);
      setMaterials(response.data.data);
    } catch (error) {
      console.error("Failed to fetch materials:", error);
    } finally {
      setMaterialsLoading(false);
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
    <div className="p-6 pb-12 max-w-7xl mx-auto">
      <AnimatePresence mode="wait">
        {!selectedCourse ? (
          <motion.div
            key="course-list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <header className="mb-8">
              <h1 className="text-3xl font-bold mb-2 text-slate-900">My Courses</h1>
              <p className="text-slate-500">
                You are enrolled in {courses.length} academic courses.
              </p>
            </header>

            {courses.length === 0 ? (
              <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-20 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen size={40} className="text-slate-300" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900 mb-2">No Courses Enrolled</h2>
                <p className="text-slate-500 max-w-md mx-auto">
                  You are not currently enrolled in any courses. Please contact the administrator for class assignments.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course, index) => (
                  <CourseCard key={course.id} course={course} index={index} onSelect={handleSelectCourse} />
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="material-list"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <button
              onClick={() => setSelectedCourse(null)}
              className="flex items-center gap-2 text-blue-600 font-semibold mb-6 hover:gap-3 transition-all"
            >
              <ArrowLeft size={18} />
              Back to Courses
            </button>

            <header className="mb-8">
              <h1 className="text-3xl font-bold mb-2 text-slate-900">{selectedCourse.name}</h1>
              <p className="text-slate-500">Course Materials & Resources</p>
            </header>

            {materialsLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
                <p className="text-gray-500">Fetching materials...</p>
              </div>
            ) : materials.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed p-20 text-center">
                <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 font-medium">No materials uploaded for this course yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {materials.map((material) => (
                  <MaterialCard key={material.id} material={material} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CoursesPage;
