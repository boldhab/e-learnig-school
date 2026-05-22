import { useNavigate, useLocation } from 'react-router-dom';
import {
  House,
  Bell,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const ParentSidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { icon: House, label: 'Overview', caption: 'Home command center', path: '/parent/dashboard' },
    { icon: Bell, label: 'Alerts', caption: 'Notifications and warnings', path: '/parent/notifications' },
  ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Parent logout failed', error);
    }
    navigate('/auth/login');
  };

  const renderSidebarContent = () => (
    <>
      <div className="border-b border-white/10 px-6 pb-6 pt-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-950/30">
            <ShieldCheck size={22} />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200/70">Millennium LMS</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">Parent Portal</h2>
            <p className="mt-2 max-w-[13rem] text-sm leading-6 text-slate-400">
              Child safety, attendance, assignments, and reports in one place.
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-5">
        <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Workspace</p>
        <div className="mt-3 space-y-2">
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
              whileHover={{ x: 3 }}
              className={`w-full rounded-2xl border px-4 py-3 text-left transition-all ${
                active
                  ? 'border-cyan-400/40 bg-white/10 text-white shadow-[0_16px_28px_-22px_rgba(34,211,238,0.65)]'
                  : 'border-transparent text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${active ? 'bg-cyan-400/20 text-cyan-200' : 'bg-white/5 text-slate-400'}`}>
                  <Icon size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className={`mt-1 text-xs ${active ? 'text-slate-200/80' : 'text-slate-500'}`}>{item.caption}</p>
                </div>
              </div>
            </motion.button>
          );
        })}
        </div>
      </nav>

      <div className="border-t border-white/10 p-4">
        <motion.button
          onClick={handleLogout}
          whileHover={{ x: 3 }}
          className="w-full rounded-2xl bg-white/5 px-4 py-3 text-left text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5">
              <LogOut size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold">Logout</p>
              <p className="mt-1 text-xs text-slate-500">End parent session securely</p>
            </div>
          </div>
        </motion.button>
      </div>
    </>
  );

  return (
    <>
      <motion.div
        className="fixed left-0 top-0 hidden h-screen w-[288px] flex-col border-r border-white/10 bg-[#0f172a] lg:flex"
      >
        <div className="w-full h-full flex flex-col">
          {renderSidebarContent()}
        </div>
      </motion.div>

      <AnimatePresence>
        {isOpen ? (
          <>
            <motion.div
              key="overlay"
              className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              key="drawer"
              className="fixed left-0 top-0 z-50 h-screen w-[288px] border-r border-white/10 bg-[#0f172a] lg:hidden"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', stiffness: 280, damping: 30 }}
            >
              <div className="flex h-full flex-col">{renderSidebarContent()}</div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
};

export default ParentSidebar;
