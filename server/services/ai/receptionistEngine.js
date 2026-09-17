import { db } from '../../storage/db.js';
import { geminiCustomerReplyService } from './geminiService.js';

export class ReceptionistEngine {
  /**
   * Builds the grounding prompt incorporating all business configuration
   */
  buildSystemPrompt(business) {
    const hoursFormatted = (business.openingHours || [])
      .map(h => `- ${h.day}: ${h.closed ? 'Closed' : `${h.open} - ${h.close}`}`)
      .join('\n');

    const servicesFormatted = (business.services || [])
      .map(s => `- ${s.name}: ${s.price} (${s.description || 'Standard service'})`)
      .join('\n');

    const faqsFormatted = (business.faqs || [])
      .map(f => `Q: ${f.question}\nA: ${f.answer}`)
      .join('\n\n');

    return `You are the friendly, professional, and efficient AI Front Desk Receptionist for "${business.name}".
Your goal is to assist customers reaching out over WhatsApp in a warm, helpful, and concise manner (optimized for WhatsApp chat).

=== BUSINESS INFORMATION ===
Business Name: ${business.name}
Tagline: ${business.tagline || ''}
Description: ${business.description}
Address: ${business.address}
Contact Phone: ${business.phone}

=== OPENING HOURS ===
${hoursFormatted}

=== SERVICES & PRICING ===
${servicesFormatted}

=== FREQUENTLY ASKED QUESTIONS ===
${faqsFormatted}

=== RECEPTIONIST GUIDELINES ===
1. Keep answers concise, polite, and easy to read on a mobile screen (1-3 sentences or short bullet points).
2. Answer based ONLY on the provided business information. Never make up services, prices, or hours not listed.
3. If a customer asks to book an appointment, warmly collect their preferred date, time, and service, and let them know the team will confirm.
4. If a customer is upset, asks for something unusual, or explicitly asks for a human/manager/agent, reassure them and let them know a staff member is stepping in.
5. Use a friendly and welcoming tone, suitable for WhatsApp.`;
  }

  /**
   * Check if a customer message triggers an explicit human handoff
   */
  checkHumanHandoffTrigger(messageText) {
    const lower = (messageText || '').toLowerCase();
    const triggers = [
      'human',
      'person',
      'speak to someone',
      'talk to someone',
      'manager',
      'supervisor',
      'agent',
      'staff',
      'real person',
      'dispute',
      'refund',
      'complain',
      'lawyer',
      'urgent help'
    ];

    return triggers.some(t => lower.includes(t));
  }

