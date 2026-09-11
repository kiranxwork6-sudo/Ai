import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = process.env.VERCEL
  ? os.tmpdir()
  : path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  // Gracefully fallback if read-only
}

// Initial seed data for clean out-of-the-box demo
const defaultData = {
  business: {
    name: "Glow & Co. Wellness Spa",
    tagline: "Boutique Massage, Organic Skincare & Holistic Therapy",
    description: "Glow & Co. is a premier boutique day spa offering rejuvenating massage therapy, organic facials, and holistic wellness treatments in a calm, tranquil setting.",
    phone: "+1 (555) 349-2810",
    address: "142 Lotus Blossom Way, Suite 200, Austin, TX 78701",
    openingHours: [
      { day: "Monday", open: "09:00 AM", close: "07:00 PM", closed: false },
      { day: "Tuesday", open: "09:00 AM", close: "07:00 PM", closed: false },
      { day: "Wednesday", open: "09:00 AM", close: "07:00 PM", closed: false },
      { day: "Thursday", open: "09:00 AM", close: "07:00 PM", closed: false },
      { day: "Friday", open: "09:00 AM", close: "07:00 PM", closed: false },
      { day: "Saturday", open: "10:00 AM", close: "06:00 PM", closed: false },
      { day: "Sunday", open: "Closed", close: "Closed", closed: true }
    ],
    services: [
      { id: "s1", name: "Swedish Relaxation Massage (60 min)", price: "$95", description: "Gentle full-body rhythmic massage to ease muscle tension and improve circulation." },
      { id: "s2", name: "Deep Tissue Recovery Therapy (75 min)", price: "$130", description: "Firm pressure targeting chronic tension, fascia tightness, and posture recovery." },
      { id: "s3", name: "Organic Radiance Glow Facial (50 min)", price: "$110", description: "Botanical deep cleanse, enzymatic exfoliation, custom serum, and cooling mask." },
      { id: "s4", name: "Hot Himalayan Salt Stone Add-on", price: "$35", description: "Warm mineral-rich salt stones to melt away deep tension and rebalance energy." }
    ],
    faqs: [
      { id: "f1", question: "Do I need an appointment or do you accept walk-ins?", answer: "We strongly recommend booking an appointment online or via WhatsApp to secure your slot, though walk-ins are welcomed subject to therapist availability." },
      { id: "f2", question: "What is your cancellation and rescheduling policy?", answer: "Please give us at least 24 hours notice for any cancellation or rescheduling to avoid a 50% cancellation fee." },
      { id: "f3", question: "Is parking available at the spa?", answer: "Yes! Complimentary covered parking is available in the building garage with validation at our front desk." },
      { id: "f4", question: "Can we book a couples massage?", answer: "Absolutely! We feature a private deluxe couples sanctuary room. Please let us know in advance so we can reserve it for you." }
    ],
    updatedAt: new Date().toISOString()
  },
  whatsapp: {
    connected: true,
    mode: "mock", // "mock" or "meta"
    phoneNumber: "+1 (555) 019-2831",
    connectedAt: new Date().toISOString(),
    statusMessage: "Connected to WhatsApp Sandbox (Test Mode)",
    metaConfigured: false
  },
  conversations: [
    {
      id: "conv-1",
      customerPhone: "+1 (555) 891-2345",
      customerName: "Sarah Jenkins",
      status: "ai", // 'ai' or 'human'
      unread: false,
      lastMessage: "Thank you! What are your opening hours on Saturday?",
      lastTimestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      messages: [
        {
          id: "m1",
          sender: "customer",
          text: "Hi there! Do you have any massage appointments available?",
          timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
          status: "read"
        },
        {
          id: "m2",
          sender: "ai",
          text: "Hello Sarah! Welcome to Glow & Co. Wellness Spa. We offer our Swedish Relaxation Massage ($95 for 60 min) and Deep Tissue Recovery Therapy ($130 for 75 min). What day were you hoping to visit?",
          timestamp: new Date(Date.now() - 1000 * 60 * 19).toISOString(),
          status: "delivered"
        },
        {
          id: "m3",
          sender: "customer",
          text: "Thank you! What are your opening hours on Saturday?",
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          status: "read"
        },
        {
          id: "m4",
          sender: "ai",
          text: "On Saturdays we are open from 10:00 AM to 6:00 PM. Would you like me to note your preferred time for our front desk?",
          timestamp: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
          status: "delivered"
        }
      ]
    },
    {
      id: "conv-2",
      customerPhone: "+1 (555) 432-8765",
      customerName: "Marcus Vance",
      status: "human", // Human handoff active
      unread: true,
      lastMessage: "Can someone check if the couples room is free this evening at 5pm?",
      lastTimestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      messages: [
        {
          id: "m21",
          sender: "customer",
          text: "Hello, I wanted to ask about booking a couples massage for our anniversary.",
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          status: "read"
        },
        {
          id: "m22",
          sender: "ai",
          text: "Happy anniversary! Yes, we have a private deluxe couples sanctuary room. We can pair our Swedish Massage or Deep Tissue therapy for both of you.",
          timestamp: new Date(Date.now() - 1000 * 60 * 29).toISOString(),
          status: "delivered"
        },
        {
          id: "m23",
          sender: "customer",
          text: "Can someone check if the couples room is free this evening at 5pm?",
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          status: "read"
        },
        {
          id: "m24",
          sender: "human",
          text: "Hi Marcus! Taking over from our AI receptionist now. Let me check the therapists' schedule for 5:00 PM right away.",
          timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
          status: "delivered"
        }
      ]
    }
  ]
};

