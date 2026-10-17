import { Body, Controller, Get, Header, Put, UseGuards } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { AdminGuard } from '../auth/admin.guard';
import { MediaService } from '../media/media.service';
import { SettingsService } from './settings.service';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

class UpdateSettingsDto {
  @IsOptional() @IsBoolean() reviewNotes?: boolean;
  @IsOptional() @IsBoolean() simulateFailure?: boolean;
  @IsOptional() @IsBoolean() addressVerified?: boolean;

  @IsOptional() @Transform(trim) @IsString() @MinLength(2, { message: 'Enter the contact’s name.' }) @MaxLength(80)
  contactName?: string;

  @IsOptional() @Transform(trim) @IsEmail({}, { message: 'Enter a valid email address.' }) @MaxLength(254)
  contactEmail?: string;

  @IsOptional() @Transform(trim) @Matches(/^[+()\d\s.-]{7,30}$/, { message: 'Enter a valid phone number.' })
  contactPhone?: string;

  @IsOptional() @Transform(trim) @IsString() @MinLength(3, { message: 'Street address is required.' }) @MaxLength(120)
  addressLine1?: string;

  @IsOptional() @Transform(trim) @IsString() @MinLength(3, { message: 'City, state and ZIP are required.' }) @MaxLength(120)
  addressLine2?: string;

  @IsOptional() @Transform(trim) @IsString() @MaxLength(400, { message: 'Keep this under 400 characters.' })
  serviceArea?: string;

  @IsOptional() @Transform(trim) @IsString() @MaxLength(400, { message: 'Keep this under 400 characters.' })
  businessHours?: string;

  @IsOptional() @Transform(trim) @IsString() @MinLength(10, { message: 'Write at least a sentence.' }) @MaxLength(1200, { message: 'Keep this under 1,200 characters.' })
  aboutIntro?: string;
}

@Controller()
export class SettingsController {
  constructor(
    private readonly settings: SettingsService,
    private readonly media: MediaService,
  ) {}

  /** Everything the public site needs on every page: settings plus which image slots have a photo. */
  @Get('site')
  @Header('Cache-Control', 'no-store')
  async site() {
    return { ...(await this.settings.getPublic()), images: await this.media.publicMap() };
  }

  @UseGuards(AdminGuard)
  @Get('admin/settings')
  get() {
    return this.settings.getAll();
  }

  @UseGuards(AdminGuard)
  @Put('admin/settings')
  update(@Body() dto: UpdateSettingsDto) {
    return this.settings.update({ ...dto, contactEmail: dto.contactEmail?.toLowerCase() });
  }
}
