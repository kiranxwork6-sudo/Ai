import crypto from 'crypto';

/**
 * Official WhatsApp Business Cloud API Provider (Meta Graph API v21.0)
 * 
 * Production Documentation & Setup Requirements:
 * 1. Meta Developer App: Create a "Business" type app at https://developers.facebook.com
 * 2. Add WhatsApp product to the app.
 * 3. Add or migrate a phone number in Meta WhatsApp Manager.
 * 4. Generate a permanent System User Token with permissions:
 *    - whatsapp_business_messaging
 *    - whatsapp_business_management
 * 5. Configure Webhooks:
 *    - Callback URL: https://yourdomain.com/api/whatsapp/webhook
 *    - Verify Token: Matches WHATSAPP_VERIFY_TOKEN
 *    - Subscribe to fields: 'messages'
 */
export class MetaWhatsAppProvider {
  constructor() {
    this.name = 'meta';
    this.isMock = false;
    this.apiUrl = 'https://graph.facebook.com/v21.0';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.apiToken = process.env.WHATSAPP_API_TOKEN;
    this.verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
    this.appSecret = process.env.WHATSAPP_APP_SECRET;
  }

  isConfigured() {
    return Boolean(this.phoneNumberId && this.apiToken);
  }

  async getStatus(currentDbStatus) {
    const configured = this.isConfigured();
    return {
      connected: configured && (currentDbStatus?.connected ?? true),
      mode: 'meta',
      provider: 'Meta WhatsApp Business Cloud API',
      phoneNumber: currentDbStatus?.phoneNumber || 'Configured via Meta Business Account',
      phoneNumberId: this.phoneNumberId || 'Missing WHATSAPP_PHONE_NUMBER_ID',
      statusMessage: configured 
        ? 'Connected to Official Meta WhatsApp Cloud API' 
        : 'Meta credentials incomplete. Check .env configuration.',
      isMock: false,
      notes: 'Operating with live Meta Graph API.'
    };
  }

  async connect(options = {}) {
    if (!this.isConfigured()) {
      throw new Error(
        'Cannot connect to official WhatsApp API: WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_API_TOKEN is missing in environment variables.'
      );
    }

    // Optional: Make a test call to Meta Graph API to verify credentials
    // GET https://graph.facebook.com/v21.0/{phone_number_id}
    try {
      const response = await fetch(`${this.apiUrl}/${this.phoneNumberId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`
        }
      });
      const data = await response.json();
      if (data.error) {
        throw new Error(`Meta API Error: ${data.error.message}`);
      }

      return {
        success: true,
        connected: true,
        mode: 'meta',
        phoneNumber: data.display_phone_number || options.phoneNumber,
        connectedAt: new Date().toISOString(),
        statusMessage: 'Connected to Meta WhatsApp Cloud API',
        isMock: false
      };
    } catch (err) {
      throw new Error(`Failed to verify Meta WhatsApp credentials: ${err.message}`);
    }
  }

  async disconnect() {
    return {
      success: true,
      connected: false,
      mode: 'meta',
      statusMessage: 'Disconnected Meta WhatsApp Cloud API',
      isMock: false
    };
  }

  /**
   * Send a standard text message via Meta Graph API v21.0
   * 
   * @param {string} to - Customer E.164 phone number without '+' (e.g. "15551234567")
   * @param {string} text - Message body
   */
  async sendMessage(to, text) {
    if (!this.isConfigured()) {
      throw new Error('Meta WhatsApp Cloud API credentials not configured.');
    }

    const cleanTo = to.replace(/[^0-9]/g, '');

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanTo,
      type: 'text',
      text: {
        preview_url: false,
        body: text
      }
    };

    // TODO: In production, handle 24-hour messaging window rules.
    // If >24 hours since customer's last message, a pre-approved WhatsApp Template Message must be used instead.

    const response = await fetch(`${this.apiUrl}/${this.phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (!response.ok || result.error) {
      const errorMsg = result.error ? result.error.message : response.statusText;
      console.error('[MetaWhatsAppProvider] Send failed:', result);
      throw new Error(`Meta WhatsApp send failed: ${errorMsg}`);
    }

    return {
      success: true,
      provider: 'meta',
      messageId: result.messages?.[0]?.id || `meta_${Date.now()}`,
      to: cleanTo,
      text,
      status: 'sent',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Verify Webhook GET request from Meta
   */
  verifyWebhookChallenge(mode, token, challenge) {
    if (mode === 'subscribe' && token === this.verifyToken) {
      return challenge;
    }
    return null;
  }

  /**
   * Verify HMAC-SHA256 signature from Meta webhook POST request
   */
  validateSignature(rawBody, signatureHeader) {
    if (!this.appSecret || !signatureHeader) return true; // Skip if no secret set
    
    const signature = signatureHeader.replace('sha256=', '');
    const expected = crypto
      .createHmac('sha256', this.appSecret)
      .update(rawBody)
      .digest('hex');

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  }

  /**
   * Parse incoming webhook payload from Meta
   */
  parseWebhook(body) {
    try {
      const entry = body.entry?.[0];
      const change = entry?.changes?.[0];
      const value = change?.value;
      const message = value?.messages?.[0];
      const contact = value?.contacts?.[0];

      if (!message || message.type !== 'text') {
        return null; // Ignore statuses or non-text for basic MVP
      }

      return {
        fromPhone: '+' + message.from,
        customerName: contact?.profile?.name || `Customer (${message.from.slice(-4)})`,
        text: message.text?.body || '',
        messageId: message.id,
        timestamp: new Date(Number(message.timestamp) * 1000).toISOString()
      };
    } catch (err) {
      console.error('[MetaWhatsAppProvider] Error parsing incoming webhook:', err);
      return null;
    }
  }
}
