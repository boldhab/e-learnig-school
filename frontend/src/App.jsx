import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/common/ErrorBoundary';
import StudentRoutes from './routes/StudentRoutes';
import TeacherRoutes from './routes/TeacherRoutes';
import { SkeletonLoader } from './components/common/UIComponents';

// Loading component
const LoadingComponent = () => (
  <div className="p-8">
    <SkeletonLoader count={6} variant="card" />
  </div>
);

// Placeholder pages
const LoginPage = () => (
  <div className="flex items-center justify-center min-h-screen p-4">
    <div className="bg-white rounded-2xl p-8 w-full max-w-md text-center shadow-lg">
      <h1 className="text-3xl font-bold mb-6" style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Millennium LMS
      </h1>
      <p className="text-slate-500 mb-8">Welcome to your Learning Management System</p>
      <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
        Login with Account
      </button>
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          <Toaster position="top-right" />
          <Routes>
            <Route path="/auth/login" element={<LoginPage />} />
            <Route
              path="/student/*"
              element={
                <Suspense fallback={<LoadingComponent />}>
                  <StudentRoutes />
                </Suspense>
              }
            />
            <Route
              path="/teacher/*"
              element={
                <Suspense fallback={<LoadingComponent />}>
                  <TeacherRoutes />
                </Suspense>
              }
            />
            <Route path="/" element={<Navigate to="/student/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
