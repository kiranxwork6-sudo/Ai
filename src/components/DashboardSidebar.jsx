import React from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Building,
  Tag,
  HelpCircle,
  Bot,
  Radio,
  Settings
} from 'lucide-react';

export default function DashboardSidebar({ activeTab, setActiveTab, unreadCount = 0 }) {
  const navSections = [
    {
      label: 'MAIN',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'inbox', label: 'Conversations', icon: MessageSquare, badge: unreadCount },
        { id: 'customers', label: 'Customers', icon: Users },
      ]
    },
    {
      label: 'BUSINESS',
      items: [
        { id: 'business', label: 'Business Information', icon: Building },
        { id: 'services', label: 'Services', icon: Tag },
        { id: 'faqs', label: 'FAQs', icon: HelpCircle },
        { id: 'ai', label: 'AI Receptionist', icon: Bot },
      ]
    },
    {
      label: 'WHATSAPP',
      items: [
        { id: 'whatsapp', label: 'WhatsApp', icon: Radio },
      ]
    },
    {
      label: 'SYSTEM',
      items: [
        { id: 'settings', label: 'Settings', icon: Settings },
      ]
    }
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r flex flex-col" style={{ background: '#0D1515', borderColor: '#1C2929' }}>
      {/* Logo */}
      <div className="p-6 border-b" style={{ borderColor: '#1C2929' }}>
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#00E676' }}>
            <Bot className="w-5 h-5" style={{ color: '#080F0F' }} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-extrabold tracking-tight" style={{ color: '#FFFFFF' }}>
            Gereply
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.label}>
            <h3
              className="text-xs font-bold uppercase tracking-wider mb-2 px-3"
              style={{ color: '#6B7280' }}
            >
              {section.label}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'text-white shadow-sm'
                        : 'hover:bg-[#111A1A]'
                    }`}
                    style={
                      isActive
                        ? { background: 'rgba(0, 230, 118, 0.1)', color: '#00E676' }
                        : { color: '#6B7280' }
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge > 0 && (
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-bold"
                        style={{ background: '#00E676', color: '#080F0F' }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Test Mode Badge */}
      <div className="p-4 border-t" style={{ borderColor: '#1C2929' }}>
        <button
          onClick={() => setActiveTab('simulator')}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all"
          style={{
            background: activeTab === 'simulator' ? '#00E676' : '#111A1A',
            color: activeTab === 'simulator' ? '#080F0F' : '#6B7280'
          }}
        >
          <Bot className="w-4 h-4" />
          <span className="flex-1 text-left">Test AI</span>
        </button>
      </div>
    </aside>
  );
}
