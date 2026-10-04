import { useState, useEffect, useRef } from 'react';
import {
  Shield, Mail, Lock, Eye, EyeOff, AlertCircle,
  ArrowRight, Fingerprint, Check, Phone, KeyRound
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../contexts/ToastContext';
import { hasSupabaseEnv, supabase } from '../lib/supabase';
import { getSavedAccounts, forgetAccount, SavedAccount } from '../lib/savedAccounts';
import OtpEmailAnimation from "../components/OtpEmailAnimation";
import { markSession, PERSIST_KEY, EXPIRED_KEY } from '../lib/sessionPolicy';
import { useSafeNavigate } from '../lib/navigation';
// ─── Types ────────────────────────────────────────────────
type Mode = 'login' | 'signup';
type AuthMethod = 'email' | 'phone';

interface LoginProps {
  onToggleMode: () => void;
  onForgotPassword: () => void;
}

// ─── Password strength ─────────────────────────────────────
const getStrength = (p: string) => {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
};
const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColor = ['', '#c0503e', '#c98a2c', '#b7972f', '#3f7d58'];

// ─── Google Sign-In ─────────────────────────────────────────
const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
  </svg>
);

const GoogleSignInButton = ({ label }: { label: string }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    markSession(true);
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      showToast('error', error.message || 'Google sign-in failed.');
      setLoading(false);
    }
    // Success par Google page pe redirect ho jayega, isliye setLoading(false) yahan nahi karna
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={loading}
      className="w-full py-3.5 rounded-full font-semibold text-[#1c2333] text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:bg-[#f4f1ea] active:scale-[0.98] duration-150 bg-white border border-[#e4ddc9]"
    >
      {loading ? (
        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <GoogleIcon />
      )}
      {label}
    </button>
  );
};

const OrDivider = () => (
  <div className="flex items-center gap-3 py-1">
    <div className="h-px flex-1 bg-[#e4ddc9]" />
    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#a39c8c]">or</span>
    <div className="h-px flex-1 bg-[#e4ddc9]" />
  </div>
);

// ─── Saved accounts ("Continue as X") ────────────────────────
const initials = (username: string | null, email: string) => {
  const source = username?.trim() || email;
  return source.slice(0, 1).toUpperCase();
};

