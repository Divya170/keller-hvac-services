'use client';

import { useRef, useState } from 'react';
import { Spinner } from '@/components/ui/States';
import { api, ApiError } from '@/lib/api';
import { fmtBytes } from '@/lib/format';
import { useApi } from '@/lib/use-api';
import type { ImageSlotInfo } from '@/lib/types';
import { useAdmin } from './admin-context';
import { ConfirmDialog } from './ConfirmDialog';

function Slot({ slot, onChanged }: { slot: ImageSlotInfo; onChanged: () => void }) {
  const { notify, handleError } = useAdmin();
  const [alt, setAlt] = useState(slot.alt);
  const [busy, setBusy] = useState<'' | 'upload' | 'alt' | 'remove'>('');
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const id = `img-${slot.id}`;

  const fail = (e: unknown) => {
    if (e instanceof ApiError && e.status !== 401) setError(e.message);
    else handleError(e);
  };

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setError('');
    setBusy('upload');
    try {
      const fd = new FormData();
      fd.append('alt', alt);
      fd.append('file', file);
      await api(`/admin/images/${slot.id}`, { method: 'PUT', body: fd });
      notify(`${slot.label}: photo saved.`);
      onChanged();
    } catch (e) {
      fail(e);
    } finally {
      setBusy('');
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const saveAlt = async () => {
    setError('');
    setBusy('alt');
    try {
      await api(`/admin/images/${slot.id}`, { method: 'PATCH', json: { alt } });
      notify(`${slot.label}: description saved.`);
      onChanged();
    } catch (e) {
      fail(e);
    } finally {
      setBusy('');
    }
  };

  const remove = async () => {
    setBusy('remove');
    try {
      await api(`/admin/images/${slot.id}`, { method: 'DELETE' });
      notify(`${slot.label}: photo removed.`);
      setConfirm(false);
      setAlt('');
      onChanged();
    } catch (e) {
      setConfirm(false);
      fail(e);
    } finally {
      setBusy('');
    }
  };

  return (
    <li className="a-slot" style={{ listStyle: 'none' }}>
      <div className="a-slot__img">
        {slot.hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/api/media/${slot.id}?v=${slot.v}`} alt={slot.alt || ''} />
        ) : (
          <span>No photo yet</span>
        )}
      </div>
      <div className="a-slot__body">
        <div>
          <strong style={{ fontFamily: 'var(--f-display)', fontSize: 15 }}>{slot.label}</strong>
          <p className="a-hint">
            {slot.ratio} · Suggested: {slot.hint}
            {slot.hasImage && ` · ${fmtBytes(slot.size)}`}
          </p>
        </div>
        <div className="a-field">
          <label htmlFor={id}>Description (alt text)</label>
          <input id={id} className="a-input" value={alt} maxLength={200} onChange={(e) => setAlt(e.target.value)} placeholder="Describe the photo for people who can’t see it" />
        </div>
        {error && (
          <p className="a-err" role="alert">
            ⚠ {error}
          </p>
        )}
        <div className="a-tools">
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden id={`${id}-file`} aria-label={`Choose photo for ${slot.label}`} onChange={(e) => upload(e.target.files?.[0])} />
          <button type="button" className="small-btn small-btn--primary" disabled={!!busy} onClick={() => fileRef.current?.click()}>
            {busy === 'upload' ? 'Uploading…' : slot.hasImage ? 'Replace photo' : 'Upload photo'}
          </button>
          {slot.hasImage && (
            <>
              <button type="button" className="small-btn" disabled={!!busy || alt === slot.alt} onClick={saveAlt}>
                {busy === 'alt' ? 'Saving…' : 'Save description'}
              </button>
              <button type="button" className="small-btn small-btn--danger" disabled={!!busy} onClick={() => setConfirm(true)}>
                Remove
              </button>
            </>
          )}
        </div>
      </div>
      {confirm && <ConfirmDialog title="Remove this photo?" body={`The placeholder will show again on “${slot.label}”.`} confirmLabel="Remove photo" busy={busy === 'remove'} onConfirm={remove} onCancel={() => setConfirm(false)} />}
    </li>
  );
}

export function ImagesTab() {
  const { data, error, loading, reload } = useApi<ImageSlotInfo[]>('/admin/images', { keepPrevious: true });

  return (
    <>
      <div className="a-head">
        <div>
          <h1 className="a-h1">Images</h1>
          <p className="a-hint">JPEG, PNG or WebP, up to 8 MB. Photos replace the placeholders on the public pages straight away.</p>
        </div>
      </div>
      {loading && !data && (
        <p className="a-loading">
          <Spinner size={14} /> Loading images…
        </p>
      )}
      {error && !data && (
        <div style={{ marginTop: 16 }}>
          <p className="a-alert" role="alert" style={{ marginBottom: 10 }}>
            {error.message}
          </p>
          <button type="button" className="small-btn" onClick={reload}>
            Try again
          </button>
        </div>
      )}
      {data && (
        <ul className="a-slot-grid" style={{ padding: 0, margin: '16px 0 0' }}>
          {data.map((s) => (
            <Slot key={s.id} slot={s} onChanged={reload} />
          ))}
        </ul>
      )}
    </>
  );
}
