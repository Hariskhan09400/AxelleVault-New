const DEFAULT_REQUEST_TIMEOUT_MS = 15_000;

export function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason ?? new DOMException('Operation aborted', 'AbortError'));
      return;
    }

    const finish = () => {
      signal?.removeEventListener('abort', abort);
      resolve();
    };
    const timer = globalThis.setTimeout(finish, ms);
    const abort = () => {
      globalThis.clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
      reject(signal?.reason ?? new DOMException('Operation aborted', 'AbortError'));
    };
    signal?.addEventListener('abort', abort, { once: true });
  });
}

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const originalSignal = init.signal ?? (input instanceof Request ? input.signal : undefined);
  const forwardAbort = () => controller.abort(originalSignal?.reason);

  if (originalSignal?.aborted) {
    forwardAbort();
  } else {
    originalSignal?.addEventListener('abort', forwardAbort, { once: true });
  }

  const timeout = globalThis.setTimeout(() => {
    controller.abort(new Error(`Request timed out after ${timeoutMs}ms`));
  }, timeoutMs);

  try {
    return await globalThis.fetch(input, { ...init, signal: controller.signal });
  } finally {
    globalThis.clearTimeout(timeout);
    originalSignal?.removeEventListener('abort', forwardAbort);
  }
}
