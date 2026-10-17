'use client';

/** Shown when the API can't be reached while rendering the public site. */
export function SiteUnavailable() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <div className="wrap" style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'flex-start', paddingTop: 64, paddingBottom: 64 }}>
        <span className="eyebrow eyebrow--rust">Keller HVAC Services</span>
        <h1 className="h-xl" style={{ fontSize: 'clamp(40px,5vw,64px)', lineHeight: 1.05 }}>
          We’ll be right back.
        </h1>
        <p className="lede">The site couldn’t load its content just now. Please try again in a moment.</p>
        <button type="button" className="btn" onClick={() => window.location.reload()}>
          Try again
        </button>
      </div>
    </main>
  );
}
