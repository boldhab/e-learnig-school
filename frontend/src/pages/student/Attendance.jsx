import { motion } from 'framer-motion';
import { Calendar, CheckCircle, XCircle, AlertCircle, BarChart3 } from 'lucide-react';
import { COLORS } from '../../constants/theme';

// Attendance Stats Card
const AttendanceStatCard = ({ icon: Icon, label, value, percentage, color }) => (
  <motion.div
    className="bg-white p-6 rounded-2xl border"
    style={{ borderColor: COLORS.BORDER }}
    whileHover={{ y: -4 }}
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
  >
    <div className="flex items-center justify-between mb-3">
      <p style={{ color: COLORS.TEXT_SECONDARY }} className="text-sm font-medium">
        {label}
      </p>
      <div
        className="p-3 rounded-lg"
        style={{
          backgroundColor: `${color}15`,
        }}
      >
        <Icon size={20} style={{ color }} />
      </div>
    </div>
    <p className="text-3xl font-bold mb-2" style={{ color: COLORS.TEXT_PRIMARY }}>
      {value}
    </p>
    <p style={{ color: COLORS.TEXT_SECONDARY }} className="text-sm">
      {percentage}% attendance rate
    </p>
  </motion.div>
);

// Calendar Heatmap
const AttendanceCalendar = () => {
  const daysInMonth = 31;
  const firstDayOfMonth = 2; // 0 = Sunday, 2 = Tuesday (May 1st, 2026)
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  // Generate sample attendance data
  const getAttendanceStatus = (day) => {
    const random = Math.random();
    if (day < 5 || day > 28) return 'empty';
    if (random < 0.05) return 'absent';
    if (random < 0.15) return 'late';
    return 'present';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return COLORS.EMERALD_GREEN;
      case 'absent':
        return COLORS.DANGER;
      case 'late':
        return COLORS.WARNING;
      default:
        return COLORS.BORDER;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'present':
        return 'Present';
      case 'absent':
        return 'Absent';
      case 'late':
        return 'Late';
      default:
        return '';
    }
  };

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    return {
      day,
      status: getAttendanceStatus(day),
    };
  });

  const gridDays = Array(firstDayOfMonth)
    .fill(null)
    .concat(days);

  return (
    <motion.div
      className="bg-white p-8 rounded-2xl border"
      style={{ borderColor: COLORS.BORDER }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <h3 className="text-xl font-bold mb-6" style={{ color: COLORS.TEXT_PRIMARY }}>
        May 2026 - Attendance Calendar
      </h3>

      {/* Calendar Grid */}
      <div className="mb-6">
        {/* Week Days Header */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="text-center text-xs font-semibold py-2"
              style={{ color: COLORS.TEXT_SECONDARY }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {gridDays.map((item, idx) => (
            <motion.div
              key={idx}
              className="aspect-square rounded-lg flex items-center justify-center cursor-pointer relative group"
              style={{
                backgroundColor:
                  item?.status === 'empty' ? 'transparent' : getStatusColor(item?.status),
                opacity: item?.status === 'empty' ? 0.3 : 1,
              }}
              whileHover={
                item?.status !== 'empty'
                  ? { scale: 1.1 }
                  : { scale: 1 }
              }
            >
              {item?.day && (
                <>
                  <span
                    className="text-xs font-bold"
                    style={{
                      color:
                        item?.status === 'empty' || item?.status === 'present'
                          ? '#FFFFFF'
                          : '#FFFFFF',
                    }}
                  >
                    {item.day}
                  </span>
                  {/* Tooltip */}
                  {item?.status !== 'empty' && (
                    <div
                      className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {getStatusLabel(item?.status)}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-6 justify-center flex-wrap">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: COLORS.EMERALD_GREEN }}
          />
          <span className="text-sm" style={{ color: COLORS.TEXT_SECONDARY }}>
            Present
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: COLORS.DANGER }}
          />
          <span className="text-sm" style={{ color: COLORS.TEXT_SECONDARY }}>
            Absent
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: COLORS.WARNING }}
          />
          <span className="text-sm" style={{ color: COLORS.TEXT_SECONDARY }}>
            Late
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// Subject Attendance
const SubjectAttendance = () => {
  const subjects = [
    { name: 'Web Development', present: 18, absent: 1, total: 20, percentage: 90 },
    { name: 'Database Design', present: 16, absent: 2, total: 18, percentage: 89 },
    { name: 'Data Structures', present: 19, absent: 1, total: 20, percentage: 95 },
    { name: 'UI/UX Design', present: 17, absent: 0, total: 17, percentage: 100 },
    { name: 'Cloud Computing', present: 15, absent: 2, total: 17, percentage: 88 },
  ];

  return (
    <motion.div
      className="bg-white p-6 rounded-2xl border"
      style={{ borderColor: COLORS.BORDER }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h3 className="text-xl font-bold mb-6" style={{ color: COLORS.TEXT_PRIMARY }}>
        Subject-wise Attendance
      </h3>
      <div className="space-y-4">
        {subjects.map((subject, idx) => (
          <motion.div key={idx} className="pb-4 border-b last:border-b-0" style={{ borderColor: COLORS.BORDER }}>
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-sm" style={{ color: COLORS.TEXT_PRIMARY }}>
                {subject.name}
              </p>
              <p className="font-bold text-sm" style={{ color: COLORS.EMERALD_GREEN }}>
                {subject.percentage}%
              </p>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="h-2 rounded-full"
                  style={{ backgroundColor: COLORS.EMERALD_GREEN }}
                  initial={{ width: 0 }}
                  animate={{ width: `${subject.percentage}%` }}
                  transition={{ duration: 0.8, delay: idx * 0.1 }}
                />
              </div>
            </div>
            <div className="flex gap-4 text-xs">
              <span style={{ color: COLORS.TEXT_SECONDARY }}>
                <span style={{ color: COLORS.EMERALD_GREEN }} className="font-semibold">
                  {subject.present}
                </span>{' '}
                Present
              </span>
              <span style={{ color: COLORS.TEXT_SECONDARY }}>
                <span style={{ color: COLORS.DANGER }} className="font-semibold">
                  {subject.absent}
                </span>{' '}
                Absent
              </span>
              <span style={{ color: COLORS.TEXT_SECONDARY }}>Total: {subject.total}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// Attendance Policy
const AttendancePolicy = () => (
  <motion.div
    className="bg-white p-6 rounded-2xl border"
    style={{ borderColor: COLORS.BORDER }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4 }}
  >
    <h3 className="text-lg font-bold mb-4" style={{ color: COLORS.TEXT_PRIMARY }}>
      Attendance Policy
    </h3>
    <div className="space-y-3">
      <div className="flex gap-3 p-3 rounded-lg" style={{ backgroundColor: COLORS.BACKGROUND }}>
        <AlertCircle size={20} style={{ color: COLORS.WARNING, flexShrink: 0 }} />
        <div>
          <p className="font-semibold text-sm" style={{ color: COLORS.TEXT_PRIMARY }}>
            Minimum Attendance Requirement
          </p>
          <p style={{ color: COLORS.TEXT_SECONDARY }} className="text-sm mt-1">
            80% attendance is required to sit for final exams
          </p>
        </div>
      </div>
      <div className="flex gap-3 p-3 rounded-lg" style={{ backgroundColor: COLORS.BACKGROUND }}>
        <AlertCircle size={20} style={{ color: COLORS.DANGER, flexShrink: 0 }} />
        <div>
          <p className="font-semibold text-sm" style={{ color: COLORS.TEXT_PRIMARY }}>
            Current Status
          </p>
          <p style={{ color: COLORS.TEXT_SECONDARY }} className="text-sm mt-1">
            You are meeting the attendance requirement. Keep it up!
          </p>
        </div>
      </div>
    </div>
  </motion.div>
);

// Main Attendance Page
const AttendancePage = () => {
  return (
    <div className="p-6 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.TEXT_PRIMARY }}>
          Attendance Tracking
        </h1>
        <p style={{ color: COLORS.TEXT_SECONDARY }} className="text-lg">
          Monitor your class attendance and participation
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
      >
        <AttendanceStatCard
          icon={CheckCircle}
          label="Overall Attendance"
          value="92%"
          percentage="92"
          color={COLORS.EMERALD_GREEN}
        />
        <AttendanceStatCard
          icon={Calendar}
          label="Classes Present"
          value="89"
          percentage="92"
          color={COLORS.PRIMARY_BLUE}
        />
        <AttendanceStatCard
          icon={AlertCircle}
          label="Classes Absent"
          value="3"
          percentage="8"
          color={COLORS.DANGER}
        />
        <AttendanceStatCard
          icon={BarChart3}
          label="Classes Late"
          value="2"
          percentage="2"
          color={COLORS.WARNING}
        />
      </motion.div>

      {/* Calendar */}
      <div className="mb-8">
        <AttendanceCalendar />
      </div>

      {/* Subject Attendance and Policy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SubjectAttendance />
        </div>
        <div>
          <AttendancePolicy />
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
