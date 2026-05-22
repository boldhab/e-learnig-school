import { motion } from 'framer-motion';

const toneClasses = {
  slate: 'from-slate-900 via-slate-800 to-slate-900 text-white',
  blue: 'from-blue-600 via-cyan-500 to-sky-400 text-white',
  amber: 'from-amber-100 via-orange-50 to-white text-slate-900',
  rose: 'from-rose-100 via-orange-50 to-white text-slate-900',
  emerald: 'from-emerald-100 via-teal-50 to-white text-slate-900',
};

export const ParentPageHero = ({ eyebrow, title, subtitle, action, tone = 'slate', children }) => (
  <motion.section
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-br px-6 py-7 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.45)] md:px-8 ${toneClasses[tone] || toneClasses.slate}`}
  >
    <div className="absolute inset-0 opacity-20">
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white blur-3xl" />
      <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-cyan-300 blur-3xl" />
    </div>
    <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        {eyebrow && <p className="text-[11px] font-semibold uppercase tracking-[0.28em] opacity-75">{eyebrow}</p>}
        <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-3 max-w-2xl text-sm leading-6 opacity-80 md:text-base">{subtitle}</p>}
        {children && <div className="mt-5">{children}</div>}
      </div>
      {action && <div className="relative z-10 flex flex-wrap gap-2">{action}</div>}
    </div>
  </motion.section>
);

export const ParentPanel = ({ children, className = '', tone = 'white' }) => {
  const bgClass =
    tone === 'soft'
      ? 'bg-white/80 backdrop-blur-sm'
      : tone === 'dark'
        ? 'bg-slate-900 text-white'
        : 'bg-white';

  return (
    <div
      className={`rounded-[1.75rem] border border-slate-200/70 ${bgClass} shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)] ${className}`}
    >
      {children}
    </div>
  );
};

export const ParentStatCard = ({ icon: Icon, label, value, caption, tone = 'blue' }) => {
  const accents = {
    blue: 'bg-blue-50 text-blue-700 ring-blue-100',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    amber: 'bg-amber-50 text-amber-700 ring-amber-100',
    rose: 'bg-rose-50 text-rose-700 ring-rose-100',
    slate: 'bg-slate-100 text-slate-700 ring-slate-200',
  };

  return (
    <ParentPanel className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
          {caption && <p className="mt-2 text-xs font-medium uppercase tracking-[0.22em] text-slate-400">{caption}</p>}
        </div>
        {Icon && (
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${accents[tone] || accents.blue}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </ParentPanel>
  );
};

export const ParentSectionHeading = ({ icon: Icon, title, subtitle, action }) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div className="min-w-0">
      <div className="flex items-center gap-2 text-slate-900">
        {Icon ? <Icon size={18} className="text-slate-500" /> : null}
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      </div>
      {subtitle && <p className="mt-2 text-sm leading-6 text-slate-500">{subtitle}</p>}
    </div>
    {action && <div className="flex flex-wrap gap-2">{action}</div>}
  </div>
);

export const ParentBadge = ({ children, tone = 'slate' }) => {
  const tones = {
    blue: 'bg-blue-100 text-blue-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-700',
    rose: 'bg-rose-100 text-rose-700',
    slate: 'bg-slate-100 text-slate-700',
  };

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${tones[tone] || tones.slate}`}>
      {children}
    </span>
  );
};

export const ParentEmptyState = ({ title, description, action }) => (
  <ParentPanel className="p-10 text-center">
    <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
    <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">{description}</p>
    {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
  </ParentPanel>
);
