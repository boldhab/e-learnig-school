import { motion } from 'framer-motion';
import { ADMIN_COLORS, ADMIN_SHADOWS } from '../../constants/adminTheme';

export const AdminSection = ({ title, description, action, children, className = '' }) => (
  <section className={`space-y-4 ${className}`}>
    {(title || description || action) && (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {title && <h2 className="text-xl font-semibold text-slate-900">{title}</h2>}
          {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
        </div>
        {action}
      </div>
    )}
    {children}
  </section>
);

export const AdminCard = ({ children, className = '', hover = true }) => (
  <motion.div
    className={`rounded-[20px] border bg-white ${className}`}
    style={{
      borderColor: ADMIN_COLORS.BORDER,
      boxShadow: ADMIN_SHADOWS.SM,
    }}
    whileHover={hover ? { y: -4 } : {}}
    transition={{ type: 'spring', stiffness: 260, damping: 22 }}
  >
    {children}
  </motion.div>
);

export const AdminMetricCard = ({ title, value, trend, trendColor = ADMIN_COLORS.SUCCESS, icon: Icon, subtitle }) => (
  <AdminCard className="p-5">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div className="mt-2 flex items-end gap-3">
          <span className="text-3xl font-semibold tracking-tight text-slate-900">{value}</span>
          {trend && <span className="pb-1 text-sm font-semibold" style={{ color: trendColor }}>{trend}</span>}
        </div>
        {subtitle && <p className="mt-2 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {Icon && (
        <div className="rounded-2xl p-3 text-white" style={{ backgroundColor: ADMIN_COLORS.PRIMARY_BLUE }}>
          <Icon size={20} />
        </div>
      )}
    </div>
  </AdminCard>
);

export const AdminBadge = ({ children, tone = 'blue' }) => {
  const palette = {
    blue: { bg: '#DBEAFE', text: ADMIN_COLORS.PRIMARY_BLUE },
    teal: { bg: '#CCFBF1', text: ADMIN_COLORS.ACCENT_TEAL },
    green: { bg: '#DCFCE7', text: ADMIN_COLORS.SUCCESS },
    amber: { bg: '#FEF3C7', text: ADMIN_COLORS.WARNING },
    red: { bg: '#FEE2E2', text: ADMIN_COLORS.DANGER },
    slate: { bg: '#E2E8F0', text: '#334155' },
  };

  const color = palette[tone] || palette.blue;

  return (
    <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: color.bg, color: color.text }}>
      {children}
    </span>
  );
};

export const AdminToolbarButton = ({ children, active = false, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${active ? 'text-white' : 'text-slate-600 hover:text-slate-900'}`}
    style={{ backgroundColor: active ? ADMIN_COLORS.PRIMARY_BLUE : 'transparent' }}
  >
    {children}
  </button>
);
