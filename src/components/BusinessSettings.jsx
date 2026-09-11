import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Clock, 
  Tag, 
  HelpCircle, 
  Plus, 
  Trash2, 
  Save, 
  Check, 
  AlertCircle,
  Sparkles
} from 'lucide-react';

export default function BusinessSettings({ initialBusiness, onSave, onApplyTemplate }) {
  const [formData, setFormData] = useState(initialBusiness || {});
  const [activeSection, setActiveSection] = useState('profile'); // 'profile' | 'hours' | 'services' | 'faqs'
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (initialBusiness) {
      setFormData(initialBusiness);
    }
  }, [initialBusiness]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleHourChange = (index, field, value) => {
    const updatedHours = [...(formData.openingHours || [])];
    updatedHours[index] = { ...updatedHours[index], [field]: value };
    setFormData(prev => ({ ...prev, openingHours: updatedHours }));
  };

  const handleAddService = () => {
    const newService = {
      id: `s-${Date.now()}`,
      name: '',
      price: '',
      description: ''
    };
    setFormData(prev => ({
      ...prev,
      services: [...(prev.services || []), newService]
    }));
  };

  const handleServiceChange = (index, field, value) => {
    const updated = [...(formData.services || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, services: updated }));
  };

  const handleDeleteService = (index) => {
    const updated = [...(formData.services || [])];
    updated.splice(index, 1);
    setFormData(prev => ({ ...prev, services: updated }));
  };

  const handleAddFaq = () => {
    const newFaq = {
      id: `f-${Date.now()}`,
      question: '',
      answer: ''
    };
    setFormData(prev => ({
      ...prev,
      faqs: [...(prev.faqs || []), newFaq]
    }));
  };

  const handleFaqChange = (index, field, value) => {
    const updated = [...(formData.faqs || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, faqs: updated }));
  };

  const handleDeleteFaq = (index) => {
    const updated = [...(formData.faqs || [])];
    updated.splice(index, 1);
    setFormData(prev => ({ ...prev, faqs: updated }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert('Failed to save business settings: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Business Knowledge & Onboarding
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            The AI Receptionist automatically reads this information to answer customer messages on WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 animate-fadeIn">
              <Check className="w-3.5 h-3.5" />
              Saved & Active!
            </span>
          )}

          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Knowledge Base'}
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveSection('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSection === 'profile'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Building className="w-4 h-4" />
          1. Business Profile
        </button>

        <button
          onClick={() => setActiveSection('hours')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSection === 'hours'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Clock className="w-4 h-4" />
          2. Opening Hours
        </button>

        <button
          onClick={() => setActiveSection('services')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSection === 'services'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Tag className="w-4 h-4" />
          3. Services & Prices ({formData.services?.length || 0})
        </button>

        <button
          onClick={() => setActiveSection('faqs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSection === 'faqs'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          4. FAQs & Answers ({formData.faqs?.length || 0})
        </button>
      </div>

      {/* Tab 1: Business Profile */}
      {activeSection === 'profile' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">General Business Identity</h2>
            <p className="text-xs text-slate-500">How your business introduces itself to WhatsApp customers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Business Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleProfileChange}
                placeholder="e.g. Glow & Co. Wellness Spa"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tagline / Specialty
              </label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline || ''}
                onChange={handleProfileChange}
                placeholder="e.g. Boutique Massage, Organic Skincare & Holistic Therapy"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone || ''}
                onChange={handleProfileChange}
                placeholder="e.g. +1 (555) 349-2810"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Physical Address (for directions & parking inquiries)
              </label>
              <input
                type="text"
                name="address"
                value={formData.address || ''}
                onChange={handleProfileChange}
                placeholder="e.g. 142 Lotus Blossom Way, Suite 200, Austin, TX 78701"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Business Description & Atmosphere
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description || ''}
              onChange={handleProfileChange}
              placeholder="Describe your business, vibe, clientele, and mission..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      )}

      {/* Tab 2: Opening Hours */}
      {activeSection === 'hours' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Weekly Operating Schedule</h2>
            <p className="text-xs text-slate-500">The AI uses this to answer questions like "Are you open on Sunday?" or "What time do you close?".</p>
          </div>

          <div className="divide-y divide-slate-100">
            {(formData.openingHours || []).map((schedule, idx) => (
              <div key={schedule.day} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="w-28 font-bold text-xs text-slate-800">
                  {schedule.day}
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={schedule.closed}
                      onChange={(e) => handleHourChange(idx, 'closed', e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    Closed
                  </label>

                  {!schedule.closed && (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={schedule.open}
                        onChange={(e) => handleHourChange(idx, 'open', e.target.value)}
                        className="w-24 px-2 py-1 text-xs rounded border border-slate-300 text-center"
                        placeholder="09:00 AM"
                      />
                      <span className="text-xs text-slate-400">to</span>
                      <input
                        type="text"
                        value={schedule.close}
                        onChange={(e) => handleHourChange(idx, 'close', e.target.value)}
                        className="w-24 px-2 py-1 text-xs rounded border border-slate-300 text-center"
                        placeholder="06:00 PM"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Services & Prices */}
      {activeSection === 'services' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Services & Pricing Menu</h2>
              <p className="text-xs text-slate-500">Enter every service and exact price so the AI can provide immediate quotes.</p>
            </div>
            <button
              type="button"
              onClick={handleAddService}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Service
            </button>
          </div>

          <div className="space-y-3">
            {(formData.services || []).map((service, idx) => (
              <div key={service.id || idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={service.name}
                    onChange={(e) => handleServiceChange(idx, 'name', e.target.value)}
                    placeholder="Service Name (e.g. Swedish Relaxation Massage)"
                    className="flex-1 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <input
                    type="text"
                    value={service.price}
                    onChange={(e) => handleServiceChange(idx, 'price', e.target.value)}
                    placeholder="Price (e.g. $95)"
                    className="w-28 px-3 py-1.5 text-xs font-bold text-emerald-700 rounded-lg border border-slate-300 bg-white text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteService(idx)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  value={service.description}
                  onChange={(e) => handleServiceChange(idx, 'description', e.target.value)}
                  placeholder="Short description / duration (e.g. 60-minute full body gentle therapy)"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            ))}

            {(formData.services || []).length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                No services added yet. Click "+ Add Service" above.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: FAQs */}
      {activeSection === 'faqs' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Custom FAQs & Front Desk Policies</h2>
              <p className="text-xs text-slate-500">Provide official answers for parking, appointments, walk-ins, cancellations, insurance, etc.</p>
            </div>
            <button
              type="button"
              onClick={handleAddFaq}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add FAQ
            </button>
          </div>

          <div className="space-y-3">
            {(formData.faqs || []).map((faq, idx) => (
              <div key={faq.id || idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-start gap-2">
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => handleFaqChange(idx, 'question', e.target.value)}
                    placeholder="Question (e.g. Do I need an appointment or do you accept walk-ins?)"
                    className="flex-1 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteFaq(idx)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors mt-0.5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={faq.answer}
                  onChange={(e) => handleFaqChange(idx, 'answer', e.target.value)}
                  placeholder="Official Answer given to customer..."
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            ))}

            {(formData.faqs || []).length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                No FAQs added yet. Click "+ Add FAQ" above.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Save Bar */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {savedSuccess && (
          <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
            <Check className="w-4 h-4" />
            Saved & Active!
          </span>
        )}
        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving Changes...' : 'Save Knowledge Base'}
        </button>
      </div>

    </div>
  );
}
