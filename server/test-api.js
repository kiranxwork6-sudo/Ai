import assert from 'node:assert/strict';
import crypto from 'node:crypto';

const baseUrl = process.env.BASE_URL || 'http://localhost:3001/api';

async function request(path, options) {
  return fetch(`${baseUrl}${path}`, { redirect: 'manual', ...options });
}

async function runTests() {
  const health = await request('/health');
  assert.equal(health.status, 200, 'health endpoint should be public');

  const me = await request('/auth/me');
  assert.equal(me.status, 401, '/auth/me must reject a missing session');

  const protectedBusiness = await request('/business');
  assert.equal(protectedBusiness.status, 401, 'dashboard business data must require authentication');

  const callback = await request('/auth/google/callback');
  assert.equal(callback.status, 302, 'OAuth callback route must be registered');
  assert.equal(callback.headers.get('location'), '/?auth_error=invalid_state', 'missing OAuth state must fail safely');

  const logout = await request('/auth/logout', { method: 'POST' });
  assert.equal(logout.status, 403, 'logout must reject a request without a CSRF token');

  const webhookVerification = await request('/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=verify-token&hub.challenge=challenge-123');
  if (process.env.META_VERIFY_TOKEN === 'verify-token') {
    assert.equal(webhookVerification.status, 200, 'valid Meta webhook verification must succeed');
    assert.equal(await webhookVerification.text(), 'challenge-123');
  }

  const webhookPayload = JSON.stringify({ object: 'whatsapp_business_account', entry: [] });
  const invalidWebhook = await request('/webhooks/whatsapp', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-hub-signature-256': 'sha256=bad' }, body: webhookPayload });
  assert.equal(invalidWebhook.status, 401, 'unsigned or invalid Meta webhook must be rejected');

  if (process.env.META_APP_SECRET === 'test-app-secret') {
    const signature = crypto.createHmac('sha256', process.env.META_APP_SECRET).update(webhookPayload).digest('hex');
    const validWebhook = await request('/webhooks/whatsapp', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-hub-signature-256': `sha256=${signature}` }, body: webhookPayload });
    assert.equal(validWebhook.status, 200, 'signed Meta webhook must be acknowledged');
  }

  console.log('Authentication, CSRF, and webhook protection tests passed.');
}

runTests().catch((error) => { console.error(error); process.exit(1); });
