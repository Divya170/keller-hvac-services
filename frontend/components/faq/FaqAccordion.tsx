'use client';

import { useState } from 'react';
import type { ContentItem } from '@/lib/types';

export function FaqAccordion({ items }: { items: ContentItem[] }) {
  const [open, setOpen] = useState(-1);
  return (
    <div className="faq">
      {items.map((q, i) => {
        const isOpen = open === i;
        return (
          <div key={q.id} className="faq__item">
            <h3>
              <button type="button" className="faq__q" aria-expanded={isOpen} aria-controls={`faq-${i}`} onClick={() => setOpen(isOpen ? -1 : i)}>
                {q.title}
                <span aria-hidden="true">{isOpen ? '−' : '+'}</span>
              </button>
            </h3>
            {isOpen && (
              <p id={`faq-${i}`} className="faq__a">
                {q.body}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
