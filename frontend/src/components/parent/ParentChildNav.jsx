import { NavLink } from 'react-router-dom';
import { BookOpen, ClipboardList, LineChart, ShieldAlert, TrendingUp } from 'lucide-react';

const items = [
  { label: 'Courses', suffix: 'courses', icon: BookOpen },
  { label: 'Assignments', suffix: 'assignments', icon: ClipboardList },
  { label: 'Attendance', suffix: 'attendance', icon: ShieldAlert },
  { label: 'Performance', suffix: 'performance', icon: TrendingUp },
  { label: 'Reports', suffix: 'reports', icon: LineChart },
];

const ParentChildNav = ({ studentId }) => {
  if (!studentId) return null;

  return (
    <div className="rounded-lg border border-slate-200/70 bg-white p-2 shadow-sm">
      <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.suffix}
            to={`/parent/student/${studentId}/${item.suffix}`}
            className={({ isActive }) =>
              `inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-[0_12px_26px_-18px_rgba(15,23,42,0.9)]'
                  : 'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            <Icon size={16} />
            {item.label}
          </NavLink>
        );
      })}
      </div>
    </div>
  );
};

export default ParentChildNav;
