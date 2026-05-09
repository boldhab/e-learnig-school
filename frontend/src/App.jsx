import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/common/ErrorBoundary';

// Layout components (Placeholder)
const Layout = ({ children }) => <div className="min-h-screen bg-slate-50 dark:bg-dark">{children}</div>;

// Pages (Placeholders)
const LoginPage = () => (
  <div className="flex items-center justify-center min-h-screen p-4">
    <div className="premium-card w-full max-w-md text-center">
      <h1 className="text-3xl font-bold mb-6 bg-premium-gradient bg-clip-text text-transparent">Millennium E-Learning</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8">Please login to continue to your dashboard</p>
      <button className="btn-primary w-full">Login with Account</button>
    </div>
  </div>
);

const Dashboard = () => (
  <div className="p-8">
    <h1 className="text-4xl font-bold mb-4">Welcome Back!</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="premium-card">Stat 1</div>
      <div className="premium-card">Stat 2</div>
      <div className="premium-card">Stat 3</div>
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
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<div>404 Not Found</div>} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
