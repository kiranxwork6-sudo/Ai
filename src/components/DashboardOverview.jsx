import React from 'react';
import { 
  Users, 
  Bot, 
  UserCheck, 
  Radio, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  MapPin, 
  Tag, 
  HelpCircle,
  CheckCircle,
  ExternalLink
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
  const recentConvs = conversations.slice(0, 4);

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            AI Receptionist is Online 24/7
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {business?.name || 'Business Owner'}!
          </h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base leading-relaxed">
            Your automated receptionist is ready to answer customer inquiries on WhatsApp using your real business hours, pricing, and services.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('simulator')}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
            >
              <Bot className="w-4 h-4" />
              Test Receptionist (Simulator)
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all border border-white/10 backdrop-blur"
            >
              Edit Business Info & Prices
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Decorative ambient background */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Inquiries */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Inquiries</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-slate-900">{stats?.total || 0}</p>
          <p className="mt-1 text-xs text-slate-500">Customer threads recorded</p>
        </div>

        {/* AI Resolution Rate */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Autonomous AI</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-slate-900">
            {stats?.total ? Math.round(((stats?.aiHandled || 0) / stats.total) * 100) : 100}%
          </p>
          <p className="mt-1 text-xs text-slate-500">{stats?.aiHandled || 0} handled completely by AI</p>
        </div>

        {/* Human Takeovers */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Human Handoffs</span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-slate-900">{stats?.humanHandled || 0}</p>
          <p className="mt-1 text-xs text-slate-500">
            {stats?.humanHandled > 0 ? (
              <span className="text-amber-600 font-semibold cursor-pointer" onClick={() => setActiveTab('inbox')}>
                Requires attention →
              </span>
            ) : (
              'All clear — no pending handoffs'
            )}
          </p>
        </div>

        {/* WhatsApp Channel */}
        <div 
          onClick={onOpenWhatsAppModal}
          className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">WhatsApp Status</span>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isConnected ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
              <Radio className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-sm font-bold text-slate-900 truncate">
            {isConnected ? 'Connected (Test Sandbox)' : 'Disconnected'}
          </p>
          <p className="mt-1 text-xs text-emerald-600 font-medium group-hover:underline flex items-center gap-1">
            {whatsappStatus?.phoneNumber || 'Click to configure'}
            <ExternalLink className="w-3 h-3" />
          </p>
        </div>

      </div>

      {/* 2-Column Section: Setup Wizard & 1-Click Industry Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Setup Checklist & Active Business Summary */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Onboarding Checklist Card */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              Quick Launch Onboarding Flow
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Verify your setup to start answering customer inquiries automatically.
            </p>

            <div className="mt-4 space-y-3">
              {/* Step 1 */}
              <div 
                onClick={() => setActiveTab('settings')}
                className="flex items-start justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 cursor-pointer transition-colors border border-slate-200/60"
              >
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold mt-0.5">
                    1
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Define Business Info & Knowledge Base</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {business?.name ? `${business.name} (${business.services?.length || 0} services, ${business.faqs?.length || 0} FAQs)` : 'Add your hours, services, prices, and FAQs'}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Ready
                </span>
              </div>

              {/* Step 2 */}
              <div 
                onClick={onOpenWhatsAppModal}
                className="flex items-start justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 cursor-pointer transition-colors border border-slate-200/60"
              >
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold mt-0.5">
                    2
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Connect WhatsApp Channel</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isConnected ? `Active on sandbox number: ${whatsappStatus?.phoneNumber}` : 'Connect your WhatsApp test sandbox or Meta API'}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                  isConnected ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-amber-700 bg-amber-50 border-amber-200'
                }`}>
                  {isConnected ? 'Connected' : 'Action Needed'}
                </span>
              </div>

              {/* Step 3 */}
              <div 
                onClick={() => setActiveTab('simulator')}
                className="flex items-start justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 cursor-pointer transition-colors border border-slate-200/60"
              >
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold mt-0.5">
                    3
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Simulate Real Customer Inquiries</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Try asking about your hours, prices, or test the human handoff feature.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
                  Try Now →
                </span>
              </div>
            </div>
          </div>

          {/* Recent Inquiries List */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Recent Customer Activity</h2>
                <p className="text-xs text-slate-500">Live conversations from WhatsApp</p>
              </div>
              <button
                onClick={() => setActiveTab('inbox')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                View all in Inbox →
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {recentConvs.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No customer conversations yet. Use the Simulator tab to start one!
                </div>
              ) : (
                recentConvs.map((conv) => (
                  <div 
                    key={conv.id}
                    onClick={() => setActiveTab('inbox')}
                    className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold">
                        {conv.customerName ? conv.customerName.slice(0, 1).toUpperCase() : 'C'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{conv.customerName}</span>
                          <span className="text-[10px] text-slate-400">{conv.customerPhone}</span>
                        </div>
                        <p className="text-xs text-slate-500 truncate max-w-xs sm:max-w-md mt-0.5">
                          {conv.lastMessage || 'No messages yet'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                        conv.status === 'human'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {conv.status === 'human' ? 'Staff Takeover' : 'AI Active'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right 1 Col: Quick Industry Template Loader */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-700 mb-2">
              <Sparkles className="w-5 h-5" />
              <h2 className="text-sm font-extrabold text-slate-900">1-Click Industry Templates</h2>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Test instantly with real-world small business profiles, operating hours, service catalogs, and FAQs.
            </p>

            <div className="mt-4 space-y-2.5">
              <button
                onClick={() => onApplyTemplate('spa')}
                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-800">
                    💆 Glow & Co. Day Spa
                  </span>
                  <span className="text-[10px] text-slate-400">Massage & Facials</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">4 Services, $95-$130 pricing, cancellation & couples FAQs</p>
              </button>

              <button
                onClick={() => onApplyTemplate('dental')}
                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-800">
                    🦷 BrightSmile Dental
                  </span>
                  <span className="text-[10px] text-slate-400">Family Clinic</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Cleaning, whitening, insurance acceptance, emergency care</p>
              </button>

              <button
                onClick={() => onApplyTemplate('auto')}
                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-800">
                    🚗 Apex Auto Care
                  </span>
                  <span className="text-[10px] text-slate-400">Repair & Service</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Oil change, brakes, repair warranty, shuttle & night-drop box</p>
              </button>
            </div>
          </div>

          {/* Quick Business Card Preview */}
          <div className="bg-slate-900 text-slate-200 rounded-xl p-5 shadow-sm text-xs space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center justify-between">
              <span>Active Business Card</span>
              <span className="text-[10px] font-normal text-emerald-400">Live in AI Engine</span>
            </h3>
            <div className="space-y-2 border-t border-slate-800 pt-3">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                <span className="truncate">{business?.address || 'Address not configured'}</span>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                <span>Mon-Fri: 9:00 AM - 7:00 PM (typical)</span>
              </div>
              <div className="flex items-start gap-2">
                <Tag className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                <span>{business?.services?.length || 0} active services in price sheet</span>
              </div>
              <div className="flex items-start gap-2">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                <span>{business?.faqs?.length || 0} automated FAQ answers</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
