import { SiteShell } from '@/components/layout/SiteShell';
import { SiteUnavailable } from '@/components/layout/SiteUnavailable';
import { NotFoundContent } from '@/components/pages/NotFoundContent';
import { getSiteOrNull } from '@/lib/server-api';

export const metadata = { title: 'Page Not Found' };

export default async function RootNotFound() {
  const site = await getSiteOrNull();
  if (!site) return <SiteUnavailable />;
  return (
    <SiteShell site={site}>
      <NotFoundContent />
    </SiteShell>
  );
}
