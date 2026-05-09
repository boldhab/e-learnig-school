import { motion } from 'framer-motion';
import {
	Users,
	GraduationCap,
	BookOpen,
	ClipboardList,
	MessageSquare,
	CalendarDays,
	Bell,
	ShieldCheck,
	ArrowRight,
	Server,
	CircleCheck,
	TriangleAlert,
	Activity,
	TrendingUp,
	Database,
} from 'lucide-react';
import { ADMIN_COLORS } from '../../constants/adminTheme';
import { AdminBadge, AdminCard, AdminMetricCard, AdminSection } from '../../components/admin/AdminUI';

const systemCards = [
	{ title: 'Total Students', value: '1,280', trend: '+8.4%', icon: Users },
	{ title: 'Total Teachers', value: '84', trend: '+2.1%', icon: GraduationCap },
	{ title: 'Active Courses', value: '142', trend: '+6.7%', icon: BookOpen },
	{ title: 'Assignments Submitted', value: '3,420', trend: '+14.3%', icon: ClipboardList },
	{ title: 'Attendance Rate', value: '92%', trend: '+1.8%', icon: CalendarDays },
	{ title: 'Active Discussions', value: '318', trend: '+11.2%', icon: MessageSquare },
];

const systemHealth = [
	{ label: 'API Services', value: 'Healthy', tone: 'green' },
	{ label: 'Database', value: 'Normal', tone: 'blue' },
	{ label: 'Storage', value: '68% Used', tone: 'amber' },
	{ label: 'Backups', value: 'Scheduled', tone: 'teal' },
];

const recentActivity = [
	{ text: 'New teacher account activated', meta: '2 minutes ago', icon: GraduationCap },
	{ text: '12 assignments pending review across all courses', meta: '11 minutes ago', icon: ClipboardList },
	{ text: 'Backup completed successfully', meta: '22 minutes ago', icon: Database },
	{ text: 'Suspicious login blocked by policy', meta: '41 minutes ago', icon: TriangleAlert },
];

const quickActions = [
	'Create user',
	'Review logs',
	'Trigger backup',
	'Open analytics',
];

