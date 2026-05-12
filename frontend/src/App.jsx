import React, { Suspense, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { toast } from 'react-hot-toast';
import RegisterPage from './pages/auth/RegisterPage';

import ErrorBoundary from './components/common/ErrorBoundary';
import { SkeletonLoader } from './components/common/UIComponents';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';

import PrivateRoute from './routes/PrivateRoute';
import AdminRoutes from './routes/AdminRoutes';
import StudentRoutes from './routes/StudentRoutes';
import TeacherRoutes from './routes/TeacherRoutes';

// ─── Loading Fallback ────────────────────────────────────────────────────────
const LoadingComponent = () => (
  <div className="p-8">
    <SkeletonLoader count={6} variant="card" />
  </div>
);

// ─── Root Redirect ───────────────────────────────────────────────────────────
// Decides where "/" goes based on auth state and role.
const RootRedirect = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  const role = (user?.role || user?.type || '').toLowerCase();
  if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (role === 'teacher' || role === 'instructor') return <Navigate to="/teacher/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
};

// ─── Login Page ──────────────────────────────────────────────────────────────
const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Already logged in? Send them to their dashboard immediately.
  if (isAuthenticated) {
    const role = (user?.role || user?.type || '').toLowerCase();
    if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'teacher' || role === 'instructor') return <Navigate to="/teacher/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login({ email, password });
      toast.success('Logged in successfully');
      const role = (data?.user?.role || data?.user?.type || '').toLowerCase();
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else if (role === 'teacher' || role === 'instructor') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
        padding: '1rem',
      }}
    >
      <div
        style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '1.5rem',
          padding: '2.5rem',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              background: 'linear-gradient(135deg, #2563EB, #4F46E5)',
              borderRadius: '1rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              fontSize: '1.5rem',
            }}
          >
            🎓
          </div>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #60a5fa, #818cf8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: '0 0 0.25rem',
            }}
          >
            Millennium LMS
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
            Sign in to continue to your dashboard
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '500' }}>
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@school.edu"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '0.75rem',
                color: '#f1f5f9',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '500' }}>
              Password
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '0.75rem',
                color: '#f1f5f9',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.85rem',
              background: loading
                ? 'rgba(99,102,241,0.5)'
                : 'linear-gradient(135deg, #2563EB, #4F46E5)',
              border: 'none',
              borderRadius: '0.75rem',
              color: '#fff',
              fontWeight: '600',
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.2s',
              marginTop: '0.25rem',
            }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#475569', fontSize: '0.75rem', marginTop: '1.5rem' }}>
          Access is role-based. Contact your administrator for credentials.
        </p>
      </div>
    </div>
  );
};

// ─── App ─────────────────────────────────────────────────────────────────────
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <div className="App">
              <Toaster position="top-right" />
              <Routes>
                {/* Public route — login page */}
                <Route path="/auth/login" element={<LoginPage />} />
                <Route path="/auth/register" element={<RegisterPage />} />

                {/* Protected: Student */}
                <Route
                  path="/student/*"
                  element={
                    <PrivateRoute allowedRoles={['student']}>
                      <Suspense fallback={<LoadingComponent />}>
                        <StudentRoutes />
                      </Suspense>
                    </PrivateRoute>
                  }
                />

                {/* Protected: Teacher / Instructor */}
                <Route
                  path="/teacher/*"
                  element={
                    <PrivateRoute allowedRoles={['teacher', 'instructor']}>
                      <Suspense fallback={<LoadingComponent />}>
                        <TeacherRoutes />
                      </Suspense>
                    </PrivateRoute>
                  }
                />

                {/* Protected: Admin */}
                <Route
                  path="/admin/*"
                  element={
                    <PrivateRoute allowedRoles={['admin']}>
                      <Suspense fallback={<LoadingComponent />}>
                        <AdminRoutes />
                      </Suspense>
                    </PrivateRoute>
                  }
                />

                {/* Root "/" and any unknown path → smart redirect */}
                <Route path="/" element={<RootRedirect />} />
                <Route path="*" element={<RootRedirect />} />
              </Routes>
            </div>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
