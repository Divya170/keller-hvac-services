import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { REQUEST_RULES } from '../../common/constants/domain';
import { AppConfig } from '../../config/configuration';

export type TokenCheck = { ok: true } | { ok: false; reason: 'invalid' | 'expired' | 'too-fast' };

/**
 * Signed, timestamped token issued when the contact form is opened.
 * Lets the server (not the browser) enforce the "filled in too quickly" bot check.
 */
@Injectable()
export class FormTokenService {
  private readonly secret: string;

  constructor(config: ConfigService) {
    this.secret = config.get<AppConfig>('app')!.appSecret + ':form';
  }

  private sign(payload: string): string {
    return createHmac('sha256', this.secret).update(payload).digest('base64url');
  }

  issue(now = Date.now()): string {
    const payload = `${now.toString(36)}.${randomBytes(6).toString('base64url')}`;
    return `${payload}.${this.sign(payload)}`;
  }

  check(token: unknown, now = Date.now()): TokenCheck {
    if (typeof token !== 'string') return { ok: false, reason: 'invalid' };
    const parts = token.split('.');
    if (parts.length !== 3) return { ok: false, reason: 'invalid' };
    const payload = `${parts[0]}.${parts[1]}`;
    const expected = Buffer.from(this.sign(payload));
    const given = Buffer.from(parts[2]);
    if (expected.length !== given.length || !timingSafeEqual(expected, given)) return { ok: false, reason: 'invalid' };
    const issued = parseInt(parts[0], 36);
    if (!Number.isFinite(issued)) return { ok: false, reason: 'invalid' };
    const age = now - issued;
    if (age > REQUEST_RULES.tokenMaxAgeMs) return { ok: false, reason: 'expired' };
    if (age < REQUEST_RULES.minFillMs) return { ok: false, reason: 'too-fast' };
    return { ok: true };
  }
}
