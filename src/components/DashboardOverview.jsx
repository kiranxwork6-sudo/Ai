import React from 'react';
import {
  Users,
  Bot,
  UserCheck,
  Radio,
  ArrowRight,
  Sparkles,
  MessageSquare,
  Tag,
  Plus
} from 'lucide-react';

export default function DashboardOverview({
  business,
  whatsappStatus,
  conversations = [],
  stats,
  setActiveTab,
  onOpenWhatsAppModal,
  onApplyTemplate
}) {
  const isConnected = whatsappStatus?.connected;
  // Sort by most recent activity first (safety sort)
  const sortedConvs = [...conversations].sort(
    (a, b) => new Date(b.lastTimestamp || b.lastMessageAt || 0) - new Date(a.lastTimestamp || a.lastMessageAt || 0)
  );
  const recentConvs = sortedConvs.slice(0, 5);

  const totalCount = stats?.total ?? conversations.length ?? 0;
  const aiHandledCount = stats?.aiHandled ?? conversations.filter(c => c.status === 'AI_ACTIVE' || c.status === 'ai').length ?? 0;
  const humanHandledCount = stats?.humanHandled ?? conversations.filter(c => ['HUMAN_ACTIVE', 'NEEDS_HUMAN', 'human'].includes(c.status)).length ?? 0;

  return (
    <div className="space-y-6">

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Total Inquiries */}
        <div className="p-5 rounded-2xl border transition-all hover:border-[#00E676]/30" style={{ background: '#0D1515', borderColor: '#1C2929' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#6B7280' }}>Total Inquiries</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#111A1A', color: '#00E676' }}>
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold" style={{ color: '#FFFFFF' }}>{totalCount}</p>
          <p className="mt-1 text-xs" style={{ color: '#6B7280' }}>
            {totalCount === 1 ? '1 active customer thread' : `${totalCount} customer threads recorded`}
          </p>
        </div>

        {/* AI Handled */}
        <div className="p-5 rounded-2xl border transition-all hover:border-[#00E676]/30" style={{ background: '#0D1515', borderColor: '#1C2929' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#6B7280' }}>AI Handled</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#111A1A', color: '#00E676' }}>
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold" style={{ color: '#00E676' }}>
            {aiHandledCount}
          </p>
          <p className="mt-1 text-xs" style={{ color: '#6B7280' }}>
            {totalCount > 0
              ? `${Math.round((aiHandledCount / totalCount) * 100)}% resolution rate`
              : 'No data yet'}
          </p>
        </div>

        {/* Human Handoffs */}
        <div className="p-5 rounded-2xl border transition-all hover:border-[#00E676]/30" style={{ background: '#0D1515', borderColor: '#1C2929' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#6B7280' }}>Human Handoffs</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#111A1A', color: humanHandledCount > 0 ? '#fbbf24' : '#6B7280' }}>
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold" style={{ color: '#FFFFFF' }}>{humanHandledCount}</p>
          <p className="mt-1 text-xs" style={{ color: '#6B7280' }}>
            {humanHandledCount > 0 ? (
              <span className="cursor-pointer hover:underline text-amber-400" onClick={() => setActiveTab('inbox')}>
                Requires staff attention →
              </span>
            ) : (
              'All clear — no pending handoffs'
            )}
          </p>
        </div>

        {/* WhatsApp Status */}
        <div
          onClick={onOpenWhatsAppModal}
          className="p-5 rounded-2xl border transition-all hover:border-[#00E676]/30 cursor-pointer"
          style={{ background: '#0D1515', borderColor: '#1C2929' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#6B7280' }}>WhatsApp Status</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#111A1A', color: isConnected ? '#00E676' : '#6B7280' }}>
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: isConnected ? '#00E676' : '#6B7280' }} />
            <p className="text-lg font-bold" style={{ color: '#FFFFFF' }}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </p>
          </div>
          <p className="mt-1 text-xs" style={{ color: '#6B7280' }}>
            {isConnected ? 'Test Mode Active' : 'Click to connect'}
          </p>
        </div>

      </div>

      {/* Main Grid: Left Large (Recent Convs) + Right (Quick Actions / AI Performance) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left 2 Cols: Recent Conversations */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border p-6" style={{ background: '#0D1515', borderColor: '#1C2929' }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold" style={{ color: '#FFFFFF' }}>Recent Conversations</h2>
                <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
                  {totalCount > 0 ? `${totalCount} customer thread${totalCount === 1 ? '' : 's'}` : 'No active inquiries'}
                </p>
              </div>
              {totalCount > 0 && (
                <button
                  onClick={() => setActiveTab('inbox')}
                  className="text-xs font-bold transition-colors hover:underline"
                  style={{ color: '#00E676' }}
                >
                  View all in Conversations →
                </button>
              )}
            </div>

            <div className="divide-y" style={{ borderColor: '#1C2929' }}>
              {recentConvs.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: '#111A1A', color: '#6B7280' }}>
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold mb-1" style={{ color: '#FFFFFF' }}>No conversations yet</p>
                  <p className="text-xs max-w-sm mb-5" style={{ color: '#6B7280' }}>
                    When customers message your WhatsApp number, conversations will appear here automatically.
                  </p>
                  <button
                    onClick={() => setActiveTab('simulator')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all hover:brightness-110 active:scale-95"
                    style={{ background: '#00E676', color: '#080F0F' }}
                  >
                    <Bot className="w-4 h-4" />
                    Test AI Receptionist
                  </button>
                </div>
              ) : (
                recentConvs.map((conv) => {
                  const isHuman = ['HUMAN_ACTIVE', 'NEEDS_HUMAN', 'human'].includes(conv.status);
                  return (
                    <div
                      key={conv.id}
                      onClick={() => setActiveTab('inbox')}
                      className="py-3.5 flex items-center justify-between px-3 rounded-xl cursor-pointer transition-colors hover:bg-[#111A1A]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: '#111A1A', color: isHuman ? '#fbbf24' : '#00E676' }}>
                          {conv.customerName ? conv.customerName.slice(0, 1).toUpperCase() : 'C'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold truncate" style={{ color: '#FFFFFF' }}>{conv.customerName}</span>
                            <span className="text-xs font-mono" style={{ color: '#6B7280' }}>{conv.customerPhone}</span>
                          </div>
                          <p className="text-xs truncate max-w-xs sm:max-w-md mt-0.5" style={{ color: '#E5E7EB' }}>
                            {conv.lastMessage || 'No messages yet'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full border" style={{
                          background: isHuman ? 'rgba(251, 191, 36, 0.1)' : 'rgba(0, 230, 118, 0.1)',
                          borderColor: isHuman ? 'rgba(251, 191, 36, 0.3)' : 'rgba(0, 230, 118, 0.3)',
                          color: isHuman ? '#fbbf24' : '#00E676'
                        }}>
                          {isHuman ? 'Human' : 'AI'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Actions & Templates */}
        <div className="space-y-6">

          {/* Quick Actions */}
          <div className="rounded-2xl border p-6" style={{ background: '#0D1515', borderColor: '#1C2929' }}>
            <h2 className="text-base font-bold mb-4" style={{ color: '#FFFFFF' }}>Quick Actions</h2>
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('simulator')}
                className="w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group hover:border-[#00E676]/30"
                style={{ background: '#111A1A', borderColor: '#1C2929' }}
              >
                <div className="flex items-center gap-3">
                  <Bot className="w-4 h-4" style={{ color: '#00E676' }} />
                  <span className="text-xs font-semibold" style={{ color: '#FFFFFF' }}>Test AI Receptionist</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" style={{ color: '#6B7280' }} />
              </button>

              <button
                onClick={() => setActiveTab('inbox')}
                className="w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group hover:border-[#00E676]/30"
                style={{ background: '#111A1A', borderColor: '#1C2929' }}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4" style={{ color: '#00E676' }} />
                  <span className="text-xs font-semibold" style={{ color: '#FFFFFF' }}>View Conversations</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" style={{ color: '#6B7280' }} />
              </button>

              <button
                onClick={() => setActiveTab('business')}
                className="w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group hover:border-[#00E676]/30"
                style={{ background: '#111A1A', borderColor: '#1C2929' }}
              >
                <div className="flex items-center gap-3">
                  <Tag className="w-4 h-4" style={{ color: '#00E676' }} />
                  <span className="text-xs font-semibold" style={{ color: '#FFFFFF' }}>Update Business Info</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" style={{ color: '#6B7280' }} />
              </button>

              <button
                onClick={onOpenWhatsAppModal}
                className="w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group hover:border-[#00E676]/30"
                style={{ background: '#111A1A', borderColor: '#1C2929' }}
              >
                <div className="flex items-center gap-3">
                  <Radio className="w-4 h-4" style={{ color: '#00E676' }} />
                  <span className="text-xs font-semibold" style={{ color: '#FFFFFF' }}>Connect WhatsApp</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" style={{ color: '#6B7280' }} />
              </button>
            </div>
          </div>

          {/* Industry Templates */}
          <div className="rounded-2xl border p-6" style={{ background: '#0D1515', borderColor: '#1C2929' }}>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4" style={{ color: '#00E676' }} />
              <h2 className="text-base font-bold" style={{ color: '#FFFFFF' }}>Industry Templates</h2>
            </div>
            <p className="text-xs leading-relaxed mb-4" style={{ color: '#6B7280' }}>
              Load realistic small business profiles with hours, services, and FAQs.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => onApplyTemplate('spa')}
                className="w-full text-left p-3 rounded-xl border transition-all hover:border-[#00E676]/30"
                style={{ background: '#111A1A', borderColor: '#1C2929' }}
              >
                <p className="text-xs font-bold" style={{ color: '#FFFFFF' }}>💆 Day Spa & Wellness</p>
                <p className="text-[11px] mt-1" style={{ color: '#6B7280' }}>Massage, facials, cancellation FAQs</p>
              </button>

              <button
                onClick={() => onApplyTemplate('dental')}
                className="w-full text-left p-3 rounded-xl border transition-all hover:border-[#00E676]/30"
                style={{ background: '#111A1A', borderColor: '#1C2929' }}
              >
                <p className="text-xs font-bold" style={{ color: '#FFFFFF' }}>🦷 Dental Clinic</p>
                <p className="text-[11px] mt-1" style={{ color: '#6B7280' }}>Cleaning, whitening, insurance FAQs</p>
              </button>

              <button
                onClick={() => onApplyTemplate('auto')}
                className="w-full text-left p-3 rounded-xl border transition-all hover:border-[#00E676]/30"
                style={{ background: '#111A1A', borderColor: '#1C2929' }}
              >
                <p className="text-xs font-bold" style={{ color: '#FFFFFF' }}>🚗 Auto Care</p>
                <p className="text-[11px] mt-1" style={{ color: '#6B7280' }}>Oil change, brakes, warranty info</p>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
