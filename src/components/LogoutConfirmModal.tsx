import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { LogOut, Bookmark } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogoutConfirmModal = ({ isOpen, onClose }: LogoutConfirmModalProps) => {
  const { signOut } = useAuth();
  const [busy, setBusy] = useState(false);
  const reduceMotion = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    cancelRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;
      const buttons = dialogRef.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)');
      if (!buttons?.length) return;
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, busy, onClose]);

  const handleLogout = async (rememberLogin: boolean) => {
    setBusy(true);
    try {
      await signOut({ rememberLogin });
    } catch (error) {
      console.error('[LogoutConfirmModal] signOut failed:', error);
    } finally {
      setBusy(false);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.16 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !busy) onClose();
          }}
        >
      <motion.div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="logout-confirm-title"
        aria-describedby="logout-confirm-description"
        className="w-full max-w-sm rounded-2xl border border-[#e4ddc9] bg-white p-6 shadow-xl sm:p-8"
        initial={{ opacity: 0, y: reduceMotion ? 0 : 12, scale: reduceMotion ? 1 : 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: reduceMotion ? 0 : 8, scale: reduceMotion ? 1 : 0.99 }}
        transition={{ duration: reduceMotion ? 0 : 0.18, ease: 'easeOut' }}
      >
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8b74a]/15 text-[#e8b74a]">
          <LogOut className="h-7 w-7" />
        </div>

        <h2 id="logout-confirm-title" className="text-center text-xl font-bold text-[#0b1f3d]">Save login info?</h2>
        <p id="logout-confirm-description" className="mt-2 text-center text-sm leading-6 text-[#5d5648]">
          Save your email so you can log back in faster next time. Your password is never saved.
        </p>

        <div className="mt-6 space-y-2.5">
          <button
            type="button"
            onClick={() => handleLogout(true)}
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0b1f3d] px-5 py-3 text-sm font-semibold text-[#f4f1ea] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Bookmark className="h-4 w-4" />
            {busy ? 'Logging out...' : 'Save info'}
          </button>
          <button
            type="button"
            onClick={() => handleLogout(false)}
            disabled={busy}
            className="w-full rounded-full border border-[#e4ddc9] px-5 py-3 text-sm font-semibold text-[#1c2333] transition hover:bg-[#f4f1ea] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? 'Logging out...' : "Don't save"}
          </button>
          <button
            type="button"
            ref={cancelRef}
            onClick={onClose}
            disabled={busy}
            className="w-full py-2 text-center text-xs font-medium text-[#8a8272] hover:text-[#0b1f3d] transition-colors disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};