/**
 * Mock WhatsApp Provider for Sandbox / Development Testing
 * 
 * NOTE: This provider simulates WhatsApp Business Cloud API behavior without requiring
 * real Meta Developer credentials or a verified Meta Business Account.
 * It is clearly marked as Test Mode in the UI.
 */
export class MockWhatsAppProvider {
  constructor() {
    this.name = 'mock';
    this.isMock = true;
  }

  async getStatus(currentDbStatus) {
    return {
      connected: currentDbStatus?.connected ?? true,
      mode: 'mock',
      provider: 'Simulated WhatsApp Sandbox',
      phoneNumber: currentDbStatus?.phoneNumber || '+1 (555) 019-2831',
      connectedAt: currentDbStatus?.connectedAt || new Date().toISOString(),
      statusMessage: currentDbStatus?.connected 
        ? 'Connected to WhatsApp Sandbox (Test Mode)' 
        : 'Disconnected',
      isMock: true,
      notes: 'Running in sandbox mode. Customer messages can be simulated directly from the test panel.'
    };
  }

  async connect(options = {}) {
    const phoneNumber = options.phoneNumber || '+1 (555) 019-2831';
    return {
      success: true,
      connected: true,
      mode: 'mock',
      phoneNumber,
      connectedAt: new Date().toISOString(),
      statusMessage: 'Connected to WhatsApp Sandbox (Test Mode)',
      isMock: true
    };
  }

  async disconnect() {
    return {
      success: true,
      connected: false,
      mode: 'mock',
      statusMessage: 'Disconnected from WhatsApp Sandbox',
      isMock: true
    };
  }

  async sendMessage(to, text) {
    // Simulate slight network transmission delay (200ms)
    await new Promise(resolve => setTimeout(resolve, 200));

    return {
      success: true,
      provider: 'mock',
      messageId: `mock_msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      to,
      text,
      status: 'delivered',
      timestamp: new Date().toISOString()
    };
  }
}
