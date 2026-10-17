import Link from 'next/link';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { getSite } from '@/lib/server-api';

export const metadata = { title: 'About & Contact', description: 'Contact Keller HVAC Services by phone or email, or send a service request online.' };

export default async function AboutContactPage() {
  const site = await getSite();
  const c = site.contact;
  const draft = site.reviewNotes;

  return (
    <section aria-label="About and contact" style={{ padding: 'clamp(24px,3vw,40px) 0 clamp(64px,8vw,112px)' }}>
      <div className="wrap stack" style={{ gap: 'clamp(40px,5vw,72px)' }}>
        <nav aria-label="Breadcrumb" className="crumbs">
          <ol>
            <li>
              <Link href="/">Home</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">About / Contact</li>
          </ol>
        </nav>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px 96px' }}>
          <div className="stack" style={{ flex: '6 1 420px', gap: 24 }}>
            <h1 className="h-xl" style={{ fontSize: 'clamp(38px,5vw,76px)', lineHeight: 1.02 }}>
              About Keller HVAC Services
            </h1>
            <p style={{ fontSize: 19, lineHeight: 1.6, color: 'var(--muted)', maxWidth: '32em', textWrap: 'pretty' }}>{site.aboutIntro}</p>
            {draft && (
              <p className="draft-note">
                Draft note: add a verified business introduction here (history, team, licensing and insurance) once confirmed by the owner. Nothing in this space is published until supplied.
              </p>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <Link href="/request-service" className="btn">
                Request Service <span aria-hidden="true">→</span>
              </Link>
              <Link href="/request-service?service=general" className="btn btn--outline">
                General enquiry
              </Link>
            </div>
          </div>
          <div style={{ flex: '5 1 340px', position: 'relative', minHeight: 320, background: 'var(--slate)' }}>
            <ImageSlot id="about-photo" brief="Team or van photo (a real Keller HVAC photo is preferred)" />
          </div>
        </div>

        <div className="fact-grid">
          <div className="fact">
            <span className="eyebrow">PHONE</span>
            <a href={c.phoneHref} style={{ font: '700 22px var(--f-display)' }}>
              {c.phone}
            </a>
          </div>
          <div className="fact">
            <span className="eyebrow">EMAIL</span>
            <a href={`mailto:${c.email}`} style={{ font: '700 19px var(--f-display)', overflowWrap: 'anywhere' }}>
              {c.email}
            </a>
          </div>
          <div className="fact">
            <span className="eyebrow">CONTACT</span>
            <span style={{ font: '700 22px var(--f-display)', color: 'var(--navy)' }}>{c.name}</span>
          </div>
          <div className="fact">
            <span className="eyebrow">ADDRESS</span>
            <address style={{ font: '700 19px/1.4 var(--f-display)', fontStyle: 'normal', color: 'var(--navy)' }}>
              {c.addressLine1}
              <br />
              {c.addressLine2}
            </address>
            {draft && !c.addressVerified && <span className="draft" style={{ padding: '3px 7px' }}>PROVIDED · PENDING VERIFICATION</span>}
          </div>
        </div>

        {(site.serviceArea || site.businessHours) && (
          <div className="fact-grid" style={{ borderTop: 0 }}>
            {site.serviceArea && (
              <div className="fact">
                <span className="eyebrow">SERVICE AREA</span>
                <p style={{ fontSize: 17, lineHeight: 1.55, color: 'var(--ink)', whiteSpace: 'pre-line' }}>{site.serviceArea}</p>
              </div>
            )}
            {site.businessHours && (
              <div className="fact">
                <span className="eyebrow">BUSINESS HOURS</span>
                <p style={{ fontSize: 17, lineHeight: 1.55, color: 'var(--ink)', whiteSpace: 'pre-line' }}>{site.businessHours}</p>
              </div>
            )}
          </div>
        )}
        {draft && !site.serviceArea && !site.businessHours && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px 48px', padding: 24, background: 'var(--tint)' }}>
            <span className="eyebrow">SERVICE AREA · NOT PUBLISHED</span>
            <span style={{ flex: '1 1 320px', fontSize: 15, lineHeight: 1.55, color: 'var(--ink)' }}>
              The coverage area and business hours will appear here after Keller HVAC Services confirms them. A map is added once the address is verified.
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
