# Meta WhatsApp setup

1. Deploy the application to an HTTPS domain.
2. In the Meta app's WhatsApp product, configure callback URL `https://YOUR_DOMAIN/api/webhooks/whatsapp` and the server-side `META_VERIFY_TOKEN` value.
3. Subscribe to `messages`.
4. Store `META_APP_SECRET`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, and `WHATSAPP_BUSINESS_ACCOUNT_ID` only in the deployment secret manager.
5. Register each tenant's `phoneNumberId` and WABA in the database using an authenticated admin provisioning workflow (not a browser header).

This repo deliberately does not collect access tokens in the browser. The current file-backed demo store is not an appropriate production secret store; move credentials to a KMS/secret manager before multi-tenant production use.
