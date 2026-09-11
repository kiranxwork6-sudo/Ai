# WhatsApp Business Cloud API Integration Guide

This guide details how to transition this MVP from the included **Mock / Sandbox Provider** to the **Official Meta WhatsApp Business Cloud API (Graph API v21.0+)**.

---

## 1. Overview of Architecture

The application abstracts WhatsApp messaging behind a unified provider interface:
- `server/services/whatsapp/mockProvider.js`: Used by default for instant local testing, offline simulation, and dashboard previews.
- `server/services/whatsapp/metaProvider.js`: Implements the official Meta WhatsApp Business Cloud API with HMAC signature verification, webhook challenge validation, and message dispatch.

To switch providers, update the environment variable in `.env`:
```env
WHATSAPP_PROVIDER=meta
```

---

## 2. Prerequisites in Meta for Developers

1. **Create a Meta Developer Account**:
   - Go to [https://developers.facebook.com](https://developers.facebook.com) and log in with your Facebook business account.
2. **Create a Meta App**:
   - Click **Create App**.
   - Select **Other** > **Business** as the app type.
   - Name your app (e.g., `AI Receptionist Production`).
3. **Add WhatsApp to your App**:
   - On the App Dashboard, locate **WhatsApp** and click **Set up**.
   - This creates a test WhatsApp Business Account (WABA) and assigns a test phone number with temporary access tokens.

---

## 3. Configuring Environment Variables

Never commit real tokens or credentials to version control. Fill in your production `.env` file:

```env
# Change provider from 'mock' to 'meta'
WHATSAPP_PROVIDER=meta

# Found in Meta App Dashboard > WhatsApp > API Setup:
WHATSAPP_PHONE_NUMBER_ID=109283746501928
WHATSAPP_BUSINESS_ACCOUNT_ID=987654321012345

# Permanent System User Access Token (see Section 4)
WHATSAPP_API_TOKEN=EAAG...YourPermanentSystemUserToken...

# A random secret string you choose for webhook verification
WHATSAPP_VERIFY_TOKEN=your_custom_secret_verify_token_here

# Found in Meta App Dashboard > App Settings > Basic > App Secret
WHATSAPP_APP_SECRET=a1b2c3d4e5f6g7h8i9j0
```

---

## 4. Creating a Permanent System User Token

Temporary tokens expire in 24 hours. For production:
1. Open [Meta Business Manager Settings](https://business.facebook.com/settings).
2. Navigate to **Users** > **System Users**.
3. Click **Add**, name the user `AI-Receptionist-Bot`, and assign role **Admin**.
4. Click **Generate New Token**.
5. Select your App and select the following permissions:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
6. Copy the generated token and paste it into `WHATSAPP_API_TOKEN` in your `.env`.

---

## 5. Setting Up Webhooks

When customers text your WhatsApp Business number, Meta sends an HTTP POST event to your server.

1. **Deploy your backend with a public HTTPS URL** (e.g. via Render, Railway, Cloud Run, or use ngrok for local development):
   ```bash
   ngrok http 3001
   ```
2. **Configure Webhook in Meta Developer Portal**:
   - Navigate to **WhatsApp** > **Configuration** > **Webhooks**.
   - Click **Edit**.
   - **Callback URL**: `https://<your-domain-or-ngrok>/api/whatsapp/webhook`
   - **Verify Token**: Enter the exact same string as `WHATSAPP_VERIFY_TOKEN` in `.env`.
   - Click **Verify and Save**.
3. **Subscribe to Webhook Fields**:
   - Under Webhook Fields, find **`messages`** and click **Subscribe**.

---

## 6. Registering a Real Business Phone Number

1. In Meta WhatsApp Manager, navigate to **Phone Numbers**.
2. Click **Add Phone Number**.
3. Provide your business display name, category, and website.
4. Verify ownership via SMS or Voice Call code.
5. Retrieve the **Phone Number ID** for this number and set `WHATSAPP_PHONE_NUMBER_ID` in `.env`.

---

## 7. Understanding the 24-Hour Customer Service Window

- **Customer-Initiated Inquiries**: When a customer sends a message to your WhatsApp number, a **24-hour customer service window** opens. Within this window, the AI Receptionist can reply with free-form text messages at standard service conversation rates.
- **Outside 24-Hour Window**: If more than 24 hours have elapsed since the customer's last incoming message, free-form text messages will be rejected by Meta with error code `131047`. To re-engage customers after 24 hours, you must use pre-approved **Meta WhatsApp Message Templates**.

---

## 8. Code Locations & Extension Points

- Provider Implementation: [`server/services/whatsapp/metaProvider.js`](file:///c:/Users/akhil/Documents/Ai%20Reseptionist/server/services/whatsapp/metaProvider.js)
- Webhook Handler: [`server/routes/whatsapp.js`](file:///c:/Users/akhil/Documents/Ai%20Reseptionist/server/routes/whatsapp.js)
- AI Grounding Engine: [`server/services/ai/receptionistEngine.js`](file:///c:/Users/akhil/Documents/Ai%20Reseptionist/server/services/ai/receptionistEngine.js)
