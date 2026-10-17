import { Body, Controller, Delete, Get, Header, NotFoundException, Param, Patch, Post, Query, Req, Res, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { existsSync } from 'fs';
import { memoryStorage } from 'multer';
import { PHOTO_RULES } from '../../common/constants/domain';
import { clientIp } from '../../common/utils/client-ip';
import { AdminGuard } from '../auth/admin.guard';
import { RequestNotesDto, RequestQueryDto, RequestStatusDto, SubmitRequestDto } from './requests.dto';
import { RequestsService } from './requests.service';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requests: RequestsService) {}

  @Get('options')
  options() {
    return this.requests.options();
  }

  @Get('form-token')
  @Header('Cache-Control', 'no-store')
  token() {
    return this.requests.issueToken();
  }

  /**
   * Multipart form: text fields plus up to 3 `photos`. One extra file is accepted so the service can say
   * "up to 3 photos" instead of the transport silently dropping it; each file's size is checked there too.
   */
  @Post()
  @UseInterceptors(
    FilesInterceptor('photos', PHOTO_RULES.maxFiles + 1, {
      storage: memoryStorage(),
      limits: { fileSize: PHOTO_RULES.maxBytes + 1024 * 1024, files: PHOTO_RULES.maxFiles + 1, fields: 20, fieldSize: 20 * 1024 },
    }),
  )
  submit(@Body() dto: SubmitRequestDto, @UploadedFiles() files: Express.Multer.File[], @Req() req: Request) {
    return this.requests.submit(dto, files || [], { ip: clientIp(req), userAgent: String(req.headers['user-agent'] || '') });
  }
}

@UseGuards(AdminGuard)
@Controller('admin/requests')
export class AdminRequestsController {
  constructor(private readonly requests: RequestsService) {}

  @Get()
  list(@Query() q: RequestQueryDto) {
    return this.requests.list(q);
  }

  @Get('export')
  async export(@Query() q: RequestQueryDto, @Res() res: Response) {
    const csv = await this.requests.exportCsv(q.q, q.status, q.service);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="keller-hvac-requests-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send(csv);
  }

  @Get(':ref')
  get(@Param('ref') ref: string) {
    return this.requests.get(ref);
  }

  /** Private customer photo. Only signed-in admins can fetch it. */
  @Get(':ref/photos/:id')
  async photo(@Param('ref') ref: string, @Param('id') id: string, @Res() res: Response) {
    const p = await this.requests.photo(ref, id);
    if (!existsSync(p.path)) throw new NotFoundException({ message: 'This photo file is missing.' });
    res.setHeader('Content-Type', p.mime);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('Content-Disposition', `${p.inline ? 'inline' : 'attachment'}; filename*=UTF-8''${encodeURIComponent(p.name)}`);
    res.sendFile(p.path);
  }

  @Patch(':ref/status')
  status(@Param('ref') ref: string, @Body() dto: RequestStatusDto) {
    return this.requests.setStatus(ref, dto.status);
  }

  @Patch(':ref/notes')
  notes(@Param('ref') ref: string, @Body() dto: RequestNotesDto) {
    return this.requests.setNotes(ref, dto.notes);
  }

  @Delete(':ref')
  remove(@Param('ref') ref: string) {
    return this.requests.remove(ref);
  }
}
