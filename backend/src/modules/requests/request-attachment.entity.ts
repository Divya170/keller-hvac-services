import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ServiceRequest } from './service-request.entity';

/** A photo attached to a request. The file is stored privately and only served to signed-in admins. */
@Entity('request_attachments')
export class RequestAttachment {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @ManyToOne(() => ServiceRequest, (r) => r.attachments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requestRef' })
  request: ServiceRequest;

  @Column({ type: 'varchar', length: 24 })
  requestRef: string;

  /** Name the customer's file had (sanitised, for display only). */
  @Column({ type: 'varchar', length: 120 })
  originalName: string;

  /** Name on disk: <id>.<ext> — never derived from user input. */
  @Column({ type: 'varchar', length: 60 })
  storedName: string;

  @Column({ type: 'varchar', length: 40 })
  mime: string;

  @Column({ type: 'varchar', length: 8 })
  kind: string;

  @Column({ type: 'integer' })
  size: number;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;
}
