import { HttpException, HttpStatus, Injectable, Logger, OnApplicationBootstrap, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppConfig, DEFAULT_ADMIN_PASSWORD } from '../../config/configuration';
import { AdminUser } from './admin-user.entity';
import { hashPassword, verifyPassword } from './password';

export const ADMIN_COOKIE = 'khs_admin';

const MAX_FAILS = 5;
const LOCK_MS = 5 * 60 * 1000;
// Used to keep timing similar when the email doesn't exist.
const DUMMY_HASH = 'scrypt$AAAAAAAAAAAAAAAAAAAAAA==$' + Buffer.alloc(64).toString('base64');

export interface SessionUser {
  id: number;
  email: string;
  role: string;
}

@Injectable()
export class AuthService implements OnApplicationBootstrap {
  private readonly cfg: AppConfig;
  private readonly log = new Logger('Auth');
  private readonly fails = new Map<string, { count: number; until: number }>();

  constructor(
    private readonly jwt: JwtService,
    @InjectRepository(AdminUser) private readonly users: Repository<AdminUser>,
    config: ConfigService,
  ) {
    this.cfg = config.get<AppConfig>('app')!;
  }

  /** Creates the first admin from ADMIN_EMAIL / ADMIN_PASSWORD when no admin exists. */
  async onApplicationBootstrap() {
    if ((await this.users.count()) === 0) {
      await this.users.save(this.users.create({ email: this.cfg.adminEmail, passwordHash: await hashPassword(this.cfg.adminPassword), role: 'admin' }));
      this.log.log(`Created admin account ${this.cfg.adminEmail}`);
    }
  }

  get sessionMs() {
    return this.cfg.adminSessionHours * 3600 * 1000;
  }
  get secureCookies() {
    return this.cfg.nodeEnv === 'production';
  }

  async usingDefaultPassword(): Promise<boolean> {
    const u = await this.users.findOne({ where: { email: this.cfg.adminEmail } });
    return !!u && (await verifyPassword(DEFAULT_ADMIN_PASSWORD, u.passwordHash));
  }

  async login(email: string, password: string, clientKey: string): Promise<{ token: string; user: SessionUser }> {
    const now = Date.now();
    const f = this.fails.get(clientKey);
    if (f && f.count >= MAX_FAILS && f.until > now) {
      const mins = Math.ceil((f.until - now) / 60000);
      throw new HttpException({ message: `Too many attempts. Please wait ${mins} minute${mins === 1 ? '' : 's'} and try again.` }, HttpStatus.TOO_MANY_REQUESTS);
    }
    const user = await this.users.findOne({ where: { email: String(email || '').trim().toLowerCase() } });
    const ok = await verifyPassword(String(password || ''), user?.passwordHash || DUMMY_HASH);
    if (!user || !ok) {
      const count = f && f.until > now ? f.count + 1 : 1;
      this.fails.set(clientKey, { count, until: now + LOCK_MS });
      throw new UnauthorizedException({ message: 'That email and password don’t match an admin account.' });
    }
    this.fails.delete(clientKey);
    user.lastLoginAt = new Date();
    await this.users.save(user);
    const su: SessionUser = { id: user.id, email: user.email, role: user.role };
    const token = await this.jwt.signAsync({ sub: user.id, email: user.email, role: user.role }, { expiresIn: `${this.cfg.adminSessionHours}h` });
    return { token, user: su };
  }

  async verify(token: string | undefined): Promise<SessionUser | null> {
    if (!token) return null;
    try {
      const p = await this.jwt.verifyAsync<{ sub: number; email: string; role: string }>(token);
      if (p.role !== 'admin') return null;
      // The account must still exist.
      const exists = await this.users.exist({ where: { id: p.sub } });
      return exists ? { id: p.sub, email: p.email, role: p.role } : null;
    } catch {
      return null;
    }
  }

  async changePassword(userId: number, current: string, next: string) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user || !(await verifyPassword(current, user.passwordHash))) {
      throw new UnauthorizedException({ message: 'Your current password is incorrect.', errors: { currentPassword: 'Your current password is incorrect.' } });
    }
    user.passwordHash = await hashPassword(next);
    await this.users.save(user);
    return { changed: true };
  }
}
