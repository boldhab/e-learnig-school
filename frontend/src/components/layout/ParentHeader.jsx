import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Menu, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NotificationBell from '../common/NotificationBell';
import { useAuth } from '../../contexts/AuthContext';

const ParentHeader = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const todayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }).format(new Date()),
    []
  );

  const initials = (user?.full_name || 'Parent')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-30 border-b border-white/70 bg-[#f6f7fb]/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 lg:hidden"
          >
            <Menu size={20} />
          </button>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Parent Care Hub</p>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <span className="font-semibold text-slate-900">{todayLabel}</span>
              <span className="hidden sm:inline text-slate-300">|</span>
              <span className="inline-flex items-center gap-1">
                <Sparkles size={14} className="text-cyan-500" />
                Track academics, attendance, and alerts in real time.
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell />

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowProfileMenu((value) => !value)}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:bg-slate-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400 text-sm font-bold text-white">
                {initials}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold text-slate-900">{user?.full_name || 'Parent User'}</p>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Parent Account</p>
              </div>
              <ChevronDown size={16} className="text-slate-400" />
            </button>

            {showProfileMenu ? (
              <div className="absolute right-0 mt-3 w-56 rounded-3xl border border-slate-200 bg-white p-2 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.4)]">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/parent/dashboard');
                  }}
                  className="w-full rounded-2xl px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/parent/notifications');
                  }}
                  className="w-full rounded-2xl px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Notifications
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setShowProfileMenu(false);
                    try {
                      await logout();
                    } catch (error) {
                      console.error('Parent logout failed', error);
                    }
                    navigate('/auth/login');
                  }}
                  className="mt-1 w-full rounded-2xl bg-slate-900 px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default ParentHeader;
