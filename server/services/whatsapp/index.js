import { MockWhatsAppProvider } from './mockProvider.js';
import { metaWhatsAppProvider } from './metaProvider.js';
import { db } from '../../storage/db.js';
import { assertMetaAppConfig, getMetaConfig } from '../../config/meta.js';

class WhatsAppService {
  constructor() {
    this.mockProvider = new MockWhatsAppProvider();
    this.metaProvider = metaWhatsAppProvider;
  }

  /**
   * Returns sanitized connection statuses for a business
   * Masks sensitive access tokens before returning to client.
   */
  async getStatus(businessId = "biz-default") {
    const mockConn = db.getWhatsAppConnection(businessId, "mock");
    const metaConn = db.getWhatsAppConnection(businessId, "meta");

    return {
      businessId,
      // Compatibility fields for the existing sandbox UI. These refer only to
      // the mock provider and must never be interpreted as a Meta connection.
      connected: mockConn.status === 'connected',
      phoneNumber: mockConn.phoneNumber || '+1 (555) 019-2831',
      statusMessage: mockConn.statusMessage,
      mock: {
        id: mockConn.id,
        provider: "mock",
        status: mockConn.status,
        phoneNumber: mockConn.phoneNumber || "+1 (555) 019-2831",
        statusMessage: mockConn.statusMessage,
        connectedAt: mockConn.connectedAt,
        isMock: true,
        label: "WhatsApp Sandbox (Test Simulator)"
      },
      meta: {
        id: metaConn.id,
        provider: "meta",
        status: metaConn.status,
        phoneNumber: metaConn.phoneNumber || "",
        phoneNumberId: metaConn.phoneNumberId || "",
        wabaId: metaConn.wabaId || "",
        hasAccessToken: Boolean(metaConn.accessToken),
        statusMessage: metaConn.statusMessage,
        connectedAt: metaConn.connectedAt,
        isMock: false,
        label: "Official Meta WhatsApp Business Cloud API"
      },
      // Webhook info for Meta developer portal configuration
      webhookInfo: {
        callbackUrl: `/api/webhooks/whatsapp`,
        configured: Boolean(this.metaProvider.verifyToken)
      }
    };
  }

