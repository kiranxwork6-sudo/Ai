import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import businessRouter from './routes/business.js';
import whatsappRouter from './routes/whatsapp.js';
import conversationsRouter from './routes/conversations.js';
import simulatorRouter from './routes/simulator.js';
import webhookRouter from './routes/webhooks.js';
import aiRouter from './routes/ai.js';
import { authRouter, requireAuth, requireCsrf, sessionMiddleware } from './auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy when behind Vercel or reverse proxy
if (process.env.TRUST_PROXY === 'true' || process.env.VERCEL) {
  app.set('trust proxy', 1);
}

// Middlewares
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (process.env.NODE_ENV === 'production') res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// CORS Configuration
const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3001',
  'https://ai-ceynx.vercel.app'
];

const configuredOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)
  : [];

const allowedOrigins = [...new Set([...defaultOrigins, ...configuredOrigins])];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman, same-origin)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow Vercel preview deployments (*.vercel.app)
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'x-hub-signature-256']
}));
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '256kb', verify: (req, _res, buf) => { req.rawBody = Buffer.from(buf); } }));
app.use(sessionMiddleware);

// API Routes
app.use('/api/auth', authRouter(express));
app.use('/api/webhooks/whatsapp', webhookRouter);
app.use('/api', (req, res, next) => ['GET', 'HEAD', 'OPTIONS'].includes(req.method) ? next() : requireCsrf(req, res, next));
app.use('/api/business', requireAuth, businessRouter);
app.use('/api/whatsapp', requireAuth, whatsappRouter);
app.use('/api/conversations', requireAuth, conversationsRouter);
app.use('/api/simulate', requireAuth, simulatorRouter);
app.use('/api/ai', requireAuth, aiRouter);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'gereply-api'
  });
});

// Production static assets serving
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('AI Receptionist Server is running. In dev mode, please access Vite frontend on port 5173.');
    }
  });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🤖 AI Receptionist Backend Server running on port ${PORT}`);
    console.log(`🔗 API Base: http://localhost:${PORT}/api`);
    console.log(`📱 WhatsApp Mode: ${process.env.WHATSAPP_PROVIDER || 'mock'}`);
    console.log(`🧠 AI Engine: ${process.env.GEMINI_API_KEY ? 'Gemini API' : 'Local Knowledge Engine (Zero-Config)'}`);
    console.log(`====================================================`);
  });
}

export default app;
