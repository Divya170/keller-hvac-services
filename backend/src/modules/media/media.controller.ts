import { Body, Controller, Delete, Get, Param, Patch, Put, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IsString, MaxLength } from 'class-validator';
import { Response } from 'express';
import { memoryStorage } from 'multer';
import { IMAGE_MAX_BYTES } from '../../common/constants/domain';
import { AdminGuard } from '../auth/admin.guard';
import { MediaService } from './media.service';

class AltDto {
  @IsString() @MaxLength(200, { message: 'Keep the description under 200 characters.' })
  alt: string;
}

@Controller()
export class MediaController {
  constructor(private readonly media: MediaService) {}

  /** Public: serves the photo for a slot. The frontend adds ?v=<version>, so it can be cached for a long time. */
  @Get('media/:slot')
  async serve(@Param('slot') slot: string, @Res() res: Response) {
    const f = await this.media.file(slot);
    res.setHeader('Content-Type', f.mime);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.sendFile(f.path);
  }

  @UseGuards(AdminGuard)
  @Get('admin/images')
  list() {
    return this.media.adminList();
  }

  @UseGuards(AdminGuard)
  @Put('admin/images/:slot')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: IMAGE_MAX_BYTES, files: 1 } }))
  upload(@Param('slot') slot: string, @UploadedFile() file: Express.Multer.File | undefined, @Body('alt') alt?: string) {
    return this.media.set(slot, file, typeof alt === 'string' ? alt : '');
  }

  @UseGuards(AdminGuard)
  @Patch('admin/images/:slot')
  setAlt(@Param('slot') slot: string, @Body() dto: AltDto) {
    return this.media.setAlt(slot, dto.alt);
  }

  @UseGuards(AdminGuard)
  @Delete('admin/images/:slot')
  remove(@Param('slot') slot: string) {
    return this.media.remove(slot);
  }
}
