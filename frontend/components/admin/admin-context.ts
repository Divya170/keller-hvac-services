'use client';

import { createContext, useContext } from 'react';
import { ApiError } from '@/lib/api';

export interface AdminCtx {
  /** Shows a status message under the tab bar (announced to screen readers). */
  notify: (msg: string, isError?: boolean) => void;
  /** Handles an API error: signs out on 401, otherwise shows the message. Returns the message. */
  handleError: (e: unknown) => string;
}

export const AdminContext = createContext<AdminCtx>({ notify: () => {}, handleError: () => '' });
export const useAdmin = () => useContext(AdminContext);

export const errMessage = (e: unknown) => (e instanceof ApiError ? e.message : 'Something went wrong. Please try again.');
