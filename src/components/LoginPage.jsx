import React from 'react';
import { Link } from 'react-router-dom';
import { Bot } from 'lucide-react';
import { apiUrl } from '../lib/api.js';

export default function LoginPage() {
  const error = new URLSearchParams(window.location.search).get('auth_error');

  return (
    <main
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: '#080F0F' }}
    >
      <section className="w-full max-w-md rounded-2xl border p-8 text-center" style={{ background: '#111919', borderColor: '#1a2626' }}>
        {/* Logo */}
        <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
          <div className="w-10 h-10 rounded-xl bg-[#00E676] flex items-center justify-center">
            <Bot className="w-5 h-5 text-[#080F0F]" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white">Gereply</span>
        </Link>

        <h1 className="text-xl font-extrabold text-white">Welcome to Gereply</h1>
        <p className="mt-2 text-sm" style={{ color: '#6B7280' }}>
          Your AI Receptionist for WhatsApp
        </p>

        {error && (
          <p className="mt-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs font-medium text-red-400">
            Sign-in could not be completed. Please try again.
          </p>
        )}

        <a
          href={apiUrl('/api/auth/google')}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border px-4 py-3 text-sm font-bold transition-colors hover:bg-white/5"
          style={{ borderColor: '#2a3636', color: '#E5E7EB' }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </a>

        <p className="mt-5 text-xs" style={{ color: '#4a5568' }}>
          Your Google password and tokens are never stored in this browser.
        </p>
      </section>
    </main>
  );
}
