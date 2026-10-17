'use client';

import { createContext, useContext } from 'react';
import type { SiteInfo } from './types';

const SiteContext = createContext<SiteInfo | null>(null);

export function SiteProvider({ value, children }: { value: SiteInfo; children: React.ReactNode }) {
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite(): SiteInfo {
  const v = useContext(SiteContext);
  if (!v) throw new Error('useSite must be used inside <SiteProvider>');
  return v;
}
