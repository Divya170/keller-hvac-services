/**
 * Client-side mirror of the server's service-request rules, for instant feedback.
 * The NestJS API re-validates everything and is the source of truth.
 */
import type { Option } from './types';

export const FIELD_ORDER = ['fullName', 'phone', 'email', 'property', 'location', 'service', 'equipment', 'issue', 'date'] as const;
export type FieldName = (typeof FIELD_ORDER)[number];
export type ErrorKey = FieldName | 'window' | 'photos';

export const FIELD_LABELS: Record<ErrorKey, string> = {
  fullName: 'Full name',
  phone: 'Phone number',
  email: 'Email address',
  property: 'Property type',
  location: 'Property location',
  service: 'Service required',
  equipment: 'Equipment type',
  issue: 'Issue description',
  date: 'Preferred date',
  window: 'Preferred time',
  photos: 'Photos',
};

export interface RequestForm {
  fullName: string;
  phone: string;
  email: string;
  property: string;
  location: string;
  service: string;
  equipment: string;
  issue: string;
  date: string;
  window: string;
  website: string;
}

export const blankRequest: RequestForm = { fullName: '', phone: '', email: '', property: '', location: '', service: '', equipment: '', issue: '', date: '', window: '', website: '' };

export interface Lists {
  services: Option[];
  equipment: Option[];
  properties: Option[];
  maxDaysAhead: number;
}

export const ymd = (d: Date) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

export function validateField(name: FieldName, value: string, lists: Lists): string {
  const t = (value ?? '').trim();
  switch (name) {
    case 'fullName':
      if (!t) return 'Enter your full name.';
      if (t.length < 2) return 'Name must be at least 2 characters.';
      if (t.length > 80) return 'Name must be 80 characters or fewer.';
      return '';
    case 'phone': {
      if (!t) return 'Enter a phone number.';
      if (!/^[+()\d\s.\-]+((\s*(x|ext\.?)\s*)\d{1,6})?$/i.test(t)) return 'Use digits and common symbols only, e.g. +1 (555) 123-4567.';
      const d = t.replace(/(x|ext\.?).*$/i, '').replace(/\D/g, '');
      if (d.length < 7 || d.length > 15) return 'Phone number should contain 7 to 15 digits.';
      return '';
    }
    case 'email':
      if (!t) return 'Enter an email address.';
      if (t.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t)) return 'Enter a valid email address, e.g. name@example.com.';
      return '';
    case 'property':
      return lists.properties.some((o) => o.value === t) ? '' : 'Select the property type.';
    case 'location':
      if (t.length < 3) return 'Enter the property address, or city and ZIP code.';
      if (t.length > 160) return 'Keep the location under 160 characters.';
      return '';
    case 'service':
      return lists.services.some((o) => o.value === t) ? '' : 'Select the service you need.';
    case 'equipment':
      return lists.equipment.some((o) => o.value === t) ? '' : 'Select the equipment type, or choose Other / Not sure.';
    case 'issue':
      if (!t) return 'Describe the issue so the team can review it.';
      if (t.length < 20) return 'Add a little more detail (at least 20 characters).';
      if (t.length > 1500) return 'Keep the description under 1,500 characters.';
      return '';
    case 'date': {
      if (!t) return '';
      const d = new Date(t + 'T00:00:00');
      if (isNaN(d.getTime())) return 'Enter a valid date.';
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (d < today) return 'Choose today or a future date.';
      const max = new Date(today);
      max.setDate(max.getDate() + lists.maxDaysAhead);
      if (d > max) return 'Choose a date within the next 6 months.';
      return '';
    }
  }
}

export type PhotoKind = 'JPEG' | 'PNG' | 'WebP' | 'HEIC';

/** Identifies an image from its first bytes, like the server does (never trusts the file name). */
export async function sniffPhoto(file: File): Promise<PhotoKind | null> {
  try {
    const b = new Uint8Array(await file.slice(0, 16).arrayBuffer());
    const s = String.fromCharCode(...b);
    if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'JPEG';
    if (b[0] === 0x89 && s.slice(1, 4) === 'PNG') return 'PNG';
    if (s.slice(0, 4) === 'RIFF' && s.slice(8, 12) === 'WEBP') return 'WebP';
    if (s.slice(4, 8) === 'ftyp' && /^(heic|heix|mif1|msf1|hevc)/.test(s.slice(8, 12))) return 'HEIC';
  } catch {
    /* unreadable */
  }
  return null;
}