const AdminDashboardPage = () => (
	<div className="space-y-6">
		<AdminCard className="overflow-hidden">
			<div className="grid gap-6 bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 p-6 text-white lg:grid-cols-[1.5fr_1fr] lg:p-8">
				<div className="space-y-4">
					<AdminBadge tone="blue">Enterprise System Overview</AdminBadge>
					<div>
						<h2 className="text-3xl font-semibold tracking-tight">Welcome back, Administrator 👋</h2>
						<p className="mt-2 max-w-2xl text-sm text-slate-300">The system is operating normally today. You have full oversight of users, courses, moderation, backups, and audit logs.</p>
					</div>
					<div className="flex flex-wrap gap-3">
						{quickActions.map((action) => (
							<button key={action} type="button" className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15">
								{action}
							</button>
						))}
					</div>
				</div>

				<div className="grid gap-3 sm:grid-cols-2">
					{systemHealth.map((item) => (
						<div key={item.label} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
							<p className="text-xs uppercase tracking-[0.18em] text-slate-300">{item.label}</p>
							<div className="mt-3 flex items-center justify-between gap-3">
								<span className="text-lg font-semibold">{item.value}</span>
								<AdminBadge tone={item.tone}>{item.value}</AdminBadge>
							</div>
						</div>
					))}
				</div>
			</div>
		</AdminCard>

		<AdminSection title="System Statistics" description="High-level signals across the LMS">
			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
				{systemCards.map((card) => (
					<AdminMetricCard key={card.title} {...card} />
				))}
			</div>
		</AdminSection>

		<div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
			<AdminSection title="Recent System Activity" description="Audit-friendly operational changes and alerts">
				<AdminCard className="p-5">
					<div className="space-y-4">
						{recentActivity.map((item) => {
							const Icon = item.icon;
							return (
								<div key={item.text} className="flex items-start gap-4 rounded-2xl border border-slate-200 p-4">
									<div className="rounded-2xl bg-blue-50 p-3 text-blue-700"><Icon size={18} /></div>
									<div className="flex-1">
										<p className="font-medium text-slate-900">{item.text}</p>
										<p className="mt-1 text-sm text-slate-500">{item.meta}</p>
									</div>
								</div>
							);
						})}
					</div>
				</AdminCard>
			</AdminSection>

			<AdminSection title="System Health" description="Operational status across the platform">
				<AdminCard className="p-5">
					<div className="space-y-4">
						<div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
							<div>
								<p className="text-sm font-semibold text-slate-900">Service availability</p>
								<p className="text-sm text-slate-500">All core services are currently reachable.</p>
							</div>
							<CircleCheck className="text-emerald-600" size={22} />
						</div>
						<div className="space-y-3">
							{[
								{ label: 'Notifications queue', value: '12 pending', color: ADMIN_COLORS.INFO },
								{ label: 'Unresolved issues', value: '3 flagged', color: ADMIN_COLORS.WARNING },
								{ label: 'Protected endpoints', value: '98%', color: ADMIN_COLORS.SUCCESS },
							].map((item) => (
								<div key={item.label} className="rounded-2xl border border-slate-200 p-4">
									<div className="flex items-center justify-between text-sm">
										<span className="text-slate-500">{item.label}</span>
										<span className="font-semibold" style={{ color: item.color }}>{item.value}</span>
									</div>
									<div className="mt-3 h-2 rounded-full bg-slate-100">
										<div className="h-2 rounded-full" style={{ width: '72%', backgroundColor: item.color }} />
									</div>
								</div>
							))}
						</div>
					</div>
				</AdminCard>
			</AdminSection>
		</div>

		<div className="grid gap-6 xl:grid-cols-3">
			<AdminSection title="Performance Metrics" description="What the administration team should watch right now">
				<AdminCard className="p-5 xl:col-span-2">
					<div className="grid gap-4 md:grid-cols-2">
						{[
							{ label: 'Assignment workload', value: 'High', trend: '+18%', icon: ClipboardList },
							{ label: 'Attendance risk', value: 'Low', trend: '-4%', icon: CalendarDays },
							{ label: 'Discussion moderation', value: 'Active', trend: '+22%', icon: MessageSquare },
							{ label: 'Backup readiness', value: 'Ready', trend: '100%', icon: Database },
						].map((item) => (
							<div key={item.label} className="rounded-2xl border border-slate-200 p-4">
								<div className="flex items-center justify-between">
									<item.icon size={18} className="text-slate-500" />
									<span className="text-sm font-semibold text-blue-700">{item.trend}</span>
								</div>
								<p className="mt-4 text-sm text-slate-500">{item.label}</p>
								<p className="mt-1 text-xl font-semibold text-slate-900">{item.value}</p>
							</div>
						))}
					</div>
				</AdminCard>
			</AdminSection>

			<AdminSection title="Notifications" description="Critical alerts and reminders">
				<AdminCard className="p-5">
					<div className="space-y-3">
						{[
							{ title: 'Server disk usage above 65%', tone: 'amber' },
							{ title: '3 students reported for moderation', tone: 'red' },
							{ title: 'Backup job completed successfully', tone: 'green' },
						].map((item) => (
							<div key={item.title} className="rounded-2xl border border-slate-200 p-4">
								<div className="flex items-start gap-3">
									<Bell size={18} className="mt-0.5 text-slate-400" />
									<div>
										<p className="text-sm font-medium text-slate-900">{item.title}</p>
										<p className="mt-1 text-xs text-slate-500">System-wide notification</p>
									</div>
								</div>
							</div>
						))}
					</div>
				</AdminCard>
			</AdminSection>
		</div>
	</div>
);

export default AdminDashboardPage;

