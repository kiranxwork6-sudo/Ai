import express from 'express';
import { db } from '../storage/db.js';
import { whatsAppService } from '../services/whatsapp/index.js';
import { requireRole } from '../auth.js';

const router = express.Router();

function getBusinessId(req) {
  return req.auth.businessId;
}

// GET /api/conversations
router.get('/', (req, res) => {
  const businessId = getBusinessId(req);
  const conversations = db.getConversations(businessId);
  
  const stats = {
    total: conversations.length,
    unread: conversations.filter(c => c.unread).length,
    aiHandled: conversations.filter(c => c.status === 'AI_ACTIVE').length,
    humanHandled: conversations.filter(c => c.status === 'HUMAN_ACTIVE' || c.status === 'NEEDS_HUMAN').length,
    realMetaCount: conversations.filter(c => c.channel === 'whatsapp_meta').length,
    simulatorCount: conversations.filter(c => c.channel === 'simulator').length
  };

  res.json({
    success: true,
    stats,
    conversations
  });
});

// GET /api/conversations/:id
router.get('/:id', (req, res) => {
  const businessId = getBusinessId(req);
  const conv = db.getConversation(businessId, req.params.id);
  if (!conv) {
    return res.status(404).json({ success: false, error: 'Conversation not found' });
  }

  // Mark as read when opened
  db.markConversationRead(businessId, conv.id);

  res.json({ success: true, conversation: conv });
});

// POST /api/conversations/:id/reply (Human agent replying to customer)
router.post('/:id/reply', requireRole('OWNER', 'STAFF'), async (req, res) => {
  const businessId = getBusinessId(req);
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ success: false, error: 'Reply text cannot be empty' });
  }

  const conv = db.getConversation(businessId, req.params.id);
  if (!conv) {
    return res.status(404).json({ success: false, error: 'Conversation not found' });
  }

  // Deliver first: do not show a message as sent when the provider rejected it.
  let delivery;
  try {
    delivery = await whatsAppService.sendMessage(businessId, {
      to: conv.customerPhone,
      text: text.trim(),
      channel: conv.channel || 'simulator'
    });
  } catch (err) {
    return res.status(502).json({ success: false, error: 'Message could not be delivered. Please try again.' });
  }
  const result = db.addMessage(businessId, conv.id, { sender: 'human', text: text.trim(), externalMessageId: delivery.messageId, status: delivery.status || 'sent', direction: 'outgoing' });

  res.json({
    success: true,
    conversation: db.getConversation(businessId, conv.id),
    message: result.message
  });
});

// PATCH /api/conversations/:id/handoff (Toggle AI vs Human mode)
router.patch('/:id/handoff', requireRole('OWNER', 'STAFF'), (req, res) => {
  const businessId = getBusinessId(req);
  const { status } = req.body; // 'ai' or 'human'
  if (!['ai', 'human', 'AI_ACTIVE', 'NEEDS_HUMAN', 'HUMAN_ACTIVE', 'CLOSED'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid conversation status' });
  }

  const conv = db.setConversationStatus(businessId, req.params.id, status);
  if (!conv) {
    return res.status(404).json({ success: false, error: 'Conversation not found' });
  }

  const noticeText = (status === 'human' || status === 'HUMAN_ACTIVE')
    ? '⚠️ Human staff member took over this conversation. AI responses are paused.'
    : '🤖 Conversation returned to AI Receptionist. Automatic answers resumed.';

  db.addMessage(businessId, conv.id, {
    sender: 'system',
    text: noticeText
  });

  res.json({
    success: true,
    conversation: db.getConversation(businessId, conv.id)
  });
});

export default router;
