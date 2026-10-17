import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { ContentModule } from './modules/content/content.module';
import { HealthController } from './modules/health/health.controller';
import { MediaModule } from './modules/media/media.module';
import { RequestsModule } from './modules/requests/requests.module';
import { SettingsModule } from './modules/settings/settings.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, load: [configuration], envFilePath: ['.env'] }), DatabaseModule, AuthModule, SettingsModule, MediaModule, ContentModule, RequestsModule],
  controllers: [HealthController],
})
export class AppModule {}
