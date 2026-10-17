/** Business rules (allowed values) shared by the API and exposed to the frontend. */

export const SERVICES = [
  { value: 'ac', label: 'Air conditioning service / repair' },
  { value: 'heating', label: 'Heating service / repair' },
  { value: 'installation', label: 'Installation or replacement enquiry' },
  { value: 'repair', label: 'Repair — other HVAC equipment' },
  { value: 'general', label: 'General enquiry / not sure' },
] as const;

export const EQUIPMENT = [
  { value: 'central-ac', label: 'Central air conditioner' },
  { value: 'heat-pump', label: 'Heat pump' },
  { value: 'furnace', label: 'Furnace' },
  { value: 'ductless', label: 'Ductless / mini-split' },
  { value: 'thermostat', label: 'Thermostat / controls' },
  { value: 'ductwork', label: 'Ductwork / vents' },
  { value: 'rooftop', label: 'Rooftop / packaged unit' },
  { value: 'other', label: 'Other / Not sure' },
] as const;

export const PROPERTY_TYPES = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'other', label: 'Other' },
] as const;

export const TIME_WINDOWS = [
  { value: 'morning', label: 'Morning' },
  { value: 'midday', label: 'Midday' },
  { value: 'afternoon', label: 'Afternoon' },
] as const;

export const REQUEST_STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'in_review', label: 'In review' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'closed', label: 'Closed' },
] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number]['value'];
export const REQUEST_STATUS_VALUES = REQUEST_STATUSES.map((s) => s.value) as RequestStatus[];
export const REQUEST_STATUS_LABEL: Record<string, string> = Object.fromEntries(REQUEST_STATUSES.map((s) => [s.value, s.label]));

export const values = (list: readonly { value: string }[]) => list.map((x) => x.value);
export const labelOf = (list: readonly { value: string; label: string }[], v: string) => list.find((x) => x.value === v)?.label ?? v;

/** Rules for the photos attached to a request. */
export const PHOTO_RULES = {
  maxFiles: 3,
  maxBytes: 8 * 1024 * 1024,
  formats: 'JPEG, PNG, WebP or HEIC',
} as const;

export const REQUEST_RULES = {
  /** Server-enforced "form filled in too quickly" check. */
  minFillMs: 2500,
  tokenMaxAgeMs: 12 * 60 * 60 * 1000,
  rateWindowMs: 10 * 60 * 1000,
  rateMax: 5,
  /** The preferred date must fall between today and this many days ahead. */
  maxDaysAhead: 180,
} as const;

export const REQUESTS_PAGE_SIZE = 10;

/**
 * Editable content sections. Each is a list of items shown on one page of the site.
 * `confirmed: false` items are the prototype's "pending confirmation" drafts: they appear
 * only while draft markers are on and are hidden in production.
 */
export const CONTENT_SECTIONS = [
  { key: 'home_expect', label: 'Home · What to expect', page: 'Home', body: true, hint: 'Three principles shown under “What to expect when you get in touch”.' },
  { key: 'home_steps', label: 'Home · How a request works', page: 'Home', body: true, hint: 'The numbered steps of the request process.' },
  { key: 'ac_services', label: 'Air conditioning · Services', page: 'Air Conditioning', body: true, hint: 'The list under “How we can help with cooling”.' },
  { key: 'heating_services', label: 'Heating · Services', page: 'Heating', body: true, hint: 'The cards under “Heating help, organised by what you need”.' },
  { key: 'install_items', label: 'Installation · Scope', page: 'Installation & Repairs', body: false, hint: 'Bullet list under Installation.' },
  { key: 'repair_items', label: 'Repairs · Scope', page: 'Installation & Repairs', body: false, hint: 'Bullet list under Repairs.' },
  { key: 'include_list', label: 'Installation · What to include', page: 'Installation & Repairs', body: false, hint: 'Checklist under “What to include in your request”.' },
  { key: 'faqs', label: 'FAQs (Air conditioning page)', page: 'Air Conditioning', body: true, hint: 'Accordion questions. Use {{phone}} and {{email}} to insert the current contact details.' },
  { key: 'privacy', label: 'Privacy notice', page: 'Privacy', body: true, hint: 'Headings and paragraphs of the privacy notice. A contact paragraph is added automatically.' },
] as const;
export type ContentSectionKey = (typeof CONTENT_SECTIONS)[number]['key'];
export const CONTENT_SECTION_KEYS = CONTENT_SECTIONS.map((s) => s.key) as ContentSectionKey[];

/** Image slots from the prototype's <image-slot> elements. */
export const IMAGE_SLOTS = [
  { id: 'hero-main', label: 'Home · Hero photo', hint: 'Professional HVAC technician servicing a residential air conditioner', ratio: 'Wide, about 7:5' },
  { id: 'svc-ac', label: 'Home · Air conditioning card', hint: 'Modern outdoor HVAC condenser, residential exterior', ratio: 'Wide' },
  { id: 'svc-heat', label: 'Home · Heating thumbnail', hint: 'Furnace', ratio: 'Small, 4:3' },
  { id: 'svc-install', label: 'Home · Installation thumbnail', hint: 'Installation', ratio: 'Small, 4:3' },
  { id: 'svc-repair', label: 'Home · Repairs thumbnail', hint: 'Repair', ratio: 'Small, 4:3' },
  { id: 'ac-hero', label: 'Air conditioning · Hero', hint: 'Commercial rooftop HVAC equipment', ratio: 'Very wide' },
  { id: 'ac-band', label: 'Air conditioning · Detail band', hint: 'Modern thermostat, indoor climate control', ratio: 'Wide' },
  { id: 'heat-hero', label: 'Heating · Hero (warm tones)', hint: 'HVAC technician inspecting a furnace', ratio: 'Tall-ish, 5:4' },
  { id: 'heat-detail-1', label: 'Heating · Detail left', hint: 'Clean modern residential mechanical room', ratio: 'Wide' },
  { id: 'heat-detail-2', label: 'Heating · Detail right', hint: 'Warm interior with thermostat', ratio: 'Wide' },
  { id: 'inst-hero', label: 'Installation · Hero', hint: 'Professional ductwork installation close-up', ratio: 'Wide' },
  { id: 'inst-detail', label: 'Installation · Inset detail', hint: 'HVAC technician diagnostic equipment close-up', ratio: '4:3' },
  { id: 'about-photo', label: 'About · Team or van photo', hint: 'A real Keller HVAC photo is preferred', ratio: 'Portrait-ish, 4:3' },
] as const;
export const IMAGE_SLOT_IDS = IMAGE_SLOTS.map((s) => s.id) as string[];
export const IMAGE_MAX_BYTES = 8 * 1024 * 1024;
