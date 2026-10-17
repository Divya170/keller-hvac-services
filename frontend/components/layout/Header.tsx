'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useSite } from '@/lib/site-context';

export const NAV = [
  { label: 'Home', href: '/' },
  { label: 'Air Conditioning', href: '/air-conditioning' },
  { label: 'Heating', href: '/heating' },
  { label: 'Installation & Repairs', href: '/installation-repairs' },
  { label: 'About / Contact', href: '/about-contact' },
];

export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Keller HVAC Services — home">
      <span className="brand__bars" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <span className="brand__text">
        <span className="brand__name">KELLER</span>
        <span className="brand__sub">HVAC SERVICES</span>
      </span>
    </Link>
  );
}

export function TopBar() {
  const { contact } = useSite();
  return (
    <div className="topbar only-desktop">
      <div className="topbar__in">
        <span className="topbar__tag">Heating · Ventilation · Air Conditioning</span>
        <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
          <a href={`mailto:${contact.email}`}>{contact.email}</a>
          <a href={contact.phoneHref}>{contact.phone}</a>
        </div>
      </div>
    </div>
  );
}

export function Header() {
  const { contact } = useSite();
  const pathname = usePathname() || '/';
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  const current = (href: string) => (href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/'));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onResize = () => window.innerWidth >= 1100 && setOpen(false);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      closeBtn.current?.focus();
      wasOpen.current = true;
    } else if (wasOpen.current) {
      menuBtn.current?.focus();
      wasOpen.current = false;
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <TopBar />
      <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
        <div className="site-header__bar">
          <Brand />
          <nav aria-label="Primary" className="main-nav only-desktop">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} aria-current={current(n.href) ? 'page' : undefined}>
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <Link href="/request-service" className="btn btn--sm only-desktop">
              Request Service <span aria-hidden="true">→</span>
            </Link>
            <a href={contact.phoneHref} className="btn-call only-mobile">
              Call
            </a>
            <button ref={menuBtn} type="button" className="btn-menu only-mobile" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(true)}>
              <span className="btn-menu__bars" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              Menu
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div id="mobile-menu" role="dialog" aria-modal="true" aria-label="Site menu" className="mobile-menu" onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}>
          <div className="mobile-menu__head">
            <span>MENU</span>
            <button ref={closeBtn} type="button" className="mobile-menu__close" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
          <nav aria-label="Mobile">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} aria-current={current(n.href) ? 'page' : undefined} onClick={() => setOpen(false)}>
                {n.label} <span aria-hidden="true">●</span>
              </Link>
            ))}
          </nav>
          <div className="mobile-menu__cta">
            <Link href="/request-service" className="big btn" onClick={() => setOpen(false)}>
              Request Service
            </Link>
            <a href={contact.phoneHref} className="big btn--outline" style={{ border: '1.5px solid var(--blue)', color: 'var(--blue)' }}>
              Call {contact.phone}
            </a>
            <a href={`mailto:${contact.email}`} style={{ textAlign: 'center', padding: 12, fontSize: 15 }}>
              {contact.email}
            </a>
          </div>
        </div>
      )}
    </>
  );
}
