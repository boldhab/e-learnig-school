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
import { COLORS } from '../../constants/theme';

const StepCard = ({ step, icon: Icon, title, description, details }) => (
  <motion.div
    className="rounded-3xl border bg-white p-8"
    style={{ borderColor: COLORS.BORDER }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: step * 0.1 }}
  >
    <div className="flex items-start gap-4">
      <div className="flex items-center justify-center w-12 h-12 rounded-full flex-shrink-0" style={{ backgroundColor: `${COLORS.PRIMARY_BLUE}20`, color: COLORS.PRIMARY_BLUE }}>
        <Icon size={24} />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-bold px-3 py-1 rounded-full" style={{ backgroundColor: `${COLORS.PRIMARY_BLUE}15`, color: COLORS.PRIMARY_BLUE }}>
            Step {step}
          </span>
        </div>
        <h3 className="text-xl font-bold mb-3" style={{ color: COLORS.TEXT_PRIMARY }}>
          {title}
        </h3>
        <p className="mb-4" style={{ color: COLORS.TEXT_SECONDARY }}>
          {description}
        </p>
        <ul className="space-y-2">
          {details.map((detail, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <CheckCircle size={16} className="flex-shrink-0 mt-1" style={{ color: COLORS.SUCCESS }} />
              <span className="text-sm" style={{ color: COLORS.TEXT_SECONDARY }}>
                {detail}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </motion.div>
);

const StudentGuidePage = () => {
  const steps = [
    {
      icon: BookOpen,
      title: 'Explore Courses',
      description: 'Browse and enroll in courses offered by your institution.',
      details: [
        'Go to "My Courses" to see enrolled courses',
        'View course details and instructor information',
        'Check course schedule and meeting times',
        'See the course description and learning objectives',
      ],
    },
    {
      icon: FileText,
      title: 'Access Learning Materials',
      description: 'Download and review course materials shared by your instructors.',
      details: [
        'Find all course materials in each course section',
        'Download PDFs, documents, and resources',
        'Watch instructional videos and tutorials',
        'Review materials at your own pace',
        'Use materials to prepare for assignments',
      ],
    },
    {
      icon: CheckSquare,
      title: 'Complete Assignments',
      description: 'Work on assignments and submit your work before deadlines.',
      details: [
        'View assignment details and requirements in "Assignments"',
        'Read instructions carefully and download resources if provided',
        'Complete your work according to rubric criteria',
        'Submit your work before the deadline',
        'Check submission status in "Submissions"',
      ],
    },
    {
      icon: Award,
      title: 'Review Grades',
      description: 'Track your academic performance and instructor feedback.',
      details: [
        'Navigate to "Grades" to see all grades and marks',
        'View scores for assignments, quizzes, and assessments',
        'Read feedback comments from your instructor',
        'Track your grade trends over time',
        'Identify areas for improvement',
      ],
    },
    {
      icon: Calendar,
      title: 'Track Attendance',
      description: 'Monitor your class attendance and attendance records.',
      details: [
        'Check "Attendance" for your presence records',
        'View attendance summary by date and course',
        'Monitor your attendance percentage',
        'Report any discrepancies to your instructor',
        'Attend classes regularly to stay engaged',
      ],
    },
    {
      icon: MessageCircle,
      title: 'Participate in Discussions',
      description: 'Engage with classmates and instructors through online discussions.',
      details: [
        'Visit "Discussions" to see active discussion topics',
        'Read posts from instructors and classmates',
        'Share your thoughts and ask questions',
        'Respond thoughtfully to contribute to learning',
        'Use discussions to clarify concepts and learn from peers',
      ],
    },
    {
      icon: BarChart3,
      title: 'Monitor Your Progress',
      description: 'Keep track of your academic performance and learning goals.',
      details: [
        'Check your overall GPA and course grades regularly',
        'Review grade trends to identify strengths and weaknesses',
        'Set personal learning goals based on performance data',
        'Seek help from instructors if you\'re falling behind',
        'Celebrate academic achievements and progress',
      ],
    },
    {
      icon: Bell,
      title: 'Stay Connected',
      description: 'Keep up with important announcements and notifications.',
      details: [
        'Check the notification bell for updates',
        'Receive alerts about assignment deadlines',
        'Get notified about grade releases',
        'Stay informed about course announcements',
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
        <h1 className="text-4xl font-bold mb-3" style={{ color: COLORS.TEXT_PRIMARY }}>
          Student Learning Guide
        </h1>
        <p className="text-lg max-w-2xl" style={{ color: COLORS.TEXT_SECONDARY }}>
          Follow these steps to make the most of your learning experience. This guide will help you navigate the platform, stay on top of assignments, engage with your peers, and track your academic progress.
        </p>
      </motion.div>

      {/* Quick Overview */}
      <motion.div
        className="rounded-3xl border bg-gradient-to-r p-8 mb-12"
        style={{
          borderColor: COLORS.BORDER,
          background: `linear-gradient(135deg, ${COLORS.PRIMARY_BLUE}08, ${COLORS.ACCENT_TEAL}08)`,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold mb-6" style={{ color: COLORS.TEXT_PRIMARY }}>
          Your Learning Journey
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold mb-2" style={{ color: COLORS.PRIMARY_BLUE }}>1-2</div>
            <p className="text-sm" style={{ color: COLORS.TEXT_SECONDARY }}>Explore & Learn</p>
          </div>
          <div className="flex items-center justify-center">
            <ArrowRight size={24} style={{ color: COLORS.TEXT_SECONDARY }} />
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2" style={{ color: COLORS.ACCENT_TEAL }}>3-5</div>
            <p className="text-sm" style={{ color: COLORS.TEXT_SECONDARY }}>Engage & Submit</p>
          </div>
          <div className="flex items-center justify-center">
            <ArrowRight size={24} style={{ color: COLORS.TEXT_SECONDARY }} />
          </div>
          <div className="text-center md:col-start-2">
            <div className="text-3xl font-bold mb-2" style={{ color: COLORS.SUCCESS }}>6-8</div>
            <p className="text-sm" style={{ color: COLORS.TEXT_SECONDARY }}>Track & Grow</p>
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
        style={{ borderColor: COLORS.BORDER }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <h2 className="text-2xl font-bold mb-6" style={{ color: COLORS.TEXT_PRIMARY }}>
          Study Tips for Success
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: 'Start Early',
              desc: 'Begin assignments as soon as they\'re available. This gives you time to ask questions and seek help if needed.',
            },
            {
              title: 'Stay Organized',
              desc: 'Keep track of all deadlines. Set reminders and create a study schedule to manage your workload effectively.',
            },
            {
              title: 'Participate Actively',
              desc: 'Engage in discussions, ask questions, and contribute ideas. Active participation enhances your learning.',
            },
            {
              title: 'Review Feedback',
              desc: 'Read instructor comments and feedback carefully. Use them to improve your work and understanding.',
            },
            {
              title: 'Attend Class',
              desc: 'Regular attendance helps you stay connected with course content and classmates. Don\'t fall behind.',
            },
            {
              title: 'Seek Help Early',
              desc: 'If you\'re struggling, reach out to your instructor or classmates. Getting help early prevents falling further behind.',
            },
          ].map((practice, idx) => (
            <div key={idx} className="p-4 rounded-xl" style={{ backgroundColor: `${COLORS.PRIMARY_BLUE}05` }}>
              <h3 className="font-semibold mb-2" style={{ color: COLORS.TEXT_PRIMARY }}>
                {practice.title}
              </h3>
              <p className="text-sm" style={{ color: COLORS.TEXT_SECONDARY }}>
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
          backgroundColor: `${COLORS.PRIMARY_BLUE}10`,
          borderColor: COLORS.BORDER,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <h3 className="text-xl font-bold mb-2" style={{ color: COLORS.TEXT_PRIMARY }}>
          Need Help or Have Questions?
        </h3>
        <p style={{ color: COLORS.TEXT_SECONDARY }}>
          Use the search bar to quickly find courses or materials. Check notifications for announcements and deadlines. Reach out to your instructors through the platform anytime you need support.
        </p>
      </motion.div>
    </div>
  );
};

export default StudentGuidePage;
