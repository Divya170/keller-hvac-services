import type { Content, RequestOptions, SiteInfo } from './types';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4200';

/** Server-side fetch to the NestJS API. Always fresh: the admin edits content live. */
async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BACKEND_URL}/api${path}`, { cache: 'no-store', headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`API ${path} responded ${res.status}`);
  return (await res.json()) as T;
}

export const getSite = () => get<SiteInfo>('/site');
export const getContent = () => get<Content>('/content');
export const getRequestOptions = () => get<RequestOptions>('/requests/options');

export async function getSiteOrNull(): Promise<SiteInfo | null> {
  try {
    return await getSite();
  } catch {
    return null;
  }
}
