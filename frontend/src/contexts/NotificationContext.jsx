import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { Bell, Info, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import notificationApi from '../api/modules/notification.api';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

  // Load current notifications snapshot so the list isn't empty
  const loadInitial = async () => {
    try {
      const [nRes, cRes] = await Promise.all([
        notificationApi.getNotifications(),
        notificationApi.getUnreadCount(),
      ]);
      const list = nRes?.data?.data ?? nRes?.data ?? [];
      setNotifications(Array.isArray(list) ? list : []);
      const count = cRes?.data?.data ?? cRes?.data;
      setUnreadCount(Number(count) || 0);
    } catch (err) {
      // ignore – SSE will still stream new notifications
    }
  };
  loadInitial();

    // Use Server-Sent Events (SSE) instead of Pusher
    const token = localStorage.getItem('token');
  if (!token) return;

  const envBaseRaw = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  const envBase = String(envBaseRaw).replace(/\/+$/, '');
  const base = envBase.endsWith('/api') ? envBase : `${envBase}/api`;
  const sseUrl = `${base}/notifications/stream?token=${encodeURIComponent(token)}`;
  if (import.meta.env.DEV) {
    // Helpful for diagnosing the common "text/html" SSE error (usually wrong base URL)
    console.debug('[SSE] Connecting to:', sseUrl);
  }
    
    const eventSource = new EventSource(sseUrl);

    eventSource.addEventListener('notification.received', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('New SSE notification:', data);
        
        // Update local state
        setNotifications(prev => [data, ...prev]);
        setUnreadCount(prev => prev + 1);

        // Trigger Toast
        showToast(data);
      } catch (err) {
        console.error('Error parsing SSE data:', err);
      }
    });

    eventSource.onerror = (err) => {
      console.error('SSE connection error:', err);
      // EventSource automatically retries, but we can log it
    };

    return () => {
      eventSource.close();
    };
  }, [user]);

  const showToast = (data) => {
    const icons = {
      assignment: <FileText className="text-blue-500" size={20} />,
      grade: <Award className="text-green-500" size={20} />,
      attendance: <AlertTriangle className="text-amber-500" size={20} />,
      system: <Info className="text-slate-500" size={20} />,
    };

    toast.custom((t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-4 overflow-hidden`}
        style={{ 
          borderColor: data.priority === 'high' ? '#EF4444' : '#3B82F6',
          backgroundColor: '#FFFFFF'
        }}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              {icons[data.type] || <Bell className="text-blue-500" size={20} />}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-bold text-slate-900">
                {data.title}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {data.message}
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-100">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-slate-400 hover:text-slate-600 focus:outline-none"
          >
            Close
          </button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, setUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);

// Custom Award icon for grade toast (Lucide Award isn't in my basic list usually)
const Award = ({ className, size }) => (
  <svg 
    className={className} 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </svg>
);
