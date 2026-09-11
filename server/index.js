import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import businessRouter from './routes/business.js';
import whatsappRouter from './routes/whatsapp.js';
import conversationsRouter from './routes/conversations.js';
import simulatorRouter from './routes/simulator.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/business', businessRouter);
app.use('/api/whatsapp', whatsappRouter);
app.use('/api/conversations', conversationsRouter);
app.use('/api/simulate', simulatorRouter);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'AI Receptionist API',
    time: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
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
