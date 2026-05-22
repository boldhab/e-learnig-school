import { motion } from 'framer-motion';
import { COLORS, SHADOWS, SPACING, RADIUS } from '../../constants/theme';

// Skeleton Loader Component
export const SkeletonLoader = ({ count = 3, variant = 'card' }) => {
  const variants = {
    card: 'h-48 rounded-2xl',
    line: 'h-4 rounded-lg',
    text: 'h-6 rounded',
  };

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className={`${variants[variant]} bg-gray-200`}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      ))}
    </div>
  );
};

// Empty State Component
export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <motion.div
    className="text-center py-12"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <Icon
      size={48}
      style={{ color: COLORS.TEXT_SECONDARY }}
      className="mx-auto mb-4 opacity-20"
    />
    <h3 className="text-lg font-semibold mb-2" style={{ color: COLORS.TEXT_PRIMARY }}>
      {title}
    </h3>
    <p style={{ color: COLORS.TEXT_SECONDARY }} className="text-sm mb-6 max-w-md mx-auto">
      {description}
    </p>
    {action && action}
  </motion.div>
);

// Page Header Component
export const PageHeader = ({ title, subtitle, action }) => (
  <motion.div
    className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div>
      <h1 className="text-3xl font-bold" style={{ color: COLORS.TEXT_PRIMARY }}>
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 text-sm" style={{ color: COLORS.TEXT_SECONDARY }}>
          {subtitle}
        </p>
      )}
    </div>
    {action && <div>{action}</div>}
  </motion.div>
);

// Badge Component
export const Badge = ({ children, variant = 'default', color = COLORS.PRIMARY_BLUE }) => {
  const variants = {
    default: {
      bg: `${color}15`,
      text: color,
    },
    outline: {
      bg: 'transparent',
      text: color,
      border: color,
    },
    solid: {
      bg: color,
      text: '#FFFFFF',
    },
  };

  const style = variants[variant];

  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
      style={{
        backgroundColor: style.bg,
        color: style.text,
        border: style.border ? `1px solid ${style.border}` : 'none',
      }}
    >
      {children}
    </span>
  );
};

// Progress Bar Component
export const ProgressBar = ({ value, max = 100, color = COLORS.PRIMARY_BLUE, showLabel = true }) => {
  const percentage = (value / max) * 100;

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium" style={{ color: COLORS.TEXT_PRIMARY }}>
          Progress
        </span>
        {showLabel && (
          <span className="text-sm font-bold" style={{ color }}>
            {percentage.toFixed(0)}%
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8 }}
        />
      </div>
    </div>
  );
};

// Status Indicator Component
export const StatusIndicator = ({ status, label }) => {
  const statusMap = {
    active: { color: COLORS.EMERALD_GREEN, label: 'Active' },
    inactive: { color: COLORS.DANGER, label: 'Inactive' },
    pending: { color: COLORS.WARNING, label: 'Pending' },
    completed: { color: COLORS.EMERALD_GREEN, label: 'Completed' },
    submitted: { color: COLORS.INFO, label: 'Submitted' },
  };

  const config = statusMap[status];

  return (
    <div className="flex items-center gap-2">
      <div
        className="w-2 h-2 rounded-full animate-pulse"
        style={{ backgroundColor: config.color }}
      />
      <span className="text-xs font-medium" style={{ color: config.color }}>
        {label || config.label}
      </span>
    </div>
  );
};

// Card Component
export const Card = ({ children, className = '', hover = true }) => (
  <motion.div
    className={`bg-white p-6 rounded-2xl border transition-all ${hover ? 'hover:shadow-lg' : ''} ${className}`}
    style={{
      borderColor: COLORS.BORDER,
    }}
    whileHover={hover ? { y: -4 } : {}}
  >
    {children}
  </motion.div>
);

// Button Component
export const Button = ({ children, variant = 'primary', onClick, disabled = false, className = '' }) => {
  const variants = {
    primary: {
      bg: COLORS.PRIMARY_BLUE,
      text: '#FFFFFF',
      hover: 'hover:opacity-90',
    },
    secondary: {
      bg: COLORS.BACKGROUND,
      text: COLORS.TEXT_PRIMARY,
      hover: 'hover:bg-gray-200',
      border: COLORS.BORDER,
    },
    danger: {
      bg: COLORS.DANGER,
      text: '#FFFFFF',
      hover: 'hover:opacity-90',
    },
  };

  const style = variants[variant];

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg font-medium transition-all ${style.hover} ${className}`}
      style={{
        backgroundColor: style.bg,
        color: style.text,
        border: style.border ? `1px solid ${style.border}` : 'none',
        opacity: disabled ? 0.5 : 1,
      }}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
    >
      {children}
    </motion.button>
  );
};

// Input Component
export const Input = ({ placeholder, value, onChange, type = 'text', className = '' }) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-all ${className}`}
    style={{
      borderColor: COLORS.BORDER,
      focusRingColor: COLORS.PRIMARY_BLUE,
    }}
  />
);

// Modal Component
export const Modal = ({ isOpen, onClose, title, children, actions }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl p-8 max-w-md w-full"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4" style={{ color: COLORS.TEXT_PRIMARY }}>
          {title}
        </h2>
        <div className="mb-6">{children}</div>
        <div className="flex gap-3 justify-end">
          {actions && actions}
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};
