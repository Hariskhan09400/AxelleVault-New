import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, CheckCircle2, Mail, RefreshCw, ShieldAlert } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';
import { useSafeNavigate } from '../lib/navigation';

const RESEND_COOLDOWN_SECONDS = 60;
const OTP_LENGTH = 6;

export const VerifyEmail = () => {
  const navigate = useSafeNavigate();
  const { resendVerificationEmail } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    const storedEmail = localStorage.getItem('axellevault.pending_verification_email') || '';
    const urlEmail = new URLSearchParams(window.location.search).get('email');
    setEmail(storedEmail || urlEmail || '');
  }, []);

  // Resend cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Safety net: kisi aur wajah se (jaise dusre tab se) session ban jaye to bhi redirect ho jaye
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
        localStorage.removeItem('axellevault.pending_verification_email');
        navigate('/home', { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const focusInput = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  const handleDigitChange = (index: number, rawValue: string) => {
    const digit = rawValue.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (error) setError('');

    if (digit && index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      focusInput(index - 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    const next = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((char, i) => { next[i] = char; });
    setOtp(next);
    focusInput(Math.min(pasted.length, OTP_LENGTH - 1));
  };

  const handleVerify = async () => {
    const code = otp.join('');
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError('Please enter the email address used while signing up.');
      return;
    }
    if (code.length !== OTP_LENGTH) {
      setError('Enter the complete 6-digit code.');
      return;
    }

    setVerifying(true);
    setError('');
    setMessage('');

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: trimmedEmail,
      token: code,
      type: 'signup',
    });

    if (verifyError) {
      const friendly = /expired/i.test(verifyError.message)
        ? 'This code has expired. Request a new one below.'
        : /invalid|not found/i.test(verifyError.message)
          ? 'Incorrect code. Please check and try again.'
          : verifyError.message || 'Verification failed.';
      setError(friendly);
      showToast('error', friendly);
      setOtp(Array(OTP_LENGTH).fill(''));
      focusInput(0);
      setVerifying(false);
      return;
    }

    localStorage.removeItem('axellevault.pending_verification_email');
    showToast('success', 'Email verified successfully.');
    navigate('/home', { replace: true });
  };

  const handleResend = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter the email address used while signing up.');
      return;
    }

    setResending(true);
    setError('');
    setMessage('');

    const { error: resendError } = await resendVerificationEmail(trimmedEmail);

    if (resendError) {
      const message = resendError.message || 'The verification code could not be sent.';
      setError(message);
      showToast('error', message);
    } else {
      setMessage('A fresh verification code has been sent.');
      showToast('success', 'Verification code sent.');
      localStorage.setItem('axellevault.pending_verification_email', trimmedEmail);
      setOtp(Array(OTP_LENGTH).fill(''));
      focusInput(0);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    }

    setResending(false);
  };

  return (
    <div className="min-h-screen bg-[#f4f1ea] px-4 py-10 text-[#0b1f3d]">
      <div className="mx-auto max-w-xl">
        <div className="rounded-[2rem] border border-[#e4ddc9] bg-white/70 p-6 shadow-sm backdrop-blur-sm sm:p-8">
          <div className="mb-8 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 text-sm font-medium text-[#0b1f3d] transition hover:text-[#b7972f]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </button>
          </div>

          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e8b74a]/15 text-[#e8b74a]">
            <Mail className="h-8 w-8" />
          </div>

          <div className="space-y-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a8272]">Email verification</p>
            <h1 className="text-3xl font-black tracking-[-0.05em] text-[#0b1f3d]">Enter your code</h1>
            <p className="text-sm leading-6 text-[#5d5648]">
              Your account is ready, but login is blocked until your email is verified.
              {email && (
                <>
                  {' '}We sent a 6-digit code to <span className="font-semibold text-[#1c2333]">{email}</span>.
                </>
              )}
            </p>
          </div>

          <div className="mt-8 space-y-4">
            {!email && (
              <>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a8272]">
                  Email address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-2xl border border-[#e4ddc9] bg-white px-4 py-3 text-sm text-[#1c2333] placeholder-[#a39c8c] outline-none transition focus:border-[#0b1f3d]/40 focus:ring-2 focus:ring-[#0b1f3d]/10"
                  />
                </div>
              </>
            )}

            <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a8272]">
              Verification code
            </label>
            <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="h-14 w-11 rounded-2xl border border-[#e4ddc9] bg-white text-center text-xl font-bold text-[#1c2333] outline-none transition focus:border-[#0b1f3d]/40 focus:ring-2 focus:ring-[#0b1f3d]/10 sm:h-16 sm:w-12"
                />
              ))}
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-2xl border border-[#c0503e]/25 bg-[#c0503e]/10 p-3 text-xs text-[#a1402f]">
                <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="flex items-start gap-2 rounded-2xl border border-[#3f7d58]/25 bg-[#3f7d58]/10 p-3 text-xs text-[#366f49]">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{message}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleVerify}
              disabled={verifying || otp.some((d) => !d)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0b1f3d] px-5 py-3 text-sm font-semibold text-[#f4f1ea] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {verifying ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Verify code
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={resending || cooldown > 0}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#0b1f3d]/15 px-5 py-3 text-sm font-semibold text-[#0b1f3d] transition hover:bg-[#0b1f3d]/5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {resending ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : cooldown > 0 ? (
                <>
                  <Mail className="h-4 w-4" />
                  Resend in {cooldown}s
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  Resend code
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};