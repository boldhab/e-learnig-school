import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { TEACHER_COLORS } from '../../constants/teacherTheme';

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
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedType, setSelectedType] = useState('all');
  const [uploadedFiles, setUploadedFiles] = useState([
    { name: 'Chapter 1 - Introduction.pdf', type: 'application/pdf', date: 'Mar 5, 2026', size: '2.4 MB' },
    { name: 'Mathematics Formulas.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', date: 'Mar 4, 2026', size: '1.8 MB' },
    { name: 'Class Recording - Day 1.mp4', type: 'video/mp4', date: 'Mar 3, 2026', size: '145 MB' },
    { name: 'Quiz Template.xlsx', type: 'application/vnd.ms-excel', date: 'Mar 2, 2026', size: '512 KB' },
  ]);

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

  const handleFileDelete = (index) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
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
        <div className="mb-6">
          <label style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="block text-sm font-medium mb-2">
            Select Course
          </label>
          <select
            className="w-full px-4 py-3 rounded-lg border outline-none"
            style={{
              borderColor: TEACHER_COLORS.BORDER,
              color: TEACHER_COLORS.TEXT_PRIMARY,
            }}
          >
            <option>Mathematics 101 - Section A</option>
            <option>Physics 102 - Section B</option>
            <option>Chemistry 101 - Section A</option>
            <option>Biology 103 - Section C</option>
          </select>
        </div>
      </motion.div>

      {/* Upload Area */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <UploadArea onDrop={handleDrop} isDragActive={dragActive} />
      </motion.div>

      {/* Material Type Filter */}
      <MaterialTypeSelector selectedType={selectedType} setSelectedType={setSelectedType} />

      {/* Uploaded Files Section */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} className="text-xl font-bold">
              Recently Uploaded
            </h2>
            <span
              style={{ color: TEACHER_COLORS.TEXT_SECONDARY }}
              className="text-sm"
            >
              {uploadedFiles.length} files
            </span>
          </div>
        </div>

        {uploadedFiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {uploadedFiles.map((file, index) => (
              <FileCard
                key={index}
                file={file}
                index={index}
                onDelete={handleFileDelete}
              />
            ))}
          </div>
        ) : (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <BookOpen
              size={48}
              style={{ color: TEACHER_COLORS.TEXT_SECONDARY }}
              className="mx-auto mb-4 opacity-50"
            />
            <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} className="text-lg">
              No materials uploaded yet
            </p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default TeacherMaterials;
