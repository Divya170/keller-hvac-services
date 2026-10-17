'use client';

import { useSite } from '@/lib/site-context';

/**
 * A photo placeholder from the design. Shows the photo assigned in Admin → Images when there is one;
 * otherwise a neutral block (with the photo brief in draft/review mode so the team knows what belongs there).
 * Fills its (positioned) parent.
 */
export function ImageSlot({ id, brief, eager }: { id: string; brief: string; eager?: boolean }) {
  const site = useSite();
  const img = site.images[id];
  if (img) {
    return (
      <div className="slot">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/api/media/${id}?v=${img.v}`} alt={img.alt} loading={eager ? 'eager' : 'lazy'} decoding="async" />
      </div>
    );
  }
  return (
    <div className="slot" aria-hidden="true">
      <div className="slot__empty">{site.reviewNotes && <span>Photo · {brief}</span>}</div>
    </div>
  );
}
