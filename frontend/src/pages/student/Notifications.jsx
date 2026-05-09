import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  Mail,
  BookOpen,
  AlertCircle,
  CheckCircle,
  MessageCircle,
  Trash2,
  Archive,
  Check,
} from 'lucide-react';
import { COLORS } from '../../constants/theme';

// Notification Type Icon
const NotificationIcon = ({ type }) => {
  const iconProps = { size: 20 };
  switch (type) {
    case 'assignment':
      return <BookOpen {...iconProps} style={{ color: COLORS.WARNING }} />;
    case 'grade':
      return <CheckCircle {...iconProps} style={{ color: COLORS.EMERALD_GREEN }} />;
    case 'discussion':
      return <MessageCircle {...iconProps} style={{ color: COLORS.INDIGO }} />;
    case 'announcement':
      return <Bell {...iconProps} style={{ color: COLORS.PRIMARY_BLUE }} />;
    case 'alert':
      return <AlertCircle {...iconProps} style={{ color: COLORS.DANGER }} />;
    default:
      return <Mail {...iconProps} />;
  }
};

// Notification Item
const NotificationItem = ({ notification, index, onDelete, onMarkRead }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="p-4 rounded-lg border transition-all cursor-pointer"
      style={{
        borderColor: COLORS.BORDER,
        backgroundColor: notification.read ? '#FFFFFF' : `${COLORS.PRIMARY_BLUE}05`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ x: 4 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => onMarkRead(notification.id)}
    >
      <div className="flex gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 mt-1">
          <NotificationIcon type={notification.type} />
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3
              className="font-semibold text-sm"
              style={{
                color: COLORS.TEXT_PRIMARY,
                fontWeight: notification.read ? 500 : 600,
              }}
            >
              {notification.title}
            </h3>
            {!notification.read && (
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: COLORS.PRIMARY_BLUE }}
              />
            )}
          </div>
          <p style={{ color: COLORS.TEXT_SECONDARY }} className="text-sm mb-2">
            {notification.message}
          </p>
          <div className="flex items-center justify-between">
            <p style={{ color: COLORS.TEXT_SECONDARY }} className="text-xs">
              {notification.time}
            </p>
            {isHovered && (
              <motion.div className="flex gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {!notification.read && (
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkRead(notification.id);
                    }}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Check size={14} style={{ color: COLORS.PRIMARY_BLUE }} />
                  </motion.button>
                )}
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(notification.id);
                  }}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Trash2 size={14} style={{ color: COLORS.DANGER }} />
                </motion.button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Filter Tabs
const NotificationTabs = ({ activeTab, setActiveTab, counts }) => (
  <motion.div
    className="flex gap-2 mb-8 overflow-x-auto pb-2"
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
  >
    {[
      { label: 'All', value: 'all' },
      { label: 'Unread', value: 'unread' },
      { label: 'Assignments', value: 'assignment' },
      { label: 'Grades', value: 'grade' },
      { label: 'Discussions', value: 'discussion' },
      { label: 'Announcements', value: 'announcement' },
    ].map((tab) => (
      <motion.button
        key={tab.value}
        onClick={() => setActiveTab(tab.value)}
        className="px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all text-sm"
        style={{
          backgroundColor: activeTab === tab.value ? COLORS.PRIMARY_BLUE : COLORS.BACKGROUND,
          color: activeTab === tab.value ? '#FFFFFF' : COLORS.TEXT_PRIMARY,
          border:
            activeTab === tab.value ? 'none' : `1px solid ${COLORS.BORDER}`,
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {tab.label}
        {tab.value !== 'all' && tab.value !== 'unread' && counts[tab.value] > 0 && (
          <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: COLORS.DANGER, color: '#FFFFFF' }}>
            {counts[tab.value]}
          </span>
        )}
      </motion.button>
    ))}
  </motion.div>
);

// Main Notifications Page
const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'assignment',
      title: 'React Project - Upcoming Deadline',
      message: 'Your React Component Library assignment is due in 2 days. Submit your work now!',
      time: '1 hour ago',
      read: false,
    },
    {
      id: 2,
      type: 'grade',
      title: 'Assignment Graded - Algorithm Analysis',
      message: 'Your Algorithm Analysis paper has been graded. Score: 95/100. Excellent work!',
      time: '2 hours ago',
      read: false,
    },
    {
      id: 3,
      type: 'announcement',
      title: 'New Course Material Available',
      message: 'Prof. John Smith has uploaded new lecture notes for Web Development.',
      time: '3 hours ago',
      read: true,
    },
    {
      id: 4,
      type: 'discussion',
      title: 'New Reply to Your Discussion',
      message: 'Your comment on "React Hooks Best Practices" has received 3 new replies.',
      time: '5 hours ago',
      read: false,
    },
    {
      id: 5,
      type: 'alert',
      title: 'Attendance Alert',
      message: 'Your attendance in Database Design is below 80%. Please contact your instructor.',
      time: '1 day ago',
      read: true,
    },
    {
      id: 6,
      type: 'assignment',
      title: 'Database Schema Assignment Submitted',
      message: 'Your assignment has been successfully submitted. Waiting for grading.',
      time: '2 days ago',
      read: true,
    },
    {
      id: 7,
      type: 'grade',
      title: 'Midterm Exam Results Posted',
      message: 'Your Data Structures midterm exam has been graded. Score: 88/100',
      time: '3 days ago',
      read: true,
    },
    {
      id: 8,
      type: 'announcement',
      title: 'Class Cancelled - Database Design',
      message: 'The Database Design class on May 15 has been cancelled. Will be rescheduled.',
      time: '4 days ago',
      read: true,
    },
  ]);

  const [activeTab, setActiveTab] = useState('all');

  // Filter notifications
  const filteredNotifications =
    activeTab === 'all'
      ? notifications
      : activeTab === 'unread'
      ? notifications.filter((n) => !n.read)
      : notifications.filter((n) => n.type === activeTab);

  // Count notifications by type
  const counts = {
    assignment: notifications.filter((n) => n.type === 'assignment').length,
    grade: notifications.filter((n) => n.type === 'grade').length,
    discussion: notifications.filter((n) => n.type === 'discussion').length,
    announcement: notifications.filter((n) => n.type === 'announcement').length,
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleDelete = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const handleMarkRead = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="p-6 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.TEXT_PRIMARY }}>
            Notifications
          </h1>
          <p style={{ color: COLORS.TEXT_SECONDARY }} className="text-lg">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <motion.button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 rounded-lg font-medium transition-all text-sm"
            style={{
              backgroundColor: COLORS.PRIMARY_BLUE,
              color: '#FFFFFF',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Mark All as Read
          </motion.button>
        )}
      </motion.div>

      {/* Filter Tabs */}
      <NotificationTabs activeTab={activeTab} setActiveTab={setActiveTab} counts={counts} />

      {/* Notifications List */}
      {filteredNotifications.length > 0 ? (
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.05 }}
        >
          {filteredNotifications.map((notification, index) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              index={index}
              onDelete={handleDelete}
              onMarkRead={handleMarkRead}
            />
          ))}
        </motion.div>
      ) : (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Bell size={48} style={{ color: COLORS.TEXT_SECONDARY }} className="mx-auto mb-4 opacity-20" />
          <p style={{ color: COLORS.TEXT_SECONDARY }} className="text-lg">
            No notifications in this category
          </p>
          <p style={{ color: COLORS.TEXT_SECONDARY }} className="text-sm mt-2">
            You're all caught up! Check back later.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default NotificationsPage;
