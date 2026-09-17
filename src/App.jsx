import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LandingPage from './components/LandingPage.jsx';
import LoginPage from './components/LoginPage.jsx';
import Dashboard from './components/Dashboard.jsx';
import { apiFetch } from './lib/api.js';

function AuthGuard({ children }) {
  const [user, setUser] = useState(undefined);
  const [csrfToken, setCsrfToken] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    apiFetch('/api/auth/me')
      .then(async (response) => response.ok ? response.json() : null)
      .then((data) => {
        if (data?.success) {
          setUser(data.user);
          setCsrfToken(data.csrfToken);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null));
  }, []);

  const handleLogout = () => {
    setUser(null);
    setCsrfToken(null);
    navigate('/');
  };

  // Still checking auth
  if (user === undefined) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: '#080F0F' }}>
        <div className="w-12 h-12 rounded-2xl bg-[#00E676] animate-pulse flex items-center justify-center text-[#080F0F] font-bold text-xl shadow-lg">
          G
        </div>
        <p className="mt-4 text-xs font-bold" style={{ color: '#6B7280' }}>Loading...</p>
      </div>
    );
  }

  return children({ user, csrfToken, onLogout: handleLogout });
}

function LoginRoute({ user }) {
  // Authenticated user visiting /login → redirect to /dashboard
  if (user) return <Navigate to="/dashboard" replace />;
  return <LoginPage />;
}

function DashboardRoute({ user, csrfToken, onLogout }) {
  // Unauthenticated user → redirect to /login
  if (!user) return <Navigate to="/login" replace />;
  return <Dashboard user={user} csrfToken={csrfToken} onLogout={onLogout} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthGuard>
        {({ user, csrfToken, onLogout }) => (
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginRoute user={user} />} />
            <Route path="/dashboard" element={<DashboardRoute user={user} csrfToken={csrfToken} onLogout={onLogout} />} />
            {/* Catch-all: send unknown routes to landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </AuthGuard>
    </BrowserRouter>
  );
}
