import Link from 'next/link';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { getContent, getSite } from '@/lib/server-api';

export const metadata = { title: 'Installation & Repairs', description: 'New or replacement HVAC equipment and repairs to existing systems: choose the path that matches your situation.' };

export default async function InstallationRepairsPage() {
  const [site, content] = await Promise.all([getSite(), getContent()]);
  const install = content.install_items || [];
  const repair = content.repair_items || [];
  const include = content.include_list || [];
  const hasDraft = [...install, ...repair, ...include].some((i) => !i.confirmed);

  return (
    <>
      <section aria-label="Installation and repairs" style={{ padding: 'clamp(24px,3vw,40px) 0 0' }}>
        <div className="wrap stack" style={{ gap: 28 }}>
          <nav aria-label="Breadcrumb" className="crumbs">
            <ol>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page">Installation &amp; Repairs</li>
            </ol>
          </nav>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px 64px', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <h1 className="h-xl" style={{ fontSize: 'clamp(40px,6.4vw,104px)', lineHeight: 0.98, letterSpacing: '-.045em' }}>
              Installation
              <br />
              <span style={{ color: 'var(--rust)' }}>&amp;</span> Repairs
            </h1>
            <p className="lede" style={{ maxWidth: '26em' }}>
              New equipment and problems with an existing system need different information. Choose the path that matches your situation.
            </p>
          </div>
          <div style={{ position: 'relative', paddingBottom: 'clamp(40px,6vw,96px)' }}>
            <div style={{ position: 'relative', height: 'clamp(300px,44vw,620px)', background: 'var(--slate)', width: 'min(100%,1040px)' }}>
              <ImageSlot id="inst-hero" brief="Equipment photo · professional ductwork HVAC installation close-up" eager />
            </div>
            <div style={{ position: 'absolute', right: 0, bottom: 0, width: 'clamp(160px,30vw,400px)', height: 'clamp(140px,24vw,320px)', background: 'var(--line-2)', border: '6px solid var(--bg)' }}>
              <ImageSlot id="inst-detail" brief="Detail · HVAC technician with diagnostic equipment" />
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: 'clamp(48px,6vw,96px) 0' }}>
        <div className="wrap">
          {site.reviewNotes && hasDraft && <p className="draft-line" style={{ margin: '0 0 24px' }}>DRAFT · EQUIPMENT TYPES AND SERVICE SCOPE PENDING CONFIRMATION</p>}
          <div className="path-grid">
            <div className="path">
              <span className="eyebrow">A — NEW OR REPLACEMENT EQUIPMENT</span>
              <h2 className="h-m" style={{ fontSize: 'clamp(28px,3vw,42px)', lineHeight: 1.1 }}>
                Installation
              </h2>
              <p style={{ fontSize: 17, lineHeight: 1.6, color: 'var(--muted)' }}>For planning new heating or cooling equipment, or replacing a system that has reached the end of its life.</p>
              <ul className="bullets">
                {install.map((i) => (
                  <li key={i.id}>{i.title}</li>
                ))}
              </ul>
              <Link href="/request-service?service=installation" className="btn" style={{ alignSelf: 'flex-start' }}>
                Request an installation enquiry <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="path">
              <span className="eyebrow">B — EXISTING SYSTEM PROBLEMS</span>
              <h2 className="h-m" style={{ fontSize: 'clamp(28px,3vw,42px)', lineHeight: 1.1 }}>
                Repairs
              </h2>
              <p style={{ fontSize: 17, lineHeight: 1.6, color: 'var(--muted)' }}>For equipment that has stopped working, is underperforming, or is behaving differently than usual.</p>
              <ul className="bullets bullets--orange">
                {repair.map((i) => (
                  <li key={i.id}>{i.title}</li>
                ))}
              </ul>
              <Link href="/request-service?service=repair" className="btn btn--blue" style={{ alignSelf: 'flex-start' }}>
                Request a repair <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {include.length > 0 && (
        <section className="section--tint" style={{ padding: 'clamp(56px,7vw,104px) 0' }} aria-labelledby="inc-h">
          <div className="wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: '40px 80px' }}>
            <div className="stack" style={{ flex: '4 1 280px', gap: 16 }}>
              <span className="eyebrow">Before you submit</span>
              <h2 id="inc-h" className="h-m" style={{ fontSize: 'clamp(28px,3vw,42px)', lineHeight: 1.1 }}>
                What to include in your request
              </h2>
            </div>
            <ol className="include-list">
              {include.map((c, i) => (
                <li key={c.id}>
                  <span className="num">{String(i + 1).padStart(2, '0')}</span>
                  <span>{c.title}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}
    </>
  );
}
