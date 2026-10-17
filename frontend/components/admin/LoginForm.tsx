'use client';

import { useEffect, useRef, useState } from 'react';
import { Spinner } from '@/components/ui/States';
import { api, ApiError } from '@/lib/api';

export function LoginForm({ notice, onSuccess }: { notice?: string; onSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errs, setErrs] = useState<{ email?: string; password?: string; form?: string }>({});
  const [busy, setBusy] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => emailRef.current?.focus(), []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const local: typeof errs = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) local.email = 'Enter your admin email address.';
    if (!password) local.password = 'Enter your password.';
    setErrs(local);
    if (local.email || local.password) {
      document.getElementById(local.email ? 'a-email' : 'a-pass')?.focus();
      return;
    }
    setBusy(true);
    try {
      await api('/auth/login', { method: 'POST', json: { email: email.trim(), password } });
      setPassword('');
      onSuccess();
    } catch (ex) {
      const ae = ex as ApiError;
      setErrs({ form: ae.message, ...(ae.errors || {}) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="a-login">
      <form onSubmit={submit} noValidate aria-labelledby="login-h">
        <h1 id="login-h" className="a-brand" style={{ color: 'var(--navy)', fontSize: 26 }}>
          KELLER <small>Admin</small>
        </h1>
        {notice && (
          <p role="alert" className="a-note" style={{ margin: 0 }}>
            {notice}
          </p>
        )}
        {errs.form && (
          <p role="alert" className="a-alert" style={{ margin: 0 }}>
            {errs.form}
          </p>
        )}
        <div className="a-field">
          <label htmlFor="a-email">Email</label>
          <input ref={emailRef} id="a-email" type="email" autoComplete="username" className="a-input" style={{ minHeight: 46 }} value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errs.email} />
          {errs.email && <p className="a-err">{errs.email}</p>}
        </div>
        <div className="a-field">
          <label htmlFor="a-pass">Password</label>
          <input id="a-pass" type="password" autoComplete="current-password" className="a-input" style={{ minHeight: 46 }} value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={!!errs.password} />
          {errs.password && <p className="a-err">{errs.password}</p>}
        </div>
        <button type="submit" className="small-btn small-btn--primary" disabled={busy} style={{ minHeight: 48, justifyContent: 'center' }}>
          {busy && <Spinner size={14} />}
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="a-hint">Sign-in is verified on the server. Sessions last 8 hours.</p>
      </form>
    </main>
  );
}
