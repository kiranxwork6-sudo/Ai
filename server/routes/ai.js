import express from 'express';
import { db } from '../storage/db.js';
import { geminiCustomerReplyService, GeminiServiceError } from '../services/ai/geminiService.js';

const router = express.Router();

// This diagnostic endpoint intentionally does not exist in production builds.
router.post('/test', async (req, res) => {
  if (process.env.NODE_ENV === 'production') return res.sendStatus(404);
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
  if (!message || message.length > 2000) return res.status(400).json({ success: false, error: 'A message up to 2,000 characters is required.' });
  const business = db.getBusiness(req.auth.businessId);
  if (!business) return res.status(404).json({ success: false, error: 'Business not found.' });
  try {
    const response = await geminiCustomerReplyService.generateCustomerReply({
      business,
      conversationHistory: [],
      customerMessage: message,
      customerLanguage: req.body?.customerLanguage || 'auto',
      conversationState: 'AI_ACTIVE'
    });
    res.json({ success: true, response });
  } catch (error) {
    const status = error instanceof GeminiServiceError && error.code === 'MISSING_API_KEY' ? 503 : 502;
    res.status(status).json({ success: false, error: error.message, code: error.code || 'AI_TEST_FAILED' });
  }
});

export default router;
