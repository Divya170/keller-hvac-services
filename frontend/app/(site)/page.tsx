import Link from 'next/link';
import { HeroMotion } from '@/components/ui/Motion';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { getContent, getSite } from '@/lib/server-api';

export const metadata = { title: { absolute: 'Keller HVAC Services — Heating & Air Conditioning' } };

const ROWS = [
  { href: '/heating', num: '02 / HEATING', title: 'Heating', desc: 'Furnace, heat pump and heating system enquiries.', img: 'svc-heat', brief: 'Furnace' },
  { href: '/installation-repairs', num: '03 / INSTALLATION', title: 'Installation', desc: 'Planning new or replacement equipment.', img: 'svc-install', brief: 'Installation' },
  { href: '/installation-repairs', num: '04 / REPAIRS', title: 'Repairs', desc: 'Existing systems that have stopped working properly.', img: 'svc-repair', brief: 'Repair' },
];

export default async function HomePage() {
  const [site, content] = await Promise.all([getSite(), getContent()]);
  const { contact, reviewNotes } = site;
  const expect = content.home_expect || [];
  const steps = content.home_steps || [];
  const anyDraftExpect = expect.some((e) => !e.confirmed);

  return (
    <>
      <HeroMotion />
      <section className="hero" aria-label="Introduction">
        <div className="hero__in">
          <div className="hero__text" data-hero="text">
            <div className="hero__brandline">
              <span className="hero__lines" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <span className="eyebrow">Keller HVAC Services</span>
            </div>
            <h1 className="h-xl" style={{ fontSize: 'clamp(40px,5.4vw,82px)', lineHeight: 1.02, textWrap: 'balance' }}>
              Reliable HVAC Service. <span style={{ color: 'var(--blue)', fontWeight: 600 }}>Comfort You Can Count On.</span>
            </h1>
            <p className="lede" style={{ maxWidth: '34em', fontSize: 'clamp(17px,1.35vw,19px)' }}>
              Looking for help with your heating or air conditioning? Tell us what your system needs, and the Keller HVAC Services team can follow up on your request.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <Link href="/request-service" className="btn btn--lg">
                Request Service <span aria-hidden="true">→</span>
              </Link>
              <a href={contact.phoneHref} className="btn btn--lg btn--outline" style={{ gap: 10 }}>
                Call {contact.phone}
              </a>
            </div>
            <p className="eyebrow" style={{ letterSpacing: '.06em' }}>
              Online requests are enquiries · Appointments are confirmed directly
            </p>
          </div>
          <div className="hero__img" data-hero="image">
            <ImageSlot id="hero-main" brief="Hero · professional HVAC technician servicing a residential air conditioner, natural light" eager />
            <div aria-hidden="true">
              <div className="hero__grid-line" style={{ left: '33.3%' }} />
              <div className="hero__grid-line" style={{ left: '66.6%' }} />
              <div className="hero__fig">FIG. 01 — SYSTEM SERVICE</div>
              <div className="hero__index">
                <b>SERVICE INDEX</b>
                <span>01 Air conditioning</span>
                <span>02 Heating</span>
                <span>03 Installation &amp; repairs</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="find-h">
        <div className="wrap">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px 64px', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48 }}>
            <div className="stack" style={{ gap: 16, maxWidth: 640 }}>
              <span className="eyebrow">02 — Find your service</span>
              <h2 id="find-h" className="h-l" style={{ fontSize: 'clamp(32px,3.8vw,54px)', lineHeight: 1.05, textWrap: 'balance' }}>
                What does your system need?
              </h2>
            </div>
            <p style={{ maxWidth: '30em', fontSize: 17, lineHeight: 1.6, color: 'var(--muted)' }}>Choose the area closest to your issue. Each page explains what to include in your request.</p>
          </div>
          <div className="svc-grid">
            <Link href="/air-conditioning" className="svc-feature">
              <div className="svc-feature__img">
                <div className="svc-feature__zoom">
                  <ImageSlot id="svc-ac" brief="Cooling · modern outdoor HVAC condenser, residential exterior" />
                </div>
                <span aria-hidden="true" className="svc-feature__tag">
                  01 / COOLING
                </span>
              </div>
              <div className="svc-feature__foot">
                <div className="stack" style={{ gap: 6 }}>
                  <span style={{ font: '800 clamp(26px,2.6vw,36px)/1.1 var(--f-display)', letterSpacing: '-.02em' }}>Air Conditioning</span>
                  <span style={{ fontSize: 16, color: 'var(--muted)' }}>Cooling issues, system performance and AC enquiries.</span>
                </div>
                <span aria-hidden="true" className="arrow-box">
                  →
                </span>
              </div>
            </Link>
            <div className="svc-rows">
              {ROWS.map((r) => (
                <Link key={r.num} href={r.href} className="svc-row">
                  <div className="svc-row__img">
                    <ImageSlot id={r.img} brief={r.brief} />
                  </div>
                  <div className="stack" style={{ flex: 1, gap: 6, minWidth: 0 }}>
                    <span style={{ font: '500 11px var(--f-mono)', letterSpacing: '.12em', color: 'var(--muted)' }}>{r.num}</span>
                    <span style={{ font: '800 22px/1.15 var(--f-display)', letterSpacing: '-.01em' }}>{r.title}</span>
                    <span style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--muted)' }}>{r.desc}</span>
                  </div>
                  <span aria-hidden="true" style={{ font: '700 22px var(--f-display)', color: 'var(--blue)' }}>
                    →
                  </span>
                </Link>
              ))}
              <div className="stack" style={{ borderTop: '1px solid var(--line-2)', paddingTop: 20, gap: 12 }}>
                <span style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--muted)' }}>Not sure which applies? Describe the problem and the team will review it.</span>
                <Link href="/request-service?service=general" className="text-link">
                  Start a general enquiry →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {expect.length > 0 && (
        <section className="section section--tint" aria-labelledby="expect-h">
          <div className="wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: '48px 80px' }}>
            <div className="stack" style={{ flex: '4 1 320px', gap: 20 }}>
              <span className="eyebrow">03 — Working with us</span>
              <h2 id="expect-h" className="h-l" style={{ fontSize: 'clamp(32px,3.6vw,52px)', lineHeight: 1.05, textWrap: 'balance' }}>
                What to expect when you get in touch.
              </h2>
              {reviewNotes && anyDraftExpect && <span className="draft">DRAFT · PRINCIPLES PENDING OWNER APPROVAL</span>}
            </div>
            <div className="expect-grid">
              {expect.map((e, i) => (
                <div key={e.id} className="expect-item">
                  <span className="num" style={{ fontSize: 12 }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <h3 className="h-s" style={{ fontSize: 21 }}>
                    {e.title}
                  </h3>
                  <p className="body-m">{e.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section" aria-labelledby="process-h">
        <div className="wrap">
          <div className="stack" style={{ gap: 16, marginBottom: 56, maxWidth: 680 }}>
            <span className="eyebrow">04 — How a request works</span>
            <h2 id="process-h" className="h-l" style={{ fontSize: 'clamp(32px,3.6vw,52px)', lineHeight: 1.05 }}>
              Four steps from problem to follow-up.
            </h2>
          </div>
          {steps.length > 0 && (
            <ol className="steps">
              {steps.map((s, i) => (
                <li key={s.id} data-reveal="">
                  <div className="steps__rail" aria-hidden="true">
                    <span className="steps__dot" />
                    <span className="steps__dash" />
                  </div>
                  <span className="eyebrow" style={{ fontSize: 12 }}>
                    STEP {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="h-s" style={{ fontSize: 22, textWrap: 'balance' }}>
                    {s.title}
                  </h3>
                  <p className="body-m">{s.body}</p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      <section className="closing" aria-labelledby="closing-h">
        <div className="closing__bars" aria-hidden="true">
          {[100, 88, 74, 58, 40, 22].map((w) => (
            <span key={w} style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="wrap" style={{ position: 'relative', padding: 'clamp(72px,10vw,144px) var(--gutter)', display: 'flex', flexDirection: 'column', gap: 32 }}>
          <span className="eyebrow" style={{ color: 'var(--orange-soft)' }}>
            05 — Request service
          </span>
          <h2 id="closing-h" style={{ maxWidth: '12em', font: '800 clamp(40px,6vw,88px)/1 var(--f-display)', letterSpacing: '-.04em', textWrap: 'balance' }}>
            Tell Us What Your System Needs.
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <Link href="/request-service" className="btn btn--lg">
              Request Service <span aria-hidden="true">→</span>
            </Link>
            <a href={contact.phoneHref} className="btn btn--lg btn--outline-light">
              Call the Business
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
