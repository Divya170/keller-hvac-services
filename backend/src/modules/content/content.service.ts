import { BadRequestException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CONTENT_SECTIONS, CONTENT_SECTION_KEYS, type ContentSectionKey } from '../../common/constants/domain';
import { str } from '../../common/utils/text';
import { SettingsService } from '../settings/settings.service';
import { ContentItem } from './content-item.entity';

const MAX_PER_SECTION = 30;

export interface PublicContentItem {
  id: number;
  title: string;
  body: string;
  confirmed: boolean;
}

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(ContentItem) private readonly repo: Repository<ContentItem>,
    private readonly settings: SettingsService,
  ) {}

  private cfg(section: string) {
    const c = CONTENT_SECTIONS.find((s) => s.key === section);
    if (!c) throw new NotFoundException({ message: 'That content section doesn’t exist.' });
    return c;
  }

  /** All sections for the public site. Drafts (unconfirmed items) are included only in review mode. */
  async publicAll(): Promise<Record<string, PublicContentItem[]>> {
    const site = await this.settings.getAll();
    const rows = await this.repo.find({ order: { sortOrder: 'ASC', id: 'ASC' } });
    const fill = (t: string) => t.replace(/\{\{\s*phone\s*\}\}/gi, site.contactPhone).replace(/\{\{\s*email\s*\}\}/gi, site.contactEmail);
    const out: Record<string, PublicContentItem[]> = Object.fromEntries(CONTENT_SECTION_KEYS.map((k) => [k, []]));
    for (const r of rows) {
      if (!CONTENT_SECTION_KEYS.includes(r.section)) continue;
      if (!r.confirmed && !site.reviewNotes) continue;
      out[r.section].push({ id: r.id, title: fill(r.title), body: fill(r.body), confirmed: r.confirmed });
    }
    return out;
  }

  // ---------- admin ----------

  sections() {
    return CONTENT_SECTIONS;
  }

  async list(section: string) {
    this.cfg(section);
    const items = await this.repo.find({ where: { section: section as ContentSectionKey }, order: { sortOrder: 'ASC', id: 'ASC' } });
    return { section, items };
  }

  async counts() {
    const rows = await this.repo.createQueryBuilder('c').select('c.section', 'section').addSelect('COUNT(*)', 'n').groupBy('c.section').getRawMany<{ section: string; n: number }>();
    return Object.fromEntries(CONTENT_SECTION_KEYS.map((k) => [k, Number(rows.find((r) => r.section === k)?.n ?? 0)]));
  }

  private validate(section: string, input: { title?: unknown; body?: unknown }) {
    const cfg = this.cfg(section);
    const errors: Record<string, string> = {};
    const title = str(input.title);
    const body = cfg.body ? str(input.body) : '';
    if (!title) errors.title = cfg.body ? 'Enter a title.' : 'Enter the text for this line.';
    else if (title.length < 2) errors.title = 'Use at least 2 characters.';
    else if (title.length > 200) errors.title = 'Keep this under 200 characters.';
    if (cfg.body) {
      if (!body) errors.body = 'Write the text for this item.';
      else if (body.length < 5) errors.body = 'Write at least a few words.';
      else if (body.length > 1500) errors.body = 'Keep this under 1,500 characters.';
    }
    if (Object.keys(errors).length) throw new UnprocessableEntityException({ message: 'Please fix the highlighted fields.', errors });
    return { title, body };
  }

  async create(section: string, input: { title?: unknown; body?: unknown; confirmed?: boolean }) {
    const { title, body } = this.validate(section, input);
    const existing = await this.repo.find({ where: { section: section as ContentSectionKey } });
    if (existing.length >= MAX_PER_SECTION) throw new BadRequestException({ message: `A section can hold up to ${MAX_PER_SECTION} items.` });
    const sortOrder = existing.reduce((m, r) => Math.max(m, r.sortOrder), 0) + 1;
    return this.repo.save(this.repo.create({ section: section as ContentSectionKey, title, body, confirmed: input.confirmed !== false, sortOrder }));
  }

  private async find(id: number) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException({ message: 'This item no longer exists.' });
    return item;
  }

  async update(id: number, input: { title?: unknown; body?: unknown; confirmed?: boolean }) {
    const item = await this.find(id);
    const { title, body } = this.validate(item.section, input);
    item.title = title;
    item.body = body;
    if (typeof input.confirmed === 'boolean') item.confirmed = input.confirmed;
    return this.repo.save(item);
  }

  async remove(id: number) {
    const item = await this.find(id);
    await this.repo.remove(item);
    return { deleted: true };
  }

  /** Swaps an item with its neighbour. */
  async move(id: number, direction: 'up' | 'down') {
    const item = await this.find(id);
    const all = await this.repo.find({ where: { section: item.section }, order: { sortOrder: 'ASC', id: 'ASC' } });
    const i = all.findIndex((x) => x.id === id);
    const j = direction === 'up' ? i - 1 : i + 1;
    if (j < 0 || j >= all.length) return this.list(item.section);
    [all[i], all[j]] = [all[j], all[i]];
    await this.repo.save(all.map((x, n) => ({ ...x, sortOrder: n + 1 })));
    return this.list(item.section);
  }
}
