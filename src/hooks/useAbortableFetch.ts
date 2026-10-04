import { useCallback, useEffect, useRef } from 'react';
import { fetchWithTimeout } from '../lib/network';

export function useAbortableFetch() {
  const controllers = useRef(new Set<AbortController>());
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      controllers.current.forEach((controller) => controller.abort());
      controllers.current.clear();
    };
  }, []);

  return useCallback(async (input: RequestInfo | URL, init: RequestInit = {}) => {
    if (!mounted.current) throw new DOMException('Component has unmounted', 'AbortError');
    const controller = new AbortController();
    controllers.current.add(controller);

    try {
      return await fetchWithTimeout(input, { ...init, signal: controller.signal });
    } finally {
      controllers.current.delete(controller);
    }
  }, []);
}

export function useRequestSignal() {
  const controller = useRef<AbortController | null>(null);

  useEffect(() => {
    const lifetimeController = new AbortController();
    controller.current = lifetimeController;
    return () => {
      lifetimeController.abort();
      if (controller.current === lifetimeController) controller.current = null;
    };
  }, []);

  return useCallback(() => {
    if (!controller.current) {
      throw new Error('Request signal is unavailable outside the component lifecycle.');
    }
    return controller.current.signal;
  }, []);
}
