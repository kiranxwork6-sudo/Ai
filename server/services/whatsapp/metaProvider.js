import crypto from 'crypto';

/**
 * Official WhatsApp Business Cloud API Provider (Meta Graph API v21.0)
 * 
 * Supports multi-tenant token resolution and verification against Meta Graph API.
 * Never leaks raw access tokens to client-side logs or UI responses.
 */
export class MetaWhatsAppProvider {
  constructor() {
    this.name = 'meta';
    this.isMock = false;
    this.apiUrl = 'https://graph.facebook.com/v21.0';
    this.verifyToken = process.env.META_VERIFY_TOKEN || process.env.WHATSAPP_VERIFY_TOKEN;
    this.appSecret = process.env.META_APP_SECRET || process.env.WHATSAPP_APP_SECRET;
  }

  /**
   * Safely mask an access token for display in the UI without exposing secrets.
   * e.g. "EAAG...1234"
   */
  maskToken(token) {
    if (!token || typeof token !== 'string') return '';
    if (token.length <= 10) return '••••••••';
    return `${token.slice(0, 4)}...${token.slice(-4)}`;
  }

  /**
   * Validates Meta credentials against the official Meta Graph API.
   * Only returns success if Meta actively confirms the phone number ID and token.
   * 
   * @param {Object} params
   * @param {string} params.phoneNumberId - Meta Phone Number ID
   * @param {string} params.accessToken - System User or User Access Token
   */
  async verifyCredentials({ phoneNumberId, accessToken }) {
    if (!phoneNumberId || !phoneNumberId.trim()) {
      return { valid: false, error: 'Phone Number ID is required.' };
    }
    if (!accessToken || !accessToken.trim()) {
      return { valid: false, error: 'Meta Access Token is required.' };
    }

    const cleanPhoneId = phoneNumberId.trim();
    const cleanToken = accessToken.trim();

    try {
      // Query Meta Graph API for phone number details
      const url = `${this.apiUrl}/${cleanPhoneId}?fields=verified_name,display_phone_number,quality_rating,code_verification_status`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${cleanToken}`,
          'Accept': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        const errorMsg = data.error ? data.error.message : response.statusText;
        return {
          valid: false,
          error: `Meta Graph API rejected credentials: ${errorMsg}`
        };
      }

      return {
        valid: true,
        displayPhoneNumber: data.display_phone_number || 'Registered WhatsApp Number',
        verifiedName: data.verified_name || '',
        qualityRating: data.quality_rating || 'UNKNOWN',
        phoneNumberId: cleanPhoneId
      };
    } catch (err) {
      return {
        valid: false,
        error: `Network error connecting to Meta Graph API: ${err.message}`
      };
    }
  }

  /**
   * Send an outgoing text message via Meta Graph API v21.0
   * 
   * @param {Object} params
   * @param {string} params.phoneNumberId - Verified Meta Phone Number ID
   * @param {string} params.accessToken - Meta Access Token
   * @param {string} params.to - Customer E.164 phone number
   * @param {string} params.text - Message content
   */
  async sendMessage({ phoneNumberId, accessToken, to, text }) {
    if (!phoneNumberId || !accessToken) {
      throw new Error('Missing Meta credentials for message delivery.');
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

    const response = await fetch(`${this.apiUrl}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok || result.error) {
      const errorMsg = result.error ? result.error.message : response.statusText;
      console.error(`[MetaWhatsApp] Failed to send to ${cleanTo}:`, result.error?.message || response.statusText);
      throw new Error(`Meta WhatsApp send failed: ${errorMsg}`);
    }

    return {
      success: true,
      provider: 'meta',
      messageId: result.messages?.[0]?.id || `wamid_meta_${Date.now()}`,
      to: cleanTo,
      text,
      status: 'sent',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Verify Webhook GET request handshake from Meta
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
  validateSignature(rawBody, signatureHeader, customAppSecret = null) {
    const secret = customAppSecret || this.appSecret;
    // Production must never accept unsigned events. Development can opt in explicitly.
    if (!secret) return process.env.NODE_ENV !== 'production' && process.env.ALLOW_UNSIGNED_WEBHOOKS === 'true';
    if (!signatureHeader || !rawBody) return false;

    try {
      const signature = signatureHeader.replace('sha256=', '');
      const expected = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');

      return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
    } catch (err) {
      console.error('[MetaWebhook] Signature validation failed:', err.message);
      return false;
    }
  }

  isValidWebhookPayload(body) {
    return Boolean(body && body.object === 'whatsapp_business_account' && Array.isArray(body.entry));
  }

  getWebhookEvents(body) {
    const events = [];
    for (const entry of body.entry || []) for (const change of entry.changes || []) {
      if (change.field !== 'messages' || !change.value?.metadata?.phone_number_id) continue;
      const value = change.value;
      const metadata = value.metadata;
      for (const message of value.messages || []) {
        events.push({ kind: 'message', phoneNumberId: String(metadata.phone_number_id), whatsAppAccountId: String(entry.id || ''), fromPhone: `+${String(message.from || '').replace(/\D/g, '')}`, customerName: value.contacts?.find((c) => c.wa_id === message.from)?.profile?.name || '', text: message.type === 'text' ? String(message.text?.body || '').trim() : '', messageId: message.id, messageType: message.type || 'unknown' });
      }
      for (const status of value.statuses || []) events.push({ kind: 'status', phoneNumberId: String(metadata.phone_number_id), messageId: status.id, status: status.status, errorCode: status.errors?.[0]?.code });
    }
    return events;
  }

  /**
   * Parse incoming webhook payload from Meta
   * Extracts phoneNumberId, sender phone, name, and text.
   */
  parseWebhook(body) {
    try {
      const entry = body.entry?.[0];
      const change = entry?.changes?.[0];
      const value = change?.value;
      const metadata = value?.metadata;
      const message = value?.messages?.[0];
      const contact = value?.contacts?.[0];

      if (!message || message.type !== 'text') {
        // Return null for read receipts, status events, or unsupported media in basic MVP
        return null;
      }

      return {
        phoneNumberId: metadata?.phone_number_id || '',
        displayPhoneNumber: metadata?.display_phone_number || '',
        fromPhone: '+' + message.from,
        customerName: contact?.profile?.name || `Customer (${message.from.slice(-4)})`,
        text: message.text?.body || '',
        messageId: message.id,
        timestamp: new Date(Number(message.timestamp) * 1000).toISOString()
      };
    } catch (err) {
      console.error('[MetaWebhook] Error parsing payload:', err);
      return null;
    }
  }
}

export const metaWhatsAppProvider = new MetaWhatsAppProvider();
