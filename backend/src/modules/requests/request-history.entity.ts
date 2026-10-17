import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { RequestStatus } from '../../common/constants/domain';
import { ServiceRequest } from './service-request.entity';

/** Audit trail of status changes on a request. */
@Entity('request_history')
export class RequestHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ServiceRequest, (r) => r.history, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requestRef' })
  request: ServiceRequest;

  @Column({ type: 'varchar', length: 24 })
  requestRef: string;

  @Column({ type: 'varchar', length: 16 })
  status: RequestStatus;

  @Column({ type: 'datetime' })
  at: Date;
}
