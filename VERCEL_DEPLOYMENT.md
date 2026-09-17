# Gereply - Vercel Production Deployment Guide

**Status**: ✅ Ready for Vercel Deployment  
**Date**: 2026-09-17

---

## 📋 Overview

Gereply is now configured for production deployment on Vercel. The application consists of:
- **Frontend**: React + Vite SPA (builds to `dist/`)
- **Backend**: Express API (runs as Vercel serverless functions via `api/index.js`)

---

## 🏗️ Architecture

### Frontend Entry Point
- **Source**: `src/main.jsx` → `src/App.jsx`
- **Build Command**: `npm run build`
- **Output Directory**: `dist/`
- **Routing**: Client-side routing via `react-router-dom` (`/`, `/login`, `/dashboard`)

### Backend Entry Point
- **Source**: `server/index.js`
- **Serverless Wrapper**: `api/index.js` (imports and exports Express app)
- **Local Development**: `npm run server` (runs on port 3001)
- **Vercel**: Runs as serverless function, skips `app.listen()` when `process.env.VERCEL` is set

### API Routes (All Preserved)
```
GET  /api/health
GET  /api/auth/google
GET  /api/auth/google/callback
GET  /api/auth/me
POST /api/auth/logout
GET  /api/webhooks/whatsapp
POST /api/webhooks/whatsapp
GET  /api/business
GET  /api/business/hours
PUT  /api/business/hours
PUT  /api/business
POST /api/business/template/:type
GET  /api/whatsapp/status
POST /api/whatsapp/connect-mock
POST /api/whatsapp/connect
POST /api/whatsapp/disconnect
POST /api/whatsapp/meta/connect
GET  /api/conversations
GET  /api/conversations/:id
POST /api/conversations/:id/reply
PATCH /api/conversations/:id/handoff
POST /api/simulate/message
POST /api/ai/test (dev only)
```

---

## 🔧 Vercel Configuration

### `vercel.json`
```json
{
  "version": 2,
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index.js"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    },
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### `api/index.js`
```javascript
import app from '../server/index.js';

export default app;
```

---

## 🌐 CORS Configuration

**Configured Origins**:
- `http://localhost:5173` (local Vite dev)
- `http://localhost:3000`
- `http://localhost:3001`
- `https://ai-ceynx.vercel.app` (production)
- All `*.vercel.app` preview deployments
- Additional origins via `CORS_ORIGIN` environment variable

**Credentials**: Enabled (`credentials: true`) for cookie-based sessions

---

## 🔐 Required Vercel Environment Variables

### Essential (Required for Auth)
```bash
NODE_ENV=production
TRUST_PROXY=true
SESSION_SECRET=<generate-with-openssl-rand-base64-48>
GOOGLE_CLIENT_ID=<your-google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<your-google-oauth-client-secret>
GOOGLE_REDIRECT_URI=https://YOUR-DOMAIN.vercel.app/api/auth/google/callback
```

### AI Configuration (Server-side only)
```bash
GEMINI_API_KEY=<your-gemini-api-key>
GEMINI_MODEL=gemini-2.0-flash-exp
GEMINI_SUPPORTED_LANGUAGES=English,Malayalam
```

### WhatsApp Configuration
```bash
WHATSAPP_PROVIDER=mock
# For production Meta WhatsApp API:
# WHATSAPP_PROVIDER=meta
# META_APP_ID=<your-meta-app-id>
# META_APP_SECRET=<your-meta-app-secret>
# META_VERIFY_TOKEN=<your-verify-token>
# WHATSAPP_ACCESS_TOKEN=<your-whatsapp-token>
# WHATSAPP_PHONE_NUMBER_ID=<your-phone-number-id>
# WHATSAPP_BUSINESS_ACCOUNT_ID=<your-business-account-id>
```

### Optional
```bash
CORS_ORIGIN=https://your-custom-domain.com
JSON_BODY_LIMIT=256kb
WHATSAPP_WEBHOOK_RATE_LIMIT=240
```

### Frontend (Optional)
```bash
# Only needed if deploying frontend and backend separately
# VITE_API_URL=https://your-backend.vercel.app
```

**⚠️ IMPORTANT**: 
- Never set `VITE_API_URL` if deploying as a single Vercel project
- Never prefix server secrets with `VITE_` (they would be exposed to the browser)

---

## 🔑 Google OAuth Production Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI:
   ```
   https://YOUR-DOMAIN.vercel.app/api/auth/google/callback
   ```