class Database {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error reading db.json, falling back to defaults:', err);
    }
    this.save(defaultData);
    return JSON.parse(JSON.stringify(defaultData));
  }

  save(dataToSave = this.data) {
    try {
      this.data = dataToSave;
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write db.json:', err);
    }
  }

  getBusiness() {
    return this.data.business;
  }

  updateBusiness(updates) {
    this.data.business = {
      ...this.data.business,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data.business;
  }

  getWhatsApp() {
    return this.data.whatsapp;
  }

  updateWhatsApp(updates) {
    this.data.whatsapp = {
      ...this.data.whatsapp,
      ...updates
    };
    this.save();
    return this.data.whatsapp;
  }

  getConversations() {
    return this.data.conversations || [];
  }

  getConversation(id) {
    return (this.data.conversations || []).find(c => c.id === id);
  }

  findConversationByPhone(phone) {
    return (this.data.conversations || []).find(c => c.customerPhone === phone);
  }

  createConversation({ customerPhone, customerName }) {
    const newConv = {
      id: `conv-${Date.now()}`,
      customerPhone,
      customerName: customerName || `Customer (${customerPhone.slice(-4)})`,
      status: "ai",
      unread: true,
      lastMessage: "",
      lastTimestamp: new Date().toISOString(),
      messages: []
    };
    this.data.conversations = [newConv, ...(this.data.conversations || [])];
    this.save();
    return newConv;
  }

  addMessage(convId, { sender, text }) {
    const conv = this.getConversation(convId);
    if (!conv) return null;

    const message = {
      id: `m-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sender, // 'customer' | 'ai' | 'human'
      text,
      timestamp: new Date().toISOString(),
      status: "delivered"
    };

    conv.messages.push(message);
    conv.lastMessage = text;
    conv.lastTimestamp = message.timestamp;
    if (sender === 'customer') {
      conv.unread = true;
    }
    this.save();
    return { conversation: conv, message };
  }

  setConversationStatus(convId, status) {
    const conv = this.getConversation(convId);
    if (!conv) return null;
    conv.status = status; // 'ai' or 'human'
    this.save();
    return conv;
  }

  markConversationRead(convId) {
    const conv = this.getConversation(convId);
    if (conv) {
      conv.unread = false;
      this.save();
    }
    return conv;
  }
}

export const db = new Database();
