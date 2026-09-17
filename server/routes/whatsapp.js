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
