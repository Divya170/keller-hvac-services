'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api, ApiError } from './api';

interface State<T> {
  data: T | null;
  error: ApiError | null;
  loading: boolean;
}

/**
 * Fetches `path` and tracks loading / error / data. Changing `path` refetches;
 * stale responses are ignored. `keepPrevious` keeps the old data visible while refetching.
 */
export function useApi<T>(path: string | null, opts: { keepPrevious?: boolean } = {}) {
  const [state, setState] = useState<State<T>>({ data: null, error: null, loading: !!path });
  const seq = useRef(0);

  const load = useCallback(async () => {
    if (!path) return;
    const id = ++seq.current;
    setState((s) => ({ data: opts.keepPrevious ? s.data : null, error: null, loading: true }));
    try {
      const data = await api<T>(path);
      if (id === seq.current) setState({ data, error: null, loading: false });
    } catch (e) {
      if (id === seq.current) setState((s) => ({ data: opts.keepPrevious ? s.data : null, error: e as ApiError, loading: false }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load, setData: (data: T) => setState((s) => ({ ...s, data })) };
}
