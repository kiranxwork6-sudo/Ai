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

// Initial multi-tenant normalized seed data
const defaultData = {
  businesses: [
    {
      id: "biz-default",
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
        { day: "Saturday", open: "10:00 AM", close: "05:00 PM", closed: false },
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],

  whatsapp_connections: [
    {
      id: "conn-mock-default",
      businessId: "biz-default",
      provider: "mock", // 'mock' (sandbox)
      status: "connected",
      phoneNumber: "+1 (555) 019-2831",
      phoneNumberId: "mock_phone_num_id_123",
      wabaId: "mock_waba_id_123",
      statusMessage: "Connected to WhatsApp Sandbox (Test Mode)",
      connectedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "conn-meta-default",
      businessId: "biz-default",
      provider: "meta", // 'meta' (official Meta WhatsApp Business Cloud API)
      status: "disconnected", // Not connected until valid Meta credentials supplied
      phoneNumber: "",
      phoneNumberId: "",
      wabaId: "",
      accessToken: "",
      statusMessage: "Not connected. Enter Meta Phone Number ID & Token to connect.",
      connectedAt: null,
      updatedAt: new Date().toISOString()
    }
  ],

  customers: [
    {
      id: "cust-1",
      businessId: "biz-default",
      phone: "+1 (555) 891-2345",
      name: "Sarah Jenkins",
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "cust-2",
      businessId: "biz-default",
      phone: "+1 (555) 432-8765",
      name: "Marcus Vance",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],

  conversations: [
    {
      id: "conv-1",
      businessId: "biz-default",
      customerId: "cust-1",
      channel: "simulator", // 'simulator' or 'whatsapp_meta'
      status: "ai", // 'ai' or 'human'
      unread: false,
      lastMessage: "Thank you! What are your opening hours on Saturday?",
      lastTimestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString()
    },
    {
      id: "conv-2",
      businessId: "biz-default",
      customerId: "cust-2",
      channel: "whatsapp_meta", // Real Meta WhatsApp channel
      status: "human", // Human handoff active
      unread: true,
      lastMessage: "Can someone check if the couples room is free this evening at 5pm?",
      lastTimestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString()
    }
  ],

  messages: [
    {
      id: "m1",
      conversationId: "conv-1",
      businessId: "biz-default",
      sender: "customer",
      text: "Hi there! Do you have any massage appointments available?",
      timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      status: "read",
      externalMessageId: "wamid_sim_1"
    },
    {
      id: "m2",
      conversationId: "conv-1",
      businessId: "biz-default",
      sender: "ai",
      text: "Hello Sarah! Welcome to Glow & Co. Wellness Spa. We offer our Swedish Relaxation Massage ($95 for 60 min) and Deep Tissue Recovery Therapy ($130 for 75 min). What day were you hoping to visit?",
      timestamp: new Date(Date.now() - 1000 * 60 * 19).toISOString(),
      status: "delivered",
      externalMessageId: "wamid_sim_2"
    },
    {
      id: "m3",
      conversationId: "conv-1",
      businessId: "biz-default",
      sender: "customer",
      text: "Thank you! What are your opening hours on Saturday?",
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      status: "read",
      externalMessageId: "wamid_sim_3"
    },
    {
      id: "m4",
      conversationId: "conv-1",
      businessId: "biz-default",
      sender: "ai",
      text: "On Saturdays we are open from 10:00 AM to 6:00 PM. Would you like me to note your preferred time for our front desk?",
      timestamp: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
      status: "delivered",
      externalMessageId: "wamid_sim_4"
    },
    {
      id: "m21",
      conversationId: "conv-2",
      businessId: "biz-default",
      sender: "customer",
      text: "Hello, I wanted to ask about booking a couples massage for our anniversary.",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      status: "read",
      externalMessageId: "wamid_meta_1"
    },
    {
      id: "m22",
      conversationId: "conv-2",
      businessId: "biz-default",
      sender: "ai",
      text: "Happy anniversary! Yes, we have a private deluxe couples sanctuary room. We can pair our Swedish Massage or Deep Tissue therapy for both of you.",
      timestamp: new Date(Date.now() - 1000 * 60 * 29).toISOString(),
      status: "delivered",
      externalMessageId: "wamid_meta_2"
    },
    {
      id: "m23",
      conversationId: "conv-2",
      businessId: "biz-default",
      sender: "customer",
      text: "Can someone check if the couples room is free this evening at 5pm?",
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      status: "read",
      externalMessageId: "wamid_meta_3"
    },
    {
      id: "m24",
      conversationId: "conv-2",
      businessId: "biz-default",
      sender: "human",
      text: "Hi Marcus! Taking over from our AI receptionist now. Let me check the therapists' schedule for 5:00 PM right away.",
      timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
      status: "delivered",
      externalMessageId: "wamid_meta_4"
    }
  ]
};

class Database {
  constructor() {
    this.data = this.load();
    this.migrateIfNeeded();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return parsed;
      }
    } catch (err) {
      console.error('[Database] Error reading db.json, initializing defaults:', err);
    }
    const fresh = JSON.parse(JSON.stringify(defaultData));
    this.save(fresh);
    return fresh;
  }

  migrateIfNeeded() {
    let modified = false;
    // Migrate from legacy single-tenant format if necessary
    if (!this.data.businesses && this.data.business) {
      console.log('[Database] Migrating legacy schema to multi-tenant models...');
      const legacyBiz = this.data.business;
      const legacyWa = this.data.whatsapp || {};
      const legacyConvs = this.data.conversations || [];

      const bizId = "biz-default";
      this.data.businesses = [{ id: bizId, ...legacyBiz, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }];
      
      this.data.whatsapp_connections = [
        {
          id: `conn-mock-${bizId}`,
          businessId: bizId,
          provider: "mock",
          status: legacyWa.connected ? "connected" : "disconnected",
          phoneNumber: legacyWa.phoneNumber || "+1 (555) 019-2831",
          phoneNumberId: "mock_phone_123",
          wabaId: "mock_waba_123",
          statusMessage: legacyWa.statusMessage || "Connected to WhatsApp Sandbox (Test Mode)",
          connectedAt: legacyWa.connectedAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: `conn-meta-${bizId}`,
          businessId: bizId,
          provider: "meta",
          status: "disconnected",
          phoneNumber: "",
          phoneNumberId: "",
          wabaId: "",
          accessToken: "",
          statusMessage: "Not connected to official Meta Cloud API",
          connectedAt: null,
          updatedAt: new Date().toISOString()
        }
      ];

      this.data.customers = [];
      this.data.messages = [];
      this.data.conversations = [];

      legacyConvs.forEach((conv, idx) => {
        const custId = `cust-${idx + 1}`;
        this.data.customers.push({
          id: custId,
          businessId: bizId,
          phone: conv.customerPhone,
          name: conv.customerName,
          createdAt: conv.lastTimestamp,
          updatedAt: conv.lastTimestamp
        });

        this.data.conversations.push({
          id: conv.id,
          businessId: bizId,
          customerId: custId,
          channel: "simulator",
          status: conv.status || "ai",
          unread: conv.unread || false,
          lastMessage: conv.lastMessage,
          lastTimestamp: conv.lastTimestamp
        });

        (conv.messages || []).forEach(m => {
          this.data.messages.push({
            id: m.id,
            conversationId: conv.id,
            businessId: bizId,
            sender: m.sender,
            text: m.text,
            timestamp: m.timestamp,
            status: m.status || "delivered",
            externalMessageId: `migrated_${m.id}`
          });
        });
      });

      delete this.data.business;
      delete this.data.whatsapp;
      modified = true;
    }

    // Ensure all tables exist
    if (!this.data.businesses) { this.data.businesses = defaultData.businesses; modified = true; }
    if (!this.data.whatsapp_connections) { this.data.whatsapp_connections = defaultData.whatsapp_connections; modified = true; }
    if (!this.data.customers) { this.data.customers = defaultData.customers; modified = true; }
    if (!this.data.conversations) { this.data.conversations = defaultData.conversations; modified = true; }
    if (!this.data.messages) { this.data.messages = defaultData.messages; modified = true; }
    if (!this.data.customer_follow_ups) { this.data.customer_follow_ups = []; modified = true; }
    if (!this.data.webhook_events) { this.data.webhook_events = []; modified = true; }
    if (!this.data.users) { this.data.users = []; modified = true; }
    if (!this.data.business_memberships) { this.data.business_memberships = []; modified = true; }
    for (const business of this.data.businesses) {
      if (!business.status) { business.status = 'active'; modified = true; }
      if (!business.timezone) { business.timezone = 'Asia/Kolkata'; modified = true; }
      if (!business.subscription) { business.subscription = { status: 'trial', trialStartedAt: new Date().toISOString(), trialEndsAt: new Date(Date.now() + 7 * 86400000).toISOString() }; modified = true; }
    }
    for (const connection of this.data.whatsapp_connections) {
      if (connection.provider === 'meta') {
        if (!connection.credentialRef) { connection.credentialRef = connection.accessToken ? 'legacy-db-token-migration-required' : null; modified = true; }
        if (!connection.webhookStatus) { connection.webhookStatus = 'not_verified'; modified = true; }
      }
    }
    for (const customer of this.data.customers) if (!customer.preferredLanguage) { customer.preferredLanguage = 'auto'; modified = true; }
    for (const conversation of this.data.conversations) {
      const legacy = { ai: 'AI_ACTIVE', human: 'HUMAN_ACTIVE' };
      if (legacy[conversation.status]) { conversation.status = legacy[conversation.status]; modified = true; }
      if (!conversation.lastMessageAt) { conversation.lastMessageAt = conversation.lastTimestamp || new Date().toISOString(); modified = true; }
      if (!Object.hasOwn(conversation, 'whatsappAccountId')) { conversation.whatsappAccountId = null; modified = true; }
    }

    if (modified) {
      this.save();
    }
  }

  save(dataToSave = this.data) {
    try {
      this.data = dataToSave;
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Database] Failed to write db.json:', err.message);
    }
  }

  // ==========================================
  // BUSINESSES (Multi-Tenant)
  // ==========================================
  getBusinesses() {
    return this.data.businesses || [];
  }

  getBusiness(businessId = "biz-default") {
    const biz = (this.data.businesses || []).find(b => b.id === businessId);
    return biz || (businessId === 'biz-default' ? (this.data.businesses || [])[0] || defaultData.businesses[0] : null);
  }

  updateBusiness(businessId = "biz-default", updates = {}) {
    const biz = this.getBusiness(businessId);
    if (!biz) return null;

    Object.assign(biz, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return biz;
  }

  getBusinessHours(businessId) {
    const business = this.getBusiness(businessId);
    return business ? { openingHours: business.openingHours || [], timezone: business.timezone || 'Asia/Kolkata' } : null;
  }

  saveBusinessHours(businessId, { openingHours, timezone }) {
    const business = this.getBusiness(businessId);
    if (!business) return null;
    business.openingHours = openingHours;
    business.timezone = timezone;
    business.updatedAt = new Date().toISOString();
    this.save();
    return { openingHours: business.openingHours, timezone: business.timezone };
  }

  findUserByGoogleSubject(googleSubject) {
    return this.data.users.find((user) => user.googleSubject === googleSubject) || null;
  }

  getUser(userId) {
    return this.data.users.find((user) => user.id === userId) || null;
  }

  getMembership(userId, businessId = null) {
    return this.data.business_memberships.find((membership) => membership.userId === userId && (!businessId || membership.businessId === businessId)) || null;
  }

  getPrimaryMembership(userId) {
    return this.data.business_memberships.find((membership) => membership.userId === userId) || null;
  }

  createGoogleUser({ googleSubject, email, name, picture }) {
    const now = new Date().toISOString();
    const user = { id: `usr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, googleSubject, email, name: name || email, picture: picture || null, createdAt: now, updatedAt: now };
    const businessId = `biz-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const business = { id: businessId, name: `${user.name}'s Business`, status: 'active', timezone: 'Asia/Kolkata', openingHours: [], services: [], faqs: [], createdAt: now, updatedAt: now, subscription: { status: 'trial', trialStartedAt: now, trialEndsAt: new Date(Date.now() + 7 * 86400000).toISOString() } };
    const membership = { id: `member-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, userId: user.id, businessId, role: 'OWNER', createdAt: now };
    this.data.users.push(user);
    this.data.businesses.push(business);
    this.data.business_memberships.push(membership);
    this.save();
    return { user, business, membership };
  }

  upsertGoogleUser(profile) {
    const existing = this.findUserByGoogleSubject(profile.googleSubject);
    if (existing) {
      existing.email = profile.email;
      existing.name = profile.name || existing.name;
      existing.picture = profile.picture || existing.picture;
      existing.updatedAt = new Date().toISOString();
      this.save();
      return { user: existing, membership: this.getPrimaryMembership(existing.id), isNew: false };
    }
    return { ...this.createGoogleUser(profile), isNew: true };
  }

  // ==========================================
  // WHATSAPP CONNECTIONS (Multi-Tenant & Multi-Provider)
  // ==========================================
  getWhatsAppConnections(businessId = "biz-default") {
    return (this.data.whatsapp_connections || []).filter(c => c.businessId === businessId);
  }

  getWhatsAppConnection(businessId = "biz-default", provider = "mock") {
    let conn = (this.data.whatsapp_connections || []).find(
      c => c.businessId === businessId && c.provider === provider
    );
    if (!conn) {
      conn = {
        id: `conn-${provider}-${businessId}-${Date.now()}`,
        businessId,
        provider,
        status: "disconnected",
        phoneNumber: "",
        phoneNumberId: "",
        wabaId: "",
        accessToken: "",
        statusMessage: "Not configured",
        connectedAt: null,
        updatedAt: new Date().toISOString()
      };
      this.data.whatsapp_connections.push(conn);
      this.save();
    }
    return conn;
  }

  saveWhatsAppConnection(businessId = "biz-default", provider = "meta", updates = {}) {
    const conn = this.getWhatsAppConnection(businessId, provider);
    Object.assign(conn, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return conn;
  }

  /**
   * Resolve business by Meta's phone_number_id for incoming webhooks
   */
  findBusinessByPhoneNumberId(phoneNumberId) {
    if (!phoneNumberId) return null;
    const cleanId = String(phoneNumberId).trim();
    const conn = (this.data.whatsapp_connections || []).find(
      c => c.provider === "meta" && c.phoneNumberId === cleanId
    );
    if (!conn || conn.status !== 'connected') return null;
    return this.getBusiness(conn.businessId);
  }

  // ==========================================
  // CUSTOMERS (Multi-Tenant)
  // ==========================================
  getCustomers(businessId = "biz-default") {
    return (this.data.customers || []).filter(c => c.businessId === businessId);
  }

  getCustomer(businessId = "biz-default", customerId) {
    return (this.data.customers || []).find(c => c.businessId === businessId && c.id === customerId);
  }

  getOrCreateCustomer(businessId = "biz-default", phone, name) {
    const cleanPhone = phone ? phone.trim() : "";
    let cust = (this.data.customers || []).find(
      c => c.businessId === businessId && c.phone === cleanPhone
    );

    if (!cust) {
      cust = {
        id: `cust-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        businessId,
        phone: cleanPhone,
        name: name || `Customer (${cleanPhone.slice(-4)})`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.data.customers.push(cust);
      this.save();
    } else if (name && cust.name.startsWith("Customer (")) {
      cust.name = name;
      cust.updatedAt = new Date().toISOString();
      this.save();
    }

    return cust;
  }

  // ==========================================
  // CONVERSATIONS & MESSAGES (Multi-Tenant)
  // ==========================================
  getConversations(businessId = "biz-default") {
    const convs = (this.data.conversations || []).filter(c => c.businessId === businessId);
    
    // Join customer details and latest message for UI
    return convs.map(c => {
      const customer = (this.data.customers || []).find(cust => cust.id === c.customerId) || {
        name: "Unknown Customer",
        phone: "Unknown"
      };
      const messages = (this.data.messages || [])
        .filter(m => m.conversationId === c.id && m.businessId === businessId)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      return {
        ...c,
        customerName: customer.name,
        customerPhone: customer.phone,
        messages
      };
    }).sort((a, b) => new Date(b.lastTimestamp || 0) - new Date(a.lastTimestamp || 0));
  }

  getConversation(businessId = "biz-default", convId) {
    const conv = (this.data.conversations || []).find(
      c => c.businessId === businessId && c.id === convId
    );
    if (!conv) return null;

    const customer = (this.data.customers || []).find(cust => cust.id === conv.customerId) || {
      name: "Unknown Customer",
      phone: "Unknown"
    };

    const messages = (this.data.messages || [])
      .filter(m => m.conversationId === conv.id && m.businessId === businessId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    return {
      ...conv,
      customerName: customer.name,
      customerPhone: customer.phone,
      messages
    };
  }

  getOrCreateConversation(businessId = "biz-default", customerId, channel = "simulator", whatsappAccountId = null) {
    let conv = (this.data.conversations || []).find(
      c => c.businessId === businessId && c.customerId === customerId
    );

    if (!conv) {
      conv = {
        id: `conv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        businessId,
        customerId,
        channel, // 'simulator' | 'whatsapp_meta'
        status: "AI_ACTIVE",
        whatsappAccountId,
        unread: true,
        lastMessage: "",
        lastTimestamp: new Date().toISOString()
      };
      this.data.conversations.unshift(conv);
      this.save();
    }

    return conv;
  }

  hasExternalMessageId(businessId = "biz-default", externalMessageId) {
    return Boolean(externalMessageId && this.data.messages.some((m) => m.businessId === businessId && m.externalMessageId === externalMessageId));
  }

  addMessage(businessId = "biz-default", convId, { sender, text, externalMessageId = null, status = 'delivered', messageType = 'text', direction = null }) {
    const conv = (this.data.conversations || []).find(
      c => c.businessId === businessId && c.id === convId
    );
    if (!conv) return null;

    if (externalMessageId && this.hasExternalMessageId(businessId, externalMessageId)) return null;
    const message = {
      id: `m-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      conversationId: convId,
      businessId,
      sender, // 'customer' | 'ai' | 'human' | 'system'
      text,
      timestamp: new Date().toISOString(),
      status,
      externalMessageId,
      messageType,
      direction: direction || (sender === 'customer' ? 'incoming' : sender === 'system' ? 'system' : 'outgoing'),
      createdAt: new Date().toISOString()
    };

    this.data.messages.push(message);
    conv.lastMessage = text;
    conv.lastTimestamp = message.timestamp;
    conv.lastMessageAt = message.timestamp;
    if (sender === "customer") {
      conv.unread = true;
    }
    this.save();

    return {
      conversation: this.getConversation(businessId, convId),
      message
    };
  }

  setConversationStatus(businessId = "biz-default", convId, status) {
    const conv = (this.data.conversations || []).find(
      c => c.businessId === businessId && c.id === convId
    );
    if (!conv) return null;

    const statuses = { ai: 'AI_ACTIVE', human: 'HUMAN_ACTIVE', AI_ACTIVE: 'AI_ACTIVE', NEEDS_HUMAN: 'NEEDS_HUMAN', HUMAN_ACTIVE: 'HUMAN_ACTIVE', CLOSED: 'CLOSED' };
    if (!statuses[status]) return null;
    conv.status = statuses[status];
    this.save();
    return this.getConversation(businessId, convId);
  }

  markConversationRead(businessId = "biz-default", convId) {
    const conv = (this.data.conversations || []).find(
      c => c.businessId === businessId && c.id === convId
    );
    if (conv) {
      conv.unread = false;
      this.save();
    }
    return this.getConversation(businessId, convId);
  }

  updateMessageStatus(businessId, externalMessageId, status, errorCode = null) {
    const message = this.data.messages.find((m) => m.businessId === businessId && m.externalMessageId === externalMessageId);
    if (!message) return null;
    message.status = status;
    if (errorCode) message.errorCode = String(errorCode);
    message.updatedAt = new Date().toISOString();
    this.save();
    return message;
  }

  recordWebhookReceipt(businessId) {
    const connection = this.getWhatsAppConnection(businessId, 'meta');
    connection.lastWebhookReceivedAt = new Date().toISOString();
    connection.webhookStatus = 'active';
    this.save();
  }

  scheduleFollowUp(businessId, followUp) {
    const item = { id: `followup-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, businessId, status: 'scheduled', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...followUp };
    this.data.customer_follow_ups.push(item);
    this.save();
    return item;
  }
}

export const db = new Database();
