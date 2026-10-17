import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { loadConfig } from '../../config/configuration';
import { dataSourceOptions } from '../data-source';
import { AdminUser } from '../../modules/auth/admin-user.entity';
import { hashPassword } from '../../modules/auth/password';
import { resetDatabase, seedDatabase } from './seeder';

async function main() {
  const cfg = loadConfig();
  const ds = new DataSource({ ...dataSourceOptions(cfg), synchronize: true });
  await ds.initialize();
  if (process.argv.includes('--reset')) await resetDatabase(ds);
  await seedDatabase(ds);
  const users = ds.getRepository(AdminUser);
  if ((await users.count()) === 0) {
    await users.save(users.create({ email: cfg.adminEmail, passwordHash: await hashPassword(cfg.adminPassword), role: 'admin' }));
    console.log(`Created admin account ${cfg.adminEmail}`);
  }
  await ds.destroy();
  console.log(`Database ready at ${cfg.databasePath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
