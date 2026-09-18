import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar.jsx';
import DashboardHeader from './DashboardHeader.jsx';
import DashboardOverview from './DashboardOverview.jsx';
import BusinessSettings from './BusinessSettings.jsx';
import Inbox from './Inbox.jsx';
import CustomerSimulator from './CustomerSimulator.jsx';
import WhatsAppConnectModal from './WhatsAppConnectModal.jsx';
import { apiFetch as baseApiFetch } from '../lib/api.js';

export default function Dashboard({ user, csrfToken: initialCsrfToken, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [business, setBusiness] = useState(null);
  const [whatsappStatus, setWhatsappStatus] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [stats, setStats] = useState({ total: 0, unread: 0, aiHandled: 0, humanHandled: 0 });
  const [activeConvId, setActiveConvId] = useState(null);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [csrfToken] = useState(initialCsrfToken);
  const navigate = useNavigate();

  const apiFetch = useCallback((url, options = {}) => {
    const headers = new Headers(options.headers || {});
    if (options.method && !['GET', 'HEAD'].includes(options.method.toUpperCase()) && csrfToken) {
      headers.set('X-CSRF-Token', csrfToken);
    }
    return baseApiFetch(url, { ...options, headers });
  }, [csrfToken]);

  const fetchData = useCallback(async () => {
    try {
      const [bizRes, waRes, convsRes] = await Promise.all([
        apiFetch('/api/business').then(r => r.json()),
        apiFetch('/api/whatsapp/status').then(r => r.json()),
        apiFetch('/api/conversations').then(r => r.json())
      ]);

      if (bizRes.success) setBusiness(bizRes.business);
      if (waRes.success) setWhatsappStatus(waRes.status);
      if (convsRes.success) {
        setConversations(convsRes.conversations);
        setStats(convsRes.stats);
        if (!activeConvId && convsRes.conversations.length > 0) {
          setActiveConvId(convsRes.conversations[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeConvId, apiFetch]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const convsRes = await apiFetch('/api/conversations').then(r => r.json());
        if (convsRes.success) {
          setConversations(convsRes.conversations);
          setStats(convsRes.stats);
        }
      } catch (e) {
        // silent poll error
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [apiFetch]);

  const handleSaveBusiness = async (updatedData) => {
    const { openingHours, timezone, ...businessUpdates } = updatedData;
    const res = await apiFetch('/api/business', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(businessUpdates)
    });
    const data = await res.json();
    if (data.success) {
      setBusiness(data.business);
    } else {
      throw new Error(data.error || 'Failed to update business');
    }
  };

  const handleSaveBusinessHours = async ({ openingHours, timezone }) => {
    const res = await apiFetch('/api/business/hours', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ openingHours, timezone })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to save business hours');
    setBusiness((current) => ({ ...current, openingHours: data.openingHours, timezone: data.timezone }));
    return data;
  };

  const handleApplyTemplate = async (templateType) => {
    try {
      const res = await apiFetch(`/api/business/template/${templateType}`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setBusiness(data.business);
        alert(`Loaded "${data.business.name}" template successfully! AI knowledge base updated.`);
      }
    } catch (err) {
      alert('Failed to load template: ' + err.message);
    }
  };

  const handleConnectWhatsApp = async (phoneNumber) => {
    const res = await apiFetch('/api/whatsapp/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber })
    });
    const data = await res.json();
    if (data.success) {
      setWhatsappStatus(prev => ({
        ...prev,
        connected: true,
        phoneNumber: data.result.phoneNumber,
        statusMessage: data.result.statusMessage
      }));
    } else {
      throw new Error(data.error);
    }
  };

  const handleDisconnectWhatsApp = async () => {
    const res = await apiFetch('/api/whatsapp/disconnect', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      setWhatsappStatus(prev => ({
        ...prev,
        connected: false,
        statusMessage: data.result.statusMessage
      }));
    } else {
      throw new Error(data.error);
    }
  };

  const handleSendHumanReply = async (convId, text) => {
    const res = await apiFetch(`/api/conversations/${convId}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    const data = await res.json();
    if (data.success) {
      setConversations(prev =>
        prev.map(c => (c.id === convId ? data.conversation : c))
      );
    } else {
      throw new Error(data.error);
    }
  };

  const handleToggleHandoff = async (convId, status) => {
    const res = await apiFetch(`/api/conversations/${convId}/handoff`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (data.success) {
      setConversations(prev =>
        prev.map(c => (c.id === convId ? data.conversation : c))
      );
      setStats(prev => ({
        ...prev,
        humanHandled: ['human', 'HUMAN_ACTIVE', 'NEEDS_HUMAN'].includes(status) ? prev.humanHandled + 1 : Math.max(0, prev.humanHandled - 1),
        aiHandled: ['ai', 'AI_ACTIVE'].includes(status) ? prev.aiHandled + 1 : Math.max(0, prev.aiHandled - 1)
      }));
    } else {
      throw new Error(data.error);
    }
  };

  const handleSimulateMessage = async ({ customerPhone, customerName, message }) => {
    const res = await apiFetch('/api/simulate/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerPhone, customerName, message })
    });
    const data = await res.json();
    if (data.success) {
      setConversations(prev => {
        const index = prev.findIndex(c => c.id === data.conversation.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = data.conversation;
          return updated;
        } else {
          return [data.conversation, ...prev];
        }
      });
      return data;
    } else {
      throw new Error(data.error);
    }
  };

  const handleLogout = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // proceed anyway
    }
    onLogout();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: '#080F0F' }}>
        <div className="w-12 h-12 rounded-2xl bg-[#00E676] animate-pulse flex items-center justify-center shadow-lg">
          <span className="text-xl font-black" style={{ color: '#080F0F' }}>G</span>
        </div>
        <p className="mt-4 text-xs font-bold" style={{ color: '#6B7280' }}>Loading Gereply Dashboard...</p>
      </div>
    );
  }

  const pageTitle = {
    dashboard: 'Dashboard',
    inbox: 'Conversations',
    customers: 'Customers',
    business: 'Business Information',
    services: 'Services',
    faqs: 'FAQs',
    ai: 'AI Receptionist',
    whatsapp: 'WhatsApp',
    settings: 'Settings',
    simulator: 'Test AI'
  }[activeTab] || 'Dashboard';

  return (
    <div className="min-h-screen flex" style={{ background: '#080F0F', color: '#E5E7EB' }}>
      <DashboardSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadCount={stats.unread}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader
          pageTitle={pageTitle}
          whatsappStatus={whatsappStatus}
          onOpenWhatsAppModal={() => setIsWhatsAppModalOpen(true)}
          user={user}
          onLogout={handleLogout}
        />

        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardOverview
                business={business}
                whatsappStatus={whatsappStatus}
                conversations={conversations}
                stats={stats}
                setActiveTab={setActiveTab}
                onOpenWhatsAppModal={() => setIsWhatsAppModalOpen(true)}
                onApplyTemplate={handleApplyTemplate}
              />
            )}

            {activeTab === 'inbox' && (
              <Inbox
                conversations={conversations}
                activeConvId={activeConvId}
                onSelectConversation={(id) => setActiveConvId(id)}
                onSendHumanReply={handleSendHumanReply}
                onToggleHandoff={handleToggleHandoff}
                business={business}
              />
            )}

            {(activeTab === 'business' || activeTab === 'services' || activeTab === 'faqs' || activeTab === 'settings') && (
              <BusinessSettings
                initialBusiness={business}
                onSave={handleSaveBusiness}
                onSaveHours={handleSaveBusinessHours}
                onApplyTemplate={handleApplyTemplate}
              />
            )}

            {activeTab === 'simulator' && (
              <CustomerSimulator
                business={business}
                whatsappStatus={whatsappStatus}
                onSimulateMessage={handleSimulateMessage}
                conversations={conversations}
                onOpenInbox={(convId) => {
                  setActiveConvId(convId);
                  setActiveTab('inbox');
                }}
              />
            )}

            {activeTab === 'whatsapp' && (
              <div className="rounded-2xl border p-8 text-center" style={{ background: '#0D1515', borderColor: '#1C2929' }}>
                <h2 className="text-xl font-bold mb-2" style={{ color: '#FFFFFF' }}>WhatsApp Settings</h2>
                <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
                  Configure your WhatsApp connection and webhook settings.
                </p>
                <button
                  onClick={() => setIsWhatsAppModalOpen(true)}
                  className="px-6 py-3 rounded-xl text-sm font-bold transition-all"
                  style={{ background: '#00E676', color: '#080F0F' }}
                >
                  Open WhatsApp Settings
                </button>
              </div>
            )}

            {activeTab === 'customers' && (
              <div className="rounded-2xl border p-8 text-center" style={{ background: '#0D1515', borderColor: '#1C2929' }}>
                <h2 className="text-xl font-bold mb-2" style={{ color: '#FFFFFF' }}>Customers</h2>
                <p className="text-sm" style={{ color: '#6B7280' }}>No customer data yet</p>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="rounded-2xl border p-8 text-center" style={{ background: '#0D1515', borderColor: '#1C2929' }}>
                <h2 className="text-xl font-bold mb-2" style={{ color: '#FFFFFF' }}>AI Receptionist</h2>
                <p className="text-sm mb-4" style={{ color: '#6B7280' }}>
                  Configure AI behavior and response settings.
                </p>
                <button
                  onClick={() => setActiveTab('business')}
                  className="px-6 py-3 rounded-xl text-sm font-bold transition-all"
                  style={{ background: '#00E676', color: '#080F0F' }}
                >
                  Configure Business Knowledge
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      <WhatsAppConnectModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        status={whatsappStatus}
        onConnect={handleConnectWhatsApp}
        onDisconnect={handleDisconnectWhatsApp}
        csrfToken={csrfToken}
      />
    </div>
  );
}
