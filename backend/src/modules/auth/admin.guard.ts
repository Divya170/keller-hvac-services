import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { ADMIN_COOKIE, AuthService, SessionUser } from './auth.service';

/** Allows the request only with a valid admin session cookie; attaches the user as req.admin. */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request & { admin?: SessionUser }>();
    const user = await this.auth.verify((req.cookies as Record<string, string> | undefined)?.[ADMIN_COOKIE]);
    if (!user) throw new UnauthorizedException({ message: 'Your session has ended. Please sign in again.' });
    req.admin = user;
    return true;
  }
}
