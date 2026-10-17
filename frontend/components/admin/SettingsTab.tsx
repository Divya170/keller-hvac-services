'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Spinner } from '@/components/ui/States';
import { api, ApiError } from '@/lib/api';
import type { AdminSettings } from '@/lib/types';
import { useAdmin } from './admin-context';

type TextKey = 'contactName' | 'contactEmail' | 'contactPhone' | 'addressLine1' | 'addressLine2' | 'serviceArea' | 'businessHours' | 'aboutIntro';

export function SettingsTab({ email, onPasswordChanged }: { email: string; onPasswordChanged: () => void }) {
  const { notify, handleError } = useAdmin();
  const [form, setForm] = useState<AdminSettings | null>(null);
  const [initial, setInitial] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [pwBusy, setPwBusy] = useState(false);
  const [pwDone, setPwDone] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const s = await api<AdminSettings>('/admin/settings');
      setForm(s);
      setInitial(s);
    } catch (e) {
      setLoadError(handleError(e));
    } finally {
      setLoading(false);
    }
  }, [handleError]);
  useEffect(() => {
    load();
  }, [load]);

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(initial), [form, initial]);
  const set = <K extends keyof AdminSettings>(k: K, v: AdminSettings[K]) => {
    setForm((f) => (f ? { ...f, [k]: v } : f));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: '' }));
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setErrors({});
    try {
      const s = await api<AdminSettings>('/admin/settings', { method: 'PUT', json: form });
      setForm(s);
      setInitial(s);
      notify('Settings saved. The site uses them immediately.');
    } catch (ex) {
      const ae = ex as ApiError;
      if (ae.errors) {
        setErrors(ae.errors);
        notify(ae.message, true);
      } else handleError(ex);
    } finally {
      setSaving(false);
    }
  };

  const changePw = async (e: React.FormEvent) => {
    e.preventDefault();
    const local: Record<string, string> = {};
    if (!pw.currentPassword) local.currentPassword = 'Enter your current password.';
    if (pw.newPassword.length < 10) local.newPassword = 'Use at least 10 characters.';
    if (pw.confirm !== pw.newPassword) local.confirm = 'The passwords don’t match.';
    setPwErrors(local);
    setPwDone(false);
    if (Object.keys(local).length) return;
    setPwBusy(true);
    try {
      await api('/auth/password', { method: 'POST', json: { currentPassword: pw.currentPassword, newPassword: pw.newPassword } });
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
      setPwDone(true);
      onPasswordChanged();
    } catch (ex) {
      const ae = ex as ApiError;
      if (ae.errors) setPwErrors(ae.errors);
      else if (ae.status === 401) setPwErrors({ currentPassword: ae.message });
      else handleError(ex);
    } finally {
      setPwBusy(false);
    }
  };

  if (loading)
    return (
      <p className="a-loading">
        <Spinner size={14} /> Loading settings…
      </p>
    );
  if (loadError || !form)
    return (
      <div>
        <p className="a-alert" role="alert" style={{ marginBottom: 10 }}>
          {loadError}
        </p>
        <button type="button" className="small-btn" onClick={load}>
          Try again
        </button>
      </div>
    );

  const field = (k: TextKey, label: string, opts: { hint?: string; area?: boolean; type?: string } = {}) => (
    <div className={`a-field${opts.area ? ' a-span' : ''}`}>
      <label htmlFor={`st-${k}`}>{label}</label>
      {opts.area ? (
        <textarea id={`st-${k}`} className="a-input" rows={3} value={form[k]} onChange={(e) => set(k, e.target.value)} aria-invalid={!!errors[k]} />
      ) : (
        <input id={`st-${k}`} className="a-input" type={opts.type || 'text'} value={form[k]} onChange={(e) => set(k, e.target.value)} aria-invalid={!!errors[k]} />
      )}
      {opts.hint && <p className="a-hint">{opts.hint}</p>}
      {errors[k] && <p className="a-err">⚠ {errors[k]}</p>}
    </div>
  );

  return (
    <>
      <h1 className="a-h1">Settings</h1>
      <form onSubmit={save} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <section className="a-panel">
          <h2 className="a-h2">Review mode</h2>
          <label className="a-check">
            <input type="checkbox" checked={form.reviewNotes} onChange={(e) => set('reviewNotes', e.target.checked)} />
            <span>
              Show draft markers on the public site
              <small>Unconfirmed items (marked “draft”) and the unverified-address note appear only while this is on. Turn it off for launch.</small>
            </span>
          </label>
        </section>

        <section className="a-panel">
          <h2 className="a-h2">Contact details</h2>
          <div className="a-grid">
            {field('contactName', 'Contact name')}
            {field('contactEmail', 'Email', { type: 'email' })}
            {field('contactPhone', 'Phone', { type: 'tel' })}
            {field('addressLine1', 'Street address')}
            {field('addressLine2', 'City, state, ZIP')}
            {field('serviceArea', 'Service area')}
            {field('businessHours', 'Business hours')}
          </div>
          <label className="a-check" style={{ marginTop: 14 }}>
            <input type="checkbox" checked={form.addressVerified} onChange={(e) => set('addressVerified', e.target.checked)} />
            <span>
              Address has been verified
              <small>Hides the “address to be confirmed” note in review mode.</small>
            </span>
          </label>
        </section>

        <section className="a-panel">
          <h2 className="a-h2">About page</h2>
          <div className="a-grid">{field('aboutIntro', 'Introduction', { area: true })}</div>
        </section>

        <section className="a-panel">
          <h2 className="a-h2">Testing</h2>
          <label className="a-check">
            <input type="checkbox" checked={form.simulateFailure} onChange={(e) => set('simulateFailure', e.target.checked)} />
            <span>
              Make service requests fail
              <small>Use to check the form’s error and retry state. Turn off before going live.</small>
            </span>
          </label>
        </section>

        <div className="a-tools" style={{ justifyContent: 'flex-end' }}>
          <button type="button" className="small-btn" disabled={!dirty || saving} onClick={() => { setForm(initial); setErrors({}); }}>
            Reset
          </button>
          <button type="submit" className="small-btn small-btn--primary" disabled={!dirty || saving}>
            {saving ? 'Saving…' : 'Save settings'}
          </button>
        </div>
      </form>

      <form onSubmit={changePw} noValidate className="a-panel" style={{ marginTop: 20 }}>
        <h2 className="a-h2">Your account</h2>
        <p className="a-hint">Signed in as {email}</p>
        {pwDone && <p role="status" className="a-note">✓ Password changed.</p>}
        <div className="a-grid" style={{ marginTop: 10 }}>
          {(
            [
              ['currentPassword', 'Current password', 'current-password'],
              ['newPassword', 'New password (10+ characters)', 'new-password'],
              ['confirm', 'Confirm new password', 'new-password'],
            ] as const
          ).map(([k, label, ac]) => (
            <div key={k} className="a-field">
              <label htmlFor={`pw-${k}`}>{label}</label>
              <input id={`pw-${k}`} type="password" autoComplete={ac} className="a-input" value={pw[k]} onChange={(e) => setPw({ ...pw, [k]: e.target.value })} aria-invalid={!!pwErrors[k]} />
              {pwErrors[k] && <p className="a-err">⚠ {pwErrors[k]}</p>}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14 }}>
          <button type="submit" className="small-btn small-btn--primary" disabled={pwBusy}>
            {pwBusy ? 'Changing…' : 'Change password'}
          </button>
        </div>
      </form>
    </>
  );
}
