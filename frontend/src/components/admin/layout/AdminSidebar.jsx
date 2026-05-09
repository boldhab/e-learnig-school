import { useLocation, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  MessageSquare,
  CalendarDays,
  BarChart3,
  Bell,
  Settings,
  Database,
  Activity,
  UserCircle2,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { ADMIN_COLORS } from '../../../constants/adminTheme';
import { useAuth } from '../../../contexts/AuthContext';

const sections = [
  {
    title: 'Management',
    items: [
      { icon: Users, label: 'User Management', path: '../admin/users' },
      { icon: BookOpen, label: 'Courses & Subjects', path: '../admin/courses' },
      { icon: ClipboardList, label: 'Assignments Overview', path: '../admin/assignments' },
    ],
  },
  {
    title: 'Monitoring',
    items: [
      { icon: MessageSquare, label: 'Discussions Monitoring', path: '../admin/discussions' },
      { icon: CalendarDays, label: 'Attendance Reports', path: '../admin/attendance' },
      { icon: BarChart3, label: 'Performance Analytics', path: '../admin/analytics' },
      { icon: Bell, label: 'Notifications', path: '../admin/notifications' },
      { icon: Activity, label: 'Activity Logs', path: '../admin/activity-logs' },
    ],
  },
  {
    title: 'Configuration',
    items: [
      { icon: Settings, label: 'System Settings', path: '../admin/settings' },
      { icon: Database, label: 'Backups & Recovery', path: '../admin/backups' },
      { icon: UserCircle2, label: 'Profile', path: '../admin/profile' },
    ],
  },
];

const AdminSidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState({});

  const activePath = useMemo(() => location.pathname, [location.pathname]);

  const isActive = (path) => {
    const lastPart = path.split('/').pop();
    return location.pathname.endsWith(lastPart);
  };

  const { logout } = useAuth();

  const handleLogout = () => {
    (async () => {
      try {
        await logout();
      } catch (e) {
        // ignore
      }
      navigate('/auth/login');
    })();
  };

  const renderContent = () => (
    <>
      <div className="border-b border-white/10 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-lg" style={{ backgroundColor: ADMIN_COLORS.PRIMARY_BLUE }}>
            <Shield size={20} />
          </div>
          <div>
            <p className="text-lg font-semibold text-white">Millennium Admin</p>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Enterprise Console</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-3 overflow-y-auto p-4">
        <button
          type="button"
          onClick={() => navigate('../admin/dashboard')}
          className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition-colors ${isActive('dashboard') || location.pathname.endsWith('dashboard') ? 'text-white' : 'text-slate-300 hover:text-white'}`}
          style={{ backgroundColor: isActive('dashboard') || location.pathname.endsWith('dashboard') ? ADMIN_COLORS.PRIMARY_BLUE : 'transparent' }}
        >
          <LayoutDashboard size={18} />
          Dashboard
        </button>

        {sections.map((section) => {
          const sectionCollapsed = collapsed[section.title];

          return (
            <div key={section.title} className="space-y-2">
              <button
                type="button"
                onClick={() => setCollapsed((current) => ({ ...current, [section.title]: !current[section.title] }))}
                className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 transition-colors hover:text-slate-300"
              >
                <span>{section.title}</span>
                {sectionCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
              </button>

              {!sectionCollapsed && (
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);

                    return (
                      <motion.button
                        key={item.path}
                        type="button"
                        onClick={() => {
                          navigate(item.path);
                          setIsOpen(false);
                        }}
                        whileHover={{ x: 4 }}
                        className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition-all"
                        style={{
                          backgroundColor: active ? 'rgba(30, 64, 175, 0.95)' : 'transparent',
                          color: active ? '#FFFFFF' : ADMIN_COLORS.SIDEBAR_TEXT,
                        }}
                      >
                        <Icon size={18} />
                        <span>{item.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-slate-300 transition-colors hover:text-white"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-4 z-50 rounded-2xl bg-white p-2 shadow-lg lg:hidden"
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      <motion.aside
        className="fixed left-0 top-0 z-40 hidden h-screen w-72 flex-col bg-slate-950 lg:flex"
        style={{ backgroundColor: ADMIN_COLORS.SIDEBAR }}
      >
        {renderContent()}
      </motion.aside>

      <motion.aside
        className="fixed left-0 top-0 z-50 flex h-screen w-72 flex-col bg-slate-950 lg:hidden"
        style={{ backgroundColor: ADMIN_COLORS.SIDEBAR }}
        initial={false}
        animate={{ x: isOpen ? 0 : -320 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
      >
        {renderContent()}
      </motion.aside>

      {isOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setIsOpen(false)} />}
    </>
  );
};

export default AdminSidebar;
