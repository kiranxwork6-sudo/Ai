import crypto from 'crypto';
import session from 'express-session';
import { OAuth2Client } from 'google-auth-library';
import { db } from './storage/db.js';

const SESSION_MAX_AGE = 1000 * 60 * 60 * 24 * 7;
const sessionSecret = process.env.SESSION_SECRET || crypto.randomBytes(48).toString('base64url');
const redirectUri = () => process.env.GOOGLE_REDIRECT_URI || `http://localhost:${process.env.PORT || 3001}/api/auth/google/callback`;
const configured = () => Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.SESSION_SECRET);
const googleClient = () => new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const sessionMiddleware = session({
  name: 'gereply.sid',
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: SESSION_MAX_AGE }
});

export function csrfToken(req) {
  if (!req.session) return null;
  if (!req.session.csrfToken) req.session.csrfToken = crypto.randomBytes(32).toString('base64url');
  return req.session.csrfToken;
}

/** Cookie sessions are authenticated by the browser, so every state-changing API
 * request must prove it originated in the app. Webhooks are deliberately mounted
 * before this middleware and use Meta's HMAC validation instead. */
export function requireCsrf(req, res, next) {
  const token = req.get('x-csrf-token');
  const expected = req.session?.csrfToken;
  if (!expected || typeof token !== 'string' || token.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected))) {
    return res.status(403).json({ success: false, error: 'Invalid CSRF token.' });
  }
  next();
}

export function requireAuth(req, res, next) {
  const userId = req.session?.userId;
  const membership = userId ? db.getPrimaryMembership(userId) : null;
  if (!membership) return res.status(401).json({ success: false, error: 'Authentication required.' });
  const user = db.getUser(userId);
  if (!user) return res.status(401).json({ success: false, error: 'Authentication required.' });
  req.auth = { user, membership, businessId: membership.businessId, role: membership.role };
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => (!req.auth || !roles.includes(req.auth.role)) ? res.status(403).json({ success: false, error: 'Insufficient permissions.' }) : next();
}

export function authRouter(express) {
  const router = express.Router();
  router.get('/google', (req, res) => {
    if (!configured()) return res.status(503).json({ success: false, error: 'Google sign-in is not configured.' });
    const state = crypto.randomBytes(32).toString('base64url');
    req.session.oauthState = crypto.createHash('sha256').update(state).digest('hex');
    req.session.oauthStateExpiresAt = Date.now() + 10 * 60 * 1000;
    const authorizationUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authorizationUrl.search = new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID, redirect_uri: redirectUri(), response_type: 'code', scope: 'openid email profile', state, prompt: 'select_account' }).toString();
    res.redirect(302, authorizationUrl.toString());
  });

  router.get('/google/callback', async (req, res) => {
    if (req.query.error) return res.redirect('/login?auth_error=google_denied');
    const { code, state } = req.query;
    const expectedState = req.session?.oauthState;
    const receivedHash = typeof state === 'string' ? crypto.createHash('sha256').update(state).digest('hex') : '';
    const validState = expectedState && req.session.oauthStateExpiresAt > Date.now() && receivedHash.length === expectedState.length && crypto.timingSafeEqual(Buffer.from(receivedHash), Buffer.from(expectedState));
    delete req.session.oauthState;
    delete req.session.oauthStateExpiresAt;
    if (!configured() || !code || !validState) return res.redirect('/login?auth_error=invalid_state');
    try {
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ code, client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, redirect_uri: redirectUri(), grant_type: 'authorization_code' }) });
      const tokens = await tokenResponse.json();
      if (!tokenResponse.ok || !tokens.id_token) throw new Error('Google token exchange failed');
      const ticket = await googleClient().verifyIdToken({ idToken: tokens.id_token, audience: process.env.GOOGLE_CLIENT_ID });
      const payload = ticket.getPayload();
      if (!payload || !['accounts.google.com', 'https://accounts.google.com'].includes(payload.iss) || !payload.sub || !payload.email || payload.email_verified !== true) throw new Error('Invalid Google identity token');
      const result = db.upsertGoogleUser({ googleSubject: payload.sub, email: payload.email, name: payload.name, picture: payload.picture });
      await new Promise((resolve, reject) => req.session.regenerate((err) => err ? reject(err) : resolve()));
      req.session.userId = result.user.id;
      req.session.createdAt = Date.now();
      req.session.save((err) => err ? res.redirect('/login?auth_error=session') : res.redirect('/dashboard'));
    } catch (err) {
      console.warn('[Auth] Google callback rejected:', err.message);
      res.redirect('/login?auth_error=login_failed');
    }
  });

  router.post('/logout', requireCsrf, (req, res) => req.session?.destroy(() => { res.clearCookie('gereply.sid'); res.status(204).end(); }));
  router.get('/me', requireAuth, (req, res) => res.json({ success: true, csrfToken: csrfToken(req), user: { id: req.auth.user.id, email: req.auth.user.email, name: req.auth.user.name, picture: req.auth.user.picture }, business: { id: req.auth.membership.businessId, role: req.auth.role } }));
  return router;
}
