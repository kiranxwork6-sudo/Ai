import React, { useState } from 'react';
import { 
  X, 
  Radio, 
  QrCode, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Phone, 
  ArrowRight, 
  Code2, 
  Info,
  RefreshCw
} from 'lucide-react';

export default function WhatsAppConnectModal({
  isOpen,
  onClose,
  status,
  onConnect,
  onDisconnect
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('connect'); // 'connect' | 'meta-guide'
  const [phoneNumber, setPhoneNumber] = useState(status?.phoneNumber || '+1 (555) 019-2831');
  const [isProcessing, setIsProcessing] = useState(false);
  const [qrKey, setQrKey] = useState(1);

  const isConnected = status?.connected;

  const handleToggleConnect = async () => {
    setIsProcessing(true);
    try {
      if (isConnected) {
        await onDisconnect();
      } else {
        await onConnect(phoneNumber);
      }
    } catch (err) {
      alert('Error updating WhatsApp connection: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm">WhatsApp Connection Center</h2>
              <span className="text-[10px] text-emerald-400 font-medium">
                {status?.isMock ? 'Sandbox Mode Active' : 'Meta API Mode'}
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold">
          <button
            onClick={() => setActiveTab('connect')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
              activeTab === 'connect'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Sandbox Connection
          </button>
          <button
            onClick={() => setActiveTab('meta-guide')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'meta-guide'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Meta API Production Roadmap
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {activeTab === 'connect' ? (
            <div className="space-y-5">
              
              {/* Sandbox Transparency Notice */}
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold">Sandbox Test Connection:</span> This MVP simulates WhatsApp message flows without billing Meta Cloud API fees. Incoming and outgoing WhatsApp messages are handled locally in sandbox mode.
                </div>
              </div>

              {/* Status Banner */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                isConnected
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isConnected ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {isConnected ? <CheckCircle2 className="w-5 h-5" /> : <Radio className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-xs">
                      {isConnected ? 'WhatsApp Test Sandbox Active' : 'Disconnected'}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {isConnected ? `Assigned Number: ${status?.phoneNumber}` : 'Connect to allow simulated customer messages'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleToggleConnect}
                  disabled={isProcessing}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 ${
                    isConnected
                      ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20'
                  }`}
                >
                  {isProcessing ? 'Updating...' : (isConnected ? 'Disconnect' : 'Connect')}
                </button>
              </div>

              {/* QR Code Pair Simulator */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col items-center text-center">
                <div className="relative p-3 bg-white rounded-xl shadow-inner border border-slate-200">
                  {/* Visual QR Code SVG Pattern */}
                  <svg className="w-36 h-36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Corners */}
                    <rect x="5" y="5" width="25" height="25" rx="3" fill="#0f172a" />
                    <rect x="9" y="9" width="17" height="17" rx="1" fill="white" />
                    <rect x="13" y="13" width="9" height="9" fill="#0f172a" />

                    <rect x="70" y="5" width="25" height="25" rx="3" fill="#0f172a" />
                    <rect x="74" y="9" width="17" height="17" rx="1" fill="white" />
                    <rect x="78" y="13" width="9" height="9" fill="#0f172a" />

                    <rect x="5" y="70" width="25" height="25" rx="3" fill="#0f172a" />
                    <rect x="9" y="74" width="17" height="17" rx="1" fill="white" />
                    <rect x="13" y="78" width="9" height="9" fill="#0f172a" />

                    {/* Matrix mock bits */}
                    <rect x="36" y="10" width="8" height="8" fill="#0f172a" />
                    <rect x="48" y="14" width="6" height="6" fill="#0f172a" />
                    <rect x="58" y="8" width="6" height="8" fill="#0f172a" />

                    <rect x="12" y="38" width="12" height="6" fill="#0f172a" />
                    <rect x="36" y="34" width="10" height="10" fill="#22c55e" />
                    <rect x="52" y="36" width="14" height="6" fill="#0f172a" />
                    <rect x="72" y="36" width="8" height="14" fill="#0f172a" />

                    <rect x="36" y="50" width="8" height="14" fill="#0f172a" />
                    <rect x="48" y="48" width="16" height="8" fill="#0f172a" />
                    <rect x="68" y="56" width="12" height="6" fill="#0f172a" />

                    <rect x="36" y="72" width="10" height="8" fill="#0f172a" />
                    <rect x="52" y="70" width="8" height="14" fill="#0f172a" />
                    <rect x="66" y="76" width="14" height="8" fill="#0f172a" />
                    <rect x="84" y="72" width="6" height="12" fill="#0f172a" />
                  </svg>
                  
                  {isConnected && (
                    <div className="absolute inset-0 bg-emerald-950/80 rounded-xl backdrop-blur-xs flex flex-col items-center justify-center text-white">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-1 animate-bounce" />
                      <span className="text-[11px] font-bold">Paired & Active</span>
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 mt-2 font-medium">
                  {isConnected 
                    ? 'Simulated WhatsApp device paired successfully.'
                    : 'Scan with WhatsApp to link test business number.'}
                </p>

                <div className="mt-3 w-full">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1 text-left">
                    Sandbox Business WhatsApp Number:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      disabled={isConnected}
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setQrKey(prev => prev + 1)}
                      className="p-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold"
                      title="Refresh QR Code"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            /* Meta API Production Guide Tab */
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 leading-relaxed">
                <p className="font-bold flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-blue-600" />
                  Moving from Mock to Official Meta Cloud API
                </p>
                <p className="mt-1 text-[11px] text-blue-800">
                  The codebase has an official Meta Cloud API provider already structured at <code className="font-mono bg-blue-100 px-1 py-0.5 rounded">server/services/whatsapp/metaProvider.js</code>.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs">Required Environment Variables:</h4>
                <div className="bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono text-[11px] space-y-1 overflow-x-auto">
                  <div>WHATSAPP_PROVIDER=meta</div>
                  <div>WHATSAPP_PHONE_NUMBER_ID=your_meta_phone_id</div>
                  <div>WHATSAPP_BUSINESS_ACCOUNT_ID=your_waba_id</div>
                  <div>WHATSAPP_API_TOKEN=your_system_user_token</div>
                  <div>WHATSAPP_VERIFY_TOKEN=your_webhook_verify_token</div>
                </div>
              </div>

              <div className="space-y-2 text-[11px] text-slate-600">
                <p><strong>1. Webhook Endpoint:</strong> <code className="bg-slate-100 px-1 py-0.5 rounded">POST /api/whatsapp/webhook</code> is pre-built to handle incoming Meta messages.</p>
                <p><strong>2. Full Guide:</strong> See <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">WHATSAPP_INTEGRATION_GUIDE.md</code> for step-by-step Meta Developer setup instructions.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
