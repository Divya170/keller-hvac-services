'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { fmtBytes } from '@/lib/format';
import { blankRequest, FIELD_LABELS, FIELD_ORDER, sniffPhoto, validateField, ymd, type ErrorKey, type FieldName, type PhotoKind, type RequestForm as Form } from '@/lib/request-validation';
import { useSite } from '@/lib/site-context';
import type { RequestOptions } from '@/lib/types';

type Status = 'idle' | 'invalid' | 'submitting' | 'error' | 'success';
interface Photo {
  id: string;
  file: File;
  kind: PhotoKind;
  preview: string | null;
}

export function RequestForm({ options }: { options: RequestOptions }) {
  const site = useSite();
  const params = useSearchParams();
  const lists = options;
  const presetParam = params.get('service');
  const preset = presetParam && options.services.some((s) => s.value === presetParam) ? presetParam : '';

  const [f, setF] = useState<Form>({ ...blankRequest, service: preset });
  const [e, setE] = useState<Partial<Record<ErrorKey, string>>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [failMsg, setFailMsg] = useState('');
  const [result, setResult] = useState<{ ref: string; photos: number } | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photoErr, setPhotoErr] = useState('');
  const token = useRef<string | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const photosRef = useRef<Photo[]>([]);
  photosRef.current = photos;

  const fetchToken = useCallback(async () => {
    try {
      token.current = (await api<{ token: string }>('/requests/form-token')).token;
    } catch {
      token.current = null;
    }
  }, []);
  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  // Arriving from a service page's button (or changing the ?service= link) selects that service.
  useEffect(() => {
    if (!preset) return;
    setF((x) => (x.service === preset ? x : { ...x, service: preset }));
    if (status === 'success') resetForm(preset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset]);

  useEffect(() => () => photosRef.current.forEach((p) => p.preview && URL.revokeObjectURL(p.preview)), []);

  useEffect(() => {
    if (status === 'success') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => successRef.current?.focus({ preventScroll: true }), 50);
    }
  }, [status]);

  // Computed after mount so the server HTML and the first client render always match.
  const [bounds, setBounds] = useState<{ min?: string; max?: string }>({});
  useEffect(() => {
    const t = new Date();
    const m = new Date();
    m.setDate(m.getDate() + options.maxDaysAhead);
    setBounds({ min: ymd(t), max: ymd(m) });
  }, [options.maxDaysAhead]);

  const validate = (name: FieldName, v: string) => validateField(name, v, lists);
  const onChange = (name: keyof Form) => (ev: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = ev.target.value;
    setF((x) => ({ ...x, [name]: value }));
    setE((cur) => {
      if (name === 'website' || !(cur as Record<string, string | undefined>)[name]) return cur;
      const next = { ...cur, [name]: name === 'window' ? '' : validate(name as FieldName, value) };
      if (!Object.values(next).some(Boolean) && status === 'invalid') setStatus('idle');
      return next;
    });
  };
  const onBlur = (name: FieldName) => (ev: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = ev.target.value;
    if (!value && !e[name]) return;
    setE((cur) => ({ ...cur, [name]: validate(name, value) }));
  };

  const addPhotos = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(ev.target.files || []);
    ev.target.value = '';
    const out = [...photos];
    const errs: string[] = [];
    for (const file of picked) {
      if (out.length >= options.photos.maxFiles) {
        errs.push(`You can attach up to ${options.photos.maxFiles} photos.`);
        break;
      }
      if (file.size > options.photos.maxBytes) {
        errs.push(`${file.name} is larger than 8 MB.`);
        continue;
      }
      const kind = await sniffPhoto(file);
      if (!kind) {
        errs.push(`${file.name} is not a JPEG, PNG, WebP or HEIC image.`);
        continue;
      }
      out.push({ id: Math.random().toString(36).slice(2), file, kind, preview: kind === 'HEIC' ? null : URL.createObjectURL(file) });
    }
    setPhotos(out);
    setPhotoErr(errs.join(' '));
    setE((cur) => ({ ...cur, photos: '' }));
  };
  const removePhoto = (id: string) => {
    setPhotos((list) => {
      const gone = list.find((p) => p.id === id);
      if (gone?.preview) URL.revokeObjectURL(gone.preview);
      return list.filter((p) => p.id !== id);
    });
    setPhotoErr('');
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (status === 'submitting') return;
    const errs: Partial<Record<ErrorKey, string>> = {};
    FIELD_ORDER.forEach((n) => {
      const m = validate(n, f[n]);
      if (m) errs[n] = m;
    });
    if (Object.keys(errs).length) {
      setE(errs);
      setStatus('invalid');
      setTimeout(() => summaryRef.current?.focus(), 0);
      return;
    }
    setE({});
    setStatus('submitting');
    setFailMsg('');
    try {
      if (!token.current) await fetchToken();
      const fd = new FormData();
      (Object.keys(f) as (keyof Form)[]).forEach((k) => fd.append(k, f[k]));
      fd.append('formToken', token.current || '');
      photos.forEach((p) => fd.append('photos', p.file, p.file.name));
      const r = await api<{ ref: string; photos?: number }>('/requests', { method: 'POST', body: fd });
      setResult({ ref: r.ref, photos: r.photos ?? photos.length });
      setStatus('success');
    } catch (ex) {
      const ae = ex as ApiError;
      if (ae.errors && Object.keys(ae.errors).length) {
        setE(ae.errors as Partial<Record<ErrorKey, string>>);
        setStatus('invalid');
        setTimeout(() => summaryRef.current?.focus(), 0);
      } else {
        setFailMsg(ae.message);
        setStatus('error');
        if (/expired|quick/i.test(ae.message)) fetchToken();
      }
    }
  };

  function resetForm(service = '') {
    photosRef.current.forEach((p) => p.preview && URL.revokeObjectURL(p.preview));
    setF({ ...blankRequest, service });
    setE({});
    setPhotos([]);
    setPhotoErr('');
    setResult(null);
    setFailMsg('');
    setStatus('idle');
    fetchToken();
  }

  const errKeys = (Object.keys(FIELD_LABELS) as ErrorKey[]).filter((k) => e[k]).sort((a, b) => (FIELD_ORDER as readonly string[]).indexOf(a) - (FIELD_ORDER as readonly string[]).indexOf(b));
  const busy = status === 'submitting';
  const inv = (k: ErrorKey) => (e[k] ? true : undefined);
  const err = (k: ErrorKey) =>
    e[k] ? (
      <p id={`err-${k}`} className="field-err">
        {e[k]}
      </p>
    ) : null;

  const select = (name: 'property' | 'service' | 'equipment', label: string, placeholder: string, list: { value: string; label: string }[]) => (
    <div className="field">
      <label htmlFor={`f-${name}`}>{label}</label>
      <select id={`f-${name}`} name={name} className="select" value={f[name]} onChange={onChange(name)} onBlur={onBlur(name)} aria-invalid={inv(name)} aria-describedby={`err-${name}`}>
        <option value="">{placeholder}</option>
        {list.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {err(name)}
    </div>
  );

  return (
    <div className="req-layout">
      <div className="req-card">
        {status === 'success' && result ? (
          <div ref={successRef} role="status" tabIndex={-1} className="success">
            <span className="eyebrow" style={{ color: 'var(--ok)', letterSpacing: '.12em' }}>
              REQUEST RECEIVED
            </span>
            <h2 className="h-l" style={{ fontSize: 'clamp(28px,3vw,40px)', lineHeight: 1.1, letterSpacing: '-.02em' }}>
              Thank you, your request has been recorded.
            </h2>
            <div className="success__ref">
              <span style={{ font: '500 11px var(--f-mono)', letterSpacing: '.12em', color: '#1f5e3e' }}>REQUEST REFERENCE</span>
              <span style={{ font: '600 22px var(--f-mono)', color: 'var(--navy)' }}>{result.ref}</span>
            </div>
            <p style={{ fontSize: 17, lineHeight: 1.6, color: 'var(--muted)', maxWidth: '36em' }}>
              This is a service enquiry, not a confirmed appointment. The team will review the details and follow up using the phone number or email you provided.
              {result.photos > 0 && ` Your ${result.photos === 1 ? 'photo was' : `${result.photos} photos were`} stored privately with the request.`} Quote your reference if you get in touch.
            </p>
            <div className="success__actions">
              <button type="button" className="btn btn--outline" style={{ minHeight: 52, fontSize: 16 }} onClick={() => resetForm()}>
                Submit another request
              </button>
              <Link href="/" className="text-link" style={{ display: 'inline-flex', alignItems: 'center', minHeight: 52, padding: '0 12px' }}>
                Back to home
              </Link>
            </div>
          </div>
        ) : (
          <form noValidate onSubmit={submit} aria-describedby="form-note" className="req-form">
            <p id="form-note" className="hint" style={{ fontSize: 14, lineHeight: 1.55 }}>
              All fields are required unless marked optional. Submitting this form sends an enquiry — it does not book an appointment.
            </p>

            {status === 'invalid' && errKeys.length > 0 && (
              <div ref={summaryRef} tabIndex={-1} role="alert" className="err-summary">
                <h2>Please fix {errKeys.length === 1 ? '1 field' : `${errKeys.length} fields`} before submitting</h2>
                <ul>
                  {errKeys.map((k) => (
                    <li key={k}>
                      <button type="button" onClick={() => document.getElementById(k === 'photos' ? 'f-photos' : `f-${k}`)?.focus()}>
                        {FIELD_LABELS[k]}: {e[k]}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {status === 'error' && (
              <div role="alert" className="err-banner">
                <h2>Your request could not be sent</h2>
                <p>{failMsg && !/something went wrong/i.test(failMsg) ? failMsg : `Something went wrong on our side or with the connection. Your details are still here — please try again, or call ${site.contact.phone}.`}</p>
              </div>
            )}

            <div aria-hidden="true" className="hp">
              <label htmlFor="f-website">Website</label>
              <input id="f-website" name="website" type="text" tabIndex={-1} autoComplete="off" value={f.website} onChange={onChange('website')} />
            </div>

            <fieldset className="fieldset">
              <legend>01 — YOUR CONTACT DETAILS</legend>
              <div className="field">
                <label htmlFor="f-fullName">Full name</label>
                <input id="f-fullName" name="fullName" type="text" className="input" autoComplete="name" maxLength={80} value={f.fullName} onChange={onChange('fullName')} onBlur={onBlur('fullName')} aria-invalid={inv('fullName')} aria-describedby="err-fullName" />
                {err('fullName')}
              </div>
              <div className="grid-2">
                <div className="field">
                  <label htmlFor="f-phone">Phone number</label>
                  <input id="f-phone" name="phone" type="tel" inputMode="tel" className="input" autoComplete="tel" maxLength={32} value={f.phone} onChange={onChange('phone')} onBlur={onBlur('phone')} aria-invalid={inv('phone')} aria-describedby="err-phone" />
                  {err('phone')}
                </div>
                <div className="field">
                  <label htmlFor="f-email">Email address</label>
                  <input id="f-email" name="email" type="email" inputMode="email" className="input" autoComplete="email" maxLength={254} value={f.email} onChange={onChange('email')} onBlur={onBlur('email')} aria-invalid={inv('email')} aria-describedby="err-email" />
                  {err('email')}
                </div>
              </div>
            </fieldset>

            <fieldset className="fieldset">
              <legend>02 — PROPERTY</legend>
              <div className="grid-2">
                {select('property', 'Property type', 'Select property type', options.properties)}
                <div className="field">
                  <label htmlFor="f-location">Property location</label>
                  <input id="f-location" name="location" type="text" className="input" autoComplete="street-address" maxLength={160} value={f.location} onChange={onChange('location')} onBlur={onBlur('location')} aria-invalid={inv('location')} aria-describedby={`h-location${e.location ? ' err-location' : ''}`} />
                  <p id="h-location" className="hint">
                    Street address, or at least city and ZIP code.
                  </p>
                  {err('location')}
                </div>
              </div>
            </fieldset>

            <fieldset className="fieldset">
              <legend>03 — YOUR SYSTEM</legend>
              <div className="grid-2">
                {select('service', 'Service required', 'Select a service', options.services)}
                {select('equipment', 'Equipment type', 'Select equipment type', options.equipment)}
              </div>
              <div className="field">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
                  <label htmlFor="f-issue">Describe the issue</label>
                  <span aria-live="polite" style={{ font: '500 12px var(--f-mono)', color: 'var(--muted)' }}>
                    {f.issue.length} / 1500
                  </span>
                </div>
                <p id="h-issue" className="hint">
                  What is the system doing (or not doing)? When did it start? Any noises, smells, error codes or recent changes?
                </p>
                <textarea id="f-issue" name="issue" rows={6} maxLength={1500} className="textarea" value={f.issue} onChange={onChange('issue')} onBlur={onBlur('issue')} aria-invalid={inv('issue')} aria-describedby={`h-issue${e.issue ? ' err-issue' : ''}`} />
                {err('issue')}
              </div>
            </fieldset>

            <fieldset className="fieldset">
              <legend>04 — PREFERRED APPOINTMENT (OPTIONAL)</legend>
              <p className="hint" style={{ fontSize: 14, lineHeight: 1.55, marginTop: -8 }}>
                This is a preference only. The team will confirm any appointment with you directly.
              </p>
              <div className="grid-2">
                <div className="field">
                  <label htmlFor="f-date">
                    Preferred date <span className="opt">(optional)</span>
                  </label>
                  <input id="f-date" name="date" type="date" className="input" min={bounds.min} max={bounds.max} value={f.date} onChange={onChange('date')} onBlur={onBlur('date')} aria-invalid={inv('date')} aria-describedby="err-date" />
                  {err('date')}
                </div>
                <div className="field">
                  <label htmlFor="f-window">
                    Preferred time <span className="opt">(optional)</span>
                  </label>
                  <select id="f-window" name="window" className="select" value={f.window} onChange={onChange('window')}>
                    <option value="">No preference</option>
                    {options.windows.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </fieldset>

            <fieldset className="fieldset" style={{ gap: 14 }}>
              <legend>05 — PHOTOS (OPTIONAL)</legend>
              <label htmlFor="f-photos" className="drop">
                <span className="stack" style={{ gap: 4 }}>
                  <span style={{ font: '700 16px var(--f-display)', color: 'var(--navy)' }}>Add photos of the unit or its label</span>
                  <span id="h-photos" style={{ fontSize: 13, color: 'var(--muted)' }}>
                    JPEG, PNG, WebP or HEIC · up to {options.photos.maxFiles} files · 8 MB each
                  </span>
                </span>
                <span aria-hidden="true" className="drop__btn">
                  Choose files
                </span>
              </label>
              <input id="f-photos" type="file" className="file-input" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif" multiple onChange={addPhotos} aria-describedby="h-photos err-photos" />
              {(photoErr || e.photos) && (
                <p id="err-photos" role="alert" className="field-err">
                  {photoErr || e.photos}
                </p>
              )}
              {photos.length > 0 && (
                <ul className="file-list" aria-label="Attached photos">
                  {photos.map((p) => (
                    <li key={p.id}>
                      <span className="file-list__meta">
                        {p.preview ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.preview} alt="" className="file-list__thumb" />
                        ) : (
                          <span className="file-list__thumb" aria-hidden="true" />
                        )}
                        <div>
                          <span className="file-list__name">{p.file.name}</span>
                          <span className="file-list__sub">
                            {p.kind} · {fmtBytes(p.file.size)}
                          </span>
                        </div>
                      </span>
                      <button type="button" className="btn-remove" aria-label={`Remove ${p.file.name}`} onClick={() => removePhoto(p.id)}>
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </fieldset>

            <div className="stack" style={{ gap: 14, paddingTop: 28, borderTop: '1px solid var(--line-3)' }}>
              <p className="hint" style={{ lineHeight: 1.55 }}>
                Your details are used only to respond to this enquiry. See the <Link href="/privacy">privacy notice</Link>.
              </p>
              <button type="submit" className="btn btn--lg" style={{ alignSelf: 'flex-start', minHeight: 58, padding: '0 30px' }} disabled={busy} aria-disabled={busy}>
                {busy && <span aria-hidden="true" className="spinner" />}
                {busy ? 'Sending request…' : status === 'error' ? 'Try again' : 'Submit service request'}
              </button>
              <p aria-live="polite" style={{ fontSize: 14, color: 'var(--muted)', minHeight: 20 }}>
                {busy ? 'Sending your request. Please wait.' : ''}
              </p>
            </div>
          </form>
        )}
      </div>

      <aside aria-label="Contact and next steps" className="req-aside">
        <div className="stack" style={{ gap: 16 }}>
          <span className="eyebrow" style={{ color: 'var(--orange-soft)' }}>
            WHAT HAPPENS NEXT
          </span>
          <ol>
            <li>
              <b>01</b>
              <span>Your request is recorded with the details you provide.</span>
            </li>
            <li>
              <b>02</b>
              <span>The team reviews the issue and your property location.</span>
            </li>
            <li>
              <b>03</b>
              <span>You are contacted to discuss next steps and confirm any appointment.</span>
            </li>
          </ol>
        </div>
        <div className="stack" style={{ gap: 12, paddingTop: 20, borderTop: '1px solid #2a4a63' }}>
          <span className="eyebrow" style={{ color: '#afc2d0' }}>
            PREFER TO TALK?
          </span>
          <a href={site.contact.phoneHref} style={{ font: '700 22px var(--f-display)' }}>
            {site.contact.phone}
          </a>
          <a href={`mailto:${site.contact.email}`} style={{ fontSize: 15, overflowWrap: 'anywhere' }}>
            {site.contact.email}
          </a>
        </div>
      </aside>
    </div>
  );
}
