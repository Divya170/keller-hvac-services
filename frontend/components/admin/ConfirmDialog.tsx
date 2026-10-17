'use client';

import { useEffect, useRef } from 'react';
import { Spinner } from '@/components/ui/States';

interface Props {
  title: string;
  body: string;
  confirmLabel: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Accessible confirmation dialog (used instead of window.confirm). */
export function ConfirmDialog({ title, body, confirmLabel, busy, onConfirm, onCancel }: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const cancel = useRef(onCancel);
  cancel.current = onCancel;

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cancel.current();
      if (e.key === 'Tab' && boxRef.current) {
        const els = Array.from(boxRef.current.querySelectorAll<HTMLElement>('button'));
        const first = els[0];
        const last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, []);

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div ref={boxRef} className="modal" role="alertdialog" aria-modal="true" aria-labelledby="cd-title" aria-describedby="cd-body">
        <h2 id="cd-title">{title}</h2>
        <p id="cd-body">{body}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button ref={cancelRef} type="button" className="small-btn" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="small-btn small-btn--danger" onClick={onConfirm} disabled={busy} style={{ fontWeight: 600 }}>
            {busy && <Spinner size={14} color="currentColor" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
