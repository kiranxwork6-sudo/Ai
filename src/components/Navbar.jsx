import React from 'react';
import { Link } from 'react-router-dom';
import {
  Bot,
  MessageSquare,
  Settings,
  Smartphone,
  LayoutDashboard,
  Radio,
  LogOut
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  business,
  whatsappStatus,
  onOpenWhatsAppModal,
  unreadCount = 0,
  user,
  onLogout
}) {
  const isConnected = whatsappStatus?.connected;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo & Business Brand — links to / */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Bot className="w-6 h-6" />
              </div>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Link to="/" className="font-extrabold text-slate-900 tracking-tight text-lg hover:text-emerald-600 transition-colors">
                  Gereply
                </Link>
                <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Dashboard
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate max-w-[200px] sm:max-w-xs">
                {business?.name || 'My Business'}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab('inbox')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
                activeTab === 'inbox'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Conversations
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'settings'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Settings className="w-4 h-4" />
              Business Info & FAQs
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'simulator'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                  : 'text-slate-700 hover:text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              Customer Simulator
            </button>
          </nav>

          {/* Right Actions: WhatsApp Status & Connect Button & User/Logout */}
          <div className="flex items-center gap-3">
            {/* Status Pill */}
            <div
              onClick={onOpenWhatsAppModal}
              className={`cursor-pointer hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                isConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70'
                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/70'
              }`}
              title="Click to view WhatsApp connection settings"
            >
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="font-semibold">
                {isConnected ? 'WhatsApp: Connected (Test)' : 'WhatsApp: Disconnected'}
              </span>
            </div>

            {/* Prominent Connect Button */}
            <button
              onClick={onOpenWhatsAppModal}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 ${
                isConnected
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              {isConnected ? 'WhatsApp Settings' : 'Connect WhatsApp'}
            </button>

            {/* Logout button */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            )}
          </div>

        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 text-xs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-1 px-2 font-semibold ${activeTab === 'dashboard' ? 'text-emerald-600 font-bold' : 'text-slate-500'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('inbox')}
            className={`py-1 px-2 font-semibold relative ${activeTab === 'inbox' ? 'text-emerald-600 font-bold' : 'text-slate-500'}`}
          >
            Inbox {unreadCount > 0 && `(${unreadCount})`}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-1 px-2 font-semibold ${activeTab === 'settings' ? 'text-emerald-600 font-bold' : 'text-slate-500'}`}
          >
            Business Info
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`py-1 px-2 font-semibold ${activeTab === 'simulator' ? 'text-emerald-600 font-bold' : 'text-slate-500'}`}
          >
            Simulator
          </button>
        </div>

      </div>
    </header>
  );
}
