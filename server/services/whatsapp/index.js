import { MockWhatsAppProvider } from './mockProvider.js';
import { MetaWhatsAppProvider } from './metaProvider.js';
import { db } from '../../storage/db.js';

class WhatsAppService {
  constructor() {
    this.mockProvider = new MockWhatsAppProvider();
    this.metaProvider = new MetaWhatsAppProvider();
  }

  get activeProvider() {
    const providerSetting = process.env.WHATSAPP_PROVIDER || 'mock';
    if (providerSetting === 'meta') {
      return this.metaProvider;
    }
    return this.mockProvider;
  }

  async getStatus() {
    const currentDbStatus = db.getWhatsApp();
    const status = await this.activeProvider.getStatus(currentDbStatus);
    return {
      ...status,
      configuredProvider: process.env.WHATSAPP_PROVIDER || 'mock'
    };
  }

  async connect(options = {}) {
    const result = await this.activeProvider.connect(options);
    if (result.success) {
      db.updateWhatsApp({
        connected: true,
        mode: result.mode,
        phoneNumber: result.phoneNumber,
        connectedAt: result.connectedAt,
        statusMessage: result.statusMessage
      });
    }
    return result;
  }

  async disconnect() {
    const result = await this.activeProvider.disconnect();
    db.updateWhatsApp({
      connected: false,
      statusMessage: result.statusMessage
    });
    return result;
  }

  async sendMessage(to, text) {
    return this.activeProvider.sendMessage(to, text);
  }
}

export const whatsAppService = new WhatsAppService();
