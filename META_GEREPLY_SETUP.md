# Gereply Meta WhatsApp Architecture

This is the single source of truth for Gereply's official Meta WhatsApp Business Platform integration.

## Architecture

Gereply is a multi-tenant SaaS. A signed-in business connects its own WhatsApp Business Account (WABA) and business phone number through Meta Embedded Signup. Gereply stores that connection under the authenticated Gereply business, resolves incoming webhooks by the connected phone number ID, and sends replies using that connection's credential.

The simulator is separate. It uses the mock provider and never represents a real Meta connection.

```text
Gereply session
  -> Connect WhatsApp
  -> Meta Embedded Signup
  -> short-lived authorization code
  -> server-side Meta code exchange
  -> server-side credential validation
  -> tenant-scoped WhatsApp connection
  -> phone_number_id webhook lookup
  -> tenant knowledge and Gemini
  -> tenant connection sends the reply
```

## Configuration Map

| Meta value | Example | Secret? | Scope | Where used |
|---|---|---|---|---|
| Meta App ID | `230831096602291` | No | Global | `VITE_META_APP_ID` for the SDK and `META_APP_ID` on the server |
| Meta App Secret | hidden | YES | Global | Server-side authorization-code exchange and webhook HMAC |
| Embedded Signup Config ID | `1737194977391820` | No | Global | `VITE_META_EMBEDDED_SIGNUP_CONFIG_ID` and server configuration validation |
| Graph API version | `v21.0` | No | Global | Server-side Graph API requests |
| Verify token | hidden | YES | Global | `META_VERIFY_TOKEN` for webhook GET verification |
| System User access token | hidden | YES | Global/server | `META_SYSTEM_USER_ACCESS_TOKEN`; reserved for server-side platform operations |
| Meta Business ID | customer-specific | No | Per customer | Connection metadata when returned by Meta |
| WABA ID | customer-specific | No | Per customer | `whatsapp_connections.wabaId` |
| Phone Number ID | customer-specific | No | Per customer | `whatsapp_connections.phoneNumberId` and webhook routing |
| Customer WhatsApp credential | hidden | YES | Per customer | Stored server-side with the tenant connection; never sent to the browser |
| Gemini API key | hidden | YES | Global | Server-side Gemini service only |

These identifiers must never be substituted for one another. In particular, the App ID is not the Config ID, WABA ID, Phone Number ID, Verify Token, or System User token.

## Environment Variables

### Server-only variables

```text
APP_BASE_URL=
META_APP_ID=
META_APP_SECRET=
META_VERIFY_TOKEN=
META_EMBEDDED_SIGNUP_CONFIG_ID=
META_GRAPH_API_VERSION=v21.0
META_SYSTEM_USER_ACCESS_TOKEN=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
SESSION_SECRET=
GEMINI_API_KEY=
GEMINI_MODEL=
DATABASE_URL=
```

### Public Vite build variables

```text
VITE_META_APP_ID=
VITE_META_EMBEDDED_SIGNUP_CONFIG_ID=
VITE_API_URL=
```

Only the two `VITE_META_*` values may contain Meta configuration. Never use a `VITE_` prefix for app secrets, tokens, Gemini credentials, sessions, or database credentials.