4. Set environment variables in Vercel:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI`

---

## 🍪 Session Configuration

**Current Setup**:
- Cookie name: `gereply.sid`
- HTTP-only: ✅ Yes
- Secure: ✅ Yes (when `NODE_ENV=production`)
- SameSite: `lax` (supports OAuth redirects)
- Max Age: 7 days
- Trust Proxy: ✅ Enabled for Vercel

**Authentication Flow**:
1. User clicks "Continue with Google" → `/api/auth/google`
2. Google redirects to `/api/auth/google/callback`
3. Backend verifies ID token and creates session
4. Redirects to `/dashboard` (success) or `/login?auth_error=...` (failure)

---

## 📱 WhatsApp Webhook Configuration

**Webhook URL** (for Meta production):
```
https://YOUR-DOMAIN.vercel.app/api/webhooks/whatsapp
```

**Security**:
- ✅ GET verification challenge (Meta webhook validation)
- ✅ POST signature validation (HMAC SHA-256)
- ✅ Rate limiting (240 requests/minute)
- ✅ Request size limits (256kb)
- ✅ Message idempotency
- ✅ Multi-tenant isolation

**Current Mode**: `mock` (sandbox testing without Meta credentials)

---

## 🤖 Gemini AI Configuration

**Current Setup**:
- Model: `gemini-2.0-flash-exp`
- Server-side only (never exposed to browser)
- Languages: English, Malayalam (auto-detected)
- Safety validations: price verification, address verification, no hallucinated availability

**⚠️ Security**: `GEMINI_API_KEY` must NEVER be prefixed with `VITE_` or exposed to frontend

---

## 💾 Database / Storage

**Current Implementation**:
- **Local Development**: `data/db.json` (persistent file storage)
- **Vercel Production**: In-memory fallback using `os.tmpdir()` (ephemeral)

**⚠️ PRODUCTION LIMITATION**:
The current file-based storage (`server/storage/db.js`) is **NOT production-ready** on Vercel because:
- Serverless functions are stateless
- `/tmp` storage is ephemeral and not shared across instances
- Data will NOT persist across deployments or function instances

**✅ RECOMMENDED SOLUTION**:
Migrate to a persistent database before production launch:
- **Supabase** (PostgreSQL + Auth + Real-time)
- **Neon** (Serverless PostgreSQL)
- **Vercel Postgres**
- **PlanetScale** (MySQL)

Set `DATABASE_URL` in Vercel environment variables after migration.

---

## 🧪 Build Verification

**Status**: ✅ Build Successful

```bash
npm run build
```

**Output**:
```
✓ 1612 modules transformed
✓ built in 6.78s

dist/index.html                   0.77 kB
dist/assets/index-bp1vTtno.css   28.86 kB
dist/assets/index-B7ICXGiY.js   566.51 kB
```

**Local Testing**:
```bash
# Start both frontend and backend
npm run dev

# Frontend: http://localhost:5173
# Backend:  http://localhost:3001
```

---

## 🔒 Security Check

**✅ No Secrets Exposed**:
- All sensitive credentials use `process.env.*`
- No hardcoded API keys, tokens, or secrets found in codebase
- `.env.example` contains only placeholder variables
- `.gitignore` excludes `.env` files

**Security Headers** (configured in `server/index.js`):
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security` (production only)
- `X-Powered-By` removed

---

## 🚀 Deployment Steps

### Option 1: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (first time)
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name? gereply
# - Directory? ./
# - Override settings? No

# Deploy to production
vercel --prod
```

### Option 2: Deploy via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import Git repository
3. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add environment variables (see "Required Vercel Environment Variables" section)
5. Deploy

### Post-Deployment

1. **Update Google OAuth**:
   - Add production callback URL to Google Console
   - Update `GOOGLE_REDIRECT_URI` in Vercel

2. **Update CORS**:
   - Add production domain to `CORS_ORIGIN` if using custom domain

3. **Test Authentication**:
   - Visit `https://YOUR-DOMAIN.vercel.app`
   - Click "Continue with Google"
   - Verify redirect to `/dashboard` after login

4. **Test API Health**:
   ```bash
   curl https://YOUR-DOMAIN.vercel.app/api/health
   # Should return: {"ok":true,"service":"gereply-api"}
   ```

---

## 📝 Frontend API URL Configuration

**Same-Origin Deployment** (Recommended):
- Frontend and backend deployed as single Vercel project
- API calls use relative URLs (`/api/...`)
- No `VITE_API_URL` needed
- Session cookies work automatically

**Separate Deployment** (Advanced):
- Frontend on `https://frontend.vercel.app`
- Backend on `https://backend.vercel.app`
- Set `VITE_API_URL=https://backend.vercel.app` in frontend
- Update `CORS_ORIGIN` on backend to include frontend URL

---

## ⚠️ Known Limitations

1. **Database Storage**: File-based storage is not production-ready on Vercel (ephemeral)
   - **Impact**: Data will reset on each deployment and not persist across serverless instances
   - **Solution**: Migrate to PostgreSQL/Supabase before production launch

2. **Bundle Size**: Main JS bundle is 566 KB (exceeds recommended 500 KB)
   - **Impact**: Slightly slower initial page load
   - **Solution**: Implement code splitting with dynamic imports (optional optimization)

---

## 🎯 Remaining Blockers

**Before Production Launch**:

1. ✅ **Frontend**: Ready for deployment
2. ✅ **Backend**: Ready for deployment (serverless-compatible)
3. ✅ **API Routes**: All routes preserved and functional
4. ✅ **CORS**: Configured for local and production
5. ✅ **Google OAuth**: Configuration documented
6. ✅ **Session Cookies**: Secure, HTTP-only, production-ready
7. ✅ **Security**: No exposed secrets, all headers configured
8. ✅ **Build**: Successful
9. ⚠️ **Database**: Requires PostgreSQL migration for persistent data
10. ✅ **WhatsApp Webhook**: Security validated, production-ready structure

**Status**: Deploy-ready for MVP/staging. Database migration required for production.

---

## 📞 Support

- Review `GOOGLE_OAUTH_SETUP.md` for detailed Google OAuth setup
- Review `META_WHATSAPP_SETUP.md` for Meta WhatsApp Business API setup
- Review `SECURITY.md` for security best practices
- Review `PRODUCTION_DEPLOYMENT.md` for additional deployment guidance

---

**Generated**: 2026-09-17  
**Prepared For**: Vercel Production Deployment
