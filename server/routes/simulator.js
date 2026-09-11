import express from 'express';
import { db } from '../storage/db.js';
import { receptionistEngine } from '../services/ai/receptionistEngine.js';
import { whatsAppService } from '../services/whatsapp/index.js';

const router = express.Router();

/**
 * POST /api/simulate/message
 * Simulates a customer sending a WhatsApp message to the business number.
 * Used by the interactive test sandbox widget on the dashboard.
 */
router.post('/message', async (req, res) => {
  try {
    const {
      customerPhone = '+1 (555) 789-0123',
      customerName = 'Test Customer',
      message
    } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Message text is required' });
    }

    const whatsappStatus = db.getWhatsApp();
    if (!whatsappStatus.connected) {
      return res.status(400).json({
        success: false,
        error: 'WhatsApp is currently disconnected. Please connect WhatsApp first.'
      });
    }

    // 1. Locate or create conversation
    let conv = db.findConversationByPhone(customerPhone);
    if (!conv) {
      conv = db.createConversation({ customerPhone, customerName });
    }

    // 2. Add customer message
    const customerMsgResult = db.addMessage(conv.id, {
      sender: 'customer',
      text: message.trim()
    });

    // 3. Handle response based on handoff mode
    if (conv.status === 'human') {
      return res.json({
        success: true,
        mode: 'human_takeover',
        conversation: db.getConversation(conv.id),
        customerMessage: customerMsgResult.message,
        aiReply: null,
        note: 'Human handoff is currently ACTIVE. The AI receptionist did not reply automatically.'
      });
    }

    // 4. In 'ai' mode: Generate AI Receptionist reply
    const aiResult = await receptionistEngine.generateReply({
      conversationId: conv.id,
      customerMessage: message.trim()
    });

    // 5. Store AI reply
    const aiMsgResult = db.addMessage(conv.id, {
      sender: 'ai',
      text: aiResult.text
    });

    // 6. Deliver via WhatsApp provider
    await whatsAppService.sendMessage(customerPhone, aiResult.text);

    return res.json({
      success: true,
      mode: 'ai_handled',
      source: aiResult.source,
      conversation: db.getConversation(conv.id),
      customerMessage: customerMsgResult.message,
      aiReply: aiMsgResult.message
    });
  } catch (err) {
    console.error('Simulator error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
