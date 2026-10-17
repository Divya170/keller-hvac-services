import { Body, Controller, Delete, Get, Header, Param, ParseIntPipe, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional } from 'class-validator';
import { AdminGuard } from '../auth/admin.guard';
import { ContentService } from './content.service';

class ContentDto {
  /** Rules are applied by the service so each field gets a friendly message. */
  @IsOptional() @Transform(({ value }) => (typeof value === 'string' ? value : undefined)) title?: string;
  @IsOptional() @Transform(({ value }) => (typeof value === 'string' ? value : undefined)) body?: string;
  @IsOptional() @IsBoolean() confirmed?: boolean;
}

class MoveDto {
  @IsIn(['up', 'down']) direction: 'up' | 'down';
}

@Controller()
export class ContentController {
  constructor(private readonly content: ContentService) {}

  @Get('content')
  @Header('Cache-Control', 'no-store')
  publicAll() {
    return this.content.publicAll();
  }

  @UseGuards(AdminGuard)
  @Get('admin/content/sections')
  async sections() {
    return { sections: this.content.sections(), counts: await this.content.counts() };
  }

  @UseGuards(AdminGuard)
  @Get('admin/content/section/:section')
  list(@Param('section') section: string) {
    return this.content.list(section);
  }

  @UseGuards(AdminGuard)
  @Post('admin/content/section/:section')
  create(@Param('section') section: string, @Body() dto: ContentDto) {
    return this.content.create(section, dto);
  }

  @UseGuards(AdminGuard)
  @Put('admin/content/item/:id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: ContentDto) {
    return this.content.update(id, dto);
  }

  @UseGuards(AdminGuard)
  @Patch('admin/content/item/:id/move')
  move(@Param('id', ParseIntPipe) id: number, @Body() dto: MoveDto) {
    return this.content.move(id, dto.direction);
  }

  @UseGuards(AdminGuard)
  @Delete('admin/content/item/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.content.remove(id);
  }
}
