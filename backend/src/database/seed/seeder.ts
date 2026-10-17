import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ContentItem } from '../../modules/content/content-item.entity';
import { Setting } from '../../modules/settings/setting.entity';
import { DEFAULT_SETTINGS } from '../../modules/settings/settings.service';
import { CONTENT_SECTION_KEYS } from '../../common/constants/domain';
import { SEED_CONTENT } from './seed-data';

const log = new Logger('Seeder');

/** Seeds empty tables only, so edits made in the admin are never overwritten. */
export async function seedDatabase(ds: DataSource): Promise<void> {
  const items = ds.getRepository(ContentItem);
  if ((await items.count()) === 0) {
    let n = 0;
    for (const section of CONTENT_SECTION_KEYS) {
      const list = SEED_CONTENT[section] || [];
      await items.save(list.map((it, i) => items.create({ section, title: it.title, body: it.body ?? '', confirmed: it.confirmed !== false, sortOrder: i + 1 })));
      n += list.length;
    }
    log.log(`Seeded ${n} content items`);
  }

  const settings = ds.getRepository(Setting);
  const existing = new Set((await settings.find()).map((s) => s.key));
  const missing = Object.entries(DEFAULT_SETTINGS).filter(([k]) => !existing.has(k));
  if (missing.length) {
    await settings.save(missing.map(([key, value]) => settings.create({ key, value: JSON.stringify(value) })));
    log.log(`Seeded ${missing.length} settings`);
  }
}

export async function resetDatabase(ds: DataSource): Promise<void> {
  await ds.dropDatabase();
  await ds.synchronize();
  log.warn('Database reset');
}
