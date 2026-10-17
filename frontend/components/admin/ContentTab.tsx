'use client';

import { useCallback, useEffect, useState } from 'react';
import { Spinner } from '@/components/ui/States';
import { api, ApiError } from '@/lib/api';
import { useApi } from '@/lib/use-api';
import type { AdminContentItem, ContentSectionInfo } from '@/lib/types';
import { useAdmin } from './admin-context';
import { ConfirmDialog } from './ConfirmDialog';

interface SectionsRes {
  sections: ContentSectionInfo[];
  counts: Record<string, number>;
}
interface Draft {
  id: number | null;
  title: string;
  body: string;
  confirmed: boolean;
}

export function ContentTab() {
  const { notify, handleError } = useAdmin();
  const meta = useApi<SectionsRes>('/admin/content/sections', { keepPrevious: true });
  const [section, setSection] = useState('');
  const [items, setItems] = useState<AdminContentItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [del, setDel] = useState<AdminContentItem | null>(null);

  const sections = meta.data?.sections;
  const current = sections?.find((s) => s.key === section);
  useEffect(() => {
    if (sections && !section) setSection(sections[0].key);
  }, [sections, section]);

  const load = useCallback(async () => {
    if (!section) return;
    setLoading(true);
    setLoadError('');
    try {
      const r = await api<{ items: AdminContentItem[] }>(`/admin/content/section/${section}`);
      setItems(r.items);
    } catch (e) {
      setLoadError(handleError(e));
    } finally {
      setLoading(false);
    }
  }, [section, handleError]);
  useEffect(() => {
    setItems(null);
    setDraft(null);
    load();
  }, [load]);

  const edit = (i: AdminContentItem | null) => {
    setErrors({});
    setDraft(i ? { id: i.id, title: i.title, body: i.body, confirmed: i.confirmed } : { id: null, title: '', body: '', confirmed: true });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    setBusy(true);
    setErrors({});
    try {
      const json = { title: draft.title, body: draft.body, confirmed: draft.confirmed };
      if (draft.id) await api(`/admin/content/item/${draft.id}`, { method: 'PUT', json });
      else await api(`/admin/content/section/${section}`, { method: 'POST', json });
      notify(draft.id ? 'Item updated.' : 'Item added.');
      setDraft(null);
      await load();
      meta.reload();
    } catch (ex) {
      const ae = ex as ApiError;
      if (ae.errors) setErrors(ae.errors);
      else if (ae.status && ae.status !== 401) setErrors({ _form: ae.message });
      else handleError(ex);
    } finally {
      setBusy(false);
    }
  };

  const move = async (i: AdminContentItem, direction: 'up' | 'down') => {
    try {
      const r = await api<{ items: AdminContentItem[] }>(`/admin/content/item/${i.id}/move`, { method: 'PATCH', json: { direction } });
      setItems(r.items);
    } catch (e) {
      handleError(e);
    }
  };

  const toggle = async (i: AdminContentItem) => {
    try {
      await api(`/admin/content/item/${i.id}`, { method: 'PUT', json: { title: i.title, body: i.body, confirmed: !i.confirmed } });
      notify(i.confirmed ? 'Marked as draft.' : 'Marked as confirmed.');
      load();
    } catch (e) {
      handleError(e);
    }
  };

  const remove = async () => {
    if (!del) return;
    setBusy(true);
    try {
      await api(`/admin/content/item/${del.id}`, { method: 'DELETE' });
      notify('Item deleted.');
      setDel(null);
      await load();
      meta.reload();
    } catch (e) {
      setDel(null);
      handleError(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="a-head">
        <div>
          <h1 className="a-h1">Content</h1>
          <p className="a-hint">Edit the lists and text shown on the public pages. Changes go live immediately.</p>
        </div>
      </div>

      {meta.loading && !sections && (
        <p className="a-loading">
          <Spinner size={14} /> Loading…
        </p>
      )}
      {meta.error && !sections && (
        <div style={{ marginTop: 16 }}>
          <p className="a-alert" role="alert" style={{ marginBottom: 10 }}>
            {meta.error.message}
          </p>
          <button type="button" className="small-btn" onClick={meta.reload}>
            Try again
          </button>
        </div>
      )}

      {sections && (
        <div className="a-panel" style={{ marginTop: 16 }}>
          <div className="a-field" style={{ maxWidth: 420 }}>
            <label htmlFor="ct-section">Section</label>
            <select id="ct-section" className="a-input" value={section} onChange={(e) => setSection(e.target.value)}>
              {sections.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label} ({meta.data?.counts[s.key] ?? 0})
                </option>
              ))}
            </select>
            {current && <p className="a-hint">{current.hint}</p>}
          </div>

          <div className="a-tools" style={{ margin: '14px 0 4px' }}>
            <button type="button" className="small-btn small-btn--primary" onClick={() => edit(null)} disabled={!!draft && draft.id === null}>
              + Add item
            </button>
          </div>

          {draft && current && (
            <form onSubmit={save} noValidate className="a-panel" style={{ margin: '12px 0', background: 'var(--slate)' }} aria-label={draft.id ? 'Edit item' : 'Add item'}>
              {errors._form && (
                <p className="a-alert" role="alert" style={{ marginBottom: 10 }}>
                  {errors._form}
                </p>
              )}
              <div className="a-grid">
                <div className="a-field a-span">
                  <label htmlFor="ct-title">{current.body ? 'Title' : 'Text'}</label>
                  <input id="ct-title" className="a-input" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} aria-invalid={!!errors.title} autoFocus />
                  {errors.title && <p className="a-err">⚠ {errors.title}</p>}
                </div>
                {current.body && (
                  <div className="a-field a-span">
                    <label htmlFor="ct-body">Text</label>
                    <textarea id="ct-body" className="a-input" rows={4} value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} aria-invalid={!!errors.body} />
                    <p className="a-hint">{draft.body.length}/1500</p>
                    {errors.body && <p className="a-err">⚠ {errors.body}</p>}
                  </div>
                )}
              </div>
              <label className="a-check" style={{ margin: '10px 0' }}>
                <input type="checkbox" checked={draft.confirmed} onChange={(e) => setDraft({ ...draft, confirmed: e.target.checked })} />
                <span>
                  Confirmed
                  <small>Unconfirmed items are shown (marked “draft”) only in review mode.</small>
                </span>
              </label>
              <div className="a-tools">
                <button type="submit" className="small-btn small-btn--primary" disabled={busy}>
                  {busy ? 'Saving…' : draft.id ? 'Save changes' : 'Add item'}
                </button>
                <button type="button" className="small-btn" onClick={() => setDraft(null)} disabled={busy}>
                  Cancel
                </button>
              </div>
            </form>
          )}

          {loading && !items && (
            <p className="a-loading">
              <Spinner size={14} /> Loading items…
            </p>
          )}
          {loadError && !items && (
            <div>
              <p className="a-alert" role="alert" style={{ marginBottom: 10 }}>
                {loadError}
              </p>
              <button type="button" className="small-btn" onClick={load}>
                Try again
              </button>
            </div>
          )}
          {items && items.length === 0 && <p className="a-empty">No items in this section yet. Use “Add item” to create one.</p>}
          {items && items.length > 0 && (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {items.map((i, n) => (
                <li key={i.id} className="a-row">
                  <div style={{ flex: '1 1 320px', minWidth: 0 }}>
                    <strong style={{ fontFamily: 'var(--f-display)' }}>{i.title}</strong>{' '}
                    <span className={`a-badge ${i.confirmed ? 'a-badge--ok' : 'a-badge--draft'}`}>{i.confirmed ? 'Confirmed' : 'Draft'}</span>
                    {i.body && <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--muted)', whiteSpace: 'pre-wrap' }}>{i.body}</p>}
                  </div>
                  <div className="a-tools">
                    <button type="button" className="small-btn" onClick={() => move(i, 'up')} disabled={n === 0} aria-label={`Move “${i.title}” up`}>
                      ↑
                    </button>
                    <button type="button" className="small-btn" onClick={() => move(i, 'down')} disabled={n === items.length - 1} aria-label={`Move “${i.title}” down`}>
                      ↓
                    </button>
                    <button type="button" className="small-btn" onClick={() => toggle(i)}>
                      {i.confirmed ? 'Mark draft' : 'Confirm'}
                    </button>
                    <button type="button" className="small-btn" onClick={() => edit(i)}>
                      Edit
                    </button>
                    <button type="button" className="small-btn small-btn--danger" onClick={() => setDel(i)}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {del && <ConfirmDialog title="Delete this item?" body={`“${del.title}” will be removed from the public site.`} confirmLabel="Delete" busy={busy} onConfirm={remove} onCancel={() => setDel(null)} />}
    </>
  );
}
