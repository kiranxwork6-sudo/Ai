import React, { useState, useEffect } from 'react';
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
  RefreshCw,
  Loader2
} from 'lucide-react';
import { apiFetch } from '../lib/api.js';
import { hasMetaPublicConfig, metaPublicConfig } from '../lib/metaConfig.js';

export default function WhatsAppConnectModal({
  isOpen,
  onClose,
  status,
  onConnect,
  onDisconnect,
  csrfToken
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('connect'); // 'connect' | 'meta-guide'
  const [phoneNumber, setPhoneNumber] = useState(status?.phoneNumber || '+1 (555) 019-2831');
  const [isProcessing, setIsProcessing] = useState(false);
  const [qrKey, setQrKey] = useState(1);
  const [fbSdkLoaded, setFbSdkLoaded] = useState(false);
  const [embeddedSignupStatus, setEmbeddedSignupStatus] = useState('');

  const isConnected = status?.connected;
  const metaConnected = status?.meta?.status === 'connected';

  // Load Facebook SDK
  useEffect(() => {
    if (!hasMetaPublicConfig()) {
      setFbSdkLoaded(false);
      return undefined;
    }

    if (!window.FB && !document.getElementById('facebook-jssdk')) {
      window.fbAsyncInit = function() {
        window.FB.init({
          appId: metaPublicConfig.appId,
          cookie: true,
          xfbml: true,
          version: 'v21.0'
        });
        setFbSdkLoaded(hasMetaPublicConfig());
      };

      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    } else if (window.FB) {
      setFbSdkLoaded(hasMetaPublicConfig());
    }
  }, []);

  // Listen for Embedded Signup session info
  useEffect(() => {
    const handleMessage = (event) => {
      // Only accept messages from Facebook
      if (event.origin !== 'https://www.facebook.com') {
        return;
      }

      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

        // Verify this is an Embedded Signup message
        if (data.type === 'WA_EMBEDDED_SIGNUP') {
          console.log('[EmbeddedSignup] Session info received');

          // Extract WABA and phone information
          if (data.event === 'FINISH' && data.data) {
            const { phone_number_id, waba_id } = data.data;

            if (phone_number_id && waba_id) {
              console.log('[EmbeddedSignup] WABA onboarding completed', {
                wabaId: waba_id,
                phoneNumberId: phone_number_id
              });

              // Store for authorization code exchange
              window.__embeddedSignupData = {
                wabaId: waba_id,
                phoneNumberId: phone_number_id
              };
            }
          }
        }
      } catch (err) {
        console.warn('[EmbeddedSignup] Invalid postMessage:', err);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

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

  const handleMetaEmbeddedSignup = () => {
    if (!hasMetaPublicConfig()) {
      alert('Meta Embedded Signup is not configured for this deployment.');
      return;
    }
    if (!fbSdkLoaded || !window.FB) {
      alert('Facebook SDK is still loading. Please try again in a moment.');
      return;
    }

    setIsProcessing(true);
    setEmbeddedSignupStatus('Opening Meta Embedded Signup...');

    window.FB.login((response) => {
      if (response.authResponse) {
        const authCode = response.authResponse.code;

        setEmbeddedSignupStatus('Processing authorization...');

        // Get session info from postMessage listener
        const sessionData = window.__embeddedSignupData;

        if (!sessionData || !sessionData.wabaId || !sessionData.phoneNumberId) {
          setEmbeddedSignupStatus('');
          setIsProcessing(false);
          alert('Could not retrieve WABA information. Please try again.');
          return;
        }

        // Exchange authorization code on backend
        exchangeAuthorizationCode(authCode, sessionData.wabaId, sessionData.phoneNumberId);
      } else {
        setEmbeddedSignupStatus('');
        setIsProcessing(false);
        console.log('[EmbeddedSignup] User cancelled or login failed');
      }
    }, {
      config_id: metaPublicConfig.embeddedSignupConfigId,
      response_type: 'code',
      override_default_response_type: true,
      extras: {
        version: 'v4',
        sessionInfoVersion: 3
      }
    });
  };

  const exchangeAuthorizationCode = async (code, wabaId, phoneNumberId) => {
    try {
      setEmbeddedSignupStatus('Connecting to WhatsApp Business...');

      const response = await apiFetch('/api/whatsapp/embedded-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({
          code,
          wabaId,
          phoneNumberId
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to connect WhatsApp Business');
      }

      setEmbeddedSignupStatus('Connected successfully!');

      // Clear session data
      delete window.__embeddedSignupData;

      // Refresh status
      setTimeout(() => {
        setIsProcessing(false);
        setEmbeddedSignupStatus('');
        onClose();
        window.location.reload(); // Refresh to show new connection
      }, 1500);

    } catch (err) {
      console.error('[EmbeddedSignup] Exchange error:', err);
      setEmbeddedSignupStatus('');
      setIsProcessing(false);
      alert('Failed to connect WhatsApp: ' + err.message);
    }
  };

  const handleMetaDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your WhatsApp Business account?')) {
      return;
    }

    setIsProcessing(true);
    try {
      const response = await apiFetch('/api/whatsapp/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ provider: 'meta' })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to disconnect');
      }

      onClose();
      window.location.reload();
    } catch (err) {
      alert('Error disconnecting: ' + err.message);
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
                {status?.isMock ? 'Sandbox Mode Active' : 'Production Mode'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            disabled={isProcessing}
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
            Connect WhatsApp
          </button>
          <button
            onClick={() => setActiveTab('sandbox')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
              activeTab === 'sandbox'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Sandbox / Test Mode
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {activeTab === 'connect' ? (
            <div className="space-y-5">

              {/* Meta Connection Status */}
              {metaConnected ? (
                <div className="p-4 rounded-xl border bg-emerald-50/70 border-emerald-200 text-emerald-950">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-500 text-white">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xs">WhatsApp Business Connected</h3>
                        <p className="text-[11px] text-emerald-700 mt-0.5">
                          {status?.meta?.phoneNumber || 'Connected'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-emerald-800">Phone Number ID:</span>
                      <span className="font-mono text-emerald-900">{status?.meta?.phoneNumberId?.slice(-8) || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-emerald-800">WABA ID:</span>
                      <span className="font-mono text-emerald-900">{status?.meta?.wabaId?.slice(-8) || 'N/A'}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleMetaDisconnect}
                    disabled={isProcessing}
                    className="mt-4 w-full px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                  >
                    {isProcessing ? 'Disconnecting...' : 'Disconnect WhatsApp Business'}
                  </button>
                </div>
              ) : (
                <>
                  {/* Meta Embedded Signup */}
                  <div className="p-4 rounded-xl border bg-slate-50 border-slate-200">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500 text-white shrink-0">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-sm text-slate-900">Connect Your WhatsApp Business</h3>
                        <p className="text-xs text-slate-600 mt-1">
                          Use Meta's official Embedded Signup to connect your WhatsApp Business account securely.
                        </p>
                      </div>
                    </div>

                    {embeddedSignupStatus && (
                      <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {embeddedSignupStatus}
                      </div>
                    )}

                    <button
                      onClick={handleMetaEmbeddedSignup}
                      disabled={isProcessing || !fbSdkLoaded}
                      className="w-full px-4 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 flex items-center justify-center gap-2"
                    >
                      {!fbSdkLoaded ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading...
                        </>
                      ) : isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Connect WhatsApp Business
                        </>
                      )}
                    </button>

                    <p className="text-[11px] text-slate-500 mt-3 text-center">
                      Secure OAuth 2.0 authentication via Meta
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-bold">Production WhatsApp Connection:</span> Connect your real WhatsApp Business number to receive and respond to customer messages with AI.
                    </div>
                  </div>
                </>
              )}

            </div>
          ) : (
            /* Sandbox Tab */
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
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors disabled:opacity-50"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
