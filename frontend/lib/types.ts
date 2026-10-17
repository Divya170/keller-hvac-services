/** Shapes returned by the NestJS API. */

export interface SiteInfo {
  reviewNotes: boolean;
  contact: { name: string; email: string; phone: string; phoneHref: string; addressLine1: string; addressLine2: string; addressVerified: boolean };
  serviceArea: string;
  businessHours: string;
  aboutIntro: string;
  /** Image slots that have a photo: slot → { v: version, alt }. */
  images: Record<string, { v: number; alt: string }>;
}

export interface ContentItem {
  id: number;
  title: string;
  body: string;
  confirmed: boolean;
}
export type Content = Record<string, ContentItem[]>;

export interface Option {
  value: string;
  label: string;
}

export interface RequestOptions {
  services: Option[];
  equipment: Option[];
  properties: Option[];
  windows: Option[];
  photos: { maxFiles: number; maxBytes: number; formats: string };
  maxDaysAhead: number;
}

export type RequestStatus = 'new' | 'in_review' | 'contacted' | 'scheduled' | 'closed';

export interface RequestListItem {
  ref: string;
  fullName: string;
  phone: string;
  email: string;
  service: string;
  serviceLabel: string;
  location: string;
  photos: number;
  status: RequestStatus;
  statusLabel: string;
  createdAt: string;
}

export interface RequestList {
  items: RequestListItem[];
  total: number;
  page: number;
  pages: number;
  pageSize: number;
  counts: Record<string, number>;
  statuses: { value: RequestStatus; label: string }[];
  services: Option[];
}

export interface RequestDetail {
  ref: string;
  status: RequestStatus;
  statusLabel: string;
  fullName: string;
  phone: string;
  email: string;
  property: string;
  propertyLabel: string;
  location: string;
  service: string;
  serviceLabel: string;
  equipment: string;
  equipmentLabel: string;
  issue: string;
  preferredDate: string;
  preferredWindow: string;
  windowLabel: string;
  notes: string;
  createdAt: string;
  attachments: { id: string; name: string; kind: string; mime: string; size: number; inline: boolean }[];
  history: { status: RequestStatus; label: string; at: string }[];
}

export interface AdminSettings {
  reviewNotes: boolean;
  simulateFailure: boolean;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  addressLine1: string;
  addressLine2: string;
  addressVerified: boolean;
  serviceArea: string;
  businessHours: string;
  aboutIntro: string;
}

export interface ContentSectionInfo {
  key: string;
  label: string;
  page: string;
  body: boolean;
  hint: string;
}

export interface AdminContentItem {
  id: number;
  section: string;
  title: string;
  body: string;
  confirmed: boolean;
  sortOrder: number;
}

export interface ImageSlotInfo {
  id: string;
  label: string;
  hint: string;
  ratio: string;
  hasImage: boolean;
  alt: string;
  size: number;
  mime: string;
  v: number;
}
