import assert from 'node:assert/strict';
import { db } from './storage/db.js';
import { DAYS_OF_WEEK, hoursForGemini, normalizeBusinessHours } from './services/businessHours.js';

const sampleHours = DAYS_OF_WEEK.map((day) => ({ day, closed: day === 'Sunday', open: day === 'Saturday' ? '10:00' : '09:00', close: day === 'Saturday' ? '17:00' : '19:00' }));
const normalized = normalizeBusinessHours(sampleHours);
assert.equal(normalized.length, 7, 'all seven days must be saved');
assert.deepEqual(normalized.find((item) => item.day === 'Sunday'), { day: 'Sunday', closed: true, open: '', close: '' }, 'closed days must not retain active times');
assert.throws(() => normalizeBusinessHours([{ day: 'Monday', closed: false, open: '19:00', close: '09:00' }, ...sampleHours.slice(1)]), /before closing/, 'opening time must be before closing time');
assert.throws(() => normalizeBusinessHours(sampleHours.slice(0, 6)), /seven days/, 'all days are required');
const context = hoursForGemini(normalized, 'Asia/Kolkata');
assert.match(context.schedule, /Saturday: 10:00 AM–5:00 PM/, 'Gemini context must be built from saved hours');
assert.equal(db.getBusinessHours('another-tenant'), null, 'hours retrieval must not cross tenant boundaries');
console.log('Business-hours validation, dynamic Gemini context, and tenant isolation tests passed.');
