import { SiteShell } from '@/components/layout/SiteShell';
import { SiteUnavailable } from '@/components/layout/SiteUnavailable';
import { getSiteOrNull } from '@/lib/server-api';

// Content, images and settings are edited live in the admin, so always render fresh.
export const dynamic = 'force-dynamic';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const site = await getSiteOrNull();
  if (!site) return <SiteUnavailable />;
  const ld = { '@context': 'https://schema.org', '@type': 'HVACBusiness', name: 'Keller HVAC Services', telephone: site.contact.phone.replace(/[^\d+]/g, ''), email: site.contact.email };
  return (
    <SiteShell site={site}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
      {children}
    </SiteShell>
  );
}
