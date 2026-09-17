import assert from 'node:assert/strict';
import { db } from './storage/db.js';
import { GeminiCustomerReplyService, GeminiServiceError, detectCustomerLanguage } from './services/ai/geminiService.js';

const business = db.getBusiness('biz-default');
const originalKey = process.env.GEMINI_API_KEY;

function fakeService(text) {
  return new GeminiCustomerReplyService({ createClient: () => ({ models: { generateContent: async () => ({ text }) } }) });
}

async function runTests() {
  process.env.GEMINI_API_KEY = 'unit-test-key';
  const reply = await fakeService('Our Swedish Relaxation Massage (60 min) is $95. Would you like to share a preferred day?').generateCustomerReply({ business, conversationHistory: [], customerMessage: 'How much is a massage?', customerLanguage: 'English', conversationState: 'AI_ACTIVE' });
  assert.equal(reply.source, 'gemini', 'successful Gemini response should be returned');
  assert.match(reply.text, /\$95/, 'business price must be retained');

  const instruction = fakeService('Hello').buildSystemInstruction({ business, customerLanguage: 'English' });
  assert.match(instruction, /Glow & Co\. Wellness Spa/, 'Gemini must receive business knowledge');
  assert.match(instruction, /\$95/, 'Gemini must receive configured pricing');

  assert.equal(detectCustomerLanguage('എത്രയാണ് വില?'), 'Malayalam', 'Malayalam must be detected');
  const malayalam = await fakeService('സ്വീഡിഷ് മസാജിന് $95 ആണ്.').generateCustomerReply({ business, customerMessage: 'മസാജിന് എത്രയാണ് വില?', customerLanguage: 'auto', conversationState: 'AI_ACTIVE' });
  assert.equal(malayalam.language, 'Malayalam', 'Malayalam response must preserve detected language');

  const skipped = await fakeService('Should not run').generateCustomerReply({ business, customerMessage: 'Hello', conversationState: 'HUMAN_ACTIVE' });
  assert.deepEqual(skipped, { skipped: true, reason: 'human_handoff', text: null }, 'human handoff must skip Gemini');

  process.env.GEMINI_API_KEY = '';
  await assert.rejects(() => fakeService('Hello').generateCustomerReply({ business, customerMessage: 'Hello' }), (error) => error instanceof GeminiServiceError && error.code === 'MISSING_API_KEY');

  process.env.GEMINI_API_KEY = 'unit-test-key';
  const failing = new GeminiCustomerReplyService({ createClient: () => ({ models: { generateContent: async () => { throw new Error('network'); } } }) });
  await assert.rejects(() => failing.generateCustomerReply({ business, customerMessage: 'Hello' }), (error) => error instanceof GeminiServiceError && error.code === 'GEMINI_FAILURE');

  assert.equal(db.getConversation('another-tenant', 'conv-1'), null, 'conversation lookup must not cross tenant boundaries');
  const duplicateId = db.getConversations('biz-default').flatMap((conversation) => conversation.messages).find((message) => message.externalMessageId)?.externalMessageId;
  assert.ok(duplicateId, 'seed data must include a provider message id');
  assert.equal(db.hasExternalMessageId('biz-default', duplicateId), true, 'duplicate incoming webhook message IDs must be detectable');
  assert.equal(db.hasExternalMessageId('another-tenant', duplicateId), false, 'duplicate detection must be tenant-scoped');
  console.log('Gemini service, handoff, tenant isolation, and idempotency tests passed.');
}

runTests().finally(() => { process.env.GEMINI_API_KEY = originalKey; }).catch((error) => { console.error(error); process.exit(1); });
