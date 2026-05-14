import { useEffect, useState } from 'react';
import { Loader2, Mail, ShieldCheck, UserCircle2 } from 'lucide-react';
import userApi from '../../api/modules/user.api';
import { TEACHER_COLORS, TEACHER_SHADOWS } from '../../constants/teacherTheme';

const TeacherProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await userApi.getProfile();
        const data = response?.data ?? response ?? null;
        setProfile(data);
      } catch (err) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin" style={{ color: TEACHER_COLORS.PRIMARY_BLUE }} size={42} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl p-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
      </div>
    );
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((name) => name[0]).join('').toUpperCase()
    : 'T';

  return (
    <div className="mx-auto max-w-7xl p-8 space-y-6">
      <header>
        <h1 className="text-3xl font-bold" style={{ color: TEACHER_COLORS.TEXT_PRIMARY }}>
          My Profile
        </h1>
        <p style={{ color: TEACHER_COLORS.TEXT_SECONDARY }}>
          View your teacher account details and role information.
        </p>
      </header>

      <div
        className="rounded-3xl border bg-white p-6"
        style={{ borderColor: TEACHER_COLORS.BORDER, boxShadow: TEACHER_SHADOWS.SM }}
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-3xl text-white text-2xl font-bold"
            style={{ backgroundColor: TEACHER_COLORS.PRIMARY_BLUE }}
          >
            {initials}
          </div>
          <div className="grid gap-4 md:grid-cols-3 lg:flex-1">
            <div>
              <p className="text-sm" style={{ color: TEACHER_COLORS.TEXT_SECONDARY }}>Name</p>
              <p className="font-semibold" style={{ color: TEACHER_COLORS.TEXT_PRIMARY }}>{profile?.full_name || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-sm" style={{ color: TEACHER_COLORS.TEXT_SECONDARY }}>Email</p>
              <p className="font-semibold" style={{ color: TEACHER_COLORS.TEXT_PRIMARY }}>{profile?.email || 'No email'}</p>
            </div>
            <div>
              <p className="text-sm" style={{ color: TEACHER_COLORS.TEXT_SECONDARY }}>Role</p>
              <p className="font-semibold" style={{ color: TEACHER_COLORS.TEXT_PRIMARY }}>{profile?.role_name || 'Teacher'}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border p-4" style={{ borderColor: TEACHER_COLORS.BORDER }}>
            <UserCircle2 size={18} style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} />
            <p className="mt-2 text-sm" style={{ color: TEACHER_COLORS.TEXT_SECONDARY }}>
              Username: {profile?.username || 'Not available'}
            </p>
          </div>
          <div className="rounded-2xl border p-4" style={{ borderColor: TEACHER_COLORS.BORDER }}>
            <Mail size={18} style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} />
            <p className="mt-2 text-sm" style={{ color: TEACHER_COLORS.TEXT_SECONDARY }}>
              Email notifications available in your notification center.
            </p>
          </div>
          <div className="rounded-2xl border p-4" style={{ borderColor: TEACHER_COLORS.BORDER }}>
            <ShieldCheck size={18} style={{ color: TEACHER_COLORS.TEXT_SECONDARY }} />
            <p className="mt-2 text-sm" style={{ color: TEACHER_COLORS.TEXT_SECONDARY }}>
              Account access is protected by role-based permissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfilePage;
