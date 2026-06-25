import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronDown } from 'lucide-react';
import NotificationBell from '../common/NotificationBell';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { COLORS, SHADOWS } from '../../constants/theme';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 h-16 lg:left-64 bg-white border-b flex items-center justify-between px-6 z-40"
      style={{
        borderColor: COLORS.BORDER,
        boxShadow: SHADOWS.SM,
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search courses, assignments..."
            className="w-full px-4 py-2.5 pr-10 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-all"
            style={{
              focusRingColor: COLORS.PRIMARY_BLUE,
            }}
          />
          <Search
            size={18}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
            style={{ color: COLORS.TEXT_SECONDARY }}
          />
        </div>
      </div>

      {/* Right Side Icons */}
      <div className="flex items-center gap-4">
        {/* Real-time Notifications */}
        <NotificationBell />

        {/* Profile Dropdown */}
        <div className="relative">
          <motion.button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 p-2 rounded-lg transition-colors hover:bg-gray-100"
          >
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center text-white font-semibold text-sm"
              style={{ backgroundColor: COLORS.PRIMARY_BLUE }}
            >
              {getInitials(user?.full_name)}
            </div>
            <span className="hidden sm:block text-sm font-medium" style={{ color: COLORS.TEXT_PRIMARY }}>
              {user?.full_name || 'User'}
            </span>
            <ChevronDown size={16} style={{ color: COLORS.TEXT_SECONDARY }} />
          </motion.button>

          {/* Profile Menu */}
          {showProfileMenu && (
            <motion.div
              className="absolute right-0 mt-2 w-48 bg-white rounded-lg py-2"
              style={{
                boxShadow: SHADOWS.LG,
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors">
                My Profile
              </button>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors">
                Settings
              </button>
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors border-t"
                onClick={async () => {
                  setShowProfileMenu(false);
                  try {
                    await logout();
                  } catch (e) {
                    // ignore errors, still navigate to login
                  }
                  navigate('/auth/login');
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

export default Header;
