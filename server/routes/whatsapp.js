import express from 'express';
import { whatsAppService } from '../services/whatsapp/index.js';
import { requireRole } from '../auth.js';

const router = express.Router();
function getBusinessId(req) { return req.auth.businessId; }

router.get('/status', async (req, res) => {
  try { res.json({ success: true, status: await whatsAppService.getStatus(getBusinessId(req)) }); }
  catch { res.status(500).json({ success: false, error: 'Unable to load WhatsApp status.' }); }
});
router.post('/connect-mock', requireRole('OWNER'), async (req, res) => {
  try { res.json({ success: true, result: await whatsAppService.connectMock(getBusinessId(req), { phoneNumber: String(req.body?.phoneNumber || '').slice(0, 32) }) }); }
  catch (err) { res.status(400).json({ success: false, error: err.message }); }
});
// Compatibility alias for the existing simulator UI; this never connects real WhatsApp.
router.post('/connect', requireRole('OWNER'), async (req, res) => {
  try { res.json({ success: true, result: await whatsAppService.connectMock(getBusinessId(req), { phoneNumber: String(req.body?.phoneNumber || '').slice(0, 32) }) }); }
  catch (err) { res.status(400).json({ success: false, error: err.message }); }
});
router.post('/disconnect', requireRole('OWNER'), async (req, res) => {
  try { res.json({ success: true, result: await whatsAppService.disconnect(getBusinessId(req), req.body?.provider === 'meta' ? 'meta' : 'mock') }); }
  catch { res.status(500).json({ success: false, error: 'Unable to disconnect WhatsApp.' }); }
});

// Meta Embedded Signup: Authorization Code Exchange
router.post('/embedded-signup', requireRole('OWNER'), async (req, res) => {
  try {
    const businessId = getBusinessId(req);
    const { code, wabaId, phoneNumberId } = req.body;

    // Validate request
    if (!code || typeof code !== 'string' || code.length > 512) {
      return res.status(400).json({ success: false, error: 'Valid authorization code is required.' });
    }
    if (!wabaId || typeof wabaId !== 'string' || !/^\d+$/.test(wabaId)) {
      return res.status(400).json({ success: false, error: 'Valid WABA ID is required.' });
    }
    if (!phoneNumberId || typeof phoneNumberId !== 'string' || !/^\d+$/.test(phoneNumberId)) {
      return res.status(400).json({ success: false, error: 'Valid Phone Number ID is required.' });
    }

    // Exchange authorization code for access token
    const result = await whatsAppService.exchangeEmbeddedSignupCode(businessId, {
      code,
      wabaId,
      phoneNumberId
    });

    res.json({
      success: true,
      provider: 'meta',
      status: 'connected',
      displayPhoneNumber: result.displayPhoneNumber,
      verifiedName: result.verifiedName,
      wabaId: result.wabaId,
      phoneNumberId: result.phoneNumberId
    });
  } catch (err) {
    console.error('[EmbeddedSignup] Error:', err.message);
    res.status(400).json({ success: false, error: err.message });
  }
});

// Official Meta Cloud API onboarding callback/credential handoff. This endpoint
// never returns a token and is intentionally distinct from the sandbox route.
router.post('/meta/connect', requireRole('OWNER'), async (req, res) => {
  try {
    const result = await whatsAppService.connectMeta(getBusinessId(req), req.body || {});
    res.json({ success: true, result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});
export default router;
