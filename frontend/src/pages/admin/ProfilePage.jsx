import { UserCircle2, Mail, Phone, ShieldCheck } from 'lucide-react';
import { AdminCard, AdminSection } from '../../components/admin/AdminUI';

const ProfilePage = () => (
  <div className="space-y-6">
    <AdminSection title="Admin Profile" description="Account and security details for the administrative console.">
      <AdminCard className="p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-700 text-white">
            <UserCircle2 size={34} />
          </div>
          <div className="grid gap-4 md:grid-cols-3 lg:flex-1">
            <div><p className="text-sm text-slate-500">Name</p><p className="font-semibold text-slate-900">Administrator</p></div>
            <div><p className="text-sm text-slate-500">Email</p><p className="font-semibold text-slate-900">admin@millennium.edu</p></div>
            <div><p className="text-sm text-slate-500">Role</p><p className="font-semibold text-slate-900">System Owner</p></div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 p-4"><Mail size={18} className="text-slate-400" /><p className="mt-2 text-sm text-slate-500">Email notifications enabled</p></div>
          <div className="rounded-2xl border border-slate-200 p-4"><Phone size={18} className="text-slate-400" /><p className="mt-2 text-sm text-slate-500">Recovery phone verified</p></div>
          <div className="rounded-2xl border border-slate-200 p-4"><ShieldCheck size={18} className="text-slate-400" /><p className="mt-2 text-sm text-slate-500">2FA enforced on login</p></div>
        </div>
      </AdminCard>
    </AdminSection>
  </div>
);

export default ProfilePage;