Customer WABA IDs and phone number IDs do not belong in environment variables. Legacy names such as `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_BUSINESS_ACCOUNT_ID`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_API_TOKEN`, `WHATSAPP_VERIFY_TOKEN`, and `WHATSAPP_APP_SECRET` are not part of the Gereply architecture.

## A. Meta Developer Account

**What:** The Meta developer account used to manage the application.

**Where:** Create or access it at the Meta for Developers portal.

**Gereply:** The account owns the Gereply Meta App and its products.

**Secret/public:** Account credentials are private and never enter the repository.

**Scope:** Global.

## B. Meta Business Portfolio

**What:** The verified business portfolio that owns Gereply's Meta app and tech-provider relationship.

**Where:** Meta Business Settings and the Meta app's business association.

**Gereply:** Select the portfolio that will operate the tech-provider integration.

**Secret/public:** Business identifiers are not secrets; administrator credentials are private.

**Scope:** Global for Gereply.

## C. Meta App

**What:** Gereply's Meta Developer application.

**Where:** App Dashboard, App Settings, Basic.

**Gereply:** `META_APP_ID` on the server and `VITE_META_APP_ID` in the frontend build.

**Secret/public:** App ID public; App Secret server-only.

**Scope:** Global.

## D. WhatsApp product and use case

**What:** The official WhatsApp Business Platform / Cloud API product attached to the app.

**Where:** Meta App Dashboard product setup.

**Gereply:** Enables Embedded Signup, WABA management, messages, and webhooks.

**Secret/public:** Product settings are not credentials; tokens remain private.

**Scope:** Global app capability, with accounts and numbers per customer.

## E. Tech Provider setup

**What:** Meta's configuration for a provider onboarding other businesses.

**Where:** WhatsApp Business Platform and Tech Provider configuration screens.

**Gereply:** The selected configuration produces the Embedded Signup Config ID.

**Secret/public:** Config ID public; provider account access is private.

**Scope:** Global.

## F. Business Verification

**What:** Meta verification of the business that operates the provider app.

**Where:** Meta Business Manager / Business Support Home.

**Gereply:** Required before production onboarding of external businesses.

**Secret/public:** Verification documents are private.

**Scope:** Global.

## G. Facebook Login for Business

**What:** The Meta login product used by Embedded Signup.

**Where:** Add and configure Facebook Login for Business in the Meta App Dashboard.

**Gereply:** The frontend calls `FB.init({ appId })` and `FB.login({ config_id })`.

**Secret/public:** App ID and Config ID public; App Secret server-only.

**Scope:** Global.

## H. Embedded Signup Configuration

**What:** The configuration defining the onboarding experience, including ES version and session info behavior.

**Where:** Facebook Login for Business / Tech Provider configuration.

**Gereply:** `VITE_META_EMBEDDED_SIGNUP_CONFIG_ID` is passed as `config_id`; the frontend requests ES version `v4` and Session Info Version `3`.

**Secret/public:** Config ID public.

**Scope:** Global.

## I. App Domains

**What:** Domains allowed to host Gereply and the SDK flow.

**Where:** Meta App Settings, Basic and Facebook Login for Business settings.

**Gereply:** Add `gereply.vercel.app` and any approved local/staging host required for testing.

**Secret/public:** Public domain configuration.

**Scope:** Global.

## J. OAuth redirect URLs

**What:** URLs allowed by Meta for the login flow.

**Where:** Facebook Login for Business valid OAuth redirect URI settings.

**Gereply:** Must match the deployed onboarding flow and the production domain exactly. This repository uses the JavaScript SDK code response; no secret redirect URI is placed in the frontend.

**Secret/public:** URLs public.

**Scope:** Global deployment configuration.

## K. JavaScript SDK

**What:** Meta's browser SDK used only to launch the login/onboarding dialog.

**Where:** Loaded from `connect.facebook.net` by `WhatsAppConnectModal`.

**Gereply:** `FB.init` receives the App ID, never the Config ID. `FB.login` receives the Config ID, never the App ID.

**Secret/public:** Public SDK and public IDs only.

**Scope:** Global.

## L. System User

**What:** A Meta business-system identity for server-side operations that are not customer-specific onboarding credentials.

**Where:** Meta Business Settings, Users, System Users.

**Gereply:** Record its existence in deployment configuration; do not use it as a substitute for each customer's Embedded Signup credential.

**Secret/public:** Identity may be visible; token is secret.

**Scope:** Global/server.

## M. System User token

**What:** A server-side token issued to the system user with only the permissions required by the provider integration.

**Where:** Meta Business Settings after assigning the required assets and permissions.

**Gereply:** `META_SYSTEM_USER_ACCESS_TOKEN`. It must never be a Vite variable, browser value, log value, or API response.

**Secret/public:** YES, server-only.

**Scope:** Global/server, unless Meta requires a customer-specific credential for an operation.

## N. Webhook

**What:** The HTTPS endpoint receiving Meta WhatsApp events.

**Where:** WhatsApp product configuration in the Meta App Dashboard.

**Gereply:** `https://gereply.vercel.app/api/webhooks/whatsapp`.

**Secret/public:** Callback URL public; verify token and App Secret private.

**Scope:** Global endpoint, tenant resolution per event.

## O. Verify token

**What:** A random string chosen by Gereply for Meta's GET webhook handshake.

**Where:** Set identically in Meta webhook settings and server `META_VERIFY_TOKEN`.

**Gereply:** Used only by webhook GET verification. It is not any Meta ID or access token.

**Secret/public:** YES, server-side configuration.

**Scope:** Global.

## P. messages subscription

**What:** The webhook field carrying incoming messages and delivery statuses.

**Where:** Subscribe the app/WABA in Meta's WhatsApp configuration; Embedded Signup also requests WABA subscription server-side.

**Gereply:** `webhooks.js` accepts only validated WhatsApp payloads and resolves by stored phone number ID.

