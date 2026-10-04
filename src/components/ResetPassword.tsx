import { useState, useEffect, useRef, FormEvent } from 'react';
import { Lock, AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { AuthShell } from './AuthLayout';
import { useSafeNavigate } from '../lib/navigation';

const INVALID_MSG = 'This reset link is invalid or has expired. Please request a new one.';

// Supabase client page load par hi URL (#access_token / ?code) process karke clean kar deta hai,
// aur App.tsx tab tak spinner dikhata hai. Isliye URL ka snapshot module load par hi le lete hain
// (ResetPassword App.tsx mein static import hai, to ye Supabase ke async init se pehle chalta hai).
const INITIAL_URL = {
  search: new URLSearchParams(typeof window !== 'undefined' ? window.location.search : ''),
  hash: new URLSearchParams(typeof window !== 'undefined' ? window.location.hash.replace(/^#/, '') : ''),
};

const labelCls = 'mb-2 block text-xs font-medium text-[#5b5546]';
const inputCls =
  'h-12 w-full rounded-2xl border bg-white pl-11 pr-12 text-base text-[#0b1f3d] placeholder:text-[#b3ab98] outline-none transition focus:ring-4 sm:text-sm';
const inputOk = 'border-[#e4ddc9] focus:border-[#0b1f3d] focus:ring-[#0b1f3d]/10';
const inputBad = 'border-red-400 focus:border-red-500 focus:ring-red-500/15';
const primaryBtn =
  'flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#0b1f3d] text-sm font-semibold text-[#f4f1ea] transition hover:bg-[#12305c] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0b1f3d]/25 disabled:cursor-not-allowed disabled:opacity-60';

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
const STRENGTH_COLORS = ['', '#dc2626', '#ea580c', '#e8b74a', '#2b6cb0', '#2f8f5b'];

export const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [isRecoveryTokenValid, setIsRecoveryTokenValid] = useState<boolean | null>(null);
  const validRef = useRef(false);
  const redirectTimer = useRef<number | null>(null);
  const navigate = useSafeNavigate();
  const reduce = useReducedMotion();

  useEffect(() => () => {
    if (redirectTimer.current !== null) window.clearTimeout(redirectTimer.current);
  }, []);

  useEffect(() => {
    let active = true;
    const { search, hash } = INITIAL_URL;

    const markValid = () => {
      if (!active) return;
      validRef.current = true;
      setIsRecoveryTokenValid(true);
      setError('');
    };

    const markInvalid = (msg: string) => {
      if (!active || validRef.current) return;
      setIsRecoveryTokenValid(false);
      setError(msg);
    };

    // Expired / already used link: Supabase error params bhejta hai (hash ya query mein)
    if (hash.get('error_description') || search.get('error_description')) {
      markInvalid(INVALID_MSG);
      return () => {
        active = false;
      };
    }

    // Recovery link ke 3 formats: #access_token&type=recovery (implicit), ?code= (PKCE), ?access_token (custom template)
    const looksLikeRecovery =
      hash.get('type') === 'recovery' || search.get('type') === 'recovery' ||
      hash.has('access_token') || search.has('access_token') || search.has('code');

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session?.user) markValid();
    });

    const run = async () => {
      try {
        let { data } = await supabase.auth.getSession();

        if (!data.session) {
          const at = hash.get('access_token') ?? search.get('access_token');
          const rt = hash.get('refresh_token') ?? search.get('refresh_token');
          if (at && rt) {
            const { error: sessionError } = await supabase.auth.setSession({ access_token: at, refresh_token: rt });
            if (sessionError) {
              markInvalid(INVALID_MSG);
              return;
            }
            data = (await supabase.auth.getSession()).data;
          }
        }

        if (data.session?.user && looksLikeRecovery) markValid();
      } catch {
        markInvalid(INVALID_MSG);
      }
    };
    void run();

    // Agar kuch der mein recovery session nahi bana to link invalid maano
    const timer = setTimeout(() => markInvalid(INVALID_MSG), 5000);

    return () => {
      active = false;
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  const getStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getStrength(password);
  const mismatch = !!confirmPassword && password !== confirmPassword;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isRecoveryTokenValid) {
      setError(INVALID_MSG);
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { data, error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      const msg = updateError.message.toLowerCase();
      if (msg.includes('same') && msg.includes('password')) {
        setError('New password must be different from your old one.');
      } else if (msg.includes('expired') || msg.includes('invalid') || msg.includes('session')) {
        setIsRecoveryTokenValid(false);
        setError(INVALID_MSG);
      } else {
        setError(updateError.message);
      }
      setLoading(false);
      return;
    }

    // Purane sessions revoke karo, warna signIn() "already logged in on another device" bolke block kar dega
    const userId = data.user?.id;
    if (userId) {
      try {
        await supabase
          .from('sessions')
          .update({ revoked_at: new Date().toISOString() })
          .eq('user_id', userId)
          .is('revoked_at', null);
      } catch (err) {
        console.warn('[ResetPassword] session revoke warning:', err);
      }
    }

    setDone(true);
    await supabase.auth.signOut({ scope: 'global' });
    setLoading(false);
    redirectTimer.current = window.setTimeout(() => navigate('/login', { replace: true }), 2500);
  };

  const view = {
    initial: { opacity: 0, y: reduce ? 0 : 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0 },
    transition: { duration: 0.25 },
  };

  const pill =
    isRecoveryTokenValid === true
      ? { text: 'Link verified', cls: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-600' }
      : isRecoveryTokenValid === false
        ? { text: 'Link not valid', cls: 'bg-red-100 text-red-800', dot: 'bg-red-600' }
        : { text: 'Verifying link...', cls: 'bg-[#e8b74a]/20 text-[#7a5a10]', dot: 'bg-[#e8b74a] animate-pulse' };

  return (
    <AuthShell
      headline="Set a new password"
      accent="and stay secure."
      description="Choose something strong and unique. We'll sign you out everywhere so only the new password works."
    >
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div key="done" {...view}>
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Password updated.</h1>
            <p className="mt-2 text-sm leading-6 text-[#8a8272]">
              Your vault is secured with the new password. Taking you to sign in...
            </p>
            <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-[#e4ddc9]">
              <motion.div
                className="h-full rounded-full bg-[#0b1f3d]"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: reduce ? 0 : 2.5, ease: 'linear' }}
              />
            </div>
            <button
              type="button"
              onClick={() => navigate('/login', { replace: true })}
              className="mt-6 text-sm font-medium text-[#0b1f3d] underline-offset-4 hover:underline"
            >
              Go to sign in now
            </button>
          </motion.div>
        ) : isRecoveryTokenValid === false ? (
          <motion.div key="invalid" {...view}>
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${pill.cls}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${pill.dot}`} />
              {pill.text}
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight">Link expired.</h1>
            <p className="mt-2 text-sm leading-6 text-[#8a8272]">{error || INVALID_MSG}</p>
            <button type="button" onClick={() => navigate('/forgot-password')} className={`${primaryBtn} mt-6`}>
              Request a new link
            </button>
          </motion.div>
        ) : (
          <motion.div key="form" {...view}>
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${pill.cls}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${pill.dot}`} />
              {pill.text}
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight">New password.</h1>
            <p className="mt-2 text-sm text-[#8a8272]">Use at least 8 characters.</p>

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
                <label htmlFor="rp-password" className={labelCls}>
                  New password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a8272]" />
                  <input
                    id="rp-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`${inputCls} ${inputOk}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-[#8a8272] transition hover:text-[#0b1f3d]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {password && (
                  <div className="mt-3" aria-live="polite">
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className="h-1.5 flex-1 rounded-full transition-colors duration-300"
                          style={{ backgroundColor: i <= strength ? STRENGTH_COLORS[strength] : '#e4ddc9' }}
                        />
                      ))}
                    </div>
                    <p className="mt-1.5 text-xs font-medium" style={{ color: STRENGTH_COLORS[strength] || '#8a8272' }}>
                      {STRENGTH_LABELS[strength] || 'Too short'}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="rp-confirm" className={labelCls}>
                  Confirm password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a8272]" />
                  <input
                    id="rp-confirm"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    aria-invalid={mismatch}
                    className={`${inputCls} ${mismatch ? inputBad : inputOk}`}
                    required
                  />
                </div>
                {mismatch && <p className="mt-1.5 text-xs font-medium text-red-600">Passwords don't match.</p>}
                {!mismatch && confirmPassword && password.length >= 8 && (
                  <p className="mt-1.5 text-xs font-medium text-emerald-700">Passwords match.</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || isRecoveryTokenValid !== true || mismatch}
                className={primaryBtn}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Securing...
                  </>
                ) : (
                  'Update password'
                )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {!done && (
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => navigate('/login', { replace: true })}
            className="inline-flex items-center gap-2 py-2 text-sm font-medium text-[#0b1f3d] transition hover:opacity-70"
          >
            <ArrowLeft className="h-4 w-4" /> Back to sign in
          </button>
        </div>
      )}
    </AuthShell>
  );
};