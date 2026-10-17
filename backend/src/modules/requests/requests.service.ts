import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomInt, randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import { join } from 'path';
import { MoreThan, Repository } from 'typeorm';
import {
  EQUIPMENT,
  PHOTO_RULES,
  PROPERTY_TYPES,
  REQUEST_RULES,
  REQUEST_STATUS_LABEL,
  REQUEST_STATUSES,
  REQUESTS_PAGE_SIZE,
  SERVICES,
  TIME_WINDOWS,
  labelOf,
  type RequestStatus,
} from '../../common/constants/domain';
import { cleanFileName, sniffImage } from '../../common/utils/file-sniff';
import { csvCell, str } from '../../common/utils/text';
import { AppConfig } from '../../config/configuration';
import { SettingsService } from '../settings/settings.service';
import { FormTokenService } from './form-token.service';
import { RequestAttachment } from './request-attachment.entity';
import { RequestHistory } from './request-history.entity';
import { RequestQueryDto, SubmitRequestDto } from './requests.dto';
import { sanitizeRequest, validateRequest } from './request-validator';
import { ServiceRequest } from './service-request.entity';

const REF_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ymd = (d: Date) => d.getUTCFullYear() + String(d.getUTCMonth() + 1).padStart(2, '0') + String(d.getUTCDate()).padStart(2, '0');

@Injectable()
export class RequestsService {
  private readonly secret: string;
  private readonly dir: string;
  private readonly log = new Logger('Requests');

  constructor(
    @InjectRepository(ServiceRequest) private readonly repo: Repository<ServiceRequest>,
    @InjectRepository(RequestHistory) private readonly history: Repository<RequestHistory>,
    @InjectRepository(RequestAttachment) private readonly attachments: Repository<RequestAttachment>,
    private readonly settings: SettingsService,
    private readonly tokens: FormTokenService,
    config: ConfigService,
  ) {
    const cfg = config.get<AppConfig>('app')!;
    this.secret = cfg.appSecret;
    this.dir = join(cfg.uploadsPath, 'requests');
  }

  private hashIp(ip: string) {
    return createHash('sha256').update(`${this.secret}:${ip}`).digest('hex');
  }

  private static randomRef(now = new Date()) {
    let s = `KH-${ymd(now)}-`;
    for (let i = 0; i < 4; i++) s += REF_ALPHABET[randomInt(REF_ALPHABET.length)];
    return s;
  }

  options() {
    return { services: SERVICES, equipment: EQUIPMENT, properties: PROPERTY_TYPES, windows: TIME_WINDOWS, photos: PHOTO_RULES, maxDaysAhead: REQUEST_RULES.maxDaysAhead };
  }

  issueToken() {
    return { token: this.tokens.issue() };
  }

  /** Checks every uploaded photo by its bytes; returns the accepted files or per-form messages. */
  private checkPhotos(files: Express.Multer.File[]) {
    const problems: string[] = [];
    const ok: { file: Express.Multer.File; kind: NonNullable<ReturnType<typeof sniffImage>> }[] = [];
    for (const f of files) {
      const name = cleanFileName(f.originalname);
      if (ok.length >= PHOTO_RULES.maxFiles) {
        problems.push(`You can attach up to ${PHOTO_RULES.maxFiles} photos.`);
        break;
      }
      if (f.size > PHOTO_RULES.maxBytes) {
        problems.push(`${name} is larger than 8 MB.`);
        continue;
      }
      const kind = sniffImage(f.buffer);
      if (!kind) {
        problems.push(`${name} is not a JPEG, PNG, WebP or HEIC image.`);
        continue;
      }
      ok.push({ file: f, kind });
    }
    return { ok, problems };
  }