**Secret/public:** Subscription setting public; credentials private.

**Scope:** App/WABA configuration, with events resolved per customer.

## Q. App Review

**What:** Meta approval for permissions and production use with external businesses.

**Where:** App Dashboard App Review.

**Gereply:** Request only the permissions required for WABA management, messaging, and webhook operations.

**Secret/public:** Review material is private to Meta.

**Scope:** Global.

## R. Production / Live mode

**What:** The app state that permits production customers outside app roles.

**Where:** Meta App Dashboard.

**Gereply:** Complete verification, review, privacy/legal requirements, and publish before customer onboarding.

**Secret/public:** Status is public; credentials remain private.

**Scope:** Global.

## S. Embedded Signup testing

**What:** Test the onboarding flow with Meta-approved testers and test resources.

**Where:** Meta App roles, test WABA/number resources, and a staging deployment.

**Gereply:** Confirm the browser receives only the short-lived code/session info, the server validates the IDs, the connection is tenant-scoped, and the webhook resolves correctly.

**Secret/public:** Test credentials still remain private.

**Scope:** Per test customer/resource.

## T. Customer onboarding

**What:** The production workflow for a business connecting its own WABA and phone number.

**Where:** Gereply dashboard -> Connect WhatsApp -> Meta Embedded Signup.

**Gereply:** The authenticated server session supplies the tenant. WABA ID and Phone Number ID are stored per tenant only after Meta validation.

**Secret/public:** Customer credential server-only; IDs are credential-linked metadata.

**Scope:** Per customer.

## Connection data model

The current file-backed model stores `businessId`, `wabaId`, `phoneNumberId`, display phone, status, timestamps, webhook status, and the server-side credential on a Meta connection record. Every connection lookup used by the API is business-scoped, and webhook resolution uses the connected phone number ID.

The JSON store is not production-safe on Vercel: serverless instances use ephemeral storage and do not provide shared durable persistence or a suitable secret vault. Before live multi-tenant onboarding, migrate the existing storage abstraction to a durable database and move per-customer credentials to encrypted secret storage. Do not silently treat the current demo store as production-complete.

## Security invariants

- The browser may send a short-lived authorization code and session claims, but the server exchanges the code.
- The server verifies the returned phone number and WABA relationship with Meta before saving.
- The browser never receives an access token or permanent credential.
- Webhook GET uses `META_VERIFY_TOKEN`; POST uses raw-body HMAC with `META_APP_SECRET`.
- There is no default-tenant fallback for unknown phone number IDs.
- Outgoing Meta messages use only the connected tenant record.
- Simulator messages use only the mock provider and a separate simulator route.
- Gemini and Google credentials remain server-only.

## Current known values and verification status

The repository previously contained App ID `230831096602291` and Embedded Signup Config ID `1737194977391820`. Code inspection cannot prove that the Config ID belongs to that App ID or that either remains active. Verify the relationship in Meta before production use; do not recreate or delete the app based on repository values alone.

## Meta reset plan

1. Keep the existing Meta App and configuration only if Meta Dashboard confirms the App ID and Config ID belong together and the app is the intended Gereply business.
2. Disable or remove stale Meta configurations only after that verification. Do not delete the app, WABA, or number automatically.
3. Recreate only the mismatched configuration or app, not customer resources, and record the new values in Vercel and the Vite build environment.
4. Put App ID and Config ID in both server names and the two public Vite names; put App Secret, Verify Token, System User Token, Google secrets, Gemini key, and session secret only in server-side deployment variables.
5. Set the production Vercel variables for Production and rebuild. A Vite variable change requires a new build.
6. Use the source files and tests in this repository to validate the flow, then complete a real Meta tester onboarding.
7. Confirm webhook GET, signed POST, incoming reply, outgoing reply, and simulator isolation before inviting customers.

## Manual Meta and Vercel steps

1. Verify the App ID and Embedded Signup Config ID relationship in Meta.
2. Verify the selected Meta business is verified and is the intended Gereply tech provider business.
3. Configure Facebook Login for Business, App Domains, valid OAuth redirect URLs, ES `v4`, and Session Info Version `3`.
4. Configure the webhook URL and `messages` subscription in Meta.
5. Create or confirm a System User and assign only required assets and permissions; store its token in Vercel as `META_SYSTEM_USER_ACCESS_TOKEN` if needed.
6. Set all required server variables and the two `VITE_META_*` variables in Vercel Production, then redeploy.
7. Complete Meta App Review and switch to Live mode before external customer onboarding.
8. Migrate the JSON store and per-customer credentials to durable production storage before treating the SaaS as live.