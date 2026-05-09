import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Info, AlertTriangle, FileText, CheckCircle2, Award, Clock } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { COLORS } from '../../constants/theme';
import notificationApi from '../../api/modules/notification.api';

const NotificationBell = () => {
  const { notifications, unreadCount, setUnreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setUnreadCount(0); // Mark as read locally for UX
  };

  const getIcon = (type) => {
    const icons = {
      assignment: <FileText className="text-blue-500" size={16} />,
      grade: <Award className="text-green-500" size={16} />,
      attendance: <AlertTriangle className="text-amber-500" size={16} />,
      system: <Info className="text-slate-500" size={16} />,
    };
    return icons[type] || <Bell size={16} />;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        onClick={handleToggle}
        className="p-2.5 rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 transition-all relative"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
          >
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Notifications</h3>
              <button className="text-xs text-blue-600 font-bold hover:underline">Mark all read</button>
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Bell className="text-slate-300" size={24} />
                  </div>
                  <p className="text-slate-400 text-sm">No new notifications</p>
                </div>
              ) : (
                notifications.map((notif, index) => (
                  <div 
                    key={index} 
                    className={`p-4 border-b last:border-0 hover:bg-slate-50 transition-colors cursor-pointer ${notif.read ? 'opacity-60' : ''}`}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 pt-1">
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900 leading-tight mb-1">{notif.title}</p>
                        <p className="text-xs text-slate-500 leading-relaxed mb-2">{notif.message}</p>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                          <Clock size={10} />
                          {new Date(notif.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button className="w-full py-3 text-xs font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 border-t transition-colors">
              View All Notifications
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
