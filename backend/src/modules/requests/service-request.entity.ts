import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import type { RequestStatus } from '../../common/constants/domain';
import { RequestAttachment } from './request-attachment.entity';
import { RequestHistory } from './request-history.entity';

/** An HVAC service request (an enquiry — not a booked appointment). */
@Entity('service_requests')
export class ServiceRequest {
  /** Public reference shown to the customer, e.g. KH-20261014-7K2Q. */
  @PrimaryColumn({ type: 'varchar', length: 24 })
  ref: string;

  @Index()
  @Column({ type: 'varchar', length: 16, default: 'new' })
  status: RequestStatus;

  @Column({ type: 'datetime' })
  statusChangedAt: Date;

  @Column({ type: 'varchar', length: 80 })
  fullName: string;

  @Column({ type: 'varchar', length: 32 })
  phone: string;

  @Column({ type: 'varchar', length: 254 })
  email: string;

  @Column({ type: 'varchar', length: 16 })
  property: string;

  @Column({ type: 'varchar', length: 160 })
  location: string;

  @Index()
  @Column({ type: 'varchar', length: 20 })
  service: string;

  @Column({ type: 'varchar', length: 20 })
  equipment: string;

  @Column({ type: 'text' })
  issue: string;

  /** Preferred appointment date (YYYY-MM-DD) or '' — a preference only. */
  @Column({ type: 'varchar', length: 10, default: '' })
  preferredDate: string;

  @Column({ type: 'varchar', length: 12, default: '' })
  preferredWindow: string;

  /** Internal notes from the team. */
  @Column({ type: 'text', default: '' })
  notes: string;

  @Index()
  @Column({ type: 'varchar', length: 64, default: '' })
  ipHash: string;

  @Column({ type: 'varchar', length: 300, default: '' })
  userAgent: string;

  @OneToMany(() => RequestAttachment, (a) => a.request, { cascade: true })
  attachments: RequestAttachment[];

  @OneToMany(() => RequestHistory, (h) => h.request, { cascade: true })
  history: RequestHistory[];

  @Index()
  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}
