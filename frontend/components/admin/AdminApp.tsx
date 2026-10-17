'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Spinner } from '@/components/ui/States';
import { api, ApiError } from '@/lib/api';
import { AdminContext, errMessage } from './admin-context';
import { ContentTab } from './ContentTab';
import { ImagesTab } from './ImagesTab';
import { LoginForm } from './LoginForm';
import { RequestsTab } from './RequestsTab';
import { SettingsTab } from './SettingsTab';

const TABS = [
  { key: 'requests', label: 'Requests' },
  { key: 'content', label: 'Content' },
  { key: 'images', label: 'Images' },
  { key: 'settings', label: 'Settings' },
] as const;
type TabKey = (typeof TABS)[number]['key'];

interface Me {
  authenticated: boolean;
  user: { email: string } | null;
  usingDefaultPassword: boolean;
}

export function AdminApp() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const tp = params.get('tab');
  const tab: TabKey = TABS.some((t) => t.key === tp) ? (tp as TabKey) : 'requests';

  const [auth, setAuth] = useState<'checking' | 'in' | 'out' | 'error'>('checking');
  const [me, setMe] = useState<Me | null>(null);
  const [signedOutMsg, setSignedOutMsg] = useState('');
  const [msg, setMsg] = useState({ text: '', error: false });
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const check = useCallback(async () => {
    setAuth('checking');
    try {
      const m = await api<Me>('/auth/me');
      setMe(m);
      setAuth(m.authenticated ? 'in' : 'out');
    } catch {
      setAuth('error');
    }
  }, []);
  useEffect(() => {
    check();
  }, [check]);

  const notify = useCallback((text: string, error = false) => {
    setMsg({ text, error });
    clearTimeout(timer.current);
    if (text) timer.current = setTimeout(() => setMsg({ text: '', error: false }), 5000);
  }, []);

  const handleError = useCallback(
    (e: unknown) => {
      const m = errMessage(e);
      if (e instanceof ApiError && e.status === 401) {
        setSignedOutMsg(m);
        setAuth('out');
      } else notify(m, true);
      return m;
    },
    [notify],
  );

  const signOut = async () => {
    try {
      await api('/auth/logout', { method: 'POST' });
    } catch {
      /* ignore */
    }
    setSignedOutMsg('');
    setAuth('out');
  };

  const setTab = (k: TabKey) => {
    notify('');
    router.replace(k === 'requests' ? pathname : `${pathname}?tab=${k}`, { scroll: false });
  };
  const onTabKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const n = (i + (e.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length;
    setTab(TABS[n].key);
    setTimeout(() => document.getElementById(`tab-${TABS[n].key}`)?.focus(), 0);
  };

  if (auth === 'checking')
    return (
      <div className="admin-loading" aria-busy="true">
        <Spinner /> Checking your session…
      </div>
    );

  if (auth === 'error')
    return (
      <main className="a-login">
        <div style={{ width: 'min(100%,440px)', background: '#fff', padding: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div role="alert" className="a-alert">
            <strong>The admin couldn’t reach the server.</strong> Make sure the API is running, then try again.
          </div>
          <button type="button" className="small-btn small-btn--primary" onClick={check}>
            Try again
          </button>
        </div>
      </main>
    );

  if (auth === 'out')
    return (
      <LoginForm
        notice={signedOutMsg}
        onSuccess={() => {
          setSignedOutMsg('');
          check();
        }}
      />
    );

  return (
    <AdminContext.Provider value={{ notify, handleError }}>
      <div className="a-shell">
        <header className="a-bar">
          <span className="a-brand">
            KELLER <small>Admin</small>
          </span>
          <div role="tablist" aria-label="Admin sections" className="a-tabs">
            {TABS.map((t, i) => (
              <button key={t.key} id={`tab-${t.key}`} role="tab" type="button" className="a-tab" aria-selected={tab === t.key} aria-controls={`panel-${t.key}`} tabIndex={tab === t.key ? 0 : -1} onClick={() => setTab(t.key)} onKeyDown={(e) => onTabKey(e, i)}>
                {t.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', fontSize: 13 }}>
            <Link href="/">View site</Link>
            <button type="button" onClick={signOut} style={{ background: 'none', border: '1px solid #7f95a6', color: '#fff', borderRadius: 2, padding: '8px 12px', font: '600 12px var(--f-body)', cursor: 'pointer' }}>
              Sign out
            </button>
          </div>
        </header>
        {me?.usingDefaultPassword && (
          <div role="note" className="a-note">
            You’re using the default admin password. Change it in{' '}
            <button type="button" onClick={() => setTab('settings')} style={{ background: 'none', border: 0, padding: 0, font: 'inherit', color: 'inherit', textDecoration: 'underline', cursor: 'pointer' }}>
              Settings
            </button>{' '}
            before going live.
          </div>
        )}
        <main className="a-main" id="main">
          <p role="status" aria-live="polite" className={`a-msg${msg.error ? ' is-error' : ''}`}>
            {msg.text}
          </p>
          <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {tab === 'requests' && <RequestsTab />}
            {tab === 'content' && <ContentTab />}
            {tab === 'images' && <ImagesTab />}
            {tab === 'settings' && <SettingsTab email={me?.user?.email || ''} onPasswordChanged={check} />}
          </div>
        </main>
      </div>
    </AdminContext.Provider>
  );
}
