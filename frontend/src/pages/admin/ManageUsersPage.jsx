import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MoreHorizontal, ShieldCheck, UserPlus, RefreshCcw, CheckCircle2, XCircle } from 'lucide-react';
import { ADMIN_COLORS } from '../../constants/adminTheme';
import { AdminBadge, AdminCard, AdminSection, AdminToolbarButton } from '../../components/admin/AdminUI';

const users = [
	{ name: 'Amina Yusuf', role: 'Teacher', email: 'amina@millennium.edu', status: 'Active', lastLogin: '2 min ago' },
	{ name: 'Daniel Okoro', role: 'Student', email: 'daniel@millennium.edu', status: 'Active', lastLogin: '10 min ago' },
	{ name: 'Grace Mensah', role: 'Teacher', email: 'grace@millennium.edu', status: 'Inactive', lastLogin: '2 days ago' },
	{ name: 'John Smith', role: 'Student', email: 'john@millennium.edu', status: 'Pending', lastLogin: 'Never' },
	{ name: 'Victoria James', role: 'Admin', email: 'victoria@millennium.edu', status: 'Active', lastLogin: '1 hr ago' },
];

const roleTone = {
	Admin: 'blue',
	Teacher: 'teal',
	Student: 'slate',
};

const statusTone = {
	Active: 'green',
	Inactive: 'red',
	Pending: 'amber',
};

const ManageUsersPage = ({ defaultRole = 'all' }) => {
	const [query, setQuery] = useState('');
	const [roleFilter, setRoleFilter] = useState(defaultRole);

	const filteredUsers = useMemo(() => users.filter((user) => {
		const matchesQuery = [user.name, user.email, user.role].join(' ').toLowerCase().includes(query.toLowerCase());
		const matchesRole = roleFilter === 'all' ? true : user.role.toLowerCase() === roleFilter.toLowerCase();
		return matchesQuery && matchesRole;
	}), [query, roleFilter]);

	return (
		<div className="space-y-6">
			<AdminSection
				title="User Management"
				description="Create users, assign roles, activate accounts, and reset passwords across the system."
				action={
					<div className="flex flex-wrap gap-3">
						<button type="button" className="inline-flex items-center gap-2 rounded-2xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-sm">
							<UserPlus size={16} />
							Create User
						</button>
						<button type="button" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
							<RefreshCcw size={16} />
							Sync Directory
						</button>
					</div>
				}
			>
				<AdminCard className="p-5">
					<div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
						<div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
							<Search size={16} className="text-slate-400" />
							<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search users, emails, roles..." className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none" />
						</div>

						<div className="flex flex-wrap items-center gap-2 rounded-full bg-slate-100 p-1">
							{['all', 'admin', 'teacher', 'student'].map((role) => (
								<AdminToolbarButton key={role} active={roleFilter === role} onClick={() => setRoleFilter(role)}>
									{role === 'all' ? 'All Roles' : role.charAt(0).toUpperCase() + role.slice(1)}
								</AdminToolbarButton>
							))}
						</div>
					</div>
				</AdminCard>

				<div className="grid gap-4 md:grid-cols-4">
					{[
						{ title: 'Total Users', value: '1,364', trend: '+9.4%', icon: ShieldCheck },
						{ title: 'Active Accounts', value: '1,287', trend: '+7.8%', icon: CheckCircle2 },
						{ title: 'Pending Invites', value: '24', trend: '+3', icon: Filter },
						{ title: 'Inactive Users', value: '53', trend: '-2', icon: XCircle },
					].map((metric) => (
						<AdminCard key={metric.title} className="p-5">
							<div className="flex items-start justify-between gap-3">
								<div>
									<p className="text-sm text-slate-500">{metric.title}</p>
									<p className="mt-2 text-2xl font-semibold text-slate-900">{metric.value}</p>
									<p className="mt-1 text-xs font-semibold text-emerald-600">{metric.trend}</p>
								</div>
								<div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
									<metric.icon size={18} />
								</div>
							</div>
						</AdminCard>
					))}
				</div>

				<AdminCard className="overflow-hidden">
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-slate-200 text-left">
							<thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500">
								<tr>
									<th className="px-6 py-4 font-semibold">Name</th>
									<th className="px-6 py-4 font-semibold">Role</th>
									<th className="px-6 py-4 font-semibold">Email</th>
									<th className="px-6 py-4 font-semibold">Status</th>
									<th className="px-6 py-4 font-semibold">Last Login</th>
									<th className="px-6 py-4 font-semibold">Actions</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-200 bg-white">
								{filteredUsers.map((user) => (
									<motion.tr key={user.email} whileHover={{ backgroundColor: '#F8FAFC' }}>
										<td className="px-6 py-4">
											<div className="font-medium text-slate-900">{user.name}</div>
										</td>
										<td className="px-6 py-4">
											<AdminBadge tone={roleTone[user.role] || 'slate'}>{user.role}</AdminBadge>
										</td>
										<td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
										<td className="px-6 py-4">
											<AdminBadge tone={statusTone[user.status] || 'slate'}>{user.status}</AdminBadge>
										</td>
										<td className="px-6 py-4 text-sm text-slate-600">{user.lastLogin}</td>
										<td className="px-6 py-4">
											<button type="button" className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
												<MoreHorizontal size={18} />
											</button>
										</td>
									</motion.tr>
								))}
							</tbody>
						</table>
					</div>

					<div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 text-sm text-slate-500">
						<span>Showing {filteredUsers.length} of {users.length} users</span>
						<div className="flex items-center gap-2">
							<button type="button" className="rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-600">Previous</button>
							<button type="button" className="rounded-full bg-blue-700 px-4 py-2 font-semibold text-white">Next</button>
						</div>
					</div>
				</AdminCard>
			</AdminSection>
		</div>
	);
};

export default ManageUsersPage;

