import Link from 'next/link';
import { FaqAccordion } from '@/components/faq/FaqAccordion';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { getContent, getSite } from '@/lib/server-api';

export const metadata = { title: 'Air Conditioning Services', description: 'Air conditioning troubleshooting, repair and replacement enquiries with Keller HVAC Services.' };

export default async function AirConditioningPage() {
  const [site, content] = await Promise.all([getSite(), getContent()]);
  const services = content.ac_services || [];
  const faqs = content.faqs || [];
  const hasDraft = services.some((s) => !s.confirmed);

  return (
    <>
      <div className="wrap" style={{ paddingTop: 20, paddingBottom: 20 }}>
        <nav aria-label="Breadcrumb" className="crumbs">
          <ol>
            <li>
              <Link href="/">Home</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">Air Conditioning</li>
          </ol>
        </nav>
      </div>
      <section aria-label="Air conditioning">
        <div className="page-hero">
          <ImageSlot id="ac-hero" brief="Cooling hero · commercial rooftop HVAC mechanical equipment" eager />
        </div>
        <div className="wrap">
          <div className="hero-card">
            <span className="eyebrow">01 / COOLING</span>
            <h1 className="h-xl" style={{ fontSize: 'clamp(38px,5vw,72px)', lineHeight: 1.02 }}>
              Air Conditioning Services
            </h1>
            <p className="lede">
              When your air conditioning is not keeping up, making unusual noises, or not turning on, a clear description helps the team understand the problem before they follow up.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <Link href="/request-service?service=ac" className="btn">
                Request AC service <span aria-hidden="true">→</span>
              </Link>
              <a href={site.contact.phoneHref} className="btn btn--outline">
                Call the team
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section--md" aria-labelledby="cool-h" style={{ padding: 'clamp(64px,8vw,112px) 0' }}>
        <div className="wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: '40px 96px' }}>
          <div className="stack" style={{ flex: '4 1 280px', gap: 16 }}>
            <span className="eyebrow">Cooling services</span>
            <h2 id="cool-h" className="h-m" style={{ fontSize: 'clamp(28px,3vw,42px)', lineHeight: 1.1 }}>
              How we can help with cooling
            </h2>
            {site.reviewNotes && hasDraft && <span className="draft">DRAFT · SERVICE LIST PENDING CONFIRMATION</span>}
          </div>
          <ul style={{ flex: '8 1 480px', listStyle: 'none', padding: 0 }}>
            {services.map((s, i) => (
              <li key={s.id} className="list-row">
                <span className="num" style={{ paddingTop: 4 }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="stack" style={{ gap: 8 }}>
                  <h3 className="h-s" style={{ fontSize: 22 }}>
                    {s.title}
                  </h3>
                  <p className="body-m" style={{ maxWidth: '40em' }}>
                    {s.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section data-reveal="" className="wrap-lg" aria-label="Equipment detail">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-end' }}>
          <div style={{ flex: '8 1 480px', position: 'relative', height: 'clamp(260px,34vw,480px)', background: 'var(--slate)' }}>
            <ImageSlot id="ac-band" brief="Equipment detail · modern thermostat, indoor climate control" />
          </div>
          <p style={{ flex: '3 1 220px', font: '500 12px/1.7 var(--f-mono)', letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--muted)' }}>
            Tip — note what the thermostat is set to, what the room temperature is, and when the problem started.
          </p>
        </div>
      </section>

      {faqs.length > 0 && (
        <section aria-labelledby="faq-h" style={{ padding: 'clamp(64px,8vw,112px) 0' }}>
          <div className="stack" style={{ maxWidth: 880, margin: '0 auto', padding: '0 var(--gutter)', gap: 24 }}>
            <h2 id="faq-h" className="h-m" style={{ fontSize: 'clamp(26px,2.8vw,38px)', lineHeight: 1.1, letterSpacing: '-.02em' }}>
              Questions about requesting service
            </h2>
            <FaqAccordion items={faqs} />
          </div>
        </section>
      )}

      <section className="cta-band">
        <div className="cta-band__in">
          <h2>Air conditioning not working as it should?</h2>
          <Link href="/request-service?service=ac" className="btn btn--lg">
            Request AC service <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </>
  );
}
