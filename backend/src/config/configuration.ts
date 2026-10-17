import { existsSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';

export interface AppConfig {
  port: number;
  nodeEnv: string;
  databasePath: string;
  uploadsPath: string;
  dbSynchronize: boolean;
  frontendOrigin: string;
  adminEmail: string;
  adminPassword: string;
  appSecret: string;
  adminSessionHours: number;
}

export const DEFAULT_ADMIN_EMAIL = 'bryce.keller@kellerhvac.com';
export const DEFAULT_ADMIN_PASSWORD = 'keller-admin';

/** Resolves runtime configuration from environment variables with safe defaults. */
export function loadConfig(): AppConfig {
  const databasePath = resolve(process.cwd(), process.env.DATABASE_PATH || '../database/app.sqlite');
  const uploadsPath = resolve(process.cwd(), process.env.UPLOADS_PATH || '../database/uploads');
  const dir = dirname(databasePath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  mkdirSync(resolve(uploadsPath, 'requests'), { recursive: true });
  mkdirSync(resolve(uploadsPath, 'media'), { recursive: true });

  return {
    port: Number(process.env.PORT) || 4200,
    nodeEnv: process.env.NODE_ENV || 'development',
    databasePath,
    uploadsPath,
    dbSynchronize: (process.env.DB_SYNCHRONIZE ?? 'true') !== 'false',
    frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:3200',
    adminEmail: (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).trim().toLowerCase(),
    adminPassword: process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD,
    appSecret: process.env.APP_SECRET || 'dev-only-secret-change-me',
    adminSessionHours: Number(process.env.ADMIN_SESSION_HOURS) || 8,
  };
}

export default () => ({ app: loadConfig() });
