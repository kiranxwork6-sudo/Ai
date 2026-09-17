import express from 'express';
import { db } from '../storage/db.js';
import { receptionistEngine } from '../services/ai/receptionistEngine.js';
import { whatsAppService } from '../services/whatsapp/index.js';

const router = express.Router();

function getBusinessId(req) {
  return req.auth.businessId;
}

/**
 * POST /api/simulate/message
 * Simulates a customer sending a WhatsApp message to the business in sandbox mode.
 * Retains 100% functionality for development and live testing.
 */
router.post('/message', async (req, res) => {
  try {
    const businessId = getBusinessId(req);
    const {
      customerPhone = '+1 (555) 789-0123',
      customerName = 'Test Customer',
      message
    } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Message text is required' });
    }

    const mockStatus = db.getWhatsAppConnection(businessId, "mock");
    if (mockStatus.status !== "connected") {
      return res.status(400).json({
        success: false,
        error: 'WhatsApp Simulator is currently disconnected. Please connect the simulator sandbox first.'
      });
    }

    // 1. Locate or create customer in multi-tenant store
    const customer = db.getOrCreateCustomer(businessId, customerPhone, customerName);

    // 2. Locate or create conversation on 'simulator' channel
    let conv = db.getOrCreateConversation(businessId, customer.id, "simulator");

    // 3. Add customer message
    const customerMsgResult = db.addMessage(businessId, conv.id, {
      sender: "customer",
      text: message.trim(),
      externalMessageId: `wamid_sim_${Date.now()}`
    });

    // 4. Handle human handoff state
    if (['human', 'HUMAN_ACTIVE', 'NEEDS_HUMAN'].includes(conv.status)) {
      return res.json({
        success: true,
        mode: "human_takeover",
        conversation: db.getConversation(businessId, conv.id),
        customerMessage: customerMsgResult.message,
        aiReply: null,
        note: "Human handoff is currently ACTIVE. The AI receptionist did not reply automatically."
      });
    }

    // 5. In 'ai' mode: Generate AI Receptionist reply
    const aiResult = await receptionistEngine.generateReply({
      businessId,
      conversationId: conv.id,
      customerMessage: message.trim()
    });

    // Check if AI triggered human takeover
    if (aiResult.requiresHumanHandoff) {
      db.setConversationStatus(businessId, conv.id, "human");
      db.addMessage(businessId, conv.id, {
        sender: "system",
        text: "⚠️ Customer inquiry flagged for human staff takeover."
      });
    }

    // 6. Store AI reply
    const aiMsgResult = db.addMessage(businessId, conv.id, {
      sender: "ai",
      text: aiResult.text,
      externalMessageId: `wamid_sim_ai_${Date.now()}`
    });

    // 7. Deliver via mock WhatsApp provider
    await whatsAppService.sendMessage(businessId, {
      to: customerPhone,
      text: aiResult.text,
      channel: "simulator"
    });

    return res.json({
      success: true,
      mode: aiResult.requiresHumanHandoff ? "human_handoff_triggered" : "ai_handled",
      source: aiResult.source,
      conversation: db.getConversation(businessId, conv.id),
      customerMessage: customerMsgResult.message,
      aiReply: aiMsgResult.message
    });
  } catch (err) {
    console.error('Simulator error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
