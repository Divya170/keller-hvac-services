import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './setting.entity';

export interface SiteSettings {
  /** Draft markers: shows "pending confirmation" notes and unconfirmed content (the prototype's draftMarkers). */
  reviewNotes: boolean;
  /** Testing: make service-request submissions fail (the prototype's network-error submit mode). */
  simulateFailure: boolean;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  addressLine1: string;
  addressLine2: string;
  /** Marks the address as verified; until then the draft marker shows beside it. */
  addressVerified: boolean;
  serviceArea: string;
  businessHours: string;
  aboutIntro: string;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  reviewNotes: true,
  simulateFailure: false,
  contactName: 'Bryce Keller',
  contactEmail: 'bryce.keller@kellerhvac.com',
  contactPhone: '+1 (702) 220-8394',
  addressLine1: '1 Civic Center Plaza',
  addressLine2: 'San Diego, CA 92101',
  addressVerified: false,
  serviceArea: '',
  businessHours: '',
  aboutIntro:
    'Keller HVAC Services provides heating, ventilation and air-conditioning service. For questions or to arrange service, contact Bryce Keller by phone or email, or send a service request online.',
};

export interface PublicSite {
  reviewNotes: boolean;
  contact: { name: string; email: string; phone: string; phoneHref: string; addressLine1: string; addressLine2: string; addressVerified: boolean };
  serviceArea: string;
  businessHours: string;
  aboutIntro: string;
}

@Injectable()
export class SettingsService {
  constructor(@InjectRepository(Setting) private readonly repo: Repository<Setting>) {}

  async getAll(): Promise<SiteSettings> {
    const rows = await this.repo.find();
    const out: SiteSettings = { ...DEFAULT_SETTINGS };
    for (const r of rows) {
      if (r.key in out) {
        try {
          (out as unknown as Record<string, unknown>)[r.key] = JSON.parse(r.value);
        } catch {
          /* keep default */
        }
      }
    }
    return out;
  }

  async update(patch: Partial<SiteSettings>): Promise<SiteSettings> {
    const entries = Object.entries(patch).filter(([k, v]) => k in DEFAULT_SETTINGS && v !== undefined);
    if (entries.length) await this.repo.save(entries.map(([key, value]) => this.repo.create({ key, value: JSON.stringify(value) })));
    return this.getAll();
  }

  async isReview(): Promise<boolean> {
    return (await this.getAll()).reviewNotes;
  }

  toPublic(s: SiteSettings): PublicSite {
    return {
      reviewNotes: s.reviewNotes,
      contact: {
        name: s.contactName,
        email: s.contactEmail,
        phone: s.contactPhone,
        phoneHref: 'tel:' + s.contactPhone.replace(/[^\d+]/g, ''),
        addressLine1: s.addressLine1,
        addressLine2: s.addressLine2,
        addressVerified: s.addressVerified,
      },
      serviceArea: s.serviceArea,
      businessHours: s.businessHours,
      aboutIntro: s.aboutIntro,
    };
  }

  async getPublic(): Promise<PublicSite> {
    return this.toPublic(await this.getAll());
  }
}
