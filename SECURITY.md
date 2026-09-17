# Security review

Implemented: Google ID-token validation with OAuth state protection, session regeneration at login, HTTP-only cookies, CSRF validation on browser mutations, OWNER/STAFF authorization, signed webhook validation using raw request bytes, timing-safe HMAC comparison, body limits, rate limiting, safe errors, secure response headers, strict unknown-number rejection, and per-business message lookups. Meta webhooks are excluded from CSRF only because they require a valid Meta HMAC signature.

Required before a public multi-tenant launch: wire the PostgreSQL migration and repository in place of `data/db.json`; replace Express's in-memory session store with Redis or equivalent; use a secret manager/KMS for tenant tokens; add a durable queue/worker, persistent rate limiting, audit-log writes, content and upload controls, and centralized monitoring. Do not expose the current development API publicly as a SaaS until these items are complete.