const AccountCards = ({
  accounts,
  onSelect,
  onRemove,
  onUseAnother,
}: {
  accounts: SavedAccount[];
  onSelect: (account: SavedAccount) => void;
  onRemove: (email: string) => void;
  onUseAnother: () => void;
}) => (
  <div className="space-y-2.5">
    {accounts.map((account) => (
      <div
        key={account.email}
        className="flex items-center gap-3 rounded-2xl border border-[#e4ddc9] bg-white px-4 py-3 transition hover:border-[#0b1f3d]/30"
      >
        <button
          type="button"
          onClick={() => onSelect(account)}
          className="flex flex-1 items-center gap-3 text-left"
        >
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#0b1f3d] text-sm font-bold text-[#f4f1ea]">
            {initials(account.username, account.email)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#1c2333]">
              {account.username || account.email}
            </p>
            <p className="truncate text-xs text-[#8a8272]">{account.email}</p>
          </div>
        </button>
        <button
          type="button"
          onClick={() => onRemove(account.email)}
          aria-label="Remove saved account"
          className="flex-shrink-0 rounded-full p-1.5 text-[#a39c8c] transition hover:bg-[#c0503e]/10 hover:text-[#c0503e]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    ))}

    <button
      type="button"
      onClick={onUseAnother}
      className="w-full rounded-2xl border border-dashed border-[#c9c2ae] px-4 py-3 text-center text-sm font-medium text-[#5d5648] transition hover:border-[#0b1f3d]/30 hover:text-[#0b1f3d]"
    >
      Use another account
    </button>
  </div>
);

// ═══════════════════════════════════════════════════════════
// PHONE OTP FORM  (login + signup dono ke liye ek hi flow)
// ═══════════════════════════════════════════════════════════
const RESEND_SECONDS = 30;
const OTP_LENGTH = 6;

const PhoneOtpForm = () => {
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const { showToast } = useToast();
  const navigate = useSafeNavigate();
  const otpInputRef = useRef<HTMLInputElement>(null);

  // Resend countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // E.164 format: +919876543210
  const fullPhone = `${countryCode}${phone.replace(/\D/g, '')}`;
  const isValidPhone = /^\+[1-9]\d{9,14}$/.test(fullPhone);

  const sendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!hasSupabaseEnv) { setError('Service not configured.'); return; }
    if (!isValidPhone) { setError('Please enter a valid mobile number.'); return; }

    setError('');
    setLoading(true);

    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone: fullPhone,
      // naya user ho to account khud ban jayega (signup + login same flow)
      options: { shouldCreateUser: true },
    });

    setLoading(false);

    if (otpError) {
      setError(otpError.message || 'Could not send OTP. Please try again.');
      showToast('error', 'OTP could not be sent.');
      return;
    }

    setStep('otp');
    setOtp('');
    setCooldown(RESEND_SECONDS);
    showToast('success', `OTP sent to ${fullPhone}`);
    setTimeout(() => otpInputRef.current?.focus(), 50);
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== OTP_LENGTH) { setError(`Enter the ${OTP_LENGTH}-digit OTP.`); return; }

    setError('');
    setLoading(true);

    const { error: verifyError } = await supabase.auth.verifyOtp({
      phone: fullPhone,
      token: otp,
      type: 'sms',
    });

    setLoading(false);

    if (verifyError) {
      setError('Wrong or expired OTP. Please try again.');
      showToast('error', 'OTP verification failed.');
      return;
    }

    // Session Supabase automatically localStorage me save kar deta hai —
    // logout tak user logged in rahega. Auth state change se app khud redirect karega.
    markSession(true);
    showToast('success', 'Welcome to AxelleVault!');
    navigate('/home', { replace: true });
  };

  const backToPhone = () => {
    setStep('phone');
    setOtp('');
    setError('');
  };

  if (step === 'otp') {
    return (
      <form onSubmit={verifyOtp} className="space-y-4 sm:space-y-5">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#c0503e]/10 border border-[#c0503e]/25 text-[#a1402f] text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        <div className="flex items-center gap-3 rounded-2xl border border-[#e4ddc9] bg-[#f4f1ea] px-4 py-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#0b1f3d] text-[#f4f1ea]">
            <Phone className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-[#8a8272]">OTP sent to</p>
            <p className="truncate text-sm font-semibold text-[#1c2333]">{fullPhone}</p>
          </div>
          <button
            type="button"
            onClick={backToPhone}
            className="flex-shrink-0 text-xs font-medium text-[#0b1f3d] hover:text-[#b7972f] transition-colors"
          >
            Change
          </button>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#8a8272] tracking-wide">Enter OTP</label>
          <div className="relative group">
            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a39c8c] group-focus-within:text-[#0b1f3d] transition-colors" />
            <input
              ref={otpInputRef}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={OTP_LENGTH}
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="••••••"
              className="w-full bg-white border border-[#e4ddc9] rounded-2xl pl-11 pr-4 py-3 text-[#1c2333] text-sm tracking-[0.5em] placeholder-[#a39c8c] focus:outline-none focus:border-[#0b1f3d]/40 focus:ring-2 focus:ring-[#0b1f3d]/10 transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || otp.length !== OTP_LENGTH}
          className="w-full py-3.5 rounded-full font-semibold text-[#f4f1ea] text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:opacity-90 active:scale-[0.98] duration-150 bg-[#0b1f3d]"
        >
          {loading ? (
            <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Verifying...</>
          ) : (
            <><Fingerprint className="w-4 h-4" /> Verify &amp; sign in <ArrowRight className="w-4 h-4" /></>
          )}
        </button>

        <div className="text-center text-xs text-[#8a8272]">
          {cooldown > 0 ? (
            <span>Resend OTP in {cooldown}s</span>
          ) : (
            <button
              type="button"
              onClick={() => sendOtp()}
              disabled={loading}
              className="text-[#0b1f3d] font-semibold hover:text-[#b7972f] transition-colors disabled:opacity-50"
            >
              Resend OTP
            </button>
          )}
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={sendOtp} className="space-y-4 sm:space-y-5">
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#c0503e]/10 border border-[#c0503e]/25 text-[#a1402f] text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-[#8a8272] tracking-wide">Mobile number</label>
        <div className="flex gap-2">
          <input
            type="text"
            inputMode="tel"
            value={countryCode}
            onChange={e => setCountryCode('+' + e.target.value.replace(/\D/g, '').slice(0, 3))}
            aria-label="Country code"
            className="w-20 bg-white border border-[#e4ddc9] rounded-2xl px-3 py-3 text-center text-[#1c2333] text-sm focus:outline-none focus:border-[#0b1f3d]/40 focus:ring-2 focus:ring-[#0b1f3d]/10 transition-all"
          />
          <div className="relative group flex-1">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a39c8c] group-focus-within:text-[#0b1f3d] transition-colors" />
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 12))}
              placeholder="98765 43210"
              required
              className="w-full bg-white border border-[#e4ddc9] rounded-2xl pl-11 pr-4 py-3 text-[#1c2333] text-sm placeholder-[#a39c8c] focus:outline-none focus:border-[#0b1f3d]/40 focus:ring-2 focus:ring-[#0b1f3d]/10 transition-all"
            />
          </div>
        </div>
        <p className="text-[11px] text-[#a39c8c]">We'll text you a one-time code. New here? An account is created automatically.</p>
      </div>

      <button
        type="submit"
        disabled={loading || !isValidPhone}
        className="w-full py-3.5 rounded-full font-semibold text-[#f4f1ea] text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:opacity-90 active:scale-[0.98] duration-150 bg-[#0b1f3d]"
      >
        {loading ? (
          <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Sending OTP...</>
        ) : (
          <>Send OTP <ArrowRight className="w-4 h-4" /></>
        )}
      </button>

      <OrDivider />
      <GoogleSignInButton label="Continue with Google" />
    </form>
  );
};

