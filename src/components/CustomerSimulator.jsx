import React, { useState } from 'react';
import {
  Send,
  Smartphone,
  Bot,
  Sparkles,
  CheckCheck,
  User,
  AlertCircle,
  Plus,
  RefreshCw
} from 'lucide-react';

const TEST_CUSTOMERS = [
  { name: 'Alex Rivera', phone: '+1 (555) 789-0123' },
  { name: 'Emma Watson', phone: '+1 (555) 432-8765' },
  { name: 'Michael Chen', phone: '+1 (555) 987-6543' },
  { name: 'Sarah Davis', phone: '+1 (555) 321-7654' }
];

export default function CustomerSimulator({
  business,
  whatsappStatus,
  onSimulateMessage,
  conversations = [],
  onOpenInbox
}) {
  const [customerPhone, setCustomerPhone] = useState(TEST_CUSTOMERS[0].phone);
  const [customerName, setCustomerName] = useState(TEST_CUSTOMERS[0].name);
  const [inputMessage, setInputMessage] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);

  // Find active simulation conversation in conversations list
  const activeConv = conversations.find(c => c.customerPhone === customerPhone);
  const messages = activeConv ? activeConv.messages : [];

  const isConnected = whatsappStatus?.connected;
  const isHumanHandoff = ['HUMAN_ACTIVE', 'NEEDS_HUMAN', 'human'].includes(activeConv?.status);

  const quickPrompts = [
    "What are your opening hours on Saturday?",
    "How much does a massage cost?",
    "Where are you located and is there parking?",
    "Can I speak to a human manager?",
    "Do you accept walk-in appointments?"
  ];

  const handleSelectPresetCustomer = (preset) => {
    setCustomerName(preset.name);
    setCustomerPhone(preset.phone);
  };

  const handleCreateNewCustomer = () => {
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const firstNames = ['David', 'Jessica', 'Daniel', 'Sophia', 'James', 'Olivia'];
    const lastNames = ['Miller', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White'];
    const randomFirst = firstNames[Math.floor(Math.random() * firstNames.length)];
    const randomLast = lastNames[Math.floor(Math.random() * lastNames.length)];
    const newName = `${randomFirst} ${randomLast}`;
    const newPhone = `+1 (555) ${Math.floor(100 + Math.random() * 900)}-${randomId}`;
    setCustomerName(newName);
    setCustomerPhone(newPhone);
  };

  const handleSend = async (messageToSend) => {
    const text = (messageToSend || inputMessage).trim();
    if (!text || isSimulating) return;

    if (!isConnected) {
      alert('WhatsApp is currently disconnected. Please connect WhatsApp first in sandbox mode.');
      return;
    }

    setIsSimulating(true);
    setInputMessage('');

    try {
      await onSimulateMessage({ customerPhone, customerName, message: text });
    } catch (err) {
      alert('Simulation error: ' + err.message);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border" style={{ background: '#0D1515', borderColor: '#1C2929' }}>
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border mb-2" style={{ background: 'rgba(0, 230, 118, 0.1)', borderColor: 'rgba(0, 230, 118, 0.3)', color: '#00E676' }}>
            <Sparkles className="w-3.5 h-3.5" />
            TEST MODE
          </div>
          <h1 className="text-xl font-bold" style={{ color: '#FFFFFF' }}>
            Test Your AI Receptionist
          </h1>
          <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
            Simulate WhatsApp messages to <span className="font-semibold" style={{ color: '#FFFFFF' }}>{business?.name}</span>. The AI will respond using your business knowledge.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isHumanHandoff ? (
            <span className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border" style={{ background: 'rgba(251, 191, 36, 0.1)', borderColor: 'rgba(251, 191, 36, 0.3)', color: '#fbbf24' }}>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Human Takeover
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border" style={{ background: 'rgba(0, 230, 118, 0.1)', borderColor: 'rgba(0, 230, 118, 0.3)', color: '#00E676' }}>
              <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse" />
              AI Ready
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Left 1 Col: Quick Controls */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl border space-y-4" style={{ background: '#0D1515', borderColor: '#1C2929' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#6B7280' }}>
                Simulated Customer
              </h2>
              <button
                type="button"
                onClick={handleCreateNewCustomer}
                className="flex items-center gap-1 text-[11px] font-bold transition-colors hover:underline"
                style={{ color: '#00E676' }}
              >
                <Plus className="w-3 h-3" />
                New Customer
              </button>
            </div>

            {/* Customer Preset Quick Selector */}
            <div className="grid grid-cols-2 gap-1.5">
              {TEST_CUSTOMERS.map((preset) => {
                const isSelected = customerPhone === preset.phone;
                return (
                  <button
                    key={preset.phone}
                    onClick={() => handleSelectPresetCustomer(preset)}
                    className="p-2 rounded-xl text-left border text-[11px] font-semibold transition-all"
                    style={{
                      background: isSelected ? 'rgba(0, 230, 118, 0.1)' : '#111A1A',
                      borderColor: isSelected ? '#00E676' : '#1C2929',
                      color: isSelected ? '#00E676' : '#E5E7EB'
                    }}
                  >
                    <p className="truncate">{preset.name.split(' ')[0]}</p>
                    <p className="text-[9px] font-mono" style={{ color: '#6B7280' }}>{preset.phone.slice(-4)}</p>
                  </button>
                );
              })}
            </div>

            <div>
              <label className="block text-xs font-bold mb-1" style={{ color: '#E5E7EB' }}>
                Customer Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:border-[#00E676]"
                style={{ background: '#111A1A', borderColor: '#1C2929', color: '#FFFFFF' }}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1" style={{ color: '#E5E7EB' }}>
                Customer Phone
              </label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-mono rounded-xl border focus:outline-none focus:border-[#00E676]"
                style={{ background: '#111A1A', borderColor: '#1C2929', color: '#FFFFFF' }}
              />
            </div>

            <div className="border-t pt-3" style={{ borderColor: '#1C2929' }}>
              <label className="block text-xs font-bold mb-2" style={{ color: '#E5E7EB' }}>
                Quick Inquiries:
              </label>
              <div className="space-y-1.5">
                {quickPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(prompt)}
                    disabled={isSimulating}
                    className="w-full text-left p-2 rounded-xl text-[11px] font-medium border transition-all disabled:opacity-50 hover:border-[#00E676]/30"
                    style={{ background: '#111A1A', borderColor: '#1C2929', color: '#E5E7EB' }}
                  >
                    💬 "{prompt}"
                  </button>
                ))}
              </div>
            </div>

            {activeConv && (
              <div className="border-t pt-3" style={{ borderColor: '#1C2929' }}>
                <button
                  onClick={() => onOpenInbox(activeConv.id)}
                  className="w-full py-2 px-3 rounded-xl text-xs font-bold transition-colors"
                  style={{ background: '#00E676', color: '#080F0F' }}
                >
                  Open in Staff Inbox →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right 2 Cols: Phone Mockup */}
        <div className="md:col-span-2">
          <div className="max-w-md mx-auto rounded-[36px] p-3 shadow-2xl border-4" style={{ background: '#0D1515', borderColor: '#1C2929' }}>

            {/* Phone Screen */}
            <div className="rounded-[28px] overflow-hidden h-[580px] flex flex-col border" style={{ background: '#efeae2', borderColor: '#1C2929' }}>

              {/* WhatsApp Header */}
              <div className="px-4 py-3 flex items-center justify-between shadow-md" style={{ background: '#075E54', color: '#FFFFFF' }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-inner" style={{ background: '#FFFFFF', color: '#075E54' }}>
                    <Bot className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs tracking-tight truncate max-w-[170px]">
                      {business?.name || 'AI Receptionist'}
                    </h3>
                    <p className="text-[10px] text-emerald-200">
                      online • typically replies instantly
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(0, 230, 118, 0.2)' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Test Mode</span>
                </div>
              </div>

              {/* Handoff Notice */}
              {isHumanHandoff && (
                <div className="px-3 py-1.5 text-[11px] font-semibold border-b flex items-center gap-1.5" style={{ background: '#fef3c7', color: '#92400e', borderColor: '#fcd34d' }}>
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Human staff is responding. AI paused.</span>
                </div>
              )}

              {/* Chat Area */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3">

                {/* Encryption Notice */}
                <div className="text-center my-2">
                  <span className="text-[10px] px-3 py-1 rounded-md shadow-xs inline-block max-w-[90%] font-medium" style={{ background: '#ffeecd', color: '#374151' }}>
                    🔒 Messages are end-to-end simulated for {business?.name}.
                  </span>
                </div>

                {messages.length === 0 ? (
                  <div className="h-48 flex flex-col items-center justify-center text-xs text-center px-6" style={{ color: '#6B7280' }}>
                    <Smartphone className="w-8 h-8 stroke-1 mb-2" style={{ color: '#9CA3AF' }} />
                    <p className="font-bold" style={{ color: '#374151' }}>WhatsApp Chat Ready</p>
                    <p className="text-[11px] mt-1" style={{ color: '#6B7280' }}>
                      Type a question below or pick a quick prompt to test your AI with <span className="font-semibold">{customerName}</span>!
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isFromCustomer = msg.sender === 'customer';
                    const isFromAi = msg.sender === 'ai';
                    const isFromHuman = msg.sender === 'human';

                    if (msg.sender === 'system') return null;

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isFromCustomer ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] p-2.5 rounded-xl text-xs shadow-xs leading-relaxed whitespace-pre-wrap ${
                            isFromCustomer
                              ? 'rounded-tr-none'
                              : isFromHuman
                              ? 'rounded-tl-none border'
                              : 'rounded-tl-none'
                          }`}
                          style={
                            isFromCustomer
                              ? { background: '#d9fdd3', color: '#1f2937' }
                              : isFromHuman
                              ? { background: '#e0e7ff', color: '#1f2937', borderColor: '#c7d2fe' }
                              : { background: '#FFFFFF', color: '#1f2937' }
                          }
                        >
                          {!isFromCustomer && (
                            <div className="text-[9px] font-bold mb-1 flex items-center gap-0.5" style={{ color: isFromHuman ? '#4338ca' : '#059669' }}>
                              {isFromHuman ? (
                                <><User className="w-2.5 h-2.5" /> Staff</>
                              ) : (
                                <><Bot className="w-2.5 h-2.5" /> AI</>
                              )}
                            </div>
                          )}

                          <div>{msg.text}</div>

                          <div className="flex items-center justify-end gap-1 mt-1 text-[9px]" style={{ color: '#9CA3AF' }}>
                            <span>
                              {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                            {isFromCustomer && <CheckCheck className="w-3 h-3 text-blue-500" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {isSimulating && (
                  <div className="flex justify-start">
                    <div className="p-2.5 rounded-xl rounded-tl-none text-xs flex items-center gap-2 shadow-xs" style={{ background: '#FFFFFF', color: '#6B7280' }}>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0.4s' }} />
                      <span className="text-[11px]">AI typing...</span>
                    </div>
                  </div>
                )}

              </div>

              {/* WhatsApp Input */}
              <div className="p-2.5 border-t" style={{ background: '#f0f2f5', borderColor: '#d1d5db' }}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={`Type message as ${customerName.split(' ')[0]}...`}
                    disabled={isSimulating}
                    className="flex-1 px-3.5 py-2 text-xs rounded-full border focus:outline-none focus:ring-1"
                    style={{ background: '#FFFFFF', borderColor: '#d1d5db', color: '#1f2937' }}
                  />
                  <button
                    type="submit"
                    disabled={isSimulating || !inputMessage.trim()}
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all disabled:opacity-40 shadow-sm"
                    style={{ background: '#00a884', color: '#FFFFFF' }}
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </form>
              </div>

            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
