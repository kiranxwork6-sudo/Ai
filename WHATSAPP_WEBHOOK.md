# WhatsApp Cloud API webhook

Configure Meta with `https://YOUR_DOMAIN/api/webhooks/whatsapp`. The legacy `/api/whatsapp/webhook` remains available only for migration.

Set `META_VERIFY_TOKEN` to a long, randomly generated value in the server environment, then enter exactly that value as Meta's Verify token. Set `META_APP_SECRET` too: POST callbacks are rejected unless their `X-Hub-Signature-256` HMAC validates. Development can only accept unsigned calls if `ALLOW_UNSIGNED_WEBHOOKS=true` is deliberately set; never set it in production.

The endpoint verifies `hub.mode`, `hub.verify_token`, and `hub.challenge` on GET. On POST it checks signature, limits body size and request volume, validates the WhatsApp payload, resolves the tenant only by Meta's `phone_number_id`, records text/status events, and ignores duplicate external message IDs. It returns 200 before AI processing.

Subscribe to `messages` under the WhatsApp Business Account. Test GET verification and a signed POST in a staging deployment before subscribing a production number.
