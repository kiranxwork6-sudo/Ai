import express from 'express';
import { db } from '../storage/db.js';
import { whatsAppService } from '../services/whatsapp/index.js';

const router = express.Router();

// GET /api/conversations
router.get('/', (req, res) => {
  const conversations = db.getConversations();
  const stats = {
    total: conversations.length,
    unread: conversations.filter(c => c.unread).length,
    aiHandled: conversations.filter(c => c.status === 'ai').length,
    humanHandled: conversations.filter(c => c.status === 'human').length
  };

  res.json({
    success: true,
    stats,
    conversations
  });
});

// GET /api/conversations/:id
router.get('/:id', (req, res) => {
  const conv = db.getConversation(req.params.id);
  if (!conv) {
    return res.status(404).json({ success: false, error: 'Conversation not found' });
  }

  // Mark as read when opened
  db.markConversationRead(conv.id);

  res.json({ success: true, conversation: conv });
});

// POST /api/conversations/:id/reply (Human agent replying to customer)
router.post('/:id/reply', async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ success: false, error: 'Reply text cannot be empty' });
  }

  const conv = db.getConversation(req.params.id);
  if (!conv) {
    return res.status(404).json({ success: false, error: 'Conversation not found' });
  }

  // Add human message to conversation
  const result = db.addMessage(conv.id, {
    sender: 'human',
    text: text.trim()
  });

  // Also dispatch through WhatsApp provider so real/mock customer receives it
  try {
    await whatsAppService.sendMessage(conv.customerPhone, text.trim());
  } catch (err) {
    console.error(`Failed to send WhatsApp message to ${conv.customerPhone}:`, err.message);
  }

  res.json({
    success: true,
    conversation: conv,
    message: result.message
  });
});

// PATCH /api/conversations/:id/handoff (Toggle AI vs Human mode)
router.patch('/:id/handoff', (req, res) => {
  const { status } = req.body; // 'ai' or 'human'
  if (status !== 'ai' && status !== 'human') {
    return res.status(400).json({ success: false, error: 'Status must be "ai" or "human"' });
  }

  const conv = db.setConversationStatus(req.params.id, status);
  if (!conv) {
    return res.status(404).json({ success: false, error: 'Conversation not found' });
  }

  // Optionally log a system banner message inside the thread
  const noticeText = status === 'human' 
    ? '⚠️ Human staff member took over this conversation. AI responses are paused.'
    : '🤖 Conversation returned to AI Receptionist. Automatic answers resumed.';
    
  db.addMessage(conv.id, {
    sender: 'system',
    text: noticeText
  });

  res.json({ success: true, conversation: conv });
});

export default router;
