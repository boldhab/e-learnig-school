import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MoreHorizontal, ShieldCheck, UserPlus, RefreshCcw, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import adminApi from '../../api/modules/admin.api';
import { ADMIN_COLORS } from '../../constants/adminTheme';
import { AdminBadge, AdminCard, AdminSection, AdminToolbarButton } from '../../components/admin/AdminUI';
import CreateUserModal from '../../components/admin/CreateUserModal';
import UserDetailsModal from '../../components/admin/UserDetailsModal';

const ManageUsersPage = ({ defaultRole = 'all' }) => {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [query, setQuery] = useState('');
	const [roleFilter, setRoleFilter] = useState(defaultRole);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState(null);
	const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

	const fetchUsers = async () => {
		setLoading(true);
		try {
			const res = await adminApi.getUsers();
			const payload = res?.data?.data ?? res?.data ?? [];
			const list = Array.isArray(payload)
				? payload
				: Array.isArray(payload?.users)
					? payload.users
					: Array.isArray(payload?.data)
						? payload.data
						: [];
			setUsers(list);
		} catch (err) {
			console.error("Failed to fetch users:", err);
			setUsers([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUsers();
	}, []);

	const roleTone = {
		admin: 'blue',
		teacher: 'teal',
		student: 'slate',
	};

	const statusTone = {
		active: 'green',
		inactive: 'red',
		pending: 'amber',
	};

	const safeUsers = useMemo(() => (Array.isArray(users) ? users : []), [users]);

	const filteredUsers = useMemo(() => {
		return safeUsers.filter((user) => {
			const name = user.full_name || '';
			const email = user.email || '';
			const role = (user.role_name || '').toLowerCase();
			
			const matchesQuery = [name, email, role].join(' ').toLowerCase().includes(query.toLowerCase());
			const matchesRole = roleFilter === 'all' ? true : role === roleFilter.toLowerCase();
			return matchesQuery && matchesRole;
		});
	}, [safeUsers, query, roleFilter]);

	if (loading) {
		return (
			<div className="h-64 flex items-center justify-center">
				<Loader2 className="animate-spin text-blue-600" size={48} />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<AdminSection
				title="User Management"
				description="Create users, assign roles, activate accounts, and reset passwords across the system."
				action={
					<div className="flex flex-wrap gap-3">
						<button 
							type="button" 
							onClick={() => setIsCreateModalOpen(true)}
							className="inline-flex items-center gap-2 rounded-2xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 transition-colors"
						>
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
						{ title: 'Total Users', value: safeUsers.length, trend: 'Real-time', icon: ShieldCheck },
						{ title: 'Active Accounts', value: safeUsers.filter(u => u.status === 'active').length, trend: 'Live', icon: CheckCircle2 },
						{ title: 'Teachers', value: safeUsers.filter(u => u.role_name === 'TEACHER').length, trend: 'Staff', icon: Filter },
						{ title: 'Students', value: safeUsers.filter(u => u.role_name === 'STUDENT').length, trend: 'Students', icon: XCircle },
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
									<th className="px-6 py-4 font-semibold">Joined</th>
									<th className="px-6 py-4 font-semibold">Actions</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-200 bg-white">
								{filteredUsers.map((user) => (
									<motion.tr 
										key={user.id} 
										whileHover={{ backgroundColor: '#F8FAFC' }}
										onClick={() => {
											setSelectedUser(user);
											setIsDetailsModalOpen(true);
										}}
										className="cursor-pointer transition-colors"
									>
										<td className="px-6 py-4">
											<div className="font-medium text-slate-900">{user.full_name}</div>
										</td>
										<td className="px-6 py-4">
											<AdminBadge tone={roleTone[(user.role_name || '').toLowerCase()] || 'slate'}>{user.role_name}</AdminBadge>
										</td>
										<td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
										<td className="px-6 py-4">
											<AdminBadge tone={statusTone[(user.status || '').toLowerCase()] || 'slate'}>{user.status}</AdminBadge>
										</td>
										<td className="px-6 py-4 text-sm text-slate-600">
											{new Date(user.created_at).toLocaleDateString()}
										</td>
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

			<CreateUserModal 
				isOpen={isCreateModalOpen} 
				onClose={() => setIsCreateModalOpen(false)} 
				onUserCreated={fetchUsers}
			/>

			<UserDetailsModal
				user={selectedUser}
				isOpen={isDetailsModalOpen}
				onClose={() => {
					setIsDetailsModalOpen(false);
					setSelectedUser(null);
				}}
				onActionComplete={fetchUsers}
			/>
		</div>
	);
};

export default ManageUsersPage;

