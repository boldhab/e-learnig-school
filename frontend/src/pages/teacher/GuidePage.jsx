import { motion } from 'framer-motion';
import {
  BookOpen,
  FileText,
  CheckSquare,
  BarChart3,
  MessageCircle,
  Calendar,
  Award,
  Bell,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { TEACHER_COLORS } from '../../constants/teacherTheme';

const StepCard = ({ step, icon: Icon, title, description, details }) => (
  <motion.div
    className="rounded-3xl border bg-white p-8"
    style={{ borderColor: TEACHER_COLORS.BORDER }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: step * 0.1 }}
  >
    <div className="flex items-start gap-4">
      <div className="flex items-center justify-center w-12 h-12 rounded-full flex-shrink-0" style={{ backgroundColor: `${TEACHER_COLORS.PRIMARY_BLUE}20`, color: TEACHER_COLORS.PRIMARY_BLUE }}>
        <Icon size={24} />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-bold px-3 py-1 rounded-full" style={{ backgroundColor: `${TEACHER_COLORS.PRIMARY_BLUE}15`, color: TEACHER_COLORS.PRIMARY_BLUE }}>
            Step {step}
          </span>
        </div>
        <h3 className="text-xl font-bold mb-3" style={{ color: TEACHER_COLORS.TEXT_PRIMARY }}>
          {title}
        </h3>
        <p className="mb-4" style={{ color: TEACHER_COLORS.TEXT_SECONDARY }}>
          {description}
        </p>
        <ul className="space-y-2">
          {details.map((detail, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <CheckCircle size={16} className="flex-shrink-0 mt-1" style={{ color: TEACHER_COLORS.SUCCESS }} />
              <span className="text-sm" style={{ color: TEACHER_COLORS.TEXT_SECONDARY }}>
                {detail}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </motion.div>
);

const GuidePage = () => {
  const steps = [
    {
      icon: BookOpen,
      title: 'My Courses',
      description: 'Start by viewing your assigned courses and managing your class sections.',
      details: [
        'Navigate to "My Courses" to see all courses you teach',
        'View enrolled students for each course',
        'Check course details and class information',
        'Filter by course or class as needed',
      ],
    },
    {
      icon: FileText,
      title: 'Upload Materials',
      description: 'Share educational content with your students by uploading course materials.',
      details: [
        'Go to "Upload Materials" section',
        'Select the subject and class for the material',
        'Upload PDF, documents, videos, or other resources',
        'Materials are instantly available to students',
        'Students can download and review at their own pace',
      ],
    },
    {
      icon: CheckSquare,
      title: 'Create Assignments',
      description: 'Create and manage assignments to assess student learning.',
      details: [
        'Click "Assignments" to create new assignments',
        'Set assignment title, description, and due date',
        'Specify maximum marks for grading',
        'Upload assignment files or instructions',
        'Students submit their work before the deadline',
      ],
    },
    {
      icon: Award,
      title: 'Grade Submissions',
      description: 'Review and grade student submissions with detailed feedback.',
      details: [
        'Open "Grading" section to see pending submissions',
        'Review each student\'s submitted work',
        'Assign marks based on rubric criteria',
        'Add constructive feedback comments',
        'Publish grades so students can view results',
      ],
    },
    {
      icon: Calendar,
      title: 'Mark Attendance',
      description: 'Track student attendance for your courses.',
      details: [
        'Navigate to "Attendance" section',
        'Select the course and date',
        'Mark students as Present, Absent, Late, or Excused',
        'Add remarks if needed',
        'View attendance reports and trends',
      ],
    },
    {
      icon: MessageCircle,
      title: 'Manage Discussions',
      description: 'Guide classroom discussions and moderate online forums.',
      details: [
        'Go to "Discussions" to manage course forums',
        'Create discussion topics to guide conversations',
        'Monitor student responses and interactions',
        'Provide teacher responses to guide learning',
        'Close or reopen topics as needed',
        'Remove inappropriate content if necessary',
      ],
    },
    {
      icon: BarChart3,
      title: 'View Analytics',
      description: 'Monitor student performance and identify at-risk learners.',
      details: [
        'Access "Analytics" to view class performance trends',
        'See grade distribution across your class',
        'Identify students at risk of falling behind',
        'Review submission rates and engagement',
        'Use gap analysis to understand learning gaps',
      ],
    },
    {
      icon: Bell,
      title: 'Stay Updated',
      description: 'Keep track of important notifications and system updates.',
      details: [
        'Check the notification bell for alerts',
        'Receive notifications about student submissions',
        'Get alerted when grades are published',
        'Stay informed about attendance concerns',
        'Mark notifications as read to stay organized',
      ],
    },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-4xl font-bold mb-3" style={{ color: TEACHER_COLORS.TEXT_PRIMARY }}>
          Teacher Workflow Guide
        </h1>
        <p className="text-lg max-w-2xl" style={{ color: TEACHER_COLORS.TEXT_SECONDARY }}>
          Follow these steps to effectively manage your courses, engage with students, and track their academic progress through our comprehensive learning management system.
        </p>
      </motion.div>

      {/* Quick Overview */}
      <motion.div
        className="rounded-3xl border bg-gradient-to-r p-8 mb-12"
        style={{
          borderColor: TEACHER_COLORS.BORDER,
          background: `linear-gradient(135deg, ${TEACHER_COLORS.PRIMARY_BLUE}08, ${TEACHER_COLORS.ACCENT_TEAL}08)`,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold mb-6" style={{ color: TEACHER_COLORS.TEXT_PRIMARY }}>
          Your Teaching Journey
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold mb-2" style={{ color: TEACHER_COLORS.PRIMARY_BLUE }}>1-2</div>
            <p className="text-sm" style={{ color: TEACHER_COLORS.TEXT_SECONDARY }}>Setup & Preparation</p>
          </div>
          <div className="flex items-center justify-center">
            <ArrowRight size={24} style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} />
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2" style={{ color: TEACHER_COLORS.ACCENT_TEAL }}>3-5</div>
            <p className="text-sm" style={{ color: TEACHER_COLORS.TEXT_SECONDARY }}>Teaching & Assessment</p>
          </div>
          <div className="flex items-center justify-center">
            <ArrowRight size={24} style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} />
          </div>
          <div className="text-center md:col-start-2">
            <div className="text-3xl font-bold mb-2" style={{ color: TEACHER_COLORS.SUCCESS }}>6-8</div>
            <p className="text-sm" style={{ color: TEACHER_COLORS.TEXT_SECONDARY }}>Engagement & Analysis</p>
          </div>
        </div>
      </motion.div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {steps.map((step, index) => (
          <StepCard
            key={index}
            step={index + 1}
            icon={step.icon}
            title={step.title}
            description={step.description}
            details={step.details}
          />
        ))}
      </div>

      {/* Best Practices Section */}
      <motion.div
        className="rounded-3xl border bg-white p-8"
        style={{ borderColor: TEACHER_COLORS.BORDER }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <h2 className="text-2xl font-bold mb-6" style={{ color: TEACHER_COLORS.TEXT_PRIMARY }}>
          Best Practices for Success
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: 'Regular Engagement',
              desc: 'Check the platform weekly to review submissions, grade assignments, and respond to student discussions promptly.',
            },
            {
              title: 'Clear Communication',
              desc: 'Provide clear instructions for assignments and use announcements to keep students informed about important updates.',
            },
            {
              title: 'Timely Feedback',
              desc: 'Grade submissions promptly and provide constructive feedback to help students improve their work.',
            },
            {
              title: 'Monitor Progress',
              desc: 'Regularly check analytics to identify struggling students and intervene early with additional support.',
            },
            {
              title: 'Active Moderation',
              desc: 'Participate in discussions to guide conversations and model good academic practices for your students.',
            },
            {
              title: 'Track Attendance',
              desc: 'Maintain accurate attendance records and address patterns of absence to ensure student engagement.',
            },
          ].map((practice, idx) => (
            <div key={idx} className="p-4 rounded-xl" style={{ backgroundColor: `${TEACHER_COLORS.PRIMARY_BLUE}05` }}>
              <h3 className="font-semibold mb-2" style={{ color: TEACHER_COLORS.TEXT_PRIMARY }}>
                {practice.title}
              </h3>
              <p className="text-sm" style={{ color: TEACHER_COLORS.TEXT_SECONDARY }}>
                {practice.desc}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Footer Tips */}
      <motion.div
        className="mt-12 p-8 rounded-3xl text-center"
        style={{
          backgroundColor: `${TEACHER_COLORS.PRIMARY_BLUE}10`,
          borderColor: TEACHER_COLORS.BORDER,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <h3 className="text-xl font-bold mb-2" style={{ color: TEACHER_COLORS.TEXT_PRIMARY }}>
          Need More Help?
        </h3>
        <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }}>
          Check your notifications for system updates and tips. Use the search bar to quickly find specific courses or students.
        </p>
      </motion.div>
    </div>
  );
};

export default GuidePage;
