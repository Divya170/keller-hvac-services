import { DataSourceOptions } from 'typeorm';
import { AppConfig } from '../config/configuration';
import { ENTITIES } from './entities';

export function dataSourceOptions(cfg: AppConfig): DataSourceOptions {
  return {
    type: 'better-sqlite3',
    database: cfg.databasePath,
    entities: ENTITIES,
    synchronize: cfg.dbSynchronize,
    // Write-ahead logging gives better concurrency for reads during writes.
    prepareDatabase: (db: { pragma: (s: string) => unknown }) => {
      db.pragma('journal_mode = WAL');
      db.pragma('foreign_keys = ON');
    },
  };
}
