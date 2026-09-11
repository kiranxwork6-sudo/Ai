import express from 'express';
import { whatsAppService } from '../services/whatsapp/index.js';
import { db } from '../storage/db.js';
import { receptionistEngine } from '../services/ai/receptionistEngine.js';

const router = express.Router();

// GET /api/whatsapp/status
router.get('/status', async (req, res) => {
  try {
    const status = await whatsAppService.getStatus();
    res.json({ success: true, status });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/whatsapp/connect
router.post('/connect', async (req, res) => {
  try {
    const { phoneNumber } = req.body || {};
    const result = await whatsAppService.connect({ phoneNumber });
    res.json({ success: true, result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/whatsapp/disconnect
router.post('/disconnect', async (req, res) => {
  try {
    const result = await whatsAppService.disconnect();
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/whatsapp/webhook
 * Meta Webhook verification handshake for official WhatsApp Cloud API
 */
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (whatsAppService.activeProvider.verifyWebhookChallenge) {
    const valid = whatsAppService.activeProvider.verifyWebhookChallenge(mode, token, challenge);
    if (valid) {
      console.log('[Meta Webhook] Verification challenge passed!');
      return res.status(200).send(challenge);
    }
  }

  console.warn('[Meta Webhook] Verification token mismatch');
  return res.sendStatus(403);
});

/**
 * POST /api/whatsapp/webhook
 * Meta incoming message webhook receiver for official WhatsApp Cloud API
 */
router.post('/webhook', async (req, res) => {
  // Acknowledge Meta immediately with 200 OK (mandatory for Meta webhooks)
  res.sendStatus(200);

  try {
    if (whatsAppService.activeProvider.name !== 'meta') {
      return;
    }

    const parsed = whatsAppService.activeProvider.parseWebhook(req.body);
    if (!parsed) return;

    const { fromPhone, customerName, text } = parsed;
    console.log(`[Meta Webhook] Incoming message from ${fromPhone}: "${text}"`);

    // Check if conversation exists
    let conv = db.findConversationByPhone(fromPhone);
    if (!conv) {
      conv = db.createConversation({ customerPhone: fromPhone, customerName });
    }

    // Add incoming customer message
    db.addMessage(conv.id, { sender: 'customer', text });

    // If human handoff is not active, AI receptionist responds
    if (conv.status === 'ai') {
      const aiReply = await receptionistEngine.generateReply({
        conversationId: conv.id,
        customerMessage: text
      });

      // Save AI reply to history
      db.addMessage(conv.id, { sender: 'ai', text: aiReply.text });

      // Send reply via WhatsApp
      await whatsAppService.sendMessage(fromPhone, aiReply.text);
      console.log(`[Meta Webhook] AI auto-replied to ${fromPhone}`);
    } else {
      console.log(`[Meta Webhook] Conversation ${conv.id} is in HUMAN mode. AI reply suppressed.`);
    }
  } catch (err) {
    console.error('[Meta Webhook] Error processing incoming payload:', err);
  }
});

export default router;
