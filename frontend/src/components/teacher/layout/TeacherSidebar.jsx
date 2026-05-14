import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  CheckSquare,
  MessageCircle,
  BarChart3,
  Calendar,
  Video,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  HelpCircle,
} from 'lucide-react';
import { TEACHER_COLORS, TEACHER_SHADOWS } from '../../../constants/teacherTheme';
import { useAuth } from '../../../contexts/AuthContext';

const TeacherSidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/teacher/dashboard' },
    { icon: BookOpen, label: 'My Courses', path: '/teacher/courses' },
    { icon: FileText, label: 'Upload Materials', path: '/teacher/materials' },
    { icon: CheckSquare, label: 'Assignments', path: '/teacher/assignments' },
    { icon: BarChart3, label: 'Grading', path: '/teacher/grading' },
    { icon: MessageCircle, label: 'Discussions', path: '/teacher/discussions' },
    { icon: Video, label: 'Live Classes', path: '/teacher/live-classes' },
    { icon: Calendar, label: 'Attendance', path: '/teacher/attendance' },
    { icon: BarChart3, label: 'Analytics', path: '/teacher/analytics' },
    { icon: Bell, label: 'Notifications', path: '/teacher/notifications' },
    { icon: User, label: 'Profile', path: '/teacher/profile' },
    { icon: HelpCircle, label: 'Guide', path: '/teacher/guide' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    // Perform auth logout then navigate to login
    (async () => {
      try {
        await logout();
      } catch (e) {
        // ignore
      }
      navigate('/auth/login');
    })();
  };

  const renderSidebarContent = () => (
    <>
      {/* Logo Section */}
      <div className="p-6 border-b" style={{ borderColor: TEACHER_COLORS.BORDER }}>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: TEACHER_COLORS.PRIMARY_BLUE }}
          >
            LMS
          </div>
          <div>
            <span className="text-lg font-bold block" style={{ color: TEACHER_COLORS.SIDEBAR_TEXT }}>
              Academy
            </span>
            <span className="text-xs" style={{ color: TEACHER_COLORS.TEXT_SECONDARY }}>
              Teacher
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <motion.button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setIsOpen(false);
              }}
              whileHover={{ x: 4 }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200"
              style={{
                backgroundColor: active ? TEACHER_COLORS.PRIMARY_BLUE : 'transparent',
                color: active ? '#FFFFFF' : TEACHER_COLORS.SIDEBAR_TEXT,
              }}
            >
              <Icon size={20} />
              <span className="text-sm font-medium">{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t" style={{ borderColor: TEACHER_COLORS.BORDER }}>
        <motion.button
          onClick={handleLogout}
          whileHover={{ x: 4 }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200"
          style={{
            color: TEACHER_COLORS.SIDEBAR_TEXT,
          }}
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Logout</span>
        </motion.button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 left-6 z-50 lg:hidden p-2 rounded-lg hover:bg-gray-200 transition-colors"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Desktop Sidebar - Always visible on lg screens */}
      <motion.div
        className="fixed left-0 top-0 h-screen w-64 flex flex-col hidden lg:flex"
        style={{ backgroundColor: TEACHER_COLORS.SIDEBAR }}
      >
        <div className="w-full h-full flex flex-col">
          {renderSidebarContent()}
        </div>
      </motion.div>

      {/* Mobile Sidebar - Slides in/out on mobile screens */}
      <motion.div
        className="fixed left-0 top-0 h-screen w-64 flex flex-col lg:hidden z-50"
        style={{ backgroundColor: TEACHER_COLORS.SIDEBAR }}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        initial={false}
      >
        <div className="w-full h-full flex flex-col">
          {renderSidebarContent()}
        </div>
      </motion.div>

      {/* Overlay for Mobile */}
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black z-40 lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default TeacherSidebar;