  async submit(dto: SubmitRequestDto, files: Express.Multer.File[], ctx: { ip: string; userAgent: string }) {
    const site = await this.settings.getAll();
    if (site.simulateFailure) {
      throw new ServiceUnavailableException({ message: 'Your request could not be sent. Your details are still here — please try again, or call ' + site.contactPhone + '.' });
    }

    // Honeypot filled: pretend success, store nothing.
    if (dto.website && str(dto.website)) return { ref: RequestsService.randomRef() };

    const now = Date.now();
    const token = this.tokens.check(dto.formToken, now);
    if (!token.ok) {
      throw new BadRequestException({
        message: token.reason === 'too-fast' ? 'That was very quick. Please check your details and try again.' : 'This form has expired. Please refresh the page and try again.',
      });
    }

    const ipHash = this.hashIp(ctx.ip);
    const recent = await this.repo.count({ where: { ipHash, createdAt: MoreThan(new Date(now - REQUEST_RULES.rateWindowMs)) } });
    if (recent >= REQUEST_RULES.rateMax) {
      throw new HttpException(
        { message: `Too many requests from this connection. Please wait a few minutes, or call ${site.contactPhone}.` },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const errors = validateRequest(dto, new Date(now));
    const photos = this.checkPhotos(files || []);
    if (photos.problems.length) errors.photos = photos.problems.join(' ');
    if (Object.keys(errors).length) throw new UnprocessableEntityException({ message: 'Please fix the highlighted fields.', errors });

    let ref = RequestsService.randomRef(new Date(now));
    while (await this.repo.exist({ where: { ref } })) ref = RequestsService.randomRef(new Date(now));

    const at = new Date(now);
    const folder = join(this.dir, ref);
    const saved: RequestAttachment[] = [];
    try {
      if (photos.ok.length) await fs.mkdir(folder, { recursive: true });
      for (const { file, kind } of photos.ok) {
        const id = randomUUID();
        const storedName = `${id}.${kind.ext}`;
        await fs.writeFile(join(folder, storedName), file.buffer, { flag: 'wx' });
        saved.push(this.attachments.create({ id, requestRef: ref, originalName: cleanFileName(file.originalname), storedName, mime: kind.mime, kind: kind.kind, size: file.size }));
      }
      await this.repo.save(
        this.repo.create({
          ref,
          ...sanitizeRequest(dto),
          status: 'new',
          statusChangedAt: at,
          createdAt: at,
          notes: '',
          ipHash,
          userAgent: String(ctx.userAgent || '').slice(0, 300),
          history: [this.history.create({ status: 'new', at })],
          attachments: saved,
        }),
      );
    } catch (err) {
      // Never leave orphaned photos behind if the request itself could not be stored.
      await fs.rm(folder, { recursive: true, force: true }).catch(() => undefined);
      this.log.error(err instanceof Error ? err.stack : String(err));
      throw new ServiceUnavailableException({ message: 'Your request could not be saved. Your details are still here — please try again.' });
    }
    return { ref, photos: saved.length };
  }

  // ---------- admin ----------

  private query(q?: string, status?: string, service?: string) {
    const qb = this.repo.createQueryBuilder('r');
    if (status && status !== 'all') qb.andWhere('r.status = :status', { status });
    if (service) qb.andWhere('r.service = :service', { service });
    if (q) {
      const like = `%${q.toLowerCase().replace(/[%_\\]/g, (m) => '\\' + m)}%`;
      qb.andWhere(
        "(LOWER(r.fullName) LIKE :like ESCAPE '\\' OR LOWER(r.email) LIKE :like ESCAPE '\\' OR LOWER(r.phone) LIKE :like ESCAPE '\\' OR LOWER(r.location) LIKE :like ESCAPE '\\' OR LOWER(r.ref) LIKE :like ESCAPE '\\')",
        { like },
      );
    }
    return qb.orderBy('r.createdAt', 'DESC').addOrderBy('r.ref', 'DESC');
  }

  async list(q: RequestQueryDto) {
    const pageSize = q.pageSize || REQUESTS_PAGE_SIZE;
    const qb = this.query(q.q, q.status, q.service);
    const total = await qb.getCount();
    const pages = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(Math.max(1, q.page || 1), pages);
    const rows = await qb.skip((page - 1) * pageSize).take(pageSize).getMany();
    const grouped = await this.repo.createQueryBuilder('r').select('r.status', 'status').addSelect('COUNT(*)', 'n').groupBy('r.status').getRawMany<{ status: string; n: number }>();
    const counts: Record<string, number> = { all: 0, ...Object.fromEntries(REQUEST_STATUSES.map((s) => [s.value, 0])) };
    grouped.forEach((g) => {
      counts[g.status] = Number(g.n);
      counts.all += Number(g.n);
    });
    const photoCounts = rows.length
      ? await this.attachments.createQueryBuilder('a').select('a.requestRef', 'ref').addSelect('COUNT(*)', 'n').where('a.requestRef IN (:...refs)', { refs: rows.map((r) => r.ref) }).groupBy('a.requestRef').getRawMany<{ ref: string; n: number }>()
      : [];
    return {
      items: rows.map((r) => ({
        ref: r.ref,
        fullName: r.fullName,
        phone: r.phone,
        email: r.email,
        service: r.service,
        serviceLabel: labelOf(SERVICES, r.service),
        location: r.location,
        photos: Number(photoCounts.find((p) => p.ref === r.ref)?.n ?? 0),
        status: r.status,
        statusLabel: REQUEST_STATUS_LABEL[r.status],
        createdAt: r.createdAt,
      })),
      total,
      page,
      pages,
      pageSize,
      counts,
      statuses: REQUEST_STATUSES,
      services: SERVICES,
    };
  }

  async get(ref: string) {
    const r = await this.repo.findOne({ where: { ref }, relations: { history: true, attachments: true } });
    if (!r) throw new NotFoundException({ message: 'This request no longer exists.' });
    const { ipHash: _ip, ...rest } = r;
    return {
      ...rest,
      statusLabel: REQUEST_STATUS_LABEL[r.status],
      serviceLabel: labelOf(SERVICES, r.service),
      equipmentLabel: labelOf(EQUIPMENT, r.equipment),
      propertyLabel: labelOf(PROPERTY_TYPES, r.property),
      windowLabel: r.preferredWindow ? labelOf(TIME_WINDOWS, r.preferredWindow) : '',
      attachments: (r.attachments || [])
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime() || a.id.localeCompare(b.id))
        .map((a) => ({ id: a.id, name: a.originalName, kind: a.kind, mime: a.mime, size: a.size, inline: a.kind !== 'heic' })),
      history: (r.history || []).sort((a, b) => a.at.getTime() - b.at.getTime() || a.id - b.id).map((h) => ({ status: h.status, label: REQUEST_STATUS_LABEL[h.status], at: h.at })),
    };
  }

  async setStatus(ref: string, status: RequestStatus) {
    const r = await this.repo.findOne({ where: { ref } });
    if (!r) throw new NotFoundException({ message: 'This request no longer exists.' });
    if (r.status !== status) {
      const at = new Date();
      r.status = status;
      r.statusChangedAt = at;
      await this.repo.save(r);
      await this.history.save(this.history.create({ requestRef: ref, status, at }));
    }
    return this.get(ref);
  }

  async setNotes(ref: string, notes: string) {
    const r = await this.repo.findOne({ where: { ref } });
    if (!r) throw new NotFoundException({ message: 'This request no longer exists.' });
    r.notes = notes.trim();
    await this.repo.save(r);
    return this.get(ref);
  }

  async remove(ref: string) {
    const r = await this.repo.findOne({ where: { ref } });
    if (!r) throw new NotFoundException({ message: 'This request no longer exists.' });
    await this.attachments.delete({ requestRef: ref });
    await this.history.delete({ requestRef: ref });
    await this.repo.remove(r);
    await fs.rm(join(this.dir, ref), { recursive: true, force: true });
    return { deleted: true };
  }

  async photo(ref: string, id: string) {
    const a = await this.attachments.findOne({ where: { id, requestRef: ref } });
    if (!a) throw new NotFoundException({ message: 'This photo no longer exists.' });
    return { path: join(this.dir, ref, a.storedName), mime: a.mime, name: a.originalName, inline: a.kind !== 'heic' };
  }

  async exportCsv(q?: string, status?: string, service?: string) {
    const rows = await this.query(q, status, service).leftJoinAndSelect('r.attachments', 'a').getMany();
    const header = ['Reference', 'Received', 'Status', 'Name', 'Phone', 'Email', 'Property', 'Location', 'Service', 'Equipment', 'Issue', 'Preferred date', 'Preferred time', 'Photos', 'Notes'];
    const lines = rows.map((r) =>
      [
        r.ref,
        r.createdAt.toISOString(),
        REQUEST_STATUS_LABEL[r.status],
        r.fullName,
        r.phone,
        r.email,
        labelOf(PROPERTY_TYPES, r.property),
        r.location,
        labelOf(SERVICES, r.service),
        labelOf(EQUIPMENT, r.equipment),
        r.issue,
        r.preferredDate,
        r.preferredWindow ? labelOf(TIME_WINDOWS, r.preferredWindow) : '',
        (r.attachments || []).length,
        r.notes,
      ]
        .map(csvCell)
        .join(','),
    );
    return '﻿' + [header.join(','), ...lines].join('\r\n');
  }
}
