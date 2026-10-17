'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const prefersReduced = () => typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Scroll-reveal for elements marked data-reveal (below the fold only), re-armed on every page change. */
export function Reveal() {
  const pathname = usePathname();
  useEffect(() => {
    if (prefersReduced() || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) {
            const el = en.target as HTMLElement;
            el.style.opacity = '1';
            el.style.transform = 'none';
            io.unobserve(el);
          }
        }),
      { rootMargin: '0px 0px -10% 0px' },
    );
    const t = setTimeout(() => {
      document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
        if (el.getBoundingClientRect().top > window.innerHeight) {
          el.style.opacity = '0';
          el.style.transform = 'translateY(28px)';
          el.style.transition = 'opacity .8s ease, transform .8s cubic-bezier(.2,.7,.1,1)';
          io.observe(el);
        }
      });
    }, 50);
    return () => {
      clearTimeout(t);
      io.disconnect();
    };
  }, [pathname]);
  return null;
}

/** Home hero entrance: text fades up, image wipes in. Cancelled afterwards so nothing is left half-styled. */
export function HeroMotion() {
  useEffect(() => {
    if (prefersReduced() || document.hidden) return;
    const t = document.querySelector<HTMLElement>('[data-hero="text"]');
    const i = document.querySelector<HTMLElement>('[data-hero="image"]');
    const ease = 'cubic-bezier(.2,.7,.1,1)';
    const anims: Animation[] = [];
    try {
      if (t?.animate) anims.push(t.animate([{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }], { duration: 700, easing: ease }));
      if (i?.animate) anims.push(i.animate([{ clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 1100, easing: ease }));
    } catch {
      /* decorative only */
    }
    const id = setTimeout(() => anims.forEach((a) => a.cancel()), 1500);
    return () => clearTimeout(id);
  }, []);
  return null;
}
