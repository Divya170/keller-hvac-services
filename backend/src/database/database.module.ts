import { Injectable, Module, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AppConfig } from '../config/configuration';
import { dataSourceOptions } from './data-source';
import { seedDatabase } from './seed/seeder';

@Injectable()
class SeedOnBoot implements OnApplicationBootstrap {
  constructor(private readonly ds: DataSource) {}
  async onApplicationBootstrap() {
    await seedDatabase(this.ds);
  }
}

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => dataSourceOptions(config.get<AppConfig>('app')!),
    }),
  ],
  providers: [SeedOnBoot],
})
export class DatabaseModule {}
