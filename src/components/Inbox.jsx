import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Bot,
  User,
  Send,
  CheckCheck,
  ShieldAlert,
  RotateCcw,
  MessageSquare,
  UserCheck
} from 'lucide-react';

const isAiActive = (status) => status === 'AI_ACTIVE' || status === 'ai';
const isHumanActive = (status) => ['HUMAN_ACTIVE', 'NEEDS_HUMAN', 'human'].includes(status);

export default function Inbox({
  conversations = [],
  activeConvId,
  onSelectConversation,
  onSendHumanReply,
  onToggleHandoff,
  business
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  const selectedConv = conversations.find(c => c.id === activeConvId) || conversations[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConv?.messages]);

  const filteredConversations = conversations.filter(c => {
    const matchesSearch =
      (c.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.customerPhone || '').includes(searchQuery) ||
      (c.lastMessage || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'ai') return isAiActive(c.status);
    if (filterType === 'human') return isHumanActive(c.status);
    if (filterType === 'unread') return c.unread;
    return true;
  });

  const handleSendReply = async (e) => {
    if (e) e.preventDefault();
    if (!replyText.trim() || !selectedConv) return;

    setIsSending(true);
    try {
      if (isAiActive(selectedConv.status)) {
        await onToggleHandoff(selectedConv.id, 'human');
      }
      await onSendHumanReply(selectedConv.id, replyText);
      setReplyText('');
    } catch (err) {
      alert('Failed to send reply: ' + err.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleToggleHandoffClick = async () => {
    if (!selectedConv) return;
    const newStatus = isAiActive(selectedConv.status) ? 'human' : 'ai';
    await onToggleHandoff(selectedConv.id, newStatus);
  };

  return (
    <div className="rounded-2xl border overflow-hidden flex flex-col md:flex-row h-[720px] max-w-7xl mx-auto" style={{ background: '#0D1515', borderColor: '#1C2929' }}>

      {/* Left Column: Conversation Directory */}
      <div className="w-full md:w-80 lg:w-96 border-r flex flex-col" style={{ borderColor: '#1C2929' }}>

        {/* Search & Header */}
        <div className="p-4 border-b space-y-3" style={{ borderColor: '#1C2929' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: '#FFFFFF' }}>
              <MessageSquare className="w-4 h-4" style={{ color: '#00E676' }} />
              Conversations
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#111A1A', color: '#6B7280' }}>
              {conversations.length} total
            </span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5" style={{ color: '#6B7280' }} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border focus:outline-none focus:border-[#00E676]"
              style={{ background: '#111A1A', borderColor: '#1C2929', color: '#FFFFFF' }}
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            {['all', 'ai', 'human'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className="px-3 py-1 rounded-lg transition-colors capitalize"
                style={{
                  background: filterType === type ? '#00E676' : '#111A1A',
                  color: filterType === type ? '#080F0F' : '#6B7280'
                }}
              >
                {type === 'all' ? 'All' : type === 'ai' ? 'AI Active' : 'Human'}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y" style={{ borderColor: '#1C2929' }}>
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-xs" style={{ color: '#6B7280' }}>
              No conversations found.
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = selectedConv?.id === conv.id;
              const isHuman = isHumanActive(conv.status);

              return (
                <div
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className="p-3.5 cursor-pointer transition-colors relative flex items-start gap-3"
                  style={{
                    background: isSelected ? 'rgba(0, 230, 118, 0.05)' : 'transparent',
                    borderLeft: isSelected ? '3px solid #00E676' : '3px solid transparent'
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
                    style={{ background: '#111A1A', color: isHuman ? '#fbbf24' : '#00E676' }}
                  >
                    {conv.customerName ? conv.customerName.slice(0, 1).toUpperCase() : 'C'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold truncate" style={{ color: '#FFFFFF' }}>
                        {conv.customerName}
                      </h3>
                      <span className="text-[10px]" style={{ color: '#6B7280' }}>
                        {conv.lastTimestamp ? new Date(conv.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>

                    <p className="text-[11px] font-mono truncate" style={{ color: '#6B7280' }}>
                      {conv.customerPhone}
                    </p>

                    <p className="text-xs truncate mt-1" style={{ color: '#E5E7EB' }}>
                      {conv.lastMessage || 'Started conversation'}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border"
                        style={{
                          background: isHuman ? 'rgba(251, 191, 36, 0.1)' : 'rgba(0, 230, 118, 0.1)',
                          borderColor: isHuman ? 'rgba(251, 191, 36, 0.3)' : 'rgba(0, 230, 118, 0.3)',
                          color: isHuman ? '#fbbf24' : '#00E676'
                        }}
                      >
                        {isHuman ? <UserCheck className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                        {isHuman ? 'Human' : 'AI'}
                      </span>

                      {conv.unread && (
                        <span className="w-2 h-2 rounded-full" style={{ background: '#00E676' }} />
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Right Column: Live Chat Interface */}
      {selectedConv ? (
        <div className="flex-1 flex flex-col" style={{ background: '#080F0F' }}>

          {/* Thread Header */}
          <div className="px-6 py-4 border-b flex items-center justify-between" style={{ background: '#0D1515', borderColor: '#1C2929' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs" style={{ background: '#111A1A', color: '#00E676' }}>
                {selectedConv.customerName ? selectedConv.customerName.slice(0, 1).toUpperCase() : 'C'}
              </div>
              <div>
                <h3 className="text-sm font-bold" style={{ color: '#FFFFFF' }}>{selectedConv.customerName}</h3>
                <span className="text-xs font-mono" style={{ color: '#6B7280' }}>{selectedConv.customerPhone}</span>
              </div>
            </div>

            {/* Handoff Button */}
            <button
              onClick={handleToggleHandoffClick}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all"
              style={{
                background: isAiActive(selectedConv.status) ? 'rgba(251, 191, 36, 0.1)' : 'rgba(0, 230, 118, 0.1)',
                border: `1px solid ${isAiActive(selectedConv.status) ? '#fbbf24' : '#00E676'}`,
                color: isAiActive(selectedConv.status) ? '#fbbf24' : '#00E676'
              }}
            >
              {isAiActive(selectedConv.status) ? (
                <>
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Take Over
                </>
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  Return to AI
                </>
              )}
            </button>
          </div>

          {/* Message Stream */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {(selectedConv.messages || []).map((msg) => {
              const isCustomer = msg.sender === 'customer';
              const isAi = msg.sender === 'ai';
              const isHuman = msg.sender === 'human';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: '#6B7280' }}>
                    {isCustomer && <span>{selectedConv.customerName}</span>}
                    {isAi && <span style={{ color: '#00E676' }}>AI Receptionist</span>}
                    {isHuman && <span style={{ color: '#60a5fa' }}>Staff</span>}
                  </div>

                  <div
                    className={`max-w-md sm:max-w-lg p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                      isCustomer ? 'rounded-tl-sm' : 'rounded-tr-sm'
                    }`}
                    style={
                      isCustomer
                        ? { background: '#111A1A', color: '#E5E7EB', border: '1px solid #1C2929' }
                        : isAi
                        ? { background: '#00E676', color: '#080F0F', fontWeight: 500 }
                        : { background: '#2563eb', color: '#FFFFFF' }
                    }
                  >
                    {msg.text}
                  </div>

                  <div className="flex items-center gap-1 mt-1 px-1 text-[10px]" style={{ color: '#6B7280' }}>
                    <span>
                      {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                    {!isCustomer && <CheckCheck className="w-3 h-3" />}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply Box */}
          <div className="p-4 border-t" style={{ background: '#0D1515', borderColor: '#1C2929' }}>
            <form onSubmit={handleSendReply} className="flex items-center gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 text-xs rounded-xl border focus:outline-none focus:border-[#00E676]"
                style={{ background: '#111A1A', borderColor: '#1C2929', color: '#FFFFFF' }}
              />
              <button
                type="submit"
                disabled={isSending || !replyText.trim()}
                className="px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
                style={{ background: '#00E676', color: '#080F0F' }}
              >
                <Send className="w-3.5 h-3.5" />
                Send
              </button>
            </form>
          </div>

        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8" style={{ color: '#6B7280' }}>
          <MessageSquare className="w-12 h-12 stroke-1 mb-2" />
          <p className="text-sm font-semibold">Select a conversation to view</p>
        </div>
      )}

    </div>
  );
}
