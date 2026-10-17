import Link from 'next/link';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { getContent, getSite } from '@/lib/server-api';

export const metadata = { title: 'Heating Services', description: 'Heating repair, installation and replacement enquiries with Keller HVAC Services.' };

export default async function HeatingPage() {
  const [site, content] = await Promise.all([getSite(), getContent()]);
  const services = content.heating_services || [];
  const hasDraft = services.some((s) => !s.confirmed);

  return (
    <>
      <section className="heat-hero" aria-label="Heating">
        <div style={{ maxWidth: 1440, margin: '0 auto', display: 'flex', flexWrap: 'wrap' }}>
          <div style={{ flex: '6 1 420px', position: 'relative', minHeight: 'clamp(340px,48vw,680px)', background: '#e6d8c8' }}>
            <ImageSlot id="heat-hero" brief="Heating hero (warm tones) · HVAC technician inspecting a furnace in a utility room" eager />
          </div>
          <div className="stack" style={{ flex: '5 1 400px', padding: 'clamp(32px,6vw,96px) var(--gutter-lg)', justifyContent: 'center', gap: 24 }}>
            <nav aria-label="Breadcrumb" className="crumbs crumbs--warm">
              <ol>
                <li>
                  <Link href="/">Home</Link>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page">Heating</li>
              </ol>
            </nav>
            <span className="eyebrow eyebrow--rust">02 / HEATING</span>
            <h1 className="h-xl" style={{ fontSize: 'clamp(38px,4.8vw,72px)', lineHeight: 1.02 }}>
              Heating Services
            </h1>
            <p className="lede" style={{ color: '#5e5249', maxWidth: '30em' }}>
              If your heating is not producing warm air, is cycling on and off, or is not responding to the thermostat, send the details and the team can review what your system needs.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <Link href="/request-service?service=heating" className="btn">
                Request heating service <span aria-hidden="true">→</span>
              </Link>
              <a href={site.contact.phoneHref} className="btn btn--ink-outline">
                Call {site.contact.phone}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="heat-h" style={{ padding: 'clamp(64px,8vw,112px) 0' }}>
        <div className="wrap stack" style={{ gap: 40 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px 48px', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <h2 id="heat-h" className="h-m" style={{ fontSize: 'clamp(28px,3.2vw,46px)', lineHeight: 1.08, maxWidth: '14em' }}>
              Heating help, organised by what you need.
            </h2>
            {site.reviewNotes && hasDraft && <span className="draft">DRAFT · CATEGORIES PENDING CONFIRMATION</span>}
          </div>
          <div className="heat-grid">
            {services.map((s, i) => (
              <div key={s.id} className="heat-cell">
                <span className="heat-cell__n">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="h-s" style={{ fontSize: 22 }}>
                  {s.title}
                </h3>
                <p className="body-m" style={{ color: '#5e5249' }}>
                  {s.body}
                </p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: '#5e5249', maxWidth: '46em' }}>
            Not sure what type of heating system you have? Choose “Other / Not sure” on the request form and describe what you can see, or attach a photo of the unit and its label.
          </p>
        </div>
      </section>

      <section data-reveal="" className="wrap-lg" style={{ paddingBottom: 'clamp(64px,8vw,112px)' }} aria-label="Heating system detail">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
          <div style={{ flex: '5 1 320px', position: 'relative', height: 'clamp(260px,30vw,420px)', background: '#e6d8c8' }}>
            <ImageSlot id="heat-detail-1" brief="Heating system detail · clean modern residential mechanical room" />
          </div>
          <div style={{ flex: '7 1 420px', position: 'relative', height: 'clamp(260px,30vw,420px)', background: '#e6d8c8' }}>
            <ImageSlot id="heat-detail-2" brief="Warm interior · modern thermostat, indoor climate control" />
          </div>
        </div>
      </section>

      <section className="cta-band cta-band--navy">
        <div className="cta-band__in">
          <h2>Tell us what your heating is doing.</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <Link href="/request-service?service=heating" className="btn btn--lg">
              Request heating service <span aria-hidden="true">→</span>
            </Link>
            <a href={site.contact.phoneHref} className="btn btn--lg btn--outline-light">
              Call
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
