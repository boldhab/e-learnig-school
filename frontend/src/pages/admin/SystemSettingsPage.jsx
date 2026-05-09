import { useState } from 'react';
import { Settings2, Shield, Cloud, Mail, Database, Lock, Wrench, ToggleLeft, ToggleRight } from 'lucide-react';
import { AdminBadge, AdminCard, AdminSection } from '../../components/admin/AdminUI';

const sections = [
	{ title: 'General Settings', icon: Settings2 },
	{ title: 'Authentication', icon: Shield },
	{ title: 'Cloudinary Settings', icon: Cloud },
	{ title: 'Email / SMTP', icon: Mail },
	{ title: 'Backup Settings', icon: Database },
	{ title: 'Security Policies', icon: Lock },
	{ title: 'System Maintenance', icon: Wrench },
];

const SystemSettingsPage = () => {
	const [enabled, setEnabled] = useState(true);

	return (
		<div className="space-y-6">
			<AdminSection title="System Settings" description="Professional configuration panels for the LMS platform.">
				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
					{sections.map((section) => (
						<AdminCard key={section.title} className="p-5">
							<div className="flex items-start justify-between gap-3">
								<div>
									<p className="text-sm text-slate-500">Configuration</p>
									<h3 className="mt-1 text-lg font-semibold text-slate-900">{section.title}</h3>
								</div>
								<section.icon size={18} className="text-slate-400" />
							</div>
							<p className="mt-3 text-sm text-slate-500">Manage policies, environment values, and operational settings.</p>
						</AdminCard>
					))}
				</div>

				<AdminCard className="p-5">
					<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
						<div>
							<p className="text-sm font-semibold text-slate-900">System Maintenance Mode</p>
							<p className="text-sm text-slate-500">Temporarily restrict access while updates or backup jobs are running.</p>
						</div>
						<button type="button" onClick={() => setEnabled((current) => !current)} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
							{enabled ? <ToggleRight className="text-emerald-600" size={18} /> : <ToggleLeft className="text-slate-400" size={18} />}
							{enabled ? 'Enabled' : 'Disabled'}
						</button>
					</div>
					<div className="mt-5 grid gap-4 md:grid-cols-2">
						<div className="rounded-2xl border border-slate-200 p-4">
							<p className="text-sm font-semibold text-slate-900">Backup Policy</p>
							<p className="mt-1 text-sm text-slate-500">Daily incremental backup at 1:00 AM.</p>
						</div>
						<div className="rounded-2xl border border-slate-200 p-4">
							<p className="text-sm font-semibold text-slate-900">Authentication Policy</p>
							<p className="mt-1 text-sm text-slate-500">Password reset and session timeout enforced.</p>
						</div>
					</div>
				</AdminCard>
			</AdminSection>
		</div>
	);
};

export default SystemSettingsPage;

