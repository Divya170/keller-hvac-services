import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FormTokenService } from './form-token.service';
import { RequestAttachment } from './request-attachment.entity';
import { RequestHistory } from './request-history.entity';
import { AdminRequestsController, RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';
import { ServiceRequest } from './service-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceRequest, RequestHistory, RequestAttachment])],
  controllers: [RequestsController, AdminRequestsController],
  providers: [RequestsService, FormTokenService],
})
export class RequestsModule {}
