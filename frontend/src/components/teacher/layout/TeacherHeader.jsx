import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Bell, ChevronDown } from 'lucide-react';
import { TEACHER_COLORS, TEACHER_SHADOWS } from '../../../constants/teacherTheme';

const TeacherHeader = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState(5);

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 h-16 lg:left-64 bg-white border-b flex items-center justify-between px-6 z-40"
      style={{
        borderColor: TEACHER_COLORS.BORDER,
        boxShadow: TEACHER_SHADOWS.SM,
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <div
          className="flex items-center gap-3 px-4 py-2 rounded-lg border"
          style={{
            borderColor: TEACHER_COLORS.BORDER,
            backgroundColor: TEACHER_COLORS.BACKGROUND,
          }}
        >
          <Search size={18} style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} />
          <input
            type="text"
            placeholder="Search students, courses..."
            className="bg-transparent outline-none w-full text-sm"
            style={{ color: TEACHER_COLORS.TEXT_PRIMARY }}
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6 ml-6">
        {/* Notifications */}
        <motion.button
          className="relative"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Bell size={20} style={{ color: TEACHER_COLORS.TEXT_PRIMARY }} />
          {notifications > 0 && (
            <span
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center"
              style={{ backgroundColor: TEACHER_COLORS.DANGER }}
            >
              {notifications}
            </span>
          )}
        </motion.button>

        {/* Profile Menu */}
        <div className="relative">
          <motion.button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            whileHover={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
              style={{ backgroundColor: TEACHER_COLORS.PRIMARY_BLUE }}
            >
              DR
            </div>
            <ChevronDown size={16} style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} />
          </motion.button>

          {/* Profile Menu */}
          {showProfileMenu && (
            <motion.div
              className="absolute right-0 mt-2 w-48 bg-white rounded-lg py-2"
              style={{
                boxShadow: TEACHER_SHADOWS.LG,
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
                style={{ color: TEACHER_COLORS.TEXT_PRIMARY }}
              >
                My Profile
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
                style={{ color: TEACHER_COLORS.TEXT_PRIMARY }}
              >
                Settings
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors border-t"
                style={{
                  color: TEACHER_COLORS.DANGER,
                  borderColor: TEACHER_COLORS.BORDER,
                }}
              >
                Logout
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default TeacherHeader;
