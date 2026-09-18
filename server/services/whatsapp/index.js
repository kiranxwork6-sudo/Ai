import { MockWhatsAppProvider } from './mockProvider.js';
import { metaWhatsAppProvider } from './metaProvider.js';
import { db } from '../../storage/db.js';

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
        maskedToken: metaConn.accessToken ? this.metaProvider.maskToken(metaConn.accessToken) : "",
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
    const META_APP_ID = process.env.META_APP_ID || '230831096602291';
    const META_APP_SECRET = process.env.META_APP_SECRET;
    const META_GRAPH_API_VERSION = process.env.META_GRAPH_API_VERSION || 'v21.0';
    const REDIRECT_URI = process.env.META_EMBEDDED_SIGNUP_REDIRECT_URI || 'https://gereply.vercel.app';

    if (!META_APP_SECRET) {
      throw new Error('META_APP_SECRET is not configured. Cannot exchange authorization code.');
    }

    try {
      // Step 1: Exchange authorization code for access token
      const tokenUrl = `https://graph.facebook.com/${META_GRAPH_API_VERSION}/oauth/access_token`;
      const tokenParams = new URLSearchParams({
        client_id: META_APP_ID,
        client_secret: META_APP_SECRET,
        code: code,
        redirect_uri: REDIRECT_URI
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
        accessToken
      });

      if (!verifyResult.valid) {
        throw new Error(verifyResult.error || 'Meta credentials verification failed after code exchange.');
      }

      // Step 3: Subscribe WABA to webhook
      try {
        await this.subscribeWABAToWebhook(wabaId, accessToken, META_GRAPH_API_VERSION);
      } catch (subscribeErr) {
        console.warn('[EmbeddedSignup] WABA subscription warning:', subscribeErr.message);
        // Continue even if subscription fails - user can manually subscribe in Meta dashboard
      }

      // Step 4: Store connection securely
      const saved = db.saveWhatsAppConnection(businessId, "meta", {
        status: "connected",
        phoneNumber: verifyResult.displayPhoneNumber,
        phoneNumberId: phoneNumberId,
        wabaId: wabaId,
        accessToken: accessToken, // Store securely - never expose to client
        statusMessage: `Connected via Embedded Signup (${verifyResult.verifiedName || verifyResult.displayPhoneNumber})`,
        connectedAt: new Date().toISOString(),
        webhookStatus: 'subscribed',
        onboardingMethod: 'embedded_signup'
      });

      return {
        success: true,
        provider: "meta",
        status: "connected",
        displayPhoneNumber: verifyResult.displayPhoneNumber,
        verifiedName: verifyResult.verifiedName,
        wabaId: wabaId,
        phoneNumberId: phoneNumberId,
        maskedToken: this.metaProvider.maskToken(accessToken)
      };
    } catch (err) {
      console.error('[EmbeddedSignup] Exchange error:', err.message);

      // Record failure state
      db.saveWhatsAppConnection(businessId, "meta", {
        status: "disconnected",
        phoneNumberId: phoneNumberId,
        wabaId: wabaId,
        accessToken: "",
        statusMessage: `Embedded Signup failed: ${err.message}`
      });

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
   * Connect and verify real Meta WhatsApp Business credentials
   */
  async connectMeta(businessId = "biz-default", { phoneNumberId, wabaId, accessToken }) {
    if (!phoneNumberId || !accessToken) {
      throw new Error('Phone Number ID and Access Token are required to connect Meta WhatsApp.');
    }

    // Actively verify credentials against Meta Graph API
    const verifyResult = await this.metaProvider.verifyCredentials({ phoneNumberId, accessToken });

    if (!verifyResult.valid) {
      // Record failure state honestly; do not claim connection succeeded
      db.saveWhatsAppConnection(businessId, "meta", {
        status: "disconnected",
        phoneNumberId: phoneNumberId.trim(),
        wabaId: (wabaId || "").trim(),
        accessToken: "", // Do not store invalid token
        statusMessage: verifyResult.error || "Meta verification failed"
      });
      throw new Error(verifyResult.error || 'Meta credentials verification failed.');
    }

    // Successfully verified against Meta!
    const saved = db.saveWhatsAppConnection(businessId, "meta", {
      status: "connected",
      phoneNumber: verifyResult.displayPhoneNumber,
      phoneNumberId: verifyResult.phoneNumberId,
      wabaId: (wabaId || "").trim(),
      accessToken: accessToken.trim(),
      statusMessage: `Connected & Verified via Meta (${verifyResult.verifiedName || verifyResult.displayPhoneNumber})`,
      connectedAt: new Date().toISOString()
    });

    return {
      success: true,
      provider: "meta",
      status: "connected",
      displayPhoneNumber: verifyResult.displayPhoneNumber,
      verifiedName: verifyResult.verifiedName,
      maskedToken: this.metaProvider.maskToken(accessToken)
    };
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
      const accessToken = process.env.WHATSAPP_ACCESS_TOKEN || process.env.WHATSAPP_API_TOKEN || metaConn.accessToken;
      const phoneNumberId = metaConn.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID;
      if ((!metaConn.status || metaConn.status === 'disconnected') && !process.env.WHATSAPP_ACCESS_TOKEN) {
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
