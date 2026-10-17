import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(private readonly ds: DataSource) {}

  @Get()
  async check() {
    await this.ds.query('SELECT 1');
    return { status: 'ok', database: 'sqlite', time: new Date().toISOString() };
  }
}
