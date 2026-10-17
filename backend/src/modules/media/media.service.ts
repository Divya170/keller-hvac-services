import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import { join } from 'path';
import { Repository } from 'typeorm';
import { IMAGE_MAX_BYTES, IMAGE_SLOT_IDS, IMAGE_SLOTS } from '../../common/constants/domain';
import { sniffImage } from '../../common/utils/file-sniff';
import { AppConfig } from '../../config/configuration';
import { SiteImage } from './site-image.entity';

@Injectable()
export class MediaService {
  private readonly dir: string;

  constructor(
    @InjectRepository(SiteImage) private readonly repo: Repository<SiteImage>,
    config: ConfigService,
  ) {
    this.dir = join(config.get<AppConfig>('app')!.uploadsPath, 'media');
  }

  /** slot → { v, alt } for slots that have a photo. `v` busts caches when a photo is replaced. */
  async publicMap(): Promise<Record<string, { v: number; alt: string }>> {
    const rows = await this.repo.find();
    return Object.fromEntries(rows.filter((r) => IMAGE_SLOT_IDS.includes(r.slot)).map((r) => [r.slot, { v: r.updatedAt.getTime(), alt: r.alt }]));
  }

  async adminList() {
    const rows = new Map((await this.repo.find()).map((r) => [r.slot, r]));
    return IMAGE_SLOTS.map((s) => {
      const r = rows.get(s.id);
      return { ...s, hasImage: !!r, alt: r?.alt ?? '', size: r?.size ?? 0, mime: r?.mime ?? '', v: r ? r.updatedAt.getTime() : 0 };
    });
  }

  private assertSlot(slot: string) {
    if (!IMAGE_SLOT_IDS.includes(slot)) throw new NotFoundException({ message: 'That image slot doesn’t exist.' });
  }

  async file(slot: string): Promise<{ path: string; mime: string }> {
    this.assertSlot(slot);
    const row = await this.repo.findOne({ where: { slot } });
    if (!row) throw new NotFoundException({ message: 'No image has been set for this slot.' });
    return { path: join(this.dir, row.fileName), mime: row.mime };
  }

  async set(slot: string, file: Express.Multer.File | undefined, alt: string) {
    this.assertSlot(slot);
    if (!file || !file.buffer?.length) throw new BadRequestException({ message: 'Choose an image to upload.', errors: { file: 'Choose an image to upload.' } });
    if (file.size > IMAGE_MAX_BYTES) throw new BadRequestException({ message: 'That image is larger than 8 MB.', errors: { file: 'That image is larger than 8 MB.' } });
    const kind = sniffImage(file.buffer);
    if (!kind || !kind.inline) {
      throw new BadRequestException({ message: 'Use a JPEG, PNG or WebP image.', errors: { file: 'Use a JPEG, PNG or WebP image.' } });
    }
    const fileName = `${slot}-${randomUUID()}.${kind.ext}`;
    await fs.writeFile(join(this.dir, fileName), file.buffer);
    const previous = await this.repo.findOne({ where: { slot } });
    await this.repo.save(this.repo.create({ slot, fileName, mime: kind.mime, size: file.size, alt: alt.trim().slice(0, 200), updatedAt: new Date() }));
    if (previous) await fs.rm(join(this.dir, previous.fileName), { force: true });
    return this.adminList();
  }

  async setAlt(slot: string, alt: string) {
    this.assertSlot(slot);
    const row = await this.repo.findOne({ where: { slot } });
    if (!row) throw new NotFoundException({ message: 'Upload an image first.' });
    row.alt = alt.trim().slice(0, 200);
    await this.repo.save(row);
    return this.adminList();
  }

  async remove(slot: string) {
    this.assertSlot(slot);
    const row = await this.repo.findOne({ where: { slot } });
    if (row) {
      await this.repo.remove(row);
      await fs.rm(join(this.dir, row.fileName), { force: true });
    }
    return this.adminList();
  }
}
