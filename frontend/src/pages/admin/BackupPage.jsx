import { CloudUpload, Download, RefreshCcw, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { AdminBadge, AdminCard, AdminSection } from '../../components/admin/AdminUI';

const BackupPage = () => (
	<div className="space-y-6">
		<AdminSection title="Backup & Recovery" description="Manual backup triggers, scheduled status, recovery operations, and SQL dump downloads.">
			<div className="grid gap-4 md:grid-cols-4">
				{[
					{ title: 'Last Backup', value: 'Today 01:00 AM', icon: CheckCircle2, tone: 'green' },
					{ title: 'Schedule', value: 'Daily', icon: RefreshCcw, tone: 'blue' },
					{ title: 'Recovery Point', value: 'Available', icon: ShieldAlert, tone: 'amber' },
					{ title: 'Storage', value: '12.4 GB', icon: CloudUpload, tone: 'teal' },
				].map((item) => (
					<AdminCard key={item.title} className="p-5">
						<div className="flex items-start justify-between">
							<div>
								<p className="text-sm text-slate-500">{item.title}</p>
								<p className="mt-2 text-lg font-semibold text-slate-900">{item.value}</p>
							</div>
							<item.icon size={18} className="text-slate-500" />
						</div>
					</AdminCard>
				))}
			</div>

			<div className="grid gap-6 xl:grid-cols-2">
				<AdminCard className="p-5">
					<h3 className="text-lg font-semibold text-slate-900">Manual Backup Controls</h3>
					<div className="mt-4 space-y-3">
						<button type="button" className="w-full rounded-2xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white">Trigger Full Backup</button>
						<button type="button" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">Download SQL Dump</button>
						<button type="button" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">Start Recovery Wizard</button>
					</div>
				</AdminCard>

				<AdminCard className="p-5">
					<h3 className="text-lg font-semibold text-slate-900">Recovery Status</h3>
					<div className="mt-4 space-y-3 text-sm text-slate-600">
						<div className="rounded-2xl border border-slate-200 p-4">Most recent restore point verified successfully.</div>
						<div className="rounded-2xl border border-slate-200 p-4">All dumps stored in encrypted offsite storage.</div>
						<div className="rounded-2xl border border-slate-200 p-4">Recovery drill completed in 18 minutes.</div>
					</div>
				</AdminCard>
			</div>
		</AdminSection>
	</div>
);

export default BackupPage;

