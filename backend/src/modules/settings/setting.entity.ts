import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

/** Key/value site settings (review mode, contact details, About copy, testing toggles). */
@Entity('settings')
export class Setting {
  @PrimaryColumn({ type: 'varchar', length: 64 })
  key: string;

  /** JSON-encoded value. */
  @Column({ type: 'text' })
  value: string;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}
