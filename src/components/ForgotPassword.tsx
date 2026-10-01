import { useEffect, useState, FormEvent } from 'react';
import { useSafeNavigate } from '../lib/navigation';
import { Mail, AlertCircle, MailCheck, ArrowLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { AuthShell } from './AuthLayout';

const COOLDOWN_SECONDS = 60;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const labelCls = 'mb-2 block text-xs font-medium text-[#5b5546]';
const inputCls =
  'h-12 w-full rounded-2xl border border-[#e4ddc9] bg-white pl-11 pr-4 text-base text-[#0b1f3d] placeholder:text-[#b3ab98] outline-none transition focus:border-[#0b1f3d] focus:ring-4 focus:ring-[#0b1f3d]/10 sm:text-sm';
const primaryBtn =
  'flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#0b1f3d] text-sm font-semibold text-[#f4f1ea] transition hover:bg-[#12305c] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0b1f3d]/25 disabled:cursor-not-allowed disabled:opacity-60';
const secondaryBtn =
  'flex h-12 w-full items-center justify-center rounded-full border border-[#e4ddc9] bg-white text-sm font-semibold text-[#0b1f3d] transition hover:border-[#0b1f3d]/40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0b1f3d]/15 disabled:cursor-not-allowed disabled:opacity-60';

interface ForgotPasswordProps {
  onBack?: () => void;
}

export const ForgotPassword = ({ onBack }: ForgotPasswordProps) => {
  const auth = useAuth();
  const navigate = useSafeNavigate();
  const reduce = useReducedMotion();
  const goBack = onBack ?? (() => navigate('/login'));

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const sendLink = async () => {
    if (!auth) {
      setError('Something went wrong. Please refresh the page.');
      return;
    }
    setError('');

    if (!EMAIL_RE.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const { error: resetError } = await auth.requestPasswordReset(email);

      if (resetError) {
        const msg = resetError.message.toLowerCase();
        if (msg.includes('rate limit') || msg.includes('too many') || msg.includes('seconds')) {
          setError('Too many requests. Wait a minute and try again.');
          setCooldown(COOLDOWN_SECONDS);
        } else {
          setError('Could not send the reset email. Please try again.');
        }
        return;
      }

      setSent(true);
      setCooldown(COOLDOWN_SECONDS);
    } catch {
      setError('Could not send the reset email. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void sendLink();
  };

  const view = {
    initial: { opacity: 0, y: reduce ? 0 : 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0 },
    transition: { duration: 0.25 },
  };

  return (
    <AuthShell
      headline="Locked out?"
      accent="We'll get you back in."
      description="Enter your email and we'll send a secure link to set a new password for your vault."
    >
      <AnimatePresence mode="wait" initial={false}>
        {sent ? (
          <motion.div key="sent" {...view}>
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <MailCheck className="h-7 w-7" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Check your inbox.</h1>
            <p className="mt-2 text-sm leading-6 text-[#8a8272]">
              If an account exists for <span className="font-semibold text-[#0b1f3d] break-all">{email.trim()}</span>,
              a reset link is on its way. It expires soon, so use it right away. Check spam if you don't see it.
            </p>

            {error && (
              <p role="alert" className="mt-4 text-sm text-red-700">
                {error}
              </p>
            )}

            <div className="mt-6 space-y-3">
              <button type="button" onClick={sendLink} disabled={loading || cooldown > 0} className={secondaryBtn}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : cooldown > 0 ? (
                  `Resend in ${cooldown}s`
                ) : (
                  'Resend email'
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSent(false);
                  setError('');
                }}
                className="w-full py-2 text-sm font-medium text-[#8a8272] transition hover:text-[#0b1f3d]"
              >
                Use a different email
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="form" {...view}>
            <h1 className="text-3xl font-extrabold tracking-tight">Forgot password?</h1>
            <p className="mt-2 text-sm text-[#8a8272]">
              No problem. Enter the email you signed up with.
            </p>

            {error && (
              <div
                role="alert"
                className="mt-6 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
              <div>
                <label htmlFor="fp-email" className={labelCls}>
                  Email address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a8272]" />
                  <input
                    id="fp-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={inputCls}
                    required
                  />
                </div>
              </div>

              <button type="submit" disabled={loading || cooldown > 0} className={primaryBtn}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                  </>
                ) : cooldown > 0 ? (
                  `Try again in ${cooldown}s`
                ) : (
                  'Send reset link'
                )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 text-center">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex items-center gap-2 py-2 text-sm font-medium text-[#0b1f3d] transition hover:opacity-70"
        >
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </button>
      </div>
    </AuthShell>
  );
};

export default ForgotPassword;