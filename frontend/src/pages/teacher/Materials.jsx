import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  File,
  Image,
  Video,
  FileText,
  Download,
  Trash2,
  CheckCircle,
  Calendar,
  BookOpen,
  Loader2,
  Plus
} from 'lucide-react';
import { TEACHER_COLORS } from '../../constants/teacherTheme';
import contentApi from '../../api/modules/content.api';
import teacherApi from '../../api/modules/teacher.api';
import toast from 'react-hot-toast';

// File Card Component
const FileCard = ({ file, index, onDelete }) => {
  const getFileIcon = (type) => {
    if (type.includes('image')) return <Image size={32} style={{ color: TEACHER_COLORS.SECONDARY_INDIGO }} />;
    if (type.includes('video')) return <Video size={32} style={{ color: TEACHER_COLORS.DANGER }} />;
    if (type.includes('pdf')) return <FileText size={32} style={{ color: TEACHER_COLORS.DANGER }} />;
    return <File size={32} style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} />;
  };

  return (
    <motion.div
      className="p-4 bg-white rounded-lg border hover:shadow-md transition-all"
      style={{ borderColor: TEACHER_COLORS.BORDER }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-start gap-4 mb-4">
        <div
          className="p-3 rounded-lg flex-shrink-0"
          style={{ backgroundColor: `${TEACHER_COLORS.SECONDARY_INDIGO}10` }}
        >
          {getFileIcon(file.type)}
        </div>
        <div className="flex-1">
          <p style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="font-medium truncate">
            {file.name}
          </p>
          <div className="flex items-center gap-2 mt-1 text-xs" style={{ color: TEACHER_COLORS.TEXT_SECONDARY }}>
            <Calendar size={12} />
            <span>{file.date}</span>
            <span>•</span>
            <span>{file.size}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div
        className="h-1.5 rounded-full overflow-hidden mb-3"
        style={{ backgroundColor: TEACHER_COLORS.BACKGROUND }}
      >
        <motion.div
          className="h-full"
          style={{ backgroundColor: TEACHER_COLORS.SUCCESS }}
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 2 }}
        />
      </div>

      {/* Status and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle size={16} style={{ color: TEACHER_COLORS.SUCCESS }} />
          <span style={{ color: TEACHER_COLORS.SUCCESS }} className="text-xs font-medium">
            Uploaded
          </span>
        </div>
        <div className="flex gap-2">
          <motion.button
            className="p-2 rounded hover:bg-gray-100 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download size={16} style={{ color: TEACHER_COLORS.PRIMARY_BLUE }} />
          </motion.button>
          <motion.button
            className="p-2 rounded hover:bg-gray-100 transition-colors"
            onClick={() => onDelete(index)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Trash2 size={16} style={{ color: TEACHER_COLORS.DANGER }} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// Drag and Drop Upload Area
const UploadArea = ({ onDrop, isDragActive }) => (
  <motion.div
    className="border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all"
    style={{
      borderColor: isDragActive ? TEACHER_COLORS.PRIMARY_BLUE : TEACHER_COLORS.BORDER,
      backgroundColor: isDragActive ? `${TEACHER_COLORS.PRIMARY_BLUE}05` : TEACHER_COLORS.BACKGROUND,
    }}
    animate={{
      scale: isDragActive ? 1.02 : 1,
    }}
  >
    <motion.div
      animate={{ y: isDragActive ? -5 : 0 }}
      transition={{ type: 'spring', stiffness: 400 }}
    >
      <Upload
        size={48}
        style={{
          color: isDragActive ? TEACHER_COLORS.PRIMARY_BLUE : TEACHER_COLORS.TEXT_SECONDARY,
        }}
        className="mx-auto mb-4"
      />
    </motion.div>

    <h3 style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-lg font-semibold mb-2">
      Drag and drop your files
    </h3>
    <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-sm mb-4">
      or click to browse. Supported: PDF, DOC, XLS, PPT, MP4, Images
    </p>

    <motion.button
      className="px-6 py-2 rounded-lg text-white font-medium"
      style={{ backgroundColor: TEACHER_COLORS.CREATE }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      Select Files
    </motion.button>
  </motion.div>
);

// Material Type Selector
const MaterialTypeSelector = ({ selectedType, setSelectedType }) => {
  const types = [
    { id: 'all', label: 'All Materials' },
    { id: 'lecture', label: 'Lecture Notes' },
    { id: 'assignment', label: 'Assignments' },
    { id: 'resources', label: 'Resources' },
    { id: 'video', label: 'Videos' },
  ];

  return (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
      {types.map((type) => (
        <motion.button
          key={type.id}
          onClick={() => setSelectedType(type.id)}
          className="px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-all"
          style={{
            backgroundColor:
              selectedType === type.id
                ? TEACHER_COLORS.PRIMARY_BLUE
                : TEACHER_COLORS.BACKGROUND,
            color:
              selectedType === type.id
                ? '#FFFFFF'
                : TEACHER_COLORS.TEXT_PRIMARY,
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {type.label}
        </motion.button>
      ))}
    </div>
  );
};

const TeacherMaterials = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedType, setSelectedType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [assignedSections, setAssignedSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await teacherApi.getDashboard();
        const data = response.data?.data ?? response.data;
        const sections = data?.courses ?? [];
        setAssignedSections(sections);
        if (sections.length > 0) {
          setSelectedSection(JSON.stringify({ 
            course_id: sections[0].id, 
            class_id: sections[0].class_id 
          }));
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to load your assigned courses");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedSection) {
      const fetchMaterials = async () => {
        setMaterialsLoading(true);
        try {
          const { course_id, class_id } = JSON.parse(selectedSection);
          const response = await contentApi.getMaterials(course_id, class_id);
          const data = response.data?.data ?? response.data ?? [];
          
          setUploadedFiles(data.map(m => ({
            id: m.id,
            name: m.title,
            type: m.file_type || 'application/octet-stream',
            date: new Date(m.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }),
            size: m.file_size ? (m.file_size / 1024 / 1024).toFixed(2) + ' MB' : 'Unknown size',
            url: m.cloudinary_url
          })));
        } catch (error) {
          console.error("Failed to fetch materials:", error);
          toast.error("Failed to load materials for this course");
        } finally {
          setMaterialsLoading(false);
        }
      };
      fetchMaterials();
    }
  }, [selectedSection]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = [...e.dataTransfer.files];
    files.forEach((file) => {
      const newFile = {
        name: file.name,
        type: file.type,
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      };
      setUploadedFiles([newFile, ...uploadedFiles]);
    });
  };

  const handleFileDelete = async (index) => {
    const file = uploadedFiles[index];
    if (!window.confirm(`Are you sure you want to delete ${file.name}?`)) return;

    try {
      await contentApi.deleteMaterial(file.id);
      toast.success("Material deleted successfully");
      setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete material");
    }
  };

  return (
    <motion.div className="p-8">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-6">
          <h1 style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-3xl font-bold">
            Upload Materials
          </h1>
          <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="mt-2">
            Manage course materials and resources
          </p>
        </div>

        {/* Course Selector */}
        <div className="mb-6 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="block text-sm font-medium mb-2">
              Select Course & Section
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border outline-none bg-white shadow-sm"
              style={{
                borderColor: TEACHER_COLORS.BORDER,
                color: TEACHER_COLORS.TEXT_PRIMARY,
              }}
            >
              {assignedSections.map((section, idx) => (
                <option key={idx} value={JSON.stringify({ course_id: section.id, class_id: section.class_id })}>
                  {section.name} - {section.class_name || section.grade_name}
                </option>
              ))}
            </select>
          </div>
          <motion.button
            onClick={() => navigate('/teacher/materials/upload')}
            className="flex items-center gap-2 px-6 py-3 rounded-lg text-white font-bold shadow-lg"
            style={{ backgroundColor: TEACHER_COLORS.PRIMARY_BLUE }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={20} />
            New Upload
          </motion.button>
        </div>
      </motion.div>

      {/* Materials Section */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-xl font-bold">
              Materials for this Section
            </h2>
            <span
              style={{ color: TEACHER_COLORS.TEXT_SECONDARY }}
              className="text-sm"
            >
              {uploadedFiles.length} files
            </span>
          </div>
        </div>

        {materialsLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
            <p className="text-slate-500 font-medium">Fetching materials...</p>
          </div>
        ) : uploadedFiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {uploadedFiles.map((file, index) => (
              <FileCard
                key={file.id || index}
                file={file}
                index={index}
                onDelete={handleFileDelete}
              />
            ))}
          </div>
        ) : (
          <motion.div
            className="text-center py-12 border-2 border-dashed rounded-3xl"
            style={{ borderColor: TEACHER_COLORS.BORDER }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <BookOpen
              size={48}
              style={{ color: TEACHER_COLORS.TEXT_SECONDARY }}
              className="mx-auto mb-4 opacity-50"
            />
            <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-lg font-semibold">
              No materials found
            </p>
            <p className="text-sm text-slate-400 mb-6">Start by uploading resources for your students.</p>
            <motion.button
              onClick={() => navigate('/teacher/materials/upload')}
              className="px-6 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: TEACHER_COLORS.CREATE }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Upload First Material
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default TeacherMaterials;
