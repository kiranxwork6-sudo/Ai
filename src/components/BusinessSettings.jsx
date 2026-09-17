import React, { useState, useEffect } from 'react';
import {
  Building,
  Clock,
  Tag,
  HelpCircle,
  Plus,
  Trash2,
  Save,
  Check
} from 'lucide-react';

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const toInputTime = (value) => {
  const raw = String(value || '');
  if (/^\d{2}:\d{2}$/.test(raw)) return raw;
  const match = raw.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  if (!match) return '';
  let hour = Number(match[1]); if (match[3].toUpperCase() === 'PM' && hour !== 12) hour += 12; if (match[3].toUpperCase() === 'AM' && hour === 12) hour = 0;
  return `${String(hour).padStart(2, '0')}:${match[2]}`;
};
const completeHours = (hours = []) => WEEK_DAYS.map((day) => {
  const saved = hours.find((item) => item.day === day);
  return saved ? { day, closed: Boolean(saved.closed), open: toInputTime(saved.open), close: toInputTime(saved.close) } : { day, closed: true, open: '', close: '' };
});

export default function BusinessSettings({ initialBusiness, onSave, onSaveHours, onApplyTemplate }) {
  const [formData, setFormData] = useState(initialBusiness || {});
  const [activeSection, setActiveSection] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [hoursSaved, setHoursSaved] = useState(false);
  const [hoursError, setHoursError] = useState('');

  useEffect(() => {
    if (initialBusiness) {
      setFormData({ ...initialBusiness, openingHours: completeHours(initialBusiness.openingHours), timezone: initialBusiness.timezone || 'Asia/Kolkata' });
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

  const handleSaveHours = async () => {
    setIsSaving(true); setHoursError(''); setHoursSaved(false);
    try {
      await onSaveHours({ openingHours: completeHours(formData.openingHours), timezone: formData.timezone || 'Asia/Kolkata' });
      setHoursSaved(true); setTimeout(() => setHoursSaved(false), 3000);
    } catch (error) { setHoursError(error.message || 'Could not save business hours.'); }
    finally { setIsSaving(false); }
  };

  const handleAddService = () => {
    const newService = { id: `s-${Date.now()}`, name: '', price: '', description: '' };
    setFormData(prev => ({ ...prev, services: [...(prev.services || []), newService] }));
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
    const newFaq = { id: `f-${Date.now()}`, question: '', answer: '' };
    setFormData(prev => ({ ...prev, faqs: [...(prev.faqs || []), newFaq] }));
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border" style={{ background: '#0D1515', borderColor: '#1C2929' }}>
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#FFFFFF' }}>
            Business Information
          </h1>
          <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
            The AI Receptionist uses this information to answer customer inquiries on WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="text-xs font-bold flex items-center gap-1 px-3 py-1.5 rounded-lg border" style={{ background: 'rgba(0, 230, 118, 0.1)', borderColor: 'rgba(0, 230, 118, 0.3)', color: '#00E676' }}>
              <Check className="w-3.5 h-3.5" />
              Saved
            </span>
          )}

          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all disabled:opacity-50"
            style={{ background: '#00E676', color: '#080F0F' }}
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'profile', label: '1. Profile', icon: Building },
          { id: 'hours', label: '2. Hours', icon: Clock },
          { id: 'services', label: `3. Services (${formData.services?.length || 0})`, icon: Tag },
          { id: 'faqs', label: `4. FAQs (${formData.faqs?.length || 0})`, icon: HelpCircle },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border"
            style={{
              background: activeSection === id ? '#00E676' : '#0D1515',
              borderColor: activeSection === id ? '#00E676' : '#1C2929',
              color: activeSection === id ? '#080F0F' : '#6B7280'
            }}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab 1: Profile */}
      {activeSection === 'profile' && (
        <div className="p-6 rounded-2xl border space-y-4" style={{ background: '#0D1515', borderColor: '#1C2929' }}>
          <div className="border-b pb-3" style={{ borderColor: '#1C2929' }}>
            <h2 className="text-sm font-bold" style={{ color: '#FFFFFF' }}>General Business Identity</h2>
            <p className="text-xs" style={{ color: '#6B7280' }}>How your business introduces itself to WhatsApp customers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1" style={{ color: '#E5E7EB' }}>Business Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleProfileChange}
                placeholder="e.g. Glow & Co. Wellness Spa"
                className="w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:border-[#00E676]"
                style={{ background: '#111A1A', borderColor: '#1C2929', color: '#FFFFFF' }}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1" style={{ color: '#E5E7EB' }}>Tagline / Specialty</label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline || ''}
                onChange={handleProfileChange}
                placeholder="e.g. Boutique Massage & Skincare"
                className="w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:border-[#00E676]"
                style={{ background: '#111A1A', borderColor: '#1C2929', color: '#FFFFFF' }}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1" style={{ color: '#E5E7EB' }}>Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone || ''}
                onChange={handleProfileChange}
                placeholder="e.g. +1 (555) 349-2810"
                className="w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:border-[#00E676]"
                style={{ background: '#111A1A', borderColor: '#1C2929', color: '#FFFFFF' }}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1" style={{ color: '#E5E7EB' }}>Physical Address</label>
              <input
                type="text"
                name="address"
                value={formData.address || ''}
                onChange={handleProfileChange}
                placeholder="e.g. 142 Lotus Blossom Way, Austin, TX"
                className="w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:border-[#00E676]"
                style={{ background: '#111A1A', borderColor: '#1C2929', color: '#FFFFFF' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1" style={{ color: '#E5E7EB' }}>Business Description</label>
            <textarea
              name="description"
              rows={3}
              value={formData.description || ''}
              onChange={handleProfileChange}
              placeholder="Describe your business, services, and mission..."
              className="w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:border-[#00E676]"
              style={{ background: '#111A1A', borderColor: '#1C2929', color: '#FFFFFF' }}
            />
          </div>
        </div>
      )}

      {/* Tab 2: Hours */}
      {activeSection === 'hours' && (
        <div className="p-6 rounded-2xl border space-y-4" style={{ background: '#0D1515', borderColor: '#1C2929' }}>
          <div className="border-b pb-3" style={{ borderColor: '#1C2929' }}>
            <h2 className="text-sm font-bold" style={{ color: '#FFFFFF' }}>Business Hours</h2>
            <p className="text-xs" style={{ color: '#6B7280' }}>Set when your business is open for customer appointments and visits.</p>
          </div>

          <div className="max-w-sm">
            <label className="block text-xs font-bold mb-1" style={{ color: '#E5E7EB' }}>Timezone</label>
            <input
              value={formData.timezone || 'Asia/Kolkata'}
              onChange={(e) => setFormData((prev) => ({ ...prev, timezone: e.target.value }))}
              placeholder="Asia/Kolkata"
              className="w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:border-[#00E676]"
              style={{ background: '#111A1A', borderColor: '#1C2929', color: '#FFFFFF' }}
            />
          </div>

          <div className="divide-y" style={{ borderColor: '#1C2929' }}>
            {(formData.openingHours || []).map((schedule, idx) => (
              <div key={schedule.day} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="w-28 font-bold text-xs" style={{ color: '#FFFFFF' }}>
                  {schedule.day}
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: '#E5E7EB' }}>
                    <input
                      type="checkbox"
                      checked={!schedule.closed}
                      onChange={(e) => handleHourChange(idx, 'closed', !e.target.checked)}
                      className="rounded"
                    />
                    Open
                  </label>

                  {!schedule.closed && (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={schedule.open}
                        onChange={(e) => handleHourChange(idx, 'open', e.target.value)}
                        className="w-24 px-2 py-1 text-xs rounded-lg border text-center"
                        style={{ background: '#111A1A', borderColor: '#1C2929', color: '#FFFFFF' }}
                      />
                      <span className="text-xs" style={{ color: '#6B7280' }}>to</span>
                      <input
                        type="time"
                        value={schedule.close}
                        onChange={(e) => handleHourChange(idx, 'close', e.target.value)}
                        className="w-24 px-2 py-1 text-xs rounded-lg border text-center"
                        style={{ background: '#111A1A', borderColor: '#1C2929', color: '#FFFFFF' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {hoursError && <p className="p-3 text-xs rounded-xl border border-red-500/20 bg-red-500/10 text-red-400">{hoursError}</p>}

          <div className="flex items-center justify-end gap-3 pt-2">
            {hoursSaved && <span className="text-xs font-bold" style={{ color: '#00E676' }}>Hours saved</span>}
            <button
              type="button"
              onClick={handleSaveHours}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              style={{ background: '#00E676', color: '#080F0F' }}
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Hours'}
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Services */}
      {activeSection === 'services' && (
        <div className="p-6 rounded-2xl border space-y-4" style={{ background: '#0D1515', borderColor: '#1C2929' }}>
          <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: '#1C2929' }}>
            <div>
              <h2 className="text-sm font-bold" style={{ color: '#FFFFFF' }}>Services & Pricing Menu</h2>
              <p className="text-xs" style={{ color: '#6B7280' }}>Enter your services and prices so AI can give accurate quotes.</p>
            </div>
            <button
              type="button"
              onClick={handleAddService}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors"
              style={{ background: '#111A1A', borderColor: '#1C2929', color: '#00E676' }}
            >
              <Plus className="w-3.5 h-3.5" />
              Add Service
            </button>
          </div>

          <div className="space-y-3">
            {(formData.services || []).map((service, idx) => (
              <div key={service.id || idx} className="p-4 rounded-xl border space-y-2" style={{ background: '#111A1A', borderColor: '#1C2929' }}>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={service.name}
                    onChange={(e) => handleServiceChange(idx, 'name', e.target.value)}
                    placeholder="Service Name"
                    className="flex-1 px-3 py-1.5 text-xs font-bold rounded-lg border focus:outline-none focus:border-[#00E676]"
                    style={{ background: '#0D1515', borderColor: '#1C2929', color: '#FFFFFF' }}
                  />
                  <input
                    type="text"
                    value={service.price}
                    onChange={(e) => handleServiceChange(idx, 'price', e.target.value)}
                    placeholder="Price"
                    className="w-24 px-3 py-1.5 text-xs font-bold rounded-lg border text-center focus:outline-none focus:border-[#00E676]"
                    style={{ background: '#0D1515', borderColor: '#1C2929', color: '#00E676' }}
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteService(idx)}
                    className="p-1.5 rounded-lg hover:text-red-400 transition-colors"
                    style={{ color: '#6B7280' }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  value={service.description}
                  onChange={(e) => handleServiceChange(idx, 'description', e.target.value)}
                  placeholder="Short description"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border focus:outline-none focus:border-[#00E676]"
                  style={{ background: '#0D1515', borderColor: '#1C2929', color: '#E5E7EB' }}
                />
              </div>
            ))}

            {(formData.services || []).length === 0 && (
              <div className="py-8 text-center text-xs" style={{ color: '#6B7280' }}>
                No services added yet. Click "+ Add Service" above.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: FAQs */}
      {activeSection === 'faqs' && (
        <div className="p-6 rounded-2xl border space-y-4" style={{ background: '#0D1515', borderColor: '#1C2929' }}>
          <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: '#1C2929' }}>
            <div>
              <h2 className="text-sm font-bold" style={{ color: '#FFFFFF' }}>Custom FAQs</h2>
              <p className="text-xs" style={{ color: '#6B7280' }}>Provide official answers for parking, appointments, policies, etc.</p>
            </div>
            <button
              type="button"
              onClick={handleAddFaq}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors"
              style={{ background: '#111A1A', borderColor: '#1C2929', color: '#00E676' }}
            >
              <Plus className="w-3.5 h-3.5" />
              Add FAQ
            </button>
          </div>

          <div className="space-y-3">
            {(formData.faqs || []).map((faq, idx) => (
              <div key={faq.id || idx} className="p-4 rounded-xl border space-y-2" style={{ background: '#111A1A', borderColor: '#1C2929' }}>
                <div className="flex items-start gap-2">
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => handleFaqChange(idx, 'question', e.target.value)}
                    placeholder="Question"
                    className="flex-1 px-3 py-1.5 text-xs font-bold rounded-lg border focus:outline-none focus:border-[#00E676]"
                    style={{ background: '#0D1515', borderColor: '#1C2929', color: '#FFFFFF' }}
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteFaq(idx)}
                    className="p-1.5 rounded-lg hover:text-red-400 transition-colors mt-0.5"
                    style={{ color: '#6B7280' }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={faq.answer}
                  onChange={(e) => handleFaqChange(idx, 'answer', e.target.value)}
                  placeholder="Official answer..."
                  className="w-full px-3 py-1.5 text-xs rounded-lg border focus:outline-none focus:border-[#00E676]"
                  style={{ background: '#0D1515', borderColor: '#1C2929', color: '#E5E7EB' }}
                />
              </div>
            ))}

            {(formData.faqs || []).length === 0 && (
              <div className="py-8 text-center text-xs" style={{ color: '#6B7280' }}>
                No FAQs added yet. Click "+ Add FAQ" above.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Save */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs transition-all disabled:opacity-50"
          style={{ background: '#00E676', color: '#080F0F' }}
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving Changes...' : 'Save Knowledge Base'}
        </button>
      </div>

    </div>
  );
}
