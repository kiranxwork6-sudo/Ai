import React from 'react';
import { Radio, LogOut, CheckCircle, XCircle } from 'lucide-react';

export default function DashboardHeader({ pageTitle, whatsappStatus, onOpenWhatsAppModal, user, onLogout }) {
  const isConnected = whatsappStatus?.connected;

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="border-b px-6 py-4 flex items-center justify-between" style={{ background: '#0D1515', borderColor: '#1C2929' }}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#FFFFFF' }}>
          {pageTitle}
        </h1>
        {pageTitle === 'Dashboard' && (
          <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>
            {getGreeting()}. Here's what's happening with your customer conversations.
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* WhatsApp Status */}
        <button
          onClick={onOpenWhatsAppModal}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all border"
          style={{
            background: isConnected ? 'rgba(0, 230, 118, 0.1)' : '#111A1A',
            borderColor: isConnected ? '#00E676' : '#1C2929',
            color: isConnected ? '#00E676' : '#6B7280'
          }}
        >
          {isConnected ? (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>WhatsApp Connected</span>
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4" />
              <span>WhatsApp Disconnected</span>
            </>
          )}
        </button>

        {/* User Menu / Logout */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all border hover:border-red-500/50"
            style={{ background: '#111A1A', borderColor: '#1C2929', color: '#6B7280' }}
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        )}
      </div>
    </header>
  );
}
