import { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

const toastContent: Record<ToastType, { label: string; icon: typeof CheckCircle; colors: string }> = {
  success: { label: 'Success', icon: CheckCircle, colors: 'border-emerald-500/30 bg-emerald-50 text-emerald-950 dark:bg-[#10251d] dark:text-emerald-100' },
  error: { label: 'Something went wrong', icon: XCircle, colors: 'border-red-500/30 bg-red-50 text-red-950 dark:bg-[#2b171b] dark:text-red-100' },
  warning: { label: 'Please note', icon: AlertTriangle, colors: 'border-amber-500/30 bg-amber-50 text-amber-950 dark:bg-[#2b2414] dark:text-amber-100' },
  info: { label: 'Information', icon: Info, colors: 'border-sky-500/30 bg-sky-50 text-sky-950 dark:bg-[#142331] dark:text-sky-100' },
};

const iconColors: Record<ToastType, string> = {
  success: 'bg-emerald-600 text-white',
  error: 'bg-red-600 text-white',
  warning: 'bg-amber-500 text-[#211600]',
  info: 'bg-sky-600 text-white',
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<string, number>());

  useEffect(() => () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current.clear();
  }, []);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
    const timer = window.setTimeout(() => {
      timers.current.delete(id);
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
    timers.current.set(id, timer);
  }, []);

  const remove = (id: string) => {
    const timer = timers.current.get(id);
    if (timer !== undefined) window.clearTimeout(timer);
    timers.current.delete(id);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast container */}
      <div
        className="pointer-events-none fixed inset-x-3 top-[calc(env(safe-area-inset-top)+0.75rem)] z-[200] mx-auto flex w-auto max-w-sm flex-col gap-2 sm:inset-x-auto sm:right-5 sm:top-[calc(env(safe-area-inset-top)+1.25rem)] sm:mx-0 sm:w-[min(24rem,calc(100vw-2.5rem))]"
        aria-live="polite"
        aria-relevant="additions text"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.type === 'error' ? 'alert' : 'status'}
            className={`pointer-events-auto flex min-w-0 items-center gap-3 rounded-2xl border px-3 py-3 shadow-lg shadow-black/10 ring-1 ring-black/[0.03] animate-fade-in sm:px-4 ${toastContent[toast.type].colors}`}
          >
            {(() => {
              const Icon = toastContent[toast.type].icon;
              return (
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${iconColors[toast.type]}`}>
                  <Icon aria-hidden="true" className="h-[18px] w-[18px]" />
                </span>
              );
            })()}
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold opacity-75">{toastContent[toast.type].label}</span>
              <span className="mt-0.5 block break-words text-sm font-medium leading-snug">{toast.message}</span>
            </span>
            <button
              onClick={() => remove(toast.id)}
              type="button"
              aria-label="Dismiss notification"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl opacity-60 transition hover:bg-black/5 hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current dark:hover:bg-white/10"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};