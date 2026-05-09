import { motion } from 'framer-motion';
import { Bell, Search, ShieldCheck, Sparkles, UserCircle2 } from 'lucide-react';
import { ADMIN_COLORS } from '../../../constants/adminTheme';

const AdminHeader = () => (
  <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
    <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            <Sparkles size={14} />
            Enterprise Management Dashboard
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Administrative Control Center
          </h1>
          <p className="mt-1 text-sm text-slate-500">Monitor, configure, and govern the entire LMS from one place.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search users, courses, logs..."
              className="w-56 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          <button type="button" className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
            <Bell size={16} />
            Alerts
            <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">4</span>
          </button>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full text-white" style={{ backgroundColor: ADMIN_COLORS.PRIMARY_BLUE }}>
              <UserCircle2 size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Administrator</p>
              <p className="text-xs text-slate-500">System owner</p>
            </div>
            <div className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
              <ShieldCheck size={12} className="mr-1 inline-block" />
              Secure
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
);

export default AdminHeader;
