'use client';

import Link from 'next/link';
import { SiteProvider, useSite } from '@/lib/site-context';
import type { SiteInfo } from '@/lib/types';
import { Reveal } from '../ui/Motion';
import { Header } from './Header';

function Footer() {
  const { contact } = useSite();
  return (
    <footer className="site-footer">
      <div className="site-footer__in">
        <div className="site-footer__grid">
          <div style={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 360 }}>
            <span style={{ font: '800 24px var(--f-display)', color: '#fff', letterSpacing: '-.02em' }}>Keller HVAC Services</span>
            <span style={{ fontSize: 15, lineHeight: 1.55 }}>Heating, ventilation and air-conditioning service.</span>
            <Link href="/request-service" className="btn btn--sm" style={{ alignSelf: 'flex-start', marginTop: 8 }}>
              Request Service →
            </Link>
          </div>
          <nav aria-label="Footer" className="site-footer__col">
            <span className="site-footer__label">SERVICES</span>
            <Link href="/air-conditioning">Air Conditioning</Link>
            <Link href="/heating">Heating</Link>
            <Link href="/installation-repairs">Installation &amp; Repairs</Link>
            <Link href="/about-contact">About / Contact</Link>
            <Link href="/privacy">Privacy Policy</Link>
          </nav>
          <div className="site-footer__col" style={{ flexBasis: 240 }}>
            <span className="site-footer__label">CONTACT</span>
            <a href={contact.phoneHref} style={{ font: '700 17px var(--f-display)' }}>
              {contact.phone}
            </a>
            <a href={`mailto:${contact.email}`} style={{ fontSize: 15, overflowWrap: 'anywhere' }}>
              {contact.email}
            </a>
            <address style={{ fontStyle: 'normal', fontSize: 15, lineHeight: 1.55 }}>
              {contact.addressLine1}
              <br />
              {contact.addressLine2}
            </address>
          </div>
        </div>
        <div className="site-footer__base">
          <span>
            © {new Date().getFullYear()} Keller HVAC Services. All rights reserved.
          </span>
          <span style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--f-mono)', letterSpacing: '.08em' }}>HEATING · VENTILATION · AIR CONDITIONING</span>
            <Link href="/admin" style={{ color: '#afc2d0' }}>
              Admin
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}

/** Public site chrome: skip link, header, footer, scroll-reveal. */
export function SiteShell({ site, children }: { site: SiteInfo; children: React.ReactNode }) {
  return (
    <SiteProvider value={site}>
      <div className="shell">
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <Header />
        <main id="main" tabIndex={-1} className="main">
          {children}
        </main>
        <Footer />
        <Reveal />
      </div>
    </SiteProvider>
  );
}
