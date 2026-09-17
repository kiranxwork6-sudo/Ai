import React, { useState, useEffect, useCallback } from 'react';
import { Analytics } from '@vercel/analytics/react';
import Navbar from './components/Navbar.jsx';
import DashboardOverview from './components/DashboardOverview.jsx';
import BusinessSettings from './components/BusinessSettings.jsx';
import Inbox from './components/Inbox.jsx';
import CustomerSimulator from './components/CustomerSimulator.jsx';
import WhatsAppConnectModal from './components/WhatsAppConnectModal.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'inbox' | 'settings' | 'simulator'
  const [business, setBusiness] = useState(null);
  const [whatsappStatus, setWhatsappStatus] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [stats, setStats] = useState({ total: 0, unread: 0, aiHandled: 0, humanHandled: 0 });
  const [activeConvId, setActiveConvId] = useState(null);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      const [bizRes, waRes, convsRes] = await Promise.all([
        fetch('/api/business').then(r => r.json()),
        fetch('/api/whatsapp/status').then(r => r.json()),
        fetch('/api/conversations').then(r => r.json())
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
  }, [activeConvId]);

  useEffect(() => {
    fetchData();
    // Poll for conversation updates every 3 seconds to reflect customer messages in real-time
    const interval = setInterval(async () => {
      try {
        const convsRes = await fetch('/api/conversations').then(r => r.json());
        if (convsRes.success) {
          setConversations(convsRes.conversations);
          setStats(convsRes.stats);
        }
      } catch (e) {
        // silent poll error
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchData]);

  // Business Save Handler
  const handleSaveBusiness = async (updatedData) => {
    const res = await fetch('/api/business', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });
    const data = await res.json();
    if (data.success) {
      setBusiness(data.business);
    } else {
      throw new Error(data.error || 'Failed to update business');
    }
  };

  // 1-Click Industry Template Handler
  const handleApplyTemplate = async (templateType) => {
    try {
      const res = await fetch(`/api/business/template/${templateType}`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        setBusiness(data.business);
        alert(`Loaded "${data.business.name}" template successfully! AI knowledge base updated.`);
      }
    } catch (err) {
      alert('Failed to load template: ' + err.message);
    }
  };

  // WhatsApp Connect / Disconnect Handlers
  const handleConnectWhatsApp = async (phoneNumber) => {
    const res = await fetch('/api/whatsapp/connect', {
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
    const res = await fetch('/api/whatsapp/disconnect', {
      method: 'POST'
    });
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

  // Staff Human Reply
  const handleSendHumanReply = async (convId, text) => {
    const res = await fetch(`/api/conversations/${convId}/reply`, {
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

  // Toggle Human Handoff Mode
  const handleToggleHandoff = async (convId, status) => {
    const res = await fetch(`/api/conversations/${convId}/handoff`, {
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
        humanHandled: status === 'human' ? prev.humanHandled + 1 : Math.max(0, prev.humanHandled - 1),
        aiHandled: status === 'ai' ? prev.aiHandled + 1 : Math.max(0, prev.aiHandled - 1)
      }));
    } else {
      throw new Error(data.error);
    }
  };

  // Customer Simulator Message Trigger
  const handleSimulateMessage = async ({ customerPhone, customerName, message }) => {
    const res = await fetch('/api/simulate/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerPhone, customerName, message })
    });
    const data = await res.json();
    if (data.success) {
      // Update local state with latest conversation
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 animate-pulse flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-600/30">
          AI
        </div>
        <p className="mt-4 text-xs font-bold text-slate-600">Starting AI Receptionist Platform...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/80">
      
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        business={business}
        whatsappStatus={whatsappStatus}
        onOpenWhatsAppModal={() => setIsWhatsAppModalOpen(true)}
        unreadCount={stats.unread}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

        {activeTab === 'settings' && (
          <BusinessSettings
            initialBusiness={business}
            onSave={handleSaveBusiness}
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
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-4 text-center text-xs text-slate-500">
        <p>AI Receptionist MVP • Built for non-technical small businesses • WhatsApp Cloud API Ready</p>
      </footer>

      {/* Connect WhatsApp Modal */}
      <WhatsAppConnectModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        status={whatsappStatus}
        onConnect={handleConnectWhatsApp}
        onDisconnect={handleDisconnectWhatsApp}
      />

      {/* Vercel Web Analytics */}
      <Analytics />

    </div>
  );
}