  /**
   * Exchange Meta Embedded Signup authorization code for access token
   * This implements the OAuth 2.0 authorization code exchange flow for Meta's Embedded Signup
   */
  async exchangeEmbeddedSignupCode(businessId = "biz-default", { code, wabaId, phoneNumberId }) {
    const config = assertMetaAppConfig();

    try {
      // Step 1: Exchange authorization code for access token
      const tokenUrl = `${this.metaProvider.apiUrl}/oauth/access_token`;
      const tokenParams = new URLSearchParams({
        client_id: config.appId,
        client_secret: config.appSecret,
        code: code,
      });

      const tokenResponse = await fetch(`${tokenUrl}?${tokenParams.toString()}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok || tokenData.error || !tokenData.access_token) {
        const errorMsg = tokenData.error?.message || 'Authorization code exchange failed';
        console.error('[EmbeddedSignup] Token exchange failed:', errorMsg);
        throw new Error(`Meta authorization code exchange failed: ${errorMsg}`);
      }

      const accessToken = tokenData.access_token;

      // Step 2: Verify credentials against Meta Graph API
      const verifyResult = await this.metaProvider.verifyCredentials({
        phoneNumberId,
        accessToken,
        expectedWabaId: wabaId
      });

      if (!verifyResult.valid) {
        throw new Error(verifyResult.error || 'Meta credentials verification failed after code exchange.');
      }

      // Step 3: Subscribe WABA to webhook
      let webhookStatus = 'pending';
      try {
        await this.subscribeWABAToWebhook(wabaId, accessToken, config.graphApiVersion);
        webhookStatus = 'subscribed';
      } catch (subscribeErr) {
        console.warn('[EmbeddedSignup] WABA subscription warning:', subscribeErr.message);
        webhookStatus = 'subscription_failed';
      }

      // Step 4: Store connection securely
      const saved = db.saveWhatsAppConnection(businessId, "meta", {
        status: "connected",
        phoneNumber: verifyResult.displayPhoneNumber,
        phoneNumberId: verifyResult.phoneNumberId,
        wabaId: verifyResult.wabaId,
        accessToken: accessToken, // Store securely - never expose to client
        statusMessage: `Connected via Embedded Signup (${verifyResult.verifiedName || verifyResult.displayPhoneNumber})`,
        connectedAt: new Date().toISOString(),
        webhookStatus,
        onboardingMethod: 'embedded_signup'
      });

      return {
        success: true,
        provider: "meta",
        status: "connected",
        displayPhoneNumber: verifyResult.displayPhoneNumber,
        verifiedName: verifyResult.verifiedName,
        wabaId: verifyResult.wabaId,
        phoneNumberId: verifyResult.phoneNumberId,
      };
    } catch (err) {
      console.error('[EmbeddedSignup] Exchange error:', err.message);

      const existing = db.getWhatsAppConnection(businessId, "meta");
      if (existing.status !== 'connected') {
        db.saveWhatsAppConnection(businessId, "meta", {
          status: "disconnected",
          phoneNumberId: "",
          wabaId: "",
          accessToken: "",
          statusMessage: `Embedded Signup failed: ${err.message}`
        });
      }

      throw err;
    }
  }

  /**
   * Subscribe WABA to app webhook (required for receiving messages)
   */
  async subscribeWABAToWebhook(wabaId, accessToken, apiVersion = 'v21.0') {
    const subscribeUrl = `https://graph.facebook.com/${apiVersion}/${wabaId}/subscribed_apps`;

    const response = await fetch(subscribeUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();

    if (!response.ok || result.error) {
      const errorMsg = result.error?.message || 'WABA subscription failed';
      throw new Error(`Failed to subscribe WABA to webhook: ${errorMsg}`);
    }

    return { success: true, subscribed: result.success === true };
  }

  /**
   * Connect or update mock WhatsApp sandbox
   */
  async connectMock(businessId = "biz-default", { phoneNumber = "+1 (555) 019-2831" } = {}) {
    const saved = db.saveWhatsAppConnection(businessId, "mock", {
      status: "connected",
      phoneNumber,
      statusMessage: "Connected to WhatsApp Sandbox (Test Mode)",
      connectedAt: new Date().toISOString()
    });

    return {
      success: true,
      provider: "mock",
      status: "connected",
      phoneNumber
    };
  }

  /**
   * Disconnect a provider
   */
  async disconnect(businessId = "biz-default", provider = "mock") {
    if (provider === "meta") {
      db.saveWhatsAppConnection(businessId, "meta", {
        status: "disconnected",
        accessToken: "",
        statusMessage: "Disconnected from Meta WhatsApp Cloud API",
        connectedAt: null
      });
    } else {
      db.saveWhatsAppConnection(businessId, "mock", {
        status: "disconnected",
        statusMessage: "Disconnected from WhatsApp Sandbox",
        connectedAt: null
      });
    }

    return {
      success: true,
      provider,
      status: "disconnected"
    };
  }

  /**
   * Dispatch a message through the appropriate channel for a business
   */
  async sendMessage(businessId = "biz-default", { to, text, channel = "simulator" }) {
    if (channel === "whatsapp_meta") {
      const metaConn = db.getWhatsAppConnection(businessId, "meta");
      const accessToken = metaConn.accessToken;
      const phoneNumberId = metaConn.phoneNumberId;
      if (metaConn.status !== 'connected') {
        throw new Error('Cannot send message: Meta WhatsApp connection is not active or verified.');
      }
      if (!accessToken || !phoneNumberId) throw new Error('Cannot send message: missing server-side Meta configuration.');

      return this.metaProvider.sendMessage({
        phoneNumberId,
        accessToken,
        to,
        text
      });
    } else {
      // Send through mock sandbox
      return this.mockProvider.sendMessage(to, text);
    }
  }

  async sendWhatsAppText(businessId, { to, text }) {
    return this.sendMessage(businessId, { to, text, channel: 'whatsapp_meta' });
  }

  async sendWhatsAppTemplate() {
    throw new Error('Template sending is not configured. Use an approved Meta template before scheduling outbound notifications.');
  }

  async sendWhatsAppMedia() {
    throw new Error('Media sending is not configured.');
  }
}

export const whatsAppService = new WhatsAppService();
