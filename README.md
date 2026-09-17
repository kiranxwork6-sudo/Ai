# AI Receptionist for Small Businesses 🤖📞

A modern SaaS platform that lets small business owners connect their WhatsApp Business number and have an AI receptionist automatically answer customer inquiries 24/7 based on their business profile, hours, pricing, and FAQs — with seamless live human handoff.

---

## 🌟 Key Features

1. **Intuitive Small-Business Dashboard**: Clean, jargon-free overview displaying receptionist health, connection state, total inquiries, resolution rates, and recent activity.
2. **Business Knowledge Base & Onboarding Flow**:
   - Business Name, Tagline, and Description
   - Physical Address & Phone Number
   - Operating Hours for each day of the week
   - Services Catalog with real-time pricing
   - Frequently Asked Questions (FAQs)
   - 1-Click Industry Templates (Wellness Spa, Dental Clinic, Auto Repair Shop)
3. **Prominent "Connect WhatsApp" Hub**:
   - Built-in Mock Sandbox mode with QR code connection simulation.
   - Dedicated connection state badges and real-time status updates.
   - Clearly demarcated sandbox mode with zero false claims of live Meta billing.
4. **Live Conversation Inbox**:
   - Customer conversation threads with message history and delivery receipts.
   - Distinct badges for AI-handled vs Human-handled chats.
5. **Instant Human Handoff (Takeover)**:
   - One-click **"Take Over Conversation"** pauses AI automated answers.
   - Business owner types directly to the customer in real time.
   - One-click **"Return to AI"** resumes the autonomous AI receptionist.
6. **Built-in Customer WhatsApp Simulator**:
   - Interactive mobile preview directly in the dashboard allowing the business owner to test customer questions and watch the AI receptionist respond instantly.
7. **Production Architecture**:
   - Modular WhatsApp provider pattern (`MockWhatsAppProvider` & `MetaWhatsAppProvider`).
   - Grounded AI engine supporting Google Gemini API (`GEMINI_API_KEY`) and an intelligent zero-dependency fallback engine.
   - Environment variables for all credentials and secrets.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Optional: Add `GEMINI_API_KEY` for Google Gemini AI generation. If left blank, the built-in local knowledge engine runs automatically!)*

For Google sign-in, see [GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md). The local authorized redirect URI is `http://localhost:3001/api/auth/google/callback`.

### 3. Run Development Server
```bash
npm run dev
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001`

### 4. Run Automated API Tests
```bash
npm test
```

---

## 📁 Architecture Overview

```
Ai Receptionist/
├── client/                     # Frontend UI (React 18 + Vite + Tailwind CSS)
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx              # App header with live status
│       │   ├── DashboardOverview.jsx   # Metrics, stats, and quick actions
│       │   ├── BusinessSettings.jsx    # Profile, Hours, Services, Pricing, FAQs
│       │   ├── WhatsAppConnectModal.jsx# Connect WhatsApp dialog & QR scanner
│       │   ├── Inbox.jsx               # Live customer conversations & Human Handoff
│       │   └── CustomerSimulator.jsx   # WhatsApp phone simulation widget
│       ├── App.jsx                     # Main shell & state synchronization
│       └── main.jsx                    # React root mount
├── server/                     # Backend API (Node.js + Express)
│   ├── routes/
│   │   ├── business.js         # Business profile, services, and FAQs
│   │   ├── whatsapp.js         # WhatsApp connection and webhook receivers
│   │   ├── conversations.js    # Thread management and human reply endpoints
│   │   └── simulator.js        # Test sandbox message trigger
│   ├── services/
│   │   ├── ai/
│   │   │   └── receptionistEngine.js # Grounded prompt builder & Gemini/local engine
│   │   └── whatsapp/
│   │       ├── mockProvider.js # Simulated WhatsApp provider for testing
│   │       ├── metaProvider.js # Official Meta WhatsApp Business Cloud API
│   │       └── index.js        # Provider switchboard
│   ├── storage/
│   │   └── db.js               # File-backed JSON store with auto-seeding
│   ├── index.js                # Express entrypoint
│   └── test-api.js             # Automated API test suite
├── WHATSAPP_INTEGRATION_GUIDE.md # Production Meta setup instructions
└── package.json
```