// ═══════════════════════════════════════════════════════════
// LOGIN FORM
// ═══════════════════════════════════════════════════════════
const LoginForm = ({ onForgotPassword, onSwitchToSignup }: {
  onForgotPassword: () => void;
  onSwitchToSignup: () => void;
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { showToast } = useToast();
  const navigate = useSafeNavigate();

  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<SavedAccount | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSavedAccounts(getSavedAccounts());
  }, []);

  // 8 ghante baad auto logout hua ho to user ko batao
  useEffect(() => {
    try {
      if (localStorage.getItem(EXPIRED_KEY) === '1') {
        localStorage.removeItem(EXPIRED_KEY);
        showToast('warning', 'Your session expired after 8 hours. Please sign in again.');
      }
    } catch { /* ignore */ }
  }, []);

  const handleSelectAccount = (account: SavedAccount) => {
    setSelectedAccount(account);
    setEmail(account.email);
    setShowManualForm(true);
    setError('');
    // Thoda delay taaki form pehle render ho jaye, phir focus jaaye
    setTimeout(() => passwordInputRef.current?.focus(), 50);
  };

  const handleRemoveAccount = (accountEmail: string) => {
    forgetAccount(accountEmail);
    setSavedAccounts(getSavedAccounts());
  };

  const handleSwitchAccount = () => {
    setSelectedAccount(null);
    setEmail('');
    setPassword('');
    setShowManualForm(savedAccounts.length === 0);
  };

  useEffect(() => {
    const saved = localStorage.getItem('av_remembered_email');
    if (saved) { setEmail(saved); setRememberMe(true); }
    else if (localStorage.getItem(PERSIST_KEY) === '1') setRememberMe(true);
  }, []);

  // Verification link se wapas aane par: expired link handle + verified message
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));

    if (hashParams.get('error')) {
      showToast('error', 'Verification link is invalid or has expired. Please request a new one.');
      navigate('/verify-email', { replace: true });
      return;
    }

    if (params.get('verified') === 'true') {
      showToast('success', 'Email verified! Please sign in.');
    }
  }, []);

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasSupabaseEnv) { setError('Service not configured.'); return; }

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setError('');
    setLoading(true);

    if (rememberMe) localStorage.setItem('av_remembered_email', trimmedEmail);
    else localStorage.removeItem('av_remembered_email');

    const { error: authError } = await signIn(trimmedEmail, trimmedPassword);

    if (authError) {
      const message = authError.message ?? 'Login failed.';

      if (message.toLowerCase().includes('verify your email')) {
        setError(message);
        showToast('warning', message);
        localStorage.setItem('axellevault.pending_verification_email', trimmedEmail);
        navigate(`/verify-email?email=${encodeURIComponent(trimmedEmail)}`, { replace: true });
      } else {
        setError('Wrong email or password. Please try again.');
        showToast('error', 'Login failed. Check your credentials.');
      }
    } else {
      markSession(rememberMe);
      showToast('success', 'Welcome back to AxelleVault!');
    }
    setLoading(false);
  };

  if (savedAccounts.length > 0 && !showManualForm) {
    return (
      <div className="space-y-4 sm:space-y-5">
        <AccountCards
          accounts={savedAccounts}
          onSelect={handleSelectAccount}
          onRemove={handleRemoveAccount}
          onUseAnother={() => setShowManualForm(true)}
        />

        <OrDivider />
        <GoogleSignInButton label="Continue with Google" />

        <p className="text-center text-xs text-[#8a8272]">
          Don't have an account?{' '}
          <button type="button" onClick={onSwitchToSignup} className="text-[#0b1f3d] font-semibold hover:text-[#b7972f] transition-colors">
            Create one
          </button>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#c0503e]/10 border border-[#c0503e]/25 text-[#a1402f] text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {selectedAccount ? (
        <div className="flex items-center gap-3 rounded-2xl border border-[#e4ddc9] bg-[#f4f1ea] px-4 py-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#0b1f3d] text-sm font-bold text-[#f4f1ea]">
            {initials(selectedAccount.username, selectedAccount.email)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#1c2333]">
              {selectedAccount.username || selectedAccount.email}
            </p>
            <p className="truncate text-xs text-[#8a8272]">{selectedAccount.email}</p>
          </div>
          <button
            type="button"
            onClick={handleSwitchAccount}
            className="flex-shrink-0 text-xs font-medium text-[#0b1f3d] hover:text-[#b7972f] transition-colors"
          >
            Not you?
          </button>
        </div>
      ) : (
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#8a8272] tracking-wide">Email address</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a39c8c] group-focus-within:text-[#0b1f3d] transition-colors" />
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="your@email.com"
              autoComplete="username"
              className="w-full bg-white border border-[#e4ddc9] rounded-2xl pl-11 pr-10 py-3 text-[#1c2333] text-sm placeholder-[#a39c8c] focus:outline-none focus:border-[#0b1f3d]/40 focus:ring-2 focus:ring-[#0b1f3d]/10 transition-all"
            />
            {email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && (
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#3f7d58]/15 flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-[#3f7d58]" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Password */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-[#8a8272] tracking-wide">Password</label>
        <div className="relative group">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a39c8c] group-focus-within:text-[#0b1f3d] transition-colors" />
          <input
            ref={passwordInputRef}
            type={showPass ? 'text' : 'password'} value={password}
            onChange={e => setPassword(e.target.value)} required
            placeholder="Enter your password"
            autoComplete="current-password"
            className="w-full bg-white border border-[#e4ddc9] rounded-2xl pl-11 pr-11 py-3 text-[#1c2333] text-sm placeholder-[#a39c8c] focus:outline-none focus:border-[#0b1f3d]/40 focus:ring-2 focus:ring-[#0b1f3d]/10 transition-all"
          />
          <button type="button" onClick={() => setShowPass(!showPass)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#a39c8c] hover:text-[#0b1f3d] transition-colors">
            {showPass ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Remember me + Forgot */}
      <div className="flex items-center justify-between pt-1">
        <label className="flex items-center gap-2 cursor-pointer select-none group">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={rememberMe}
            onChange={e => setRememberMe(e.target.checked)}
          />
          <div
            className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-[#0b1f3d]/30 ${rememberMe ? 'bg-[#0b1f3d] border-[#0b1f3d]' : 'border-[#c9c2ae] group-hover:border-[#0b1f3d]/50'}`}>
            {rememberMe && <svg className="w-2.5 h-2.5 text-[#f4f1ea]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
          </div>
          <span className="text-xs text-[#5d5648] group-hover:text-[#1c2333] transition-colors">Remember me</span>
        </label>
        <button type="button" onClick={onForgotPassword}
          className="text-xs font-medium text-[#0b1f3d] hover:text-[#b7972f] transition-colors">
          Forgot password?
        </button>
      </div>

      {/* Submit */}
      <button type="submit" disabled={loading}
        className="w-full py-3.5 rounded-full font-semibold text-[#f4f1ea] text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:opacity-90 active:scale-[0.98] duration-150 bg-[#0b1f3d]">
        {loading ? (
          <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Signing in...</>
        ) : (
          <><Fingerprint className="w-4 h-4" /> Sign in <ArrowRight className="w-4 h-4" /></>
        )}
      </button>

      {savedAccounts.length > 0 && (
        <button
          type="button"
          onClick={() => { setShowManualForm(false); setSelectedAccount(null); }}
          className="w-full text-center text-xs font-medium text-[#8a8272] hover:text-[#0b1f3d] transition-colors"
        >
          ← Back to saved accounts
        </button>
      )}

      <OrDivider />
      <GoogleSignInButton label="Continue with Google" />

      <p className="text-center text-xs text-[#8a8272]">
        Don't have an account?{' '}
        <button type="button" onClick={onSwitchToSignup} className="text-[#0b1f3d] font-semibold hover:text-[#b7972f] transition-colors">
          Create one
        </button>
      </p>
    </form>
  );
};

// ═══════════════════════════════════════════════════════════
// SIGNUP FORM
// ═══════════════════════════════════════════════════════════
const SignupForm = ({ onSwitchToLogin }: { onSwitchToLogin: () => void }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();
  const { showToast } = useToast();
  const navigate = useSafeNavigate();
  const redirectTimer = useRef<number | null>(null);
  const strength = getStrength(password);

  useEffect(() => () => {
    if (redirectTimer.current !== null) window.clearTimeout(redirectTimer.current);
  }, []);

  // ── Email OTP (signup verification) ──
  // UI (boxes, timer, animation) OtpEmailAnimation component sambhalta hai.
  // Neeche ke dono functions tumhara purana Supabase logic hi hain:
  // true = OTP sahi, false = galat / fail.
  const verifySignupOtp = async (code: string): Promise<boolean> => {
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code,
      type: 'signup',
    });

    if (verifyError) {
      showToast('error', 'Wrong or expired code. Please try again.');
      return false;
    }

    markSession(true);
    showToast('success', 'Email verified! Welcome to AxelleVault.');
    // Thoda delay taaki green tick animation dikh sake
    redirectTimer.current = window.setTimeout(() => navigate('/home', { replace: true }), 900);
    return true;
  };

  const resendCode = async (): Promise<boolean> => {
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
    });
    if (resendError) {
      showToast('error', resendError.message || 'Could not resend the code.');
      return false;
    }
    showToast('success', 'A new code has been sent.');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasSupabaseEnv) { setError('Service not configured.'); return; }

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();

    if (!trimmedUsername || !trimmedEmail || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }

    setError('');
    setLoading(true);

    const { error: authError } = await signUp(trimmedEmail, password, trimmedUsername);

    if (authError) {
      setError(authError.message ?? 'Something went wrong. Please try again.');
      showToast('error', 'Account creation failed.');
    } else {
      setSuccess(true);
      showToast('success', 'Account created! Enter the code we emailed you.');
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="py-2 space-y-4">
        <OtpEmailAnimation
          email={email.trim()}
          length={6}
          onVerify={verifySignupOtp}
          onResend={resendCode}
        />
        <div className="text-center text-xs text-[#8a8272]">
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-medium hover:text-[#0b1f3d] transition-colors"
          >
            ← Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#c0503e]/10 border border-[#c0503e]/25 text-[#a1402f] text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Username */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-[#8a8272] tracking-wide">Username</label>
        <div className="relative group">
          <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a39c8c] group-focus-within:text-[#0b1f3d] transition-colors" />
          <input
            type="text" value={username} onChange={e => setUsername(e.target.value)} required
            placeholder="Choose a username"
            className="w-full bg-white border border-[#e4ddc9] rounded-2xl pl-11 pr-4 py-3 text-[#1c2333] text-sm placeholder-[#a39c8c] focus:outline-none focus:border-[#0b1f3d]/40 focus:ring-2 focus:ring-[#0b1f3d]/10 transition-all"
          />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-[#8a8272] tracking-wide">Email address</label>
        <div className="relative group">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a39c8c] group-focus-within:text-[#0b1f3d] transition-colors" />
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)} required
            placeholder="your@email.com"
            className="w-full bg-white border border-[#e4ddc9] rounded-2xl pl-11 pr-4 py-3 text-[#1c2333] text-sm placeholder-[#a39c8c] focus:outline-none focus:border-[#0b1f3d]/40 focus:ring-2 focus:ring-[#0b1f3d]/10 transition-all"
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-[#8a8272] tracking-wide">Password</label>
        <div className="relative group">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a39c8c] group-focus-within:text-[#0b1f3d] transition-colors" />
          <input
            type={showPass ? 'text' : 'password'} value={password}
            onChange={e => setPassword(e.target.value)} required
            placeholder="Min. 8 characters"
            className="w-full bg-white border border-[#e4ddc9] rounded-2xl pl-11 pr-11 py-3 text-[#1c2333] text-sm placeholder-[#a39c8c] focus:outline-none focus:border-[#0b1f3d]/40 focus:ring-2 focus:ring-[#0b1f3d]/10 transition-all"
          />
          <button type="button" onClick={() => setShowPass(!showPass)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#a39c8c] hover:text-[#0b1f3d] transition-colors">
            {showPass ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>
        {/* Strength bar */}
        {password && (
          <div className="space-y-1">
            <div className="flex gap-1">
              {[0,1,2,3].map(i => (
                <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                  style={{ backgroundColor: i < strength ? strengthColor[strength] : '#e4ddc9' }} />
              ))}
            </div>
            <p className="text-[10px] font-semibold transition-colors duration-300" style={{ color: strengthColor[strength] || '#a39c8c' }}>
              {strength > 0 ? `${strengthLabel[strength]} password` : 'Too weak'}
            </p>
          </div>
        )}
      </div>

      {/* Submit */}
      <button type="submit" disabled={loading}
        className="w-full py-3.5 rounded-full font-semibold text-[#f4f1ea] text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:opacity-90 active:scale-[0.98] duration-150 bg-[#0b1f3d]">
        {loading ? (
          <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Creating account...</>
        ) : (
          <><Shield className="w-4 h-4" /> Create account <ArrowRight className="w-4 h-4" /></>
        )}
      </button>

      <OrDivider />
      <GoogleSignInButton label="Sign up with Google" />

      <p className="text-center text-xs text-[#8a8272]">
        Already have an account?{' '}
        <button type="button" onClick={onSwitchToLogin} className="text-[#0b1f3d] font-semibold hover:text-[#b7972f] transition-colors">
          Sign in
        </button>
      </p>
    </form>
  );
};

// ═══════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════
export const Login = ({ onForgotPassword, onToggleMode: _onToggleMode }: LoginProps) => {
  const [mode, setMode] = useState<Mode>('login');
  const [method, setMethod] = useState<AuthMethod>('email');

  return (
    <>
      <style>{`
        @keyframes authFadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes softGlow {
          0%, 100% {
            transform: scale(1);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.04);
            opacity: 1;
          }
        }

        @media (max-width: 1023px) {
          .auth-shell {
            min-height: 100vh;
            min-height: 100dvh;
          }

          .auth-panel {
            padding-top: 0.5rem;
          }
        }
      `}</style>

      <div className="auth-shell min-h-screen w-full bg-[#f4f1ea] lg:grid lg:grid-cols-2" style={{ animation: 'authFadeIn 0.5s ease-out both' }}>

      {/* ── LEFT: Brand panel — full height, no border, hidden on small phones ── */}
      <div className="hidden lg:flex flex-col justify-between p-12 xl:p-16 relative overflow-hidden bg-[#0b1f3d]">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full border border-[#e8b74a]/10" style={{ animation: 'softGlow 14s ease-in-out infinite' }} />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full border border-[#e8b74a]/10" style={{ animation: 'softGlow 18s ease-in-out infinite reverse' }} />

        <div className="flex items-center gap-2 relative z-10">
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
            <Shield className="w-4 h-4 text-[#e8b74a]" />
          </div>
          <span className="text-base font-bold text-[#f4f1ea] tracking-tight">AxelleVault</span>
        </div>

        <div className="relative z-10 max-w-sm">
          <h2 className="text-4xl xl:text-5xl font-bold text-[#f4f1ea] leading-tight mb-4">
            Guard the way<br />you <span className="text-[#e8b74a]">stay secure.</span>
          </h2>
          <p className="text-[#c9c2ae] text-sm leading-relaxed">
            Passwords, breach checks and phishing defense — all in one encrypted vault built for how you actually work.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <div className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
            <span className="text-[10px] font-mono text-[#c9c2ae]">AES-256</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <div className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
            <span className="text-[10px] font-mono text-[#c9c2ae]">TLS 1.3</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Form panel — full height, no card border ── */}
      <div className="flex flex-col min-h-[100dvh] lg:min-h-0">

        {/* Mobile top brand strip */}
        <div className="flex lg:hidden items-center gap-2 px-5 pt-6 pb-2">
          <div className="w-8 h-8 rounded-xl bg-[#0b1f3d] flex items-center justify-center">
            <Shield className="w-4 h-4 text-[#e8b74a]" />
          </div>
          <span className="text-base font-bold text-[#1c2333] tracking-tight">AxelleVault</span>
        </div>

        <div className="auth-panel flex-1 flex items-center justify-center px-5 py-6 sm:px-8 sm:py-8 lg:px-14 xl:px-20">
          <div className="w-full max-w-sm">

            {/* Header */}
            <div className="mb-6 sm:mb-7">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3f7d58]/10 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-[#3f7d58]" />
                <span className="text-[10px] font-semibold text-[#3f7d58]">Secure connection active</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1c2333] mb-1.5 leading-tight">
                {method === 'phone'
                  ? 'Continue with mobile.'
                  : mode === 'login' ? 'Welcome back.' : 'Create your account.'}
              </h1>
              <p className="text-sm text-[#8a8272]">
                {method === 'phone'
                  ? 'Use your mobile number — we\'ll send a one-time code'
                  : mode === 'login'
                    ? 'Sign in to access your vault'
                    : 'Join AxelleVault — it only takes a minute'}
              </p>
            </div>

            {/* Method switch: Email / Mobile OTP */}
            <div className="flex gap-1 bg-[#ece6d6] rounded-full p-1 mb-4 sm:mb-5">
              {([
                { key: 'email', label: 'Email', Icon: Mail },
                { key: 'phone', label: 'Mobile OTP', Icon: Phone },
              ] as { key: AuthMethod; label: string; Icon: typeof Mail }[]).map(({ key, label, Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setMethod(key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    method === key
                      ? 'bg-[#0b1f3d] text-[#f4f1ea]'
                      : 'text-[#8a8272] hover:text-[#1c2333]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" /> {label}
                </button>
              ))}
            </div>

            {/* Sign in / Sign up tabs — sirf Email method me dikhte hain */}
            {method === 'email' && (
              <div className="flex w-full mb-6 sm:mb-7 border-b border-[#e4ddc9]">
                {(['login', 'signup'] as Mode[]).map(m => (
                  <button key={m} type="button" onClick={() => setMode(m)}
                    className={`flex-1 text-center pb-3 -mb-px text-xs font-semibold border-b-2 transition-colors ${
                      mode === m
                        ? 'border-[#0b1f3d] text-[#0b1f3d]'
                        : 'border-transparent text-[#8a8272] hover:text-[#1c2333]'
                    }`}>
                    {m === 'login' ? 'Sign in' : 'Sign up'}
                  </button>
                ))}
              </div>
            )}
            {method === 'phone' && <div className="mb-6 sm:mb-7" />}

            {/* Forms */}
            {method === 'phone' ? (
              <PhoneOtpForm />
            ) : mode === 'login' ? (
              <LoginForm
                onForgotPassword={onForgotPassword}
                onSwitchToSignup={() => setMode('signup')}
              />
            ) : (
              <SignupForm onSwitchToLogin={() => setMode('login')} />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-4 pb-6 pt-2">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#3f7d58]" />
            <span className="text-[10px] text-[#8a8272] font-medium">Encrypted</span>
          </div>
          <span className="text-[10px] text-[#a39c8c]">© 2026 AxelleVault</span>
        </div>
      </div>
    </div>
    </>
  );
};

export default Login;