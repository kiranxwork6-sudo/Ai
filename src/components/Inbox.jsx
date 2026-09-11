import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Bot, 
  User, 
  Send, 
  CheckCheck, 
  ShieldAlert, 
  RotateCcw, 
  Phone, 
  MessageSquare, 
  Clock, 
  AlertCircle,
  Filter,
  UserCheck
} from 'lucide-react';

export default function Inbox({
  conversations = [],
  activeConvId,
  onSelectConversation,
  onSendHumanReply,
  onToggleHandoff,
  business
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'ai' | 'human' | 'unread'
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  const selectedConv = conversations.find(c => c.id === activeConvId) || conversations[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConv?.messages]);

  // Filter conversations
  const filteredConversations = conversations.filter(c => {
    const matchesSearch = 
      (c.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.customerPhone || '').includes(searchQuery) ||
      (c.lastMessage || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'ai') return c.status === 'ai';
    if (filterType === 'human') return c.status === 'human';
    if (filterType === 'unread') return c.unread;
    return true;
  });

  const handleSendReply = async (e) => {
    if (e) e.preventDefault();
    if (!replyText.trim() || !selectedConv) return;

    setIsSending(true);
    try {
      // If conversation is currently in AI mode, automatically switch to human handoff
      if (selectedConv.status === 'ai') {
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
    const newStatus = selectedConv.status === 'ai' ? 'human' : 'ai';
    await onToggleHandoff(selectedConv.id, newStatus);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col md:flex-row h-[720px] max-w-7xl mx-auto">
      
      {/* Left Column: Conversation Directory */}
      <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col bg-slate-50/50">
        
        {/* Search & Header */}
        <div className="p-3.5 border-b border-slate-200 bg-white space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              Customer Conversations
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {conversations.length} total
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, phone, message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-bold pt-1">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterType === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('ai')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterType === 'ai'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              AI Active
            </button>
            <button
              onClick={() => setFilterType('human')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterType === 'human'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              Human Takeover
            </button>
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No conversations found.
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = selectedConv?.id === conv.id;
              const isHuman = conv.status === 'human';

              return (
                <div
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className={`p-3.5 cursor-pointer transition-colors relative flex items-start gap-3 ${
                    isSelected
                      ? 'bg-emerald-50/60 border-l-4 border-emerald-600'
                      : 'hover:bg-slate-100/60 bg-white'
                  }`}
                >
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                    isHuman 
                      ? 'bg-amber-100 text-amber-800' 
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {conv.customerName ? conv.customerName.slice(0, 1).toUpperCase() : 'C'}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-900 truncate">
                        {conv.customerName}
                      </h3>
                      <span className="text-[10px] text-slate-400">
                        {conv.lastTimestamp ? new Date(conv.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 font-mono truncate">
                      {conv.customerPhone}
                    </p>

                    <p className="text-xs text-slate-600 truncate mt-1">
                      {conv.lastMessage || 'Started conversation'}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        isHuman
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {isHuman ? (
                          <>
                            <UserCheck className="w-3 h-3" />
                            Staff Takeover
                          </>
                        ) : (
                          <>
                            <Bot className="w-3 h-3" />
                            AI Responding
                          </>
                        )}
                      </span>

                      {conv.unread && (
                        <span className="w-2 h-2 rounded-full bg-emerald-600" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Center/Right Column: Live Chat Interface */}
      {selectedConv ? (
        <div className="flex-1 flex flex-col bg-slate-100/40">
          
          {/* Thread Header */}
          <div className="px-5 py-3 bg-white border-b border-slate-200 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                {selectedConv.customerName ? selectedConv.customerName.slice(0, 1).toUpperCase() : 'C'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">{selectedConv.customerName}</h3>
                  <span className="text-xs text-slate-400 font-mono">{selectedConv.customerPhone}</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Channel: WhatsApp Business Sandbox
                </p>
              </div>
            </div>

            {/* Quick Handoff Action Button */}
            <button
              onClick={handleToggleHandoffClick}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                selectedConv.status === 'ai'
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
              }`}
            >
              {selectedConv.status === 'ai' ? (
                <>
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Take Over (Human Handoff)
                </>
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  Return to AI Receptionist
                </>
              )}
            </button>
          </div>

          {/* Persistent Human Handoff Banner */}
          <div className={`px-5 py-2.5 text-xs font-semibold flex items-center justify-between border-b transition-colors ${
            selectedConv.status === 'human'
              ? 'bg-amber-500 text-amber-950 border-amber-300'
              : 'bg-emerald-50 text-emerald-900 border-emerald-200'
          }`}>
            <div className="flex items-center gap-2">
              {selectedConv.status === 'human' ? (
                <>
                  <UserCheck className="w-4 h-4 text-amber-900" />
                  <span>
                    <strong>Human Staff Active:</strong> Automated AI answers are paused for this customer.
                  </span>
                </>
              ) : (
                <>
                  <Bot className="w-4 h-4 text-emerald-700" />
                  <span>
                    <strong>AI Receptionist Active:</strong> Customer inquiries are being answered automatically using business knowledge.
                  </span>
                </>
              )}
            </div>

            <button
              onClick={handleToggleHandoffClick}
              className="text-xs font-bold underline hover:no-underline"
            >
              {selectedConv.status === 'human' ? 'Switch back to AI' : 'Take over now'}
            </button>
          </div>

          {/* Message Stream */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {(selectedConv.messages || []).map((msg) => {
              const isCustomer = msg.sender === 'customer';
              const isAi = msg.sender === 'ai';
              const isHuman = msg.sender === 'human';
              const isSystem = msg.sender === 'system';

              if (isSystem) {
                return (
                  <div key={msg.id} className="flex justify-center my-2">
                    <span className="px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-[11px] font-medium border border-slate-300 shadow-xs">
                      {msg.text}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
                >
                  {/* Sender Tag */}
                  <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {isCustomer && <span>{selectedConv.customerName}</span>}
                    {isAi && (
                      <span className="text-emerald-700 flex items-center gap-1">
                        <Bot className="w-3 h-3" /> AI Receptionist
                      </span>
                    )}
                    {isHuman && (
                      <span className="text-indigo-700 flex items-center gap-1">
                        <User className="w-3 h-3" /> Staff (You)
                      </span>
                    )}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`max-w-md sm:max-w-lg p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm whitespace-pre-wrap ${
                      isCustomer
                        ? 'bg-white text-slate-800 rounded-tl-sm border border-slate-200'
                        : isAi
                        ? 'bg-emerald-600 text-white rounded-tr-sm'
                        : 'bg-indigo-600 text-white rounded-tr-sm'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Timestamp & Status */}
                  <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-slate-400">
                    <span>
                      {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                    {!isCustomer && (
                      <CheckCheck className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply Box (for Business Owner) */}
          <div className="p-4 bg-white border-t border-slate-200">
            <form onSubmit={handleSendReply} className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={
                    selectedConv.status === 'human'
                      ? 'Type message to send directly to customer on WhatsApp...'
                      : 'Type to take over and reply directly as staff...'
                  }
                  className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  disabled={isSending || !replyText.trim()}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50 ${
                    selectedConv.status === 'human'
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  {selectedConv.status === 'human' ? 'Send' : 'Take Over & Send'}
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span>
                  {selectedConv.status === 'ai' 
                    ? '💡 Tip: Sending a message here automatically activates Human Handoff.'
                    : '👤 You are currently speaking with the customer directly.'}
                </span>
              </div>
            </form>
          </div>

        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
          <MessageSquare className="w-12 h-12 stroke-1 mb-2" />
          <p className="text-sm font-semibold">Select a conversation from the left to view the thread</p>
        </div>
      )}

    </div>
  );
}
