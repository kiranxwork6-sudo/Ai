import { db } from '../../storage/db.js';

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
4. If a customer is upset, asks for something unusual, or explicitly asks for a human/manager, reassure them and let them know a staff member is notified.
5. Use a friendly and welcoming tone, suitable for WhatsApp.`;
  }

  /**
   * Generates a reply using Google Gemini API if GEMINI_API_KEY is configured
   */
  async generateWithGemini(business, conversationHistory, latestCustomerMessage) {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const systemPrompt = this.buildSystemPrompt(business);

    // Format previous turns for Gemini API
    const contents = [
      {
        role: 'user',
        parts: [{ text: systemPrompt + '\n\nPlease acknowledge receipt of these instructions.' }]
      },
      {
        role: 'model',
        parts: [{ text: `Understood! I am the AI receptionist for ${business.name}. I will answer customer inquiries concisely and warmly based exclusively on this information.` }]
      }
    ];

    // Add recent context (up to last 6 messages)
    const recentHistory = conversationHistory.slice(-6);
    for (const msg of recentHistory) {
      contents.push({
        role: msg.sender === 'customer' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      });
    }

    // Add latest query
    contents.push({
      role: 'user',
      parts: [{ text: latestCustomerMessage }]
    });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 250
        }
      })
    });

    const data = await response.json();
    if (!response.ok || data.error) {
      throw new Error(data.error?.message || response.statusText);
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Empty response from Gemini API');
    }

    return text.trim();
  }

  /**
   * Built-in intelligent fallback knowledge engine.
   * Runs locally with zero API keys required, parsing the exact business data.
   */
  generateFallbackReply(business, messageText) {
    const lower = messageText.toLowerCase();

    // 1. Human handoff trigger
    if (lower.includes('human') || lower.includes('person') || lower.includes('speak to someone') || lower.includes('manager') || lower.includes('agent')) {
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
      const parkingFaq = business.faqs.find(f => f.question.toLowerCase().includes('park'));
      if (parkingFaq) return parkingFaq.answer;
      return `Parking is available near our location at ${business.address}.`;
    }

    // 4. Hours / Opening times / Days
    if (lower.includes('hour') || lower.includes('open') || lower.includes('close') || lower.includes('time') || lower.includes('sunday') || lower.includes('saturday') || lower.includes('weekend') || lower.includes('monday') || lower.includes('friday')) {
      // Check for specific days
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      for (const d of days) {
        if (lower.includes(d)) {
          const match = business.openingHours.find(h => h.day.toLowerCase() === d);
          if (match) {
            return match.closed
              ? `We are closed on ${match.day}s.`
              : `On ${match.day}s, our hours are ${match.open} to ${match.close}.`;
          }
        }
      }

      // General hours summary
      const openDays = business.openingHours
        .map(h => `${h.day}: ${h.closed ? 'Closed' : `${h.open} - ${h.close}`}`)
        .join(', ');
      return `Our opening hours are:\n${business.openingHours.map(h => `• ${h.day}: ${h.closed ? 'Closed' : `${h.open} - ${h.close}`}`).join('\n')}`;
    }

    // 5. Pricing / Cost / How much
    if (lower.includes('price') || lower.includes('cost') || lower.includes('how much') || lower.includes('rate') || lower.includes('fee')) {
      // Check if a specific service is mentioned
      for (const service of business.services) {
        const words = service.name.toLowerCase().split(' ');
        const matches = words.filter(w => w.length > 3 && lower.includes(w));
        if (matches.length > 0) {
          return `${service.name} is ${service.price}. ${service.description || ''}`.trim();
        }
      }

      // Otherwise list all services with prices
      const list = business.services.map(s => `• ${s.name} — ${s.price}`).join('\n');
      return `Here is our current pricing:\n${list}\n\nWould you like to book one of these services?`;
    }

    // 6. Services / Treatments / What do you offer
    if (lower.includes('service') || lower.includes('treatment') || lower.includes('offer') || lower.includes('menu') || lower.includes('what do you do')) {
      const list = business.services.map(s => `• ${s.name} (${s.price})`).join('\n');
      return `At ${business.name}, we offer the following services:\n${list}\n\nWould you like more details on any of these?`;
    }

    // 7. Check FAQs match
    for (const faq of business.faqs) {
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
      const cancelFaq = business.faqs.find(f => f.question.toLowerCase().includes('cancel'));
      if (cancelFaq) return cancelFaq.answer;
      return `For cancellations or rescheduling, please notify us as early as possible so we can update our schedule.`;
    }

    // 10. Default helpful receptionist response
    return `Thank you for reaching out to ${business.name}! We offer a variety of services including ${business.services.slice(0, 2).map(s => s.name).join(' and ')}. You can ask me about our pricing, opening hours, or location at ${business.address}. How may I help you?`;
  }

  /**
   * Main answer pipeline
   */
  async generateReply({ conversationId, customerMessage }) {
    const business = db.getBusiness();
    const conv = db.getConversation(conversationId);
    const history = conv ? conv.messages : [];

    // If GEMINI_API_KEY is configured, use Gemini
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '') {
      try {
        console.log(`[AI Engine] Calling Gemini model for conversation ${conversationId}...`);
        const reply = await this.generateWithGemini(business, history, customerMessage);
        return {
          text: reply,
          source: 'gemini'
        };
      } catch (err) {
        console.warn('[AI Engine] Gemini API call failed, falling back to local engine:', err.message);
      }
    }

    // Fallback to local deterministic business knowledge engine
    const reply = this.generateFallbackReply(business, customerMessage);
    return {
      text: reply,
      source: 'local-knowledge-engine'
    };
  }
}

export const receptionistEngine = new ReceptionistEngine();
