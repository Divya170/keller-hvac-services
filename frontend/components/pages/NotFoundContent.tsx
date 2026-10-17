import Link from 'next/link';

export function NotFoundContent() {
  return (
    <section className="center-page">
      <div className="wrap" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <span className="eyebrow eyebrow--rust">ERROR 404</span>
        <h1 className="h-xl" style={{ fontSize: 'clamp(40px,6vw,88px)', lineHeight: 1, letterSpacing: '-.04em' }}>
          This page could not be found.
        </h1>
        <p style={{ fontSize: 18, color: 'var(--muted)' }}>The link may be out of date. Try one of these instead.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <Link href="/" className="btn btn--outline">
            Home
          </Link>
          <Link href="/request-service" className="btn">
            Request Service
          </Link>
        </div>
      </div>
    </section>
  );
}
