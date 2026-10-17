import Link from 'next/link';
import { Suspense } from 'react';
import { RequestForm } from '@/components/request/RequestForm';
import { getRequestOptions } from '@/lib/server-api';

export const metadata = { title: 'Request HVAC Service', description: 'Share a few details about your system and the service you need so the Keller HVAC Services team can review your request.' };

export default async function RequestServicePage() {
  let options = null;
  try {
    options = await getRequestOptions();
  } catch {
    options = null;
  }
  return (
    <section aria-label="Request service" style={{ padding: 'clamp(24px,3vw,40px) 0 clamp(64px,8vw,112px)' }}>
      <div className="wrap stack" style={{ gap: 32 }}>
        <nav aria-label="Breadcrumb" className="crumbs">
          <ol>
            <li>
              <Link href="/">Home</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">Request Service</li>
          </ol>
        </nav>
        <div className="stack" style={{ gap: 16, maxWidth: 760 }}>
          <h1 className="h-xl" style={{ fontSize: 'clamp(36px,4.6vw,68px)', lineHeight: 1.02 }}>
            Request HVAC Service
          </h1>
          <p className="lede">Share a few details about your system and the service you need so the team can review your request.</p>
        </div>
        {options ? (
          <Suspense fallback={null}>
            <RequestForm options={options} />
          </Suspense>
        ) : (
          <div role="alert" className="err-banner" style={{ maxWidth: 640 }}>
            <h2>The request form couldn’t load</h2>
            <p>Please refresh the page to try again. If it keeps happening, call or email the team using the details in the footer.</p>
          </div>
        )}
      </div>
    </section>
  );
}
