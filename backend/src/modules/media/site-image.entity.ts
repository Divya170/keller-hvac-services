import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

/** A photo assigned to one of the site's image slots (hero, service cards, …). */
@Entity('site_images')
export class SiteImage {
  @PrimaryColumn({ type: 'varchar', length: 40 })
  slot: string;

  /** File name inside the media upload folder. */
  @Column({ type: 'varchar', length: 120 })
  fileName: string;

  @Column({ type: 'varchar', length: 40 })
  mime: string;

  @Column({ type: 'integer' })
  size: number;

  @Column({ type: 'varchar', length: 200, default: '' })
  alt: string;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}
