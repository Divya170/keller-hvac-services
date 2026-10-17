import Link from 'next/link';
import { getContent, getSite } from '@/lib/server-api';

export const metadata = { title: 'Privacy Notice' };

export default async function PrivacyPage() {
  const [site, content] = await Promise.all([getSite(), getContent()]);
  const sections = content.privacy || [];
  return (
    <section style={{ padding: 'clamp(24px,3vw,40px) 0 clamp(64px,8vw,112px)' }}>
      <div className="stack prose" style={{ maxWidth: 760, margin: '0 auto', padding: '0 var(--gutter)', gap: 24 }}>
        <nav aria-label="Breadcrumb" className="crumbs">
          <ol>
            <li>
              <Link href="/">Home</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">Privacy</li>
          </ol>
        </nav>
        <h1 className="h-l" style={{ fontSize: 'clamp(34px,4vw,56px)', lineHeight: 1.05 }}>
          Privacy notice
        </h1>
        {site.reviewNotes && <p className="draft-note" style={{ maxWidth: 'none' }}>Draft for owner and legal review before publication.</p>}
        {sections.map((s) => (
          <div key={s.id} className="stack" style={{ gap: 24 }}>
            <h2>{s.title}</h2>
            <p>{s.body}</p>
          </div>
        ))}
        <h2>Contact</h2>
        <p>
          Questions about your information: <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>.
        </p>
      </div>
    </section>
  );
}
