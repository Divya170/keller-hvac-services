import { Transform, Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { REQUEST_STATUS_VALUES, SERVICES, values, type RequestStatus } from '../../common/constants/domain';

/** Raw multipart form body. Field rules are applied by validateRequest() for friendly per-field messages. */
export class SubmitRequestDto {
  @IsOptional() fullName?: string;
  @IsOptional() phone?: string;
  @IsOptional() email?: string;
  @IsOptional() property?: string;
  @IsOptional() location?: string;
  @IsOptional() service?: string;
  @IsOptional() equipment?: string;
  @IsOptional() issue?: string;
  @IsOptional() date?: string;
  @IsOptional() window?: string;
  /** Honeypot — must stay empty. */
  @IsOptional() website?: string;
  @IsOptional() formToken?: string;
}

export class RequestQueryDto {
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(100)
  q?: string;

  @IsOptional() @IsIn(['', 'all', ...REQUEST_STATUS_VALUES]) status?: string;
  @IsOptional() @IsIn(['', ...values(SERVICES)]) service?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize?: number;
}

export class RequestStatusDto {
  @IsIn(REQUEST_STATUS_VALUES, { message: 'Status must be New, In review, Contacted, Scheduled or Closed.' })
  status: RequestStatus;
}

export class RequestNotesDto {
  @IsString()
  @MaxLength(5000, { message: 'Notes must be 5,000 characters or fewer.' })
  notes: string;
}
