'use client';

import Link from 'next/link';

export default function SiteError({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="center-page">
      <div className="wrap" style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'flex-start' }}>
        <span className="eyebrow eyebrow--rust">Something went wrong</span>
        <h1 className="h-xl" style={{ fontSize: 'clamp(36px,4.6vw,56px)', lineHeight: 1.05 }}>
          We couldn’t load this page.
        </h1>
        <p className="lede">It’s probably temporary. Try again, or head back to the home page.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center' }}>
          <button type="button" className="btn" onClick={reset}>
            Try again
          </button>
          <Link href="/" className="text-link">
            Back to home
          </Link>
        </div>
      </div>
    </section>
  );
}