  /**
   * Built-in intelligent deterministic local knowledge engine.
   * Runs locally with zero API keys required, parsing the exact business data.
   */
  generateFallbackReply(business, messageText) {
    const lower = (messageText || '').toLowerCase();

    // 1. Human handoff trigger
    if (this.checkHumanHandoffTrigger(lower)) {
      return `I understand! I have notified our front desk team to step in. A team member will reply to you directly shortly.`;
    }

    // 2. Greeting / Hello
    if (/^(hi|hello|hey|good morning|good afternoon|good evening)\b/i.test(lower.trim()) && lower.length < 25) {
      return `Hello! Welcome to ${business.name}. How can I assist you today? Feel free to ask about our services, pricing, or opening hours!`;
    }

    // 3. Address & Location & Parking
    if (lower.includes('where') || lower.includes('location') || lower.includes('address') || lower.includes('located') || lower.includes('directions')) {
      return `We are located at ${business.address}. Let us know if you need directions or parking details!`;
    }
    if (lower.includes('park') || lower.includes('parking') || lower.includes('garage')) {
      const parkingFaq = (business.faqs || []).find(f => f.question.toLowerCase().includes('park'));
      if (parkingFaq) return parkingFaq.answer;
      return `Parking is available near our location at ${business.address}.`;
    }

    // 4. Hours / Opening times / Days
    if (lower.includes('hour') || lower.includes('open') || lower.includes('close') || lower.includes('time') || lower.includes('sunday') || lower.includes('saturday') || lower.includes('weekend') || lower.includes('monday') || lower.includes('friday')) {
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      for (const d of days) {
        if (lower.includes(d)) {
          const match = (business.openingHours || []).find(h => h.day.toLowerCase() === d);
          if (match) {
            return match.closed
              ? `We are closed on ${match.day}s.`
              : `On ${match.day}s, our hours are ${match.open} to ${match.close}.`;
          }
        }
      }

      return `Our opening hours are:\n${(business.openingHours || []).map(h => `• ${h.day}: ${h.closed ? 'Closed' : `${h.open} - ${h.close}`}`).join('\n')}`;
    }

    // 5. Pricing / Cost / How much
    if (lower.includes('price') || lower.includes('cost') || lower.includes('how much') || lower.includes('rate') || lower.includes('fee')) {
      for (const service of (business.services || [])) {
        const words = service.name.toLowerCase().split(' ');
        const matches = words.filter(w => w.length > 3 && lower.includes(w));
        if (matches.length > 0) {
          return `${service.name} is ${service.price}. ${service.description || ''}`.trim();
        }
      }

      const list = (business.services || []).map(s => `• ${s.name} — ${s.price}`).join('\n');
      return `Here is our current pricing:\n${list}\n\nWould you like to book one of these services?`;
    }

    // 6. Services / Treatments / What do you offer
    if (lower.includes('service') || lower.includes('treatment') || lower.includes('offer') || lower.includes('menu') || lower.includes('what do you do') || lower.includes('facial') || lower.includes('massage')) {
      // Check if specific service is mentioned
      for (const service of (business.services || [])) {
        if (lower.includes(service.name.toLowerCase()) || (service.name.toLowerCase().includes('facial') && lower.includes('facial')) || (service.name.toLowerCase().includes('massage') && lower.includes('massage'))) {
          return `${service.name} is ${service.price}. ${service.description || ''}`.trim();
        }
      }

      const list = (business.services || []).map(s => `• ${s.name} (${s.price})`).join('\n');
      return `At ${business.name}, we offer the following services:\n${list}\n\nWould you like more details on any of these?`;
    }

    // 7. Check FAQs match
    for (const faq of (business.faqs || [])) {
      const qWords = faq.question.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const matched = qWords.filter(w => lower.includes(w));
      if (matched.length >= 2 || (qWords.length <= 3 && matched.length >= 1)) {
        return faq.answer;
      }
    }

    // 8. Booking intent
    if (lower.includes('book') || lower.includes('appointment') || lower.includes('schedule') || lower.includes('reserve') || lower.includes('slot')) {
      return `I would be happy to help you schedule an appointment at ${business.name}! What date and time works best for you, and which service would you like to book?`;
    }

    // 9. Cancellation / Rescheduling
    if (lower.includes('cancel') || lower.includes('reschedule') || lower.includes('change date')) {
      const cancelFaq = (business.faqs || []).find(f => f.question.toLowerCase().includes('cancel'));
      if (cancelFaq) return cancelFaq.answer;
      return `For cancellations or rescheduling, please notify us as early as possible so we can update our schedule.`;
    }

    // 10. Default helpful receptionist response
    const firstServices = (business.services || []).slice(0, 2).map(s => s.name).join(' and ');
    return `Thank you for reaching out to ${business.name}! We offer a variety of services including ${firstServices || 'our primary services'}. You can ask me about our pricing, opening hours, or location at ${business.address}. How may I help you?`;
  }

  /**
   * Main multi-tenant answer pipeline
   */
  async generateReply({ businessId = "biz-default", conversationId, customerMessage }) {
    const business = db.getBusiness(businessId);
    const conv = db.getConversation(businessId, conversationId);
    const history = conv ? conv.messages : [];

    const requiresHumanHandoff = this.checkHumanHandoffTrigger(customerMessage);

    // If customer explicitly needs human assistance
    if (requiresHumanHandoff) {
      return {
        text: `I understand! I have notified our front desk team to step in. A team member will reply to you directly shortly.`,
        source: 'human-handoff-trigger',
        requiresHumanHandoff: true
      };
    }

    // If GEMINI_API_KEY is configured, use Gemini
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '') {
      try {
        console.log(`[AI Engine] Calling Gemini model for business ${businessId}, conversation ${conversationId}...`);
        const result = await geminiCustomerReplyService.generateCustomerReply({ business, conversationHistory: history, customerMessage, customerLanguage: db.getCustomer(businessId, conv?.customerId)?.preferredLanguage || 'auto', conversationState: conv?.status || 'AI_ACTIVE' });
        return {
          text: result.text,
          source: 'gemini',
          requiresHumanHandoff: false
        };
      } catch (err) {
        console.warn('[AI Engine] Gemini API call failed, falling back to local engine:', err.message);
      }
    }

    // Fallback to deterministic business knowledge engine
    const reply = this.generateFallbackReply(business, customerMessage);
    return {
      text: reply,
      source: 'local-knowledge-engine',
      requiresHumanHandoff: false
    };
  }
}

export const receptionistEngine = new ReceptionistEngine();
