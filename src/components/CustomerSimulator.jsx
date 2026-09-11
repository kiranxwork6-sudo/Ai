import React, { useState } from 'react';
import { 
  Send, 
  Smartphone, 
  Bot, 
  Sparkles, 
  CheckCheck, 
  RefreshCw, 
  User, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export default function CustomerSimulator({
  business,
  whatsappStatus,
  onSimulateMessage,
  conversations = [],
  onOpenInbox
}) {
  const [customerPhone, setCustomerPhone] = useState('+1 (555) 789-0123');
  const [customerName, setCustomerName] = useState('Alex Rivera (Customer)');
  const [inputMessage, setInputMessage] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [lastResponseInfo, setLastResponseInfo] = useState(null);

  // Find active simulation conversation in conversations list
  const activeConv = conversations.find(c => c.customerPhone === customerPhone);
  const messages = activeConv ? activeConv.messages : [];

  const isConnected = whatsappStatus?.connected;
  const isHumanHandoff = activeConv?.status === 'human';

  const quickPrompts = [
    "What are your opening hours on Saturday?",
    "How much does a massage cost?",
    "Where are you located and is there parking?",
    "Can I speak to a human manager?",
    "Do you accept walk-in appointments?"
  ];

  const handleSend = async (messageToSend) => {
    const text = (messageToSend || inputMessage).trim();
    if (!text || isSimulating) return;

    if (!isConnected) {
      alert('WhatsApp is currently disconnected. Please connect WhatsApp in sandbox mode first.');
      return;
    }

    setIsSimulating(true);
    setInputMessage('');

    try {
      const result = await onSimulateMessage({
        customerPhone,
        customerName,
        message: text
      });
      setLastResponseInfo(result);
    } catch (err) {
      alert('Simulation error: ' + err.message);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Intro Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Live WhatsApp Simulator Sandbox
          </div>
          <h1 className="text-xl font-black text-slate-900">
            Test Your AI Receptionist as a Customer
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Simulate sending WhatsApp messages to <span className="font-semibold text-slate-700">{business?.name}</span>. The AI will respond in real time using your configured business profile, hours, and prices.
          </p>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-2">
          {isHumanHandoff ? (
            <span className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Human Handoff Active
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              AI Receptionist Ready
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left 1 Col: Quick Test Controls */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Simulation Settings
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Simulated Customer Phone
              </label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Customer Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
              />
            </div>

            <div className="border-t border-slate-100 pt-3">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Click to Ask Quick Question:
              </label>
              <div className="space-y-1.5">
                {quickPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(prompt)}
                    disabled={isSimulating}
                    className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 text-[11px] text-slate-700 hover:text-emerald-800 font-medium border border-slate-200/80 transition-colors disabled:opacity-50"
                  >
                    💬 "{prompt}"
                  </button>
                ))}
              </div>
            </div>

            {activeConv && (
              <div className="border-t border-slate-100 pt-3">
                <button
                  onClick={() => onOpenInbox(activeConv.id)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors text-center"
                >
                  Open in Staff Inbox →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right 2 Cols: Interactive WhatsApp Phone Screen */}
        <div className="md:col-span-2">
          <div className="max-w-md mx-auto rounded-[36px] bg-slate-900 p-3 shadow-2xl border-4 border-slate-800">
            
            {/* Phone Screen Container */}
            <div className="rounded-[28px] overflow-hidden bg-[#efeae2] h-[580px] flex flex-col relative border border-slate-700">
              
              {/* WhatsApp Header */}
              <div className="bg-[#075E54] text-white px-4 py-3 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-white text-[#075E54] flex items-center justify-center font-bold text-xs shadow-inner">
                    <Bot className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs tracking-tight truncate max-w-[170px]">
                      {business?.name || 'AI Receptionist'}
                    </h3>
                    <p className="text-[10px] text-emerald-200">
                      online • typically replies in seconds
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] bg-emerald-800/60 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Sandbox WhatsApp</span>
                </div>
              </div>

              {/* Handoff Status Notice within WhatsApp */}
              {isHumanHandoff && (
                <div className="bg-amber-100 text-amber-900 px-3 py-1.5 text-[11px] font-semibold border-b border-amber-200 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                  <span>Human Takeover Active. AI receptionist is paused.</span>
                </div>
              )}

              {/* Chat Message Scroll Area */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3">
                
                {/* Security Encryption Notice */}
                <div className="text-center my-2">
                  <span className="bg-[#ffeecd] text-slate-700 text-[10px] px-3 py-1 rounded-md shadow-xs inline-block max-w-[90%] font-medium">
                    🔒 Messages are end-to-end simulated for {business?.name}.
                  </span>
                </div>

                {messages.length === 0 ? (
                  <div className="h-48 flex flex-col items-center justify-center text-slate-500 text-xs text-center px-6">
                    <Smartphone className="w-8 h-8 text-slate-400 mb-2 stroke-1" />
                    <p className="font-bold text-slate-700">WhatsApp Chat Ready</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Type a question below or pick a quick prompt to test your AI receptionist!
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
                          className={`max-w-[85%] p-2.5 rounded-xl text-xs shadow-xs relative leading-relaxed whitespace-pre-wrap ${
                            isFromCustomer
                              ? 'bg-[#d9fdd3] text-slate-900 rounded-tr-none'
                              : isFromHuman
                              ? 'bg-[#e0e7ff] text-slate-900 rounded-tl-none border border-indigo-200'
                              : 'bg-white text-slate-900 rounded-tl-none'
                          }`}
                        >
                          {/* Sender Mini Tag */}
                          {!isFromCustomer && (
                            <div className="text-[9px] font-bold text-slate-500 mb-1 flex items-center gap-1">
                              {isFromHuman ? (
                                <span className="text-indigo-700 font-bold flex items-center gap-0.5">
                                  <User className="w-2.5 h-2.5" /> Staff (Human)
                                </span>
                              ) : (
                                <span className="text-emerald-800 font-bold flex items-center gap-0.5">
                                  <Bot className="w-2.5 h-2.5" /> AI Receptionist
                                </span>
                              )}
                            </div>
                          )}

                          <div>{msg.text}</div>

                          <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-slate-400">
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
                    <div className="bg-white p-2.5 rounded-xl rounded-tl-none text-xs text-slate-500 flex items-center gap-2 shadow-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                      <span className="text-[11px] text-slate-400">AI Receptionist typing...</span>
                    </div>
                  </div>
                )}

              </div>

              {/* WhatsApp Message Input Bar */}
              <div className="p-2.5 bg-[#f0f2f5] border-t border-slate-200">
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
                    placeholder="Type message as customer..."
                    disabled={isSimulating}
                    className="flex-1 px-3.5 py-2 text-xs rounded-full bg-white border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#075E54]"
                  />
                  <button
                    type="submit"
                    disabled={isSimulating || !inputMessage.trim()}
                    className="w-9 h-9 rounded-full bg-[#00a884] hover:bg-[#008f6f] text-white flex items-center justify-center transition-all disabled:opacity-40 shadow-sm"
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
