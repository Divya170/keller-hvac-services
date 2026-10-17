import { Request } from 'express';

/**
 * Client IP as resolved by Express. `trust proxy` is set to loopback in main.ts, so the
 * x-forwarded-for header is honoured only when it comes from the local Next.js proxy
 * (it can't be spoofed by a remote client to dodge rate limits).
 */
export function clientIp(req: Request): string {
  return req.ip || req.socket?.remoteAddress || 'unknown';
}
