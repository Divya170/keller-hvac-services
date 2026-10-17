import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import type { ContentSectionKey } from '../../common/constants/domain';

/** One editable item (a service, FAQ, checklist line, …) belonging to a section of the site. */
@Entity('content_items')
export class ContentItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'varchar', length: 30 })
  section: ContentSectionKey;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', default: '' })
  body: string;

  /** Unconfirmed items are drafts: visible only while draft markers are on. */
  @Column({ type: 'boolean', default: true })
  confirmed: boolean;

  @Column({ type: 'integer', default: 0 })
  sortOrder: number;
}
