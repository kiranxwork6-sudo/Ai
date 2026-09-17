import express from 'express';
import { db } from '../storage/db.js';
import { receptionistEngine } from '../services/ai/receptionistEngine.js';
import { whatsAppService } from '../services/whatsapp/index.js';
import { metaWhatsAppProvider } from '../services/whatsapp/metaProvider.js';

const router = express.Router();
const MAX_EVENTS_PER_MINUTE = Number(process.env.WHATSAPP_WEBHOOK_RATE_LIMIT || 240);
const rateBuckets = new Map();

function allowedRequest(req) {
  const key = req.ip || 'unknown';
  const now = Date.now();
  const bucket = rateBuckets.get(key) || { startedAt: now, count: 0 };
  if (now - bucket.startedAt > 60_000) { bucket.startedAt = now; bucket.count = 0; }
  bucket.count += 1;
  rateBuckets.set(key, bucket);
  return bucket.count <= MAX_EVENTS_PER_MINUTE;
}

router.get('/', (req, res) => {
  const { ['hub.mode']: mode, ['hub.verify_token']: token, ['hub.challenge']: challenge } = req.query;
  if (typeof challenge !== 'string' || !metaWhatsAppProvider.verifyWebhookChallenge(mode, token, challenge)) return res.sendStatus(403);
  return res.type('text/plain').status(200).send(challenge);
});

router.post('/', (req, res) => {
  if (!allowedRequest(req)) return res.status(429).json({ error: 'Too many requests' });
  const signature = req.get('x-hub-signature-256');
  if (!metaWhatsAppProvider.validateSignature(req.rawBody, signature)) {
    console.warn('[MetaWebhook] Rejected request with invalid signature.');
    return res.sendStatus(401);
  }
  if (!metaWhatsAppProvider.isValidWebhookPayload(req.body)) return res.status(400).json({ error: 'Invalid webhook payload' });

  // Meta expects a fast acknowledgement. Work begins after the safe acceptance response.
  res.sendStatus(200);
  setImmediate(() => processWebhook(req.body).catch((err) => console.error('[MetaWebhook] Processing failed:', err.message)));
});

async function processWebhook(payload) {
  for (const event of metaWhatsAppProvider.getWebhookEvents(payload)) {
    const business = db.findBusinessByPhoneNumberId(event.phoneNumberId);
    if (!business) {
      console.warn(`[MetaWebhook] Ignoring event for unregistered phone_number_id ${event.phoneNumberId || '(missing)'}.`);
      continue;
    }
    db.recordWebhookReceipt(business.id);
    if (event.kind === 'status') {
      db.updateMessageStatus(business.id, event.messageId, event.status, event.errorCode);
      continue;
    }
    if (event.kind !== 'message' || !event.text || !event.messageId) continue;
    if (db.hasExternalMessageId(business.id, event.messageId)) continue;

    const customer = db.getOrCreateCustomer(business.id, event.fromPhone, event.customerName);
    const conversation = db.getOrCreateConversation(business.id, customer.id, 'whatsapp_meta', event.whatsAppAccountId);
    const incoming = db.addMessage(business.id, conversation.id, {
      sender: 'customer', text: event.text, externalMessageId: event.messageId,
      status: 'received', messageType: event.messageType, direction: 'incoming'
    });
    if (!incoming) continue;
    const activeConversation = db.getConversation(business.id, conversation.id);
    if (['HUMAN_ACTIVE', 'NEEDS_HUMAN', 'CLOSED'].includes(activeConversation.status)) continue;

    const reply = await receptionistEngine.generateReply({ businessId: business.id, conversationId: conversation.id, customerMessage: event.text });
    if (reply.requiresHumanHandoff) {
      db.setConversationStatus(business.id, conversation.id, 'NEEDS_HUMAN');
      db.addMessage(business.id, conversation.id, { sender: 'system', text: 'Customer needs human assistance. AI replies are paused.', direction: 'system', messageType: 'system' });
      return;
    }
    const outbound = await whatsAppService.sendWhatsAppText(business.id, { to: event.fromPhone, text: reply.text });
    db.addMessage(business.id, conversation.id, {
      sender: 'ai', text: reply.text, externalMessageId: outbound.messageId,
      status: outbound.status || 'sent', messageType: 'text', direction: 'outgoing'
    });
  }
}

export default router;
