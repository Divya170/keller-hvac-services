import { EQUIPMENT, PROPERTY_TYPES, REQUEST_RULES, SERVICES, TIME_WINDOWS, values } from '../../common/constants/domain';
import { clip, str } from '../../common/utils/text';

export interface RequestInput {
  fullName?: unknown;
  phone?: unknown;
  email?: unknown;
  property?: unknown;
  location?: unknown;
  service?: unknown;
  equipment?: unknown;
  issue?: unknown;
  date?: unknown;
  window?: unknown;
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+()\d\s.\-]+((\s*(x|ext\.?)\s*)\d{1,6})?$/i;
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

const DAY_MS = 24 * 60 * 60 * 1000;
const utcDay = (d: Date) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());

/** Returns a message if `date` (YYYY-MM-DD) is not a real date within the booking window, else ''. */
export function validateDate(date: string, now = new Date()): string {
  if (!date) return '';
  const m = DATE_RE.exec(date);
  if (!m) return 'Enter a valid date.';
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const t = Date.UTC(y, mo - 1, d);
  const check = new Date(t);
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== mo - 1 || check.getUTCDate() !== d) return 'Enter a valid date.';
  // One day of slack each side so a customer's local "today" is accepted whatever the server's time zone.
  const today = utcDay(now);
  if (t < today - DAY_MS) return 'Choose today or a future date.';
  if (t > today + (REQUEST_RULES.maxDaysAhead + 1) * DAY_MS) return 'Choose a date within the next 6 months.';
  return '';
}

/** Authoritative service-request validation (same rules and wording as the prototype). */
export function validateRequest(v: RequestInput, now = new Date()): Record<string, string> {
  const e: Record<string, string> = {};
  const fullName = str(v.fullName);
  const phone = str(v.phone);
  const email = str(v.email);
  const location = str(v.location);
  const issue = str(v.issue);

  if (!fullName) e.fullName = 'Enter your full name.';
  else if (fullName.length < 2) e.fullName = 'Name must be at least 2 characters.';
  else if (fullName.length > 80) e.fullName = 'Name must be 80 characters or fewer.';

  if (!phone) e.phone = 'Enter a phone number.';
  else if (!PHONE_RE.test(phone)) e.phone = 'Use digits and common symbols only, e.g. +1 (555) 123-4567.';
  else {
    const digits = phone.replace(/(x|ext\.?).*$/i, '').replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 15) e.phone = 'Phone number should contain 7 to 15 digits.';
  }

  if (!email) e.email = 'Enter an email address.';
  else if (email.length > 254 || !EMAIL_RE.test(email)) e.email = 'Enter a valid email address, e.g. name@example.com.';

  if (!values(PROPERTY_TYPES).includes(str(v.property))) e.property = 'Select the property type.';

  if (location.length < 3) e.location = 'Enter the property address, or city and ZIP code.';
  else if (location.length > 160) e.location = 'Keep the location under 160 characters.';

  if (!values(SERVICES).includes(str(v.service))) e.service = 'Select the service you need.';
  if (!values(EQUIPMENT).includes(str(v.equipment))) e.equipment = 'Select the equipment type, or choose Other / Not sure.';

  if (!issue) e.issue = 'Describe the issue so the team can review it.';
  else if (issue.length < 20) e.issue = 'Add a little more detail (at least 20 characters).';
  else if (issue.length > 1500) e.issue = 'Keep the description under 1,500 characters.';

  const dateMsg = validateDate(str(v.date), now);
  if (dateMsg) e.date = dateMsg;

  const win = str(v.window);
  if (win && !values(TIME_WINDOWS).includes(win)) e.window = 'Choose Morning, Midday or Afternoon, or leave it blank.';
  return e;
}

export function sanitizeRequest(v: RequestInput) {
  return {
    fullName: clip(v.fullName, 80),
    phone: clip(v.phone, 32),
    email: clip(v.email, 254).toLowerCase(),
    property: str(v.property),
    location: clip(v.location, 160),
    service: str(v.service),
    equipment: str(v.equipment),
    issue: clip(v.issue, 1500),
    preferredDate: str(v.date),
    preferredWindow: str(v.window),
  };
}
