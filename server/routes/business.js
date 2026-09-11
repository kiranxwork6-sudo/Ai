import express from 'express';
import { db } from '../storage/db.js';

const router = express.Router();

// Business Profile Templates for quick onboarding / demos
const templates = {
  spa: {
    name: "Glow & Co. Wellness Spa",
    tagline: "Boutique Massage, Organic Skincare & Holistic Therapy",
    description: "Glow & Co. is a premier boutique day spa offering rejuvenating massage therapy, organic facials, and holistic wellness treatments in a calm, tranquil setting.",
    phone: "+1 (555) 349-2810",
    address: "142 Lotus Blossom Way, Suite 200, Austin, TX 78701",
    openingHours: [
      { day: "Monday", open: "09:00 AM", close: "07:00 PM", closed: false },
      { day: "Tuesday", open: "09:00 AM", close: "07:00 PM", closed: false },
      { day: "Wednesday", open: "09:00 AM", close: "07:00 PM", closed: false },
      { day: "Thursday", open: "09:00 AM", close: "07:00 PM", closed: false },
      { day: "Friday", open: "09:00 AM", close: "07:00 PM", closed: false },
      { day: "Saturday", open: "10:00 AM", close: "06:00 PM", closed: false },
      { day: "Sunday", open: "Closed", close: "Closed", closed: true }
    ],
    services: [
      { id: "s1", name: "Swedish Relaxation Massage (60 min)", price: "$95", description: "Gentle full-body rhythmic massage to ease muscle tension and improve circulation." },
      { id: "s2", name: "Deep Tissue Recovery Therapy (75 min)", price: "$130", description: "Firm pressure targeting chronic tension, fascia tightness, and posture recovery." },
      { id: "s3", name: "Organic Radiance Glow Facial (50 min)", price: "$110", description: "Botanical deep cleanse, enzymatic exfoliation, custom serum, and cooling mask." },
      { id: "s4", name: "Hot Himalayan Salt Stone Add-on", price: "$35", description: "Warm mineral-rich salt stones to melt away deep tension and rebalance energy." }
    ],
    faqs: [
      { id: "f1", question: "Do I need an appointment or do you accept walk-ins?", answer: "We strongly recommend booking an appointment online or via WhatsApp to secure your slot, though walk-ins are welcomed subject to therapist availability." },
      { id: "f2", question: "What is your cancellation and rescheduling policy?", answer: "Please give us at least 24 hours notice for any cancellation or rescheduling to avoid a 50% cancellation fee." },
      { id: "f3", question: "Is parking available at the spa?", answer: "Yes! Complimentary covered parking is available in the building garage with validation at our front desk." },
      { id: "f4", question: "Can we book a couples massage?", answer: "Absolutely! We feature a private deluxe couples sanctuary room. Please let us know in advance so we can reserve it for you." }
    ]
  },
  dental: {
    name: "BrightSmile Family Dental Care",
    tagline: "Gentle, Modern Dental Care for the Whole Family",
    description: "BrightSmile provides state-of-the-art preventative, restorative, and cosmetic dental services with a gentle, patient-first approach.",
    phone: "+1 (555) 492-1100",
    address: "780 Health Parkway, Medical Plaza Suite 305, Denver, CO 80202",
    openingHours: [
      { day: "Monday", open: "08:00 AM", close: "05:00 PM", closed: false },
      { day: "Tuesday", open: "08:00 AM", close: "05:00 PM", closed: false },
      { day: "Wednesday", open: "08:00 AM", close: "05:00 PM", closed: false },
      { day: "Thursday", open: "08:00 AM", close: "05:00 PM", closed: false },
      { day: "Friday", open: "08:00 AM", close: "02:00 PM", closed: false },
      { day: "Saturday", open: "Closed", close: "Closed", closed: true },
      { day: "Sunday", open: "Closed", close: "Closed", closed: true }
    ],
    services: [
      { id: "d1", name: "Comprehensive Exam & Cleaning", price: "$145", description: "Full oral exam, digital x-rays, periodontal evaluation, and professional hygiene cleaning." },
      { id: "d2", name: "Professional In-Office Teeth Whitening", price: "$299", description: "Brightens teeth up to 8 shades in a single 60-minute appointment." },
      { id: "d3", name: "Tooth-Colored Composite Filling", price: "$175", description: "Natural-looking mercury-free dental filling to repair decay or damage." },
      { id: "d4", name: "Emergency Dental Consultation", price: "$90", description: "Immediate evaluation and pain relief for toothaches or cracked teeth." }
    ],
    faqs: [
      { id: "df1", question: "Do you accept dental insurance?", answer: "Yes, we accept most major PPO dental plans including Delta Dental, Cigna, MetLife, and Aetna. We also offer affordable in-house discount plans for uninsured patients." },
      { id: "df2", question: "What should I do in a dental emergency?", answer: "If you are experiencing severe pain or trauma, call our emergency hotline immediately at +1 (555) 492-1100. We reserve same-day emergency slots." },
      { id: "df3", question: "Is nitrous oxide (laughing gas) available for anxious patients?", answer: "Yes, we offer gentle nitrous oxide sedation upon request to ensure a completely stress-free visit." }
    ]
  },
  auto: {
    name: "Apex Precision Auto Care",
    tagline: "Honest Diagnostics, Certified Mechanics & Fair Pricing",
    description: "Apex Auto Care is an independent ASE-certified auto repair shop serving imports and domestic vehicles with transparent digital inspections.",
    phone: "+1 (555) 723-9014",
    address: "512 Industrial Blvd, Bay 4, Seattle, WA 98134",
    openingHours: [
      { day: "Monday", open: "07:30 AM", close: "06:00 PM", closed: false },
      { day: "Tuesday", open: "07:30 AM", close: "06:00 PM", closed: false },
      { day: "Wednesday", open: "07:30 AM", close: "06:00 PM", closed: false },
      { day: "Thursday", open: "07:30 AM", close: "06:00 PM", closed: false },
      { day: "Friday", open: "07:30 AM", close: "06:00 PM", closed: false },
      { day: "Saturday", open: "08:30 AM", close: "02:00 PM", closed: false },
      { day: "Sunday", open: "Closed", close: "Closed", closed: true }
    ],
    services: [
      { id: "a1", name: "Full Synthetic Oil & Filter Service", price: "$69", description: "Up to 5 quarts premium synthetic oil, OEM filter, and 30-point safety check." },
      { id: "a2", name: "Brake Pad Replacement & Rotor Resurface", price: "$220/axle", description: "Premium ceramic pads with rotor inspection and brake fluid check." },
      { id: "a3", name: "Computer Diagnostic & Check Engine Scan", price: "$85", description: "In-depth code scan, sensor test, and technician diagnostic report." },
      { id: "a4", name: "AC System Performance Recharge", price: "$140", description: "Refrigerant recovery, leak dye check, and system recharge." }
    ],
    faqs: [
      { id: "af1", question: "Do you provide a warranty on repairs?", answer: "Yes! All repairs come with our 24-month / 24,000-mile nationwide warranty on parts and labor." },
      { id: "af2", question: "Do you offer loaner vehicles or shuttle service?", answer: "We provide a complimentary shuttle within a 7-mile radius, as well as discounted rental cars for multi-day repairs." },
      { id: "af3", question: "Can I drop off my car before you open?", answer: "Yes, we have a secure night-drop key box located right next to garage Bay 1." }
    ]
  }
};

// GET /api/business
router.get('/', (req, res) => {
  const business = db.getBusiness();
  res.json({ success: true, business });
});

// PUT /api/business
router.put('/', (req, res) => {
  const updates = req.body;
  if (!updates || typeof updates !== 'object') {
    return res.status(400).json({ success: false, error: 'Invalid payload' });
  }

  const updated = db.updateBusiness(updates);
  res.json({ success: true, business: updated });
});

// POST /api/business/template/:type
router.post('/template/:type', (req, res) => {
  const { type } = req.params;
  const template = templates[type];
  if (!template) {
    return res.status(404).json({
      success: false,
      error: `Unknown template: ${type}. Available: ${Object.keys(templates).join(', ')}`
    });
  }

  const updated = db.updateBusiness(template);
  res.json({ success: true, business: updated, templateName: type });
});

export default router;
