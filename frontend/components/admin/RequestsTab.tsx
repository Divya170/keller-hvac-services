'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Spinner } from '@/components/ui/States';
import { api, qs } from '@/lib/api';
import { fmtBytes, fmtDate, fmtDateTime, fmtYmd } from '@/lib/format';
import type { RequestDetail, RequestList, RequestStatus } from '@/lib/types';
import { useAdmin } from './admin-context';
import { ConfirmDialog } from './ConfirmDialog';

export function RequestsTab() {
  const { notify, handleError } = useAdmin();
  const [q, setQ] = useState('');
  const [dq, setDq] = useState('');
  const [status, setStatus] = useState('');
  const [service, setService] = useState('');
  const [page, setPage] = useState(1);
  const [list, setList] = useState<RequestList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sel, setSel] = useState<RequestDetail | null>(null);
  const [selRef, setSelRef] = useState<string | null>(null);
  const [saved, setSaved] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState(false);
  const asideRef = useRef<HTMLElement>(null);
  const seq = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setDq(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  const load = useCallback(async () => {
    const id = ++seq.current;
    setLoading(true);
    setError('');
    try {
      const d = await api<RequestList>(`/admin/requests${qs({ q: dq, status, service, page })}`);
      if (id !== seq.current) return;
      setList(d);
      if (d.page !== page) setPage(d.page);
    } catch (e) {
      if (id === seq.current) setError(handleError(e));
    } finally {
      if (id === seq.current) setLoading(false);
    }
  }, [dq, status, service, page, handleError]);
  useEffect(() => {
    load();
  }, [load]);

  const flash = (m: string) => {
    setSaved(m);
    setTimeout(() => setSaved(''), 2400);
  };

  const open = async (ref: string) => {
    setSelRef(ref);
    setSaved('');
    try {
      const d = await api<RequestDetail>(`/admin/requests/${encodeURIComponent(ref)}`);
      setSel(d);
      setNotes(d.notes);
      if (window.innerWidth < 1000) setTimeout(() => asideRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch (e) {
      handleError(e);
      setSelRef(null);
    }
  };

  const setReqStatus = async (s: RequestStatus) => {
    if (!sel || s === sel.status) return;
    setBusy('status');
    try {
      setSel(await api<RequestDetail>(`/admin/requests/${encodeURIComponent(sel.ref)}/status`, { method: 'PATCH', json: { status: s } }));
      flash('Status saved');
      load();
    } catch (e) {
      handleError(e);
    } finally {
      setBusy(null);
    }
  };

  const saveNotes = async () => {
    if (!sel) return;
    setBusy('notes');
    try {
      const d = await api<RequestDetail>(`/admin/requests/${encodeURIComponent(sel.ref)}/notes`, { method: 'PATCH', json: { notes } });
      setSel(d);
      setNotes(d.notes);
      flash('Notes saved');
    } catch (e) {
      handleError(e);
    } finally {
      setBusy(null);
    }
  };

  const del = async () => {
    if (!sel) return;
    setBusy('delete');
    try {
      await api(`/admin/requests/${encodeURIComponent(sel.ref)}`, { method: 'DELETE' });
      notify(`Request ${sel.ref} deleted.`);
      setSel(null);
      setSelRef(null);
      setConfirmDel(false);
      load();
    } catch (e) {
      handleError(e);
    } finally {
      setBusy(null);
    }
  };

  const counts = list?.counts;
  const filtered = !!(dq || status || service);
  const statuses = list?.statuses || [];

  return (
    <>
      <div className="a-head">
        <h1 className="a-h1">Service requests</h1>
        <div className="a-tools">
          <input type="search" className="a-input" style={{ width: 230 }} aria-label="Search requests" placeholder="Search requests" value={q} onChange={(e) => (setQ(e.target.value), setPage(1))} />
          <select className="a-input" aria-label="Filter by service" value={service} onChange={(e) => (setService(e.target.value), setPage(1))}>
            <option value="">All services</option>
            {list?.services.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <select className="a-input" aria-label="Filter by status" value={status} onChange={(e) => (setStatus(e.target.value), setPage(1))}>
            <option value="">All statuses</option>
            {statuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <a className="small-btn" href={`/api/admin/requests/export${qs({ q: dq, status, service })}`} download>
            ⤓ Export CSV
          </a>
        </div>
      </div>

      {counts && (
        <div className="a-stats" role="group" aria-label="Requests by status">
          {[{ value: '', label: 'All requests', n: counts.all }, ...statuses.map((s) => ({ ...s, n: counts[s.value] }))].map((s) => (
            <button key={s.value || 'all'} type="button" className="a-stat" aria-pressed={status === s.value} onClick={() => (setStatus(s.value), setPage(1))}>
              <strong>{s.n}</strong>
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      )}

      <div className={`a-split${sel ? ' a-split--detail' : ''}`}>
        <div className="a-tablewrap">
          <table className="a-table" aria-busy={loading}>
            <thead>
              <tr>
                <th scope="col">Customer</th>
                <th scope="col">Service</th>
                <th scope="col">Location</th>
                <th scope="col">Received</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody style={{ opacity: loading && list ? 0.6 : 1 }}>
              {list?.items.map((r) => (
                <tr key={r.ref} aria-selected={selRef === r.ref} onClick={() => open(r.ref)}>
                  <td>
                    <button type="button" className="a-rowbtn" onClick={(ev) => (ev.stopPropagation(), open(r.ref))}>
                      {r.fullName}
                    </button>
                    <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--f-mono)' }}>
                      {r.ref}
                      {r.photos > 0 && ` · ${r.photos} photo${r.photos === 1 ? '' : 's'}`}
                    </div>
                  </td>
                  <td>{r.serviceLabel}</td>
                  <td style={{ color: 'var(--muted)' }}>{r.location}</td>
                  <td style={{ color: 'var(--muted)', whiteSpace: 'nowrap' }}>{fmtDate(r.createdAt)}</td>
                  <td>
                    <span className={`a-badge a-badge--${r.status}`}>{r.statusLabel}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && !list && (
            <p className="a-loading">
              <Spinner size={14} /> Loading requests…
            </p>
          )}
          {error && !list && (
            <div style={{ padding: 20 }}>
              <p className="field-error" style={{ marginBottom: 10 }}>
                {error}
              </p>
              <button type="button" className="small-btn" onClick={load}>
                Try again
              </button>
            </div>
          )}
          {list && list.items.length === 0 && (
            <div className="a-empty">
              <p style={{ margin: 0 }}>{list.counts.all === 0 ? 'No service requests yet. Submit one from the Request Service page to see it here.' : 'No requests match.'}</p>
              {filtered && list.counts.all > 0 && (
                <button type="button" className="small-btn" style={{ marginTop: 12 }} onClick={() => (setQ(''), setStatus(''), setService(''))}>
                  Clear filters
                </button>
              )}
            </div>
          )}
          {list && list.pages > 1 && (
            <nav aria-label="Request pages" className="a-pager">
              <button type="button" className="small-btn" disabled={list.page <= 1} onClick={() => setPage(list.page - 1)}>
                ← Prev
              </button>
              <span>
                Page {list.page} of {list.pages} · {list.total} requests
              </span>
              <button type="button" className="small-btn" disabled={list.page >= list.pages} onClick={() => setPage(list.page + 1)}>
                Next →
              </button>
            </nav>
          )}
        </div>

        {sel && (
          <aside ref={asideRef} aria-label="Request details" className="a-aside">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <h2 className="a-h2" style={{ fontSize: 24 }}>
                {sel.fullName}
              </h2>
              <button type="button" aria-label="Close details" className="small-btn" style={{ width: 36, minHeight: 36, padding: 0, justifyContent: 'center' }} onClick={() => (setSel(null), setSelRef(null))}>
                ×
              </button>
            </div>
            <dl className="a-dl">
              {(
                [
                  ['Reference', sel.ref],
                  ['Phone', <a key="p" href={`tel:${sel.phone.replace(/[^\d+]/g, '')}`}>{sel.phone}</a>],
                  ['Email', <a key="e" href={`mailto:${sel.email}?subject=${encodeURIComponent(`Your service request ${sel.ref}`)}`}>{sel.email}</a>],
                  ['Property', `${sel.propertyLabel} · ${sel.location}`],
                  ['Service', sel.serviceLabel],
                  ['Equipment', sel.equipmentLabel],
                  ['Issue', sel.issue],
                  ['Preferred appointment', sel.preferredDate ? `${fmtYmd(sel.preferredDate)}${sel.windowLabel ? ` · ${sel.windowLabel}` : ''}` : sel.windowLabel || 'No preference'],
                  ['Received', fmtDateTime(sel.createdAt)],
                ] as [string, React.ReactNode][]
              ).map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
              <div>
                <dt>Photos</dt>
                <dd>
                  {sel.attachments.length === 0 ? (
                    '—'
                  ) : (
                    <span className="a-photos">
                      {sel.attachments.map((a) => {
                        const url = `/api/admin/requests/${encodeURIComponent(sel.ref)}/photos/${a.id}`;
                        return (
                          <a key={a.id} className="a-photo" href={url} target="_blank" rel="noopener noreferrer" download={a.inline ? undefined : a.name}>
                            {a.inline ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={url} alt={a.name} />
                            ) : (
                              <span className="ph">HEIC · download</span>
                            )}
                            <span>
                              {a.name} · {fmtBytes(a.size)}
                            </span>
                          </a>
                        );
                      })}
                    </span>
                  )}
                </dd>
              </div>
            </dl>
            <label className="a-field">
              <span className="a-label">Status</span>
              <select className="a-input" value={sel.status} disabled={busy === 'status'} onChange={(e) => setReqStatus(e.target.value as RequestStatus)}>
                {statuses.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="a-field">
              <span className="a-label">Internal notes</span>
              <textarea className="a-input" maxLength={5000} value={notes} placeholder="Only visible to the team" onChange={(e) => setNotes(e.target.value)} />
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'space-between' }}>
              <button type="button" className="small-btn small-btn--primary" disabled={busy === 'notes' || notes.trim() === (sel.notes || '').trim()} onClick={saveNotes}>
                {busy === 'notes' ? 'Saving…' : 'Save notes'}
              </button>
              <button type="button" className="small-btn small-btn--danger" onClick={() => setConfirmDel(true)}>
                Delete request
              </button>
            </div>
            <p role="status" className="a-msg" style={{ minHeight: 18 }}>
              {saved}
            </p>
            <div>
              <h3 style={{ margin: '0 0 6px', fontSize: 13 }}>History</h3>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: 13, color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {sel.history.map((h, i) => (
                  <li key={i}>
                    {h.label} · {fmtDateTime(h.at)}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        )}
      </div>

      {confirmDel && sel && (
        <ConfirmDialog
          title="Delete this request?"
          body={`${sel.fullName}’s request (${sel.ref}), its history and ${sel.attachments.length ? `its ${sel.attachments.length} photo${sel.attachments.length === 1 ? '' : 's'}` : 'any photos'} will be permanently removed.`}
          confirmLabel="Delete request"
          busy={busy === 'delete'}
          onConfirm={del}
          onCancel={() => setConfirmDel(false)}
        />
      )}
    </>
  );
}
