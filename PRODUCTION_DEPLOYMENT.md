# Production deployment

Deploy behind HTTPS and set server-only environment variables from `.env.example`. Set `NODE_ENV=production`, `TRUST_PROXY=true` behind a reverse proxy, a long random `SESSION_SECRET`, and an explicit HTTPS `CORS_ORIGIN`. The production callback is `https://YOUR_DOMAIN/api/webhooks/whatsapp`.

Run `npm ci`, `npm run build`, then `npm start`. For local webhook testing, expose port 3001 through a secure tunnel and use the HTTPS tunnel address as the temporary callback URL. Run `npm test` with the API running locally.

The PostgreSQL foundation schema is in `migrations/001_gereply_foundation.sql`. Provision a managed PostgreSQL database, then run `psql "$DATABASE_URL" -f migrations/001_gereply_foundation.sql`. It includes tenant identifiers, uniqueness constraints for webhook idempotency, and row-level-security policies. A PostgreSQL repository is not wired into this MVP yet: Vercel's filesystem and the JSON adapter are not durable, so do not route production traffic until that repository, a real session store, a secret manager/KMS for connection credentials, and a durable worker are deployed.
