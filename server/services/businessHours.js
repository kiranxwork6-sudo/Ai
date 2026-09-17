export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_24 = /^([01]\d|2[0-3]):[0-5]\d$/;
const TIME_12 = /^(0?[1-9]|1[0-2]):([0-5]\d)\s?(AM|PM)$/i;

export function to24HourTime(value) {
  const raw = String(value || '').trim();
  if (TIME_24.test(raw)) return raw;
  const match = raw.match(TIME_12);
  if (!match) return null;
  let hour = Number(match[1]);
  if (match[3].toUpperCase() === 'PM' && hour !== 12) hour += 12;
  if (match[3].toUpperCase() === 'AM' && hour === 12) hour = 0;
  return `${String(hour).padStart(2, '0')}:${match[2]}`;
}

export function formatBusinessTime(value) {
  const time = to24HourTime(value);
  if (!time) return '';
  const [hour, minute] = time.split(':').map(Number);
  return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
}

export function normalizeBusinessHours(hours) {
  if (!Array.isArray(hours) || hours.length !== DAYS_OF_WEEK.length) throw new Error('Provide opening hours for all seven days.');
  const seen = new Set();
  return hours.map((entry) => {
    const day = String(entry?.day || '');
    if (!DAYS_OF_WEEK.includes(day) || seen.has(day)) throw new Error('Each valid day must appear exactly once.');
    seen.add(day);
    const closed = entry.closed === true || entry.isOpen === false;
    if (closed) return { day, closed: true, open: '', close: '' };
    const open = to24HourTime(entry.open ?? entry.openTime);
    const close = to24HourTime(entry.close ?? entry.closeTime);
    if (!open || !close) throw new Error(`${day}: opening and closing times are required when open.`);
    if (open >= close) throw new Error(`${day}: opening time must be before closing time.`);
    return { day, closed: false, open, close };
  }).sort((a, b) => DAYS_OF_WEEK.indexOf(a.day) - DAYS_OF_WEEK.indexOf(b.day));
}

export function hoursForGemini(hours, timezone = 'Asia/Kolkata') {
  const normalized = Array.isArray(hours) && hours.length === DAYS_OF_WEEK.length ? hours : [];
  const now = new Date();
  let current = '';
  try { current = new Intl.DateTimeFormat('en-US', { timeZone: timezone, weekday: 'long', hour: 'numeric', minute: '2-digit', hour12: true }).format(now); }
  catch { current = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', weekday: 'long', hour: 'numeric', minute: '2-digit', hour12: true }).format(now); timezone = 'Asia/Kolkata'; }
  if (!normalized.length) return { timezone, current, schedule: 'Hours are not configured. Tell the customer you do not have opening hours available and offer human assistance.' };
  return { timezone, current, schedule: normalized.map((item) => `- ${item.day}: ${item.closed ? 'Closed' : `${formatBusinessTime(item.open)}–${formatBusinessTime(item.close)}`}`).join('\n') };
}
