import { useState, useEffect, useMemo, useRef, useCallback, useLayoutEffect } from 'react';
import { flushSync } from 'react-dom';
import {
  Shield,
  Key,
  Hash,
  Globe,
  Activity,
  LogOut,
  Menu,
  X,
  User,
  Mail,
  Search,
  Info,
  Lock,
  Brain,
  BarChart3,
  FileText,
  AlertTriangle,
  Settings as SettingsIcon,
  MessageSquare,
  Terminal,
  Zap,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  ChevronRight,
  CornerDownLeft,
  Command,
  Clock,
  ShieldCheck,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { LogoutConfirmModal } from './LogoutConfirmModal';
import { PasswordGenerator } from './tools/PasswordGenerator';
import { PasswordAnalyzer } from './tools/PasswordAnalyzer';
import { HashGenerator } from './tools/HashGenerator';
import { PhishingDetector } from './tools/PhishingDetector';
import { IPIntelligence } from './tools/IPIntelligence';
import { EmailBreachChecker } from './tools/EmailBreachChecker';
import { URLScanner } from './tools/URLScanner';
import { WhoisLookup } from './tools/WhoisLookup';
import { EncryptionTool } from './tools/EncryptionTool';
import { ThreatDetection } from './tools/ThreatDetection';
import { SecureNotesVault } from './tools/SecureNotesVault';
import PortScanner from './tools/PortScanner'
import { MalwareHashAnalyzer } from './tools/MalwareHashAnalyzer';
import { APIKeyStrengthChecker } from './tools/APIKeyStrengthChecker';
import { FileHashGenerator } from './tools/FileHashGenerator';
import { DNSLookupTool } from './tools/DNSLookupTool';
import { HTTPHeaderAnalyzer } from './tools/HTTPHeaderAnalyzer';
import { JWTDecoderValidator } from './tools/JWTDecoderValidator';
import DarkWebExposureChecker from './tools/DarkWebExposureChecker';
import { SSLCertificateChecker } from './tools/SSLCertificateChecker';
import { SecurityAnalytics } from './SecurityAnalytics';
import { SecurityDashboard } from './SecurityDashboard';
import IPChat from './tools/ipchat';
import { useLocation } from 'react-router-dom';
import { useSafeNavigate } from '../lib/navigation';

type Tool =
  | 'dashboard'
  | 'password-generator'
  | 'password-analyzer'
  | 'hash-generator'
  | 'phishing-detector'
  | 'ip-intelligence'
  | 'email-breach'
  | 'url-scanner'
  | 'whois'
  | 'encryption'
  | 'threat-detection'
  | 'analytics'
  | 'port-scanner'
  | 'malware-hash'
  | 'apikey-strength'
  | 'file-hash'
  | 'dns-lookup'
  | 'http-header'
  | 'jwt-validator'
  | 'darkweb'
  | 'ssl-monitor'
  | 'secure-notes'
  | 'ipchat';

type ToolItem = {
  id: Tool;
  name: string;
  icon: typeof Shield;
  path: string;
  hint: string;
};

type ThemeMode = 'light' | 'dark' | 'system';
type Resolved = 'light' | 'dark';

const THEME_KEY = 'axellevault:theme';
const RAIL_KEY = 'axellevault:rail';

/* ══════════════════════════════════════════════════════════════════════════
   THEME TOKENS
   Every colour in this shell reads from a CSS variable, so switching themes
   is a single attribute flip on <html> rather than a re-render of classes.
   ══════════════════════════════════════════════════════════════════════════ */
const THEME_CSS = `
:root, [data-av-theme="dark"] {
  color-scheme: dark;
  --av-bg: #0A1A2F;
  --av-bg-alt: #081729;
  --av-elevated: #0D2038;
  --av-line: rgba(255,255,255,0.08);
  --av-line-strong: rgba(255,255,255,0.17);
  --av-text: #F3EFE4;
  --av-text-soft: #93A7C0;
  --av-text-dim: #6F86A3;
  --av-accent: #E0A94C;
  --av-accent-ink: #0A1A2F;
  --av-accent-soft: rgba(224,169,76,0.12);
  --av-brand: #E0A94C;
  --av-hover: rgba(255,255,255,0.045);
  --av-active: rgba(255,255,255,0.075);
  --av-field: rgba(255,255,255,0.03);
  --av-scrim: rgba(4,16,31,0.78);
  --av-header: rgba(10,26,47,0.86);
  --av-ring-track: rgba(255,255,255,0.09);
  --av-ok: #6EE7B7;
  --av-ok-soft: rgba(110,231,183,0.12);
  --av-warn: #E0A94C;
  --av-warn-soft: rgba(224,169,76,0.12);
  --av-danger: #FB7185;
  --av-danger-soft: rgba(251,113,133,0.12);
  --av-glow-a: rgba(224,169,76,0.06);
  --av-glow-b: rgba(30,111,168,0.09);
  --av-shadow: 0 30px 70px -20px rgba(0,0,0,0.85);
}

[data-av-theme="light"] {
  color-scheme: light;
  --av-bg: #F5F2EA;
  --av-bg-alt: #EFEBE0;
  --av-elevated: #FFFFFF;
  --av-line: rgba(20,38,60,0.11);
  --av-line-strong: rgba(20,38,60,0.22);
  --av-text: #14263C;
  --av-text-soft: #4B5E75;
  --av-text-dim: #75879C;
  --av-accent: #9A6B12;
  --av-accent-ink: #FFFFFF;
  --av-accent-soft: rgba(154,107,18,0.10);
  --av-brand: #D99B2F;
  --av-hover: rgba(20,38,60,0.05);
  --av-active: rgba(20,38,60,0.08);
  --av-field: rgba(255,255,255,0.75);
  --av-scrim: rgba(20,38,60,0.38);
  --av-header: rgba(245,242,234,0.86);
  --av-ring-track: rgba(20,38,60,0.12);
  --av-ok: #15803D;
  --av-ok-soft: rgba(21,128,61,0.10);
  --av-warn: #9A6B12;
  --av-warn-soft: rgba(154,107,18,0.10);
  --av-danger: #C0392B;
  --av-danger-soft: rgba(192,57,43,0.10);
  --av-glow-a: rgba(224,169,76,0.18);
  --av-glow-b: rgba(30,111,168,0.10);
  --av-shadow: 0 24px 60px -22px rgba(20,38,60,0.30);
}

html, body { background: var(--av-bg); }

[data-av-theme="light"] .tool-page-shell,
[data-av-theme="light"] .tool-page-shell * {
  color: var(--av-text);
}

[data-av-theme="light"] .tool-page-shell .text-white,
[data-av-theme="light"] .tool-page-shell .text-gray-200,
[data-av-theme="light"] .tool-page-shell .text-gray-300,
[data-av-theme="light"] .tool-page-shell .text-gray-400,
[data-av-theme="light"] .tool-page-shell .text-gray-500,
[data-av-theme="light"] .tool-page-shell .text-slate-300,
[data-av-theme="light"] .tool-page-shell .placeholder-gray-500,
[data-av-theme="light"] .tool-page-shell .placeholder-gray-600,
[data-av-theme="light"] .tool-page-shell .placeholder-slate-400 {
  color: var(--av-text) !important;
}

[data-av-theme="light"] .tool-page-shell .bg-gray-900,
[data-av-theme="light"] .tool-page-shell .bg-gray-800,
[data-av-theme="light"] .tool-page-shell .bg-gray-800\/50,
[data-av-theme="light"] .tool-page-shell .bg-black\/40,
[data-av-theme="light"] .tool-page-shell .bg-slate-900,
[data-av-theme="light"] .tool-page-shell .bg-slate-800 {
  background-color: var(--av-elevated) !important;
}

[data-av-theme="light"] .tool-page-shell .border-gray-700,
[data-av-theme="light"] .tool-page-shell .border-gray-800,
[data-av-theme="light"] .tool-page-shell .border-cyan-500\/30,
[data-av-theme="light"] .tool-page-shell .border-slate-700 {
  border-color: var(--av-line) !important;
}

[data-av-theme="light"] .tool-page-shell input,
[data-av-theme="light"] .tool-page-shell textarea,
[data-av-theme="light"] .tool-page-shell select {
  color: var(--av-text) !important;
  background-color: var(--av-field) !important;
  border-color: var(--av-line) !important;
}

.tool-page-shell > :first-child {
  width: 100%;
  border: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
}

.tool-page-shell > :first-child > :first-child {
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}

/* Fallback crossfade for browsers without the View Transitions API.
   Only paint properties transition, so layout and transform stay untouched. */
html.av-theme-switching *,
html.av-theme-switching *::before,
html.av-theme-switching *::after {
  transition: background-color 300ms cubic-bezier(.4,0,.2,1),
              border-color 300ms cubic-bezier(.4,0,.2,1),
              color 300ms cubic-bezier(.4,0,.2,1),
              fill 300ms cubic-bezier(.4,0,.2,1),
              stroke 300ms cubic-bezier(.4,0,.2,1),
              box-shadow 300ms cubic-bezier(.4,0,.2,1) !important;
  transition-delay: 0ms !important;
}

/* Telegram-style circular reveal. The outgoing theme stays put while the
   incoming one is clipped open from the button that was pressed. */
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}
::view-transition-old(root) { z-index: 1; }
::view-transition-new(root) { z-index: 2; }

/* Scrollbars follow the theme instead of staying stuck on dark. */
.av-scroll { scrollbar-width: thin; scrollbar-color: var(--av-line-strong) transparent; }
.av-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
.av-scroll::-webkit-scrollbar-track { background: transparent; }
.av-scroll::-webkit-scrollbar-thumb {
  background: var(--av-line-strong);
  border-radius: 999px;
  border: 2px solid transparent;
  background-clip: content-box;
}

@media (prefers-reduced-motion: reduce) {
  html.av-theme-switching *,
  html.av-theme-switching *::before,
  html.av-theme-switching *::after { transition: none !important; }
}
`;

/* ══════════════════════════════════════════════════════════════════════════
   THEME ENGINE
   ══════════════════════════════════════════════════════════════════════════ */
const readStoredMode = (): ThemeMode => {
  try {
    const v = localStorage.getItem(THEME_KEY);
    if (v === 'light' || v === 'dark' || v === 'system') return v;
  } catch { /* storage blocked */ }
  return 'system';
};

const systemPrefers = (): Resolved =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark';

const resolveMode = (mode: ThemeMode): Resolved => (mode === 'system' ? systemPrefers() : mode);

const injectThemeCss = () => {
  if (typeof document === 'undefined') return;
  if (document.getElementById('axellevault-theme')) return;
  const el = document.createElement('style');
  el.id = 'axellevault-theme';
  el.textContent = THEME_CSS;
  document.head.appendChild(el);
};

/** Keeps the mobile browser chrome (status bar) in step with the theme. */
const syncBrowserChrome = (resolved: Resolved) => {
  const color = resolved === 'light' ? '#F5F2EA' : '#0A1A2F';
  let meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.appendChild(meta);
  }
  meta.content = color;
};

const useTheme = () => {
  const [mode, setMode] = useState<ThemeMode>(readStoredMode);
  const [resolved, setResolved] = useState<Resolved>(() => resolveMode(readStoredMode()));

  useLayoutEffect(() => { injectThemeCss(); }, []);

  // Paint the attribute before the browser draws, so there is no flash.
  useLayoutEffect(() => {
    const next = resolveMode(mode);
    document.documentElement.setAttribute('data-av-theme', next);
    setResolved(next);
    syncBrowserChrome(next);
    try { localStorage.setItem(THEME_KEY, mode); } catch { /* storage blocked */ }
  }, [mode]);

  // Follow the OS while the preference is "system".
  useEffect(() => {
    if (mode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const onChange = () => {
      const next: Resolved = mq.matches ? 'light' : 'dark';
      document.documentElement.setAttribute('data-av-theme', next);
      setResolved(next);
      syncBrowserChrome(next);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [mode]);

  /**
   * Switches the theme with a circular wipe originating at the element that
   * was pressed. Falls back to a paint-only crossfade where View Transitions
   * are unavailable (Firefox, older Safari) and to an instant swap when the
   * visitor has asked for reduced motion.
   */
  const changeMode = useCallback((next: ThemeMode, origin?: HTMLElement | null) => {
    const root = document.documentElement;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobile = window.matchMedia('(max-width: 767px)').matches;
    const startViewTransition = (document as unknown as {
      startViewTransition?: (cb: () => void) => { ready: Promise<void>; finished: Promise<void> };
    }).startViewTransition;

    if (reduced || mobile) {
      root.classList.add('av-theme-switching');
      setMode(next);
      window.setTimeout(() => root.classList.remove('av-theme-switching'), 260);
      return;
    }

    if (typeof startViewTransition !== 'function') {
      root.classList.add('av-theme-switching');
      setMode(next);
      window.setTimeout(() => root.classList.remove('av-theme-switching'), 340);
      return;
    }

    const rect = origin?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth - 56;
    const y = rect ? rect.top + rect.height / 2 : 56;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = startViewTransition.call(document, () => {
      flushSync(() => setMode(next));
    });

    transition.ready
      .then(() => {
        root.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${radius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 420,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            pseudoElement: '::view-transition-new(root)',
          }
        );
      })
      .catch(() => { /* transition was skipped; the theme still applied */ });
  }, []);

  return { mode, resolved, changeMode };
};

/* ══════════════════════════════════════════════════════════════════════════
   TOOL GROUPS
   `hint` feeds the command palette and the collapsed-rail tooltips.
   ══════════════════════════════════════════════════════════════════════════ */
const toolGroups: { label: string; items: ToolItem[] }[] = [
  {
    label: 'Overview',
    items: [
      { id: 'dashboard', name: 'Security Dashboard', icon: Activity, path: '/dashboard', hint: 'Your posture at a glance' },
    ],
  },
  {
    label: 'Passwords',
    items: [
      { id: 'password-generator', name: 'Password Generator', icon: Key, path: '/tools/password-generator', hint: 'Build strong, random passwords' },
      { id: 'password-analyzer', name: 'Password Analyzer', icon: Shield, path: '/tools/password-analyzer', hint: 'Score strength and crack time' },
    ],
  },
  {
    label: 'Network & web',
    items: [
      { id: 'ip-intelligence', name: 'IP Intelligence', icon: Globe, path: '/tools/ip-intelligence', hint: 'Geo, ASN and reputation' },
      { id: 'url-scanner', name: 'URL Scanner', icon: Search, path: '/tools/url-scanner', hint: 'Check a link before you open it' },
      { id: 'whois', name: 'WHOIS Lookup', icon: Info, path: '/tools/whois', hint: 'Domain registration records' },
      { id: 'dns-lookup', name: 'DNS Lookup', icon: Globe, path: '/tools/dns-lookup', hint: 'A, MX, TXT and NS records' },
      { id: 'http-header', name: 'HTTP Header Analyzer', icon: Shield, path: '/tools/http-header', hint: 'Audit security headers' },
      { id: 'port-scanner', name: 'Port Scanner', icon: Activity, path: '/tools/port-scanner', hint: 'Find open ports on a host' },
      { id: 'ssl-monitor', name: 'SSL Certificate Checker', icon: Lock, path: '/tools/ssl-check', hint: 'Expiry, chain and issuer' },
      { id: 'ipchat', name: 'IP Chat', icon: MessageSquare, path: '/tools/ipchat', hint: 'Ask questions about an address' },
    ],
  },
  {
    label: 'Crypto & hashing',
    items: [
      { id: 'hash-generator', name: 'Hash Tools', icon: Hash, path: '/tools/hash-generator', hint: 'MD5, SHA-1, SHA-256 and more' },
      { id: 'encryption', name: 'Encryption Tool', icon: Lock, path: '/tools/encryption', hint: 'Encrypt and decrypt text' },
      { id: 'malware-hash', name: 'Malware Hash Analyzer', icon: Hash, path: '/tools/malware-hash', hint: 'Look up a sample by hash' },
      { id: 'file-hash', name: 'File Hash Generator', icon: Hash, path: '/tools/file-hash', hint: 'Fingerprint a local file' },
      { id: 'jwt-validator', name: 'JWT Decoder', icon: Shield, path: '/tools/jwt-validator', hint: 'Decode and verify tokens' },
      { id: 'apikey-strength', name: 'API Key Strength', icon: Key, path: '/tools/apikey-strength', hint: 'Entropy check for secrets' },
    ],
  },
  {
    label: 'Threat intelligence',
    items: [
      { id: 'phishing-detector', name: 'Phishing Detector', icon: AlertTriangle, path: '/tools/phishing-detector', hint: 'Spot a fake message' },
      { id: 'email-breach', name: 'Email Breach Checker', icon: Mail, path: '/tools/email-breach', hint: 'See where an address leaked' },
      { id: 'darkweb', name: 'Dark Web Exposure', icon: Terminal, path: '/tools/darkweb', hint: 'Monitor leaked credentials' },
      { id: 'threat-detection', name: 'AI Threat Detection', icon: Brain, path: '/tools/threat-detection', hint: 'Analyze suspicious activity' },
    ],
  },
  {
    label: 'Vault & reporting',
    items: [
      { id: 'secure-notes', name: 'Secure Notes Vault', icon: FileText, path: '/tools/secure-notes', hint: 'Encrypted personal notes' },
      { id: 'analytics', name: 'Security Analytics', icon: BarChart3, path: '/analytics', hint: 'Trends across your activity' },
    ],
  },
];

const allTools = toolGroups.flatMap((g) => g.items);

/* ─── Score helpers ─────────────────────────────────────────────────────── */
const scoreMeta = (score: number) => {
  if (score >= 80) return { color: 'var(--av-ok)', label: 'Strong' };
  if (score >= 60) return { color: 'var(--av-warn)', label: 'Fair' };
  if (score >= 40) return { color: 'var(--av-warn)', label: 'Needs work' };
  return { color: 'var(--av-danger)', label: 'At risk' };
};

/* ─── Score ring ────────────────────────────────────────────────────────── */
const ScoreRing = ({ score, size = 44, stroke = 4 }: { score: number; size?: number; stroke?: number }) => {
  const meta = scoreMeta(score);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(Math.max(score, 0), 100);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--av-ring-track)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={meta.color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (pct / 100) * c}
          style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(.22,1,.36,1)' }}
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold tabular-nums"
        style={{ color: meta.color }}
      >
        {score}
      </span>
    </div>
  );
};

/* ─── Theme toggle (header) ─────────────────────────────────────────────────
   One tap flips light ↔ dark. The icons cross-rotate rather than pop, which
   is what makes the control feel settled instead of twitchy.
   ───────────────────────────────────────────────────────────────────────── */
const ThemeToggle = ({
  resolved,
  onToggle,
}: {
  resolved: Resolved;
  onToggle: (el: HTMLElement) => void;
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  const isLight = resolved === 'light';

  return (
    <button
      ref={ref}
      onClick={() => ref.current && onToggle(ref.current)}
      aria-label={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
      title={isLight ? 'Dark theme' : 'Light theme'}
      className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-[var(--av-line)] bg-[var(--av-field)] text-[var(--av-text)] transition-colors hover:border-[var(--av-accent)] hover:text-[var(--av-accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--av-accent)] active:scale-95 touch-manipulation"
      style={{ transition: 'transform 140ms cubic-bezier(.4,0,.2,1), color 200ms, border-color 200ms, background-color 200ms' }}
    >
      <Sun
        className="absolute left-1/2 top-1/2 h-[17px] w-[17px] -translate-x-1/2 -translate-y-1/2"
        style={{
          transform: `translate(-50%,-50%) rotate(${isLight ? 0 : 90}deg) scale(${isLight ? 1 : 0.4})`,
          opacity: isLight ? 1 : 0,
          transition: 'transform 420ms cubic-bezier(.4,0,.2,1), opacity 260ms ease',
        }}
      />
      <Moon
        className="absolute left-1/2 top-1/2 h-[17px] w-[17px] -translate-x-1/2 -translate-y-1/2"
        style={{
          transform: `translate(-50%,-50%) rotate(${isLight ? -90 : 0}deg) scale(${isLight ? 0.4 : 1})`,
          opacity: isLight ? 0 : 1,
          transition: 'transform 420ms cubic-bezier(.4,0,.2,1), opacity 260ms ease',
        }}
      />
    </button>
  );
};

/* ─── Theme preference (segmented, inside the account menu) ─────────────── */
const ToolPageShell = ({ children }: { children: React.ReactNode }) => (
  <div className="tool-page-shell min-h-[70vh] w-full rounded-none border-0 bg-transparent p-0 shadow-none">
    {children}
  </div>
);

const ThemeSegment = ({
  mode,
  onPick,
}: {
  mode: ThemeMode;
  onPick: (m: ThemeMode, el: HTMLElement) => void;
}) => {
  const options: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'Auto', icon: Monitor },
  ];
  const index = options.findIndex((o) => o.id === mode);

  return (
    <div className="px-4 py-3">
      <p className="mb-2 text-[11px] font-medium text-[var(--av-text-soft)]">Appearance</p>
      <div className="relative grid grid-cols-3 gap-1 rounded-xl border border-[var(--av-line)] bg-[var(--av-field)] p-1">
        <span
          aria-hidden
          className="absolute inset-y-1 rounded-lg bg-[var(--av-accent-soft)]"
          style={{
            width: 'calc((100% - 0.5rem) / 3)',
            left: `calc(0.25rem + ${index} * ((100% - 0.5rem) / 3))`,
            transition: 'left 340ms cubic-bezier(.4,0,.2,1)',
          }}
        />
        {options.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={(e) => onPick(id, e.currentTarget)}
            className={`relative z-10 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-[11px] font-medium transition-colors ${
              mode === id ? 'text-[var(--av-accent)]' : 'text-[var(--av-text)] hover:text-[var(--av-text)]'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

/* ─── Account menu ──────────────────────────────────────────────────────── */
const UserMenu = ({
  username,
  email,
  score,
  mode,
  onPickTheme,
  onProfile,
  onSettings,
  onSignOut,
}: {
  username: string;
  email?: string;
  score: number;
  mode: ThemeMode;
  onPickTheme: (m: ThemeMode, el: HTMLElement) => void;
  onProfile: () => void;
  onSettings: () => void;
  onSignOut: () => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2.5 rounded-xl border border-[var(--av-line)] bg-[var(--av-field)] py-1.5 pl-1.5 pr-3 transition hover:border-[var(--av-line-strong)] hover:bg-[var(--av-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--av-accent)]"
      >
        <span
          className="flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-bold"
          style={{ background: 'var(--av-brand)', color: 'var(--av-accent-ink)' }}
        >
          {username.slice(0, 2).toUpperCase()}
        </span>
        <span className="hidden max-w-[130px] truncate text-sm text-[var(--av-text)] sm:block">{username}</span>
        <ChevronDown
          className="h-3.5 w-3.5 text-[var(--av-text-dim)]"
          style={{ transform: `rotate(${open ? 180 : 0}deg)`, transition: 'transform 240ms cubic-bezier(.4,0,.2,1)' }}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            role="menu"
            className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-[var(--av-line)] bg-[var(--av-elevated)]"
            style={{ boxShadow: 'var(--av-shadow)' }}
          >
            <div className="flex items-center gap-3 border-b border-[var(--av-line)] px-4 py-4">
              <ScoreRing score={score} size={40} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[var(--av-text)]">{username}</p>
                <p className="truncate font-mono text-[11px] text-[var(--av-text-dim)]">{email}</p>
              </div>
            </div>

            <ThemeSegment mode={mode} onPick={onPickTheme} />

            <div className="border-t border-[var(--av-line)]">
              {[
                { label: 'Your profile', icon: User, action: onProfile },
                { label: 'Settings', icon: SettingsIcon, action: onSettings },
              ].map(({ label, icon: Icon, action }) => (
                <button
                  key={label}
                  role="menuitem"
                  onClick={() => { setOpen(false); action(); }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm text-[var(--av-text-soft)] transition hover:bg-[var(--av-hover)] hover:text-[var(--av-text)]"
                >
                  <Icon className="h-4 w-4 text-[var(--av-text-dim)]" />
                  {label}
                </button>
              ))}
            </div>

            <button
              role="menuitem"
              onClick={() => { setOpen(false); onSignOut(); }}
              className="flex w-full items-center gap-3 border-t border-[var(--av-line)] px-4 py-3 text-sm transition hover:bg-[var(--av-danger-soft)]"
              style={{ color: 'var(--av-danger)' }}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
};

/* ─── Command palette ───────────────────────────────────────────────────── */
const CommandPalette = ({
  onClose,
  onPick,
}: {
  onClose: () => void;
  onPick: (path: string) => void;
}) => {
  const [q, setQ] = useState('');
  const [cursor, setCursor] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return allTools;
    return allTools.filter(
      (t) => t.name.toLowerCase().includes(term) || t.hint.toLowerCase().includes(term)
    );
  }, [q]);

  useEffect(() => { setCursor(0); }, [q]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
      if (e.key === 'ArrowDown') { e.preventDefault(); setCursor((c) => Math.min(c + 1, results.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
      if (e.key === 'Enter' && results[cursor]) { e.preventDefault(); onPick(results[cursor].path); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [results, cursor, onClose, onPick]);

  useEffect(() => {
    const el = listRef.current?.querySelector('[data-active="true"]') as HTMLElement | null;
    el?.scrollIntoView({ block: 'nearest' });
  }, [cursor]);

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center px-4 pt-[12vh]">
      <div className="absolute inset-0 bg-[var(--av-scrim)] backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--av-line)] bg-[var(--av-elevated)]"
        style={{ boxShadow: 'var(--av-shadow)' }}
      >
        <div className="flex items-center gap-3 border-b border-[var(--av-line)] px-4">
          <Search className="h-4 w-4 shrink-0 text-[var(--av-text-dim)]" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Jump to a tool"
            className="w-full bg-transparent py-4 text-sm text-[var(--av-text)] placeholder-[var(--av-text-dim)] focus:outline-none"
          />
          <kbd className="hidden shrink-0 rounded border border-[var(--av-line)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--av-text-dim)] sm:block">esc</kbd>
        </div>

        <div ref={listRef} className="av-scroll max-h-[52vh] overflow-y-auto py-2">
          {results.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-[var(--av-text-dim)]">
              Nothing matches that. Try a shorter word, like hash or dns.
            </p>
          ) : (
            results.map((t, i) => {
              const Icon = t.icon;
              const active = i === cursor;
              return (
                <button
                  key={t.id}
                  data-active={active}
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => onPick(t.path)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors"
                  style={{ background: active ? 'var(--av-accent-soft)' : 'transparent' }}
                >
                  <Icon
                    className="h-4 w-4 shrink-0"
                    style={{ color: active ? 'var(--av-accent)' : 'var(--av-text-dim)' }}
                  />
                  <span className="min-w-0 flex-1">
                    <span
                      className="block truncate text-sm"
                      style={{ color: active ? 'var(--av-text)' : 'var(--av-text-soft)' }}
                    >
                      {t.name}
                    </span>
                    <span className="block truncate text-xs text-[var(--av-text-dim)]">{t.hint}</span>
                  </span>
                  {active && <CornerDownLeft className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--av-accent)' }} />}
                </button>
              );
            })
          )}
        </div>

        <div className="flex items-center gap-4 border-t border-[var(--av-line)] px-4 py-2.5 text-[11px] text-[var(--av-text-dim)]">
          <span className="flex items-center gap-1.5"><kbd className="rounded border border-[var(--av-line)] px-1 font-mono">↑↓</kbd> move</span>
          <span className="flex items-center gap-1.5"><kbd className="rounded border border-[var(--av-line)] px-1 font-mono">↵</kbd> open</span>
          <span className="ml-auto tabular-nums">{results.length} of {allTools.length}</span>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   DASHBOARD SHELL
   ══════════════════════════════════════════════════════════════════════════ */
export const Dashboard = () => {
  const { user, profile, loading } = useAuth();
  const { mode, resolved, changeMode } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(RAIL_KEY) === 'collapsed'; } catch { return false; }
  });
  const [now, setNow] = useState(() => new Date());
  const location = useLocation();
  const navigate = useSafeNavigate();

  const activeTool =
    allTools.find((t) => t.path === location.pathname)?.id ??
    (location.pathname.startsWith('/tools') ? 'password-generator' : 'dashboard');

  const activeGroup = toolGroups.find((g) => g.items.some((t) => t.id === activeTool))?.label ?? 'Overview';
  const activeMeta = allTools.find((t) => t.id === activeTool);
  const onProfilePage = location.pathname === '/profile';
  const onSettingsPage = location.pathname === '/settings';

  const filteredToolGroups = searchQuery.trim()
    ? [
        {
          label: 'Results',
          items: allTools.filter((tool) =>
            tool.name.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        },
      ]
    : toolGroups;

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    try { localStorage.setItem(RAIL_KEY, collapsed ? 'collapsed' : 'expanded'); } catch { /* ignore */ }
  }, [collapsed]);

  // Cmd/Ctrl + K palette, Cmd/Ctrl + \ rail, Cmd/Ctrl + J theme.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      const k = e.key.toLowerCase();
      if (k === 'k') { e.preventDefault(); setPaletteOpen((p) => !p); }
      if (e.key === '\\') { e.preventDefault(); setCollapsed((p) => !p); }
      if (k === 'j') { e.preventDefault(); changeMode(resolved === 'light' ? 'dark' : 'light', null); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [changeMode, resolved]);

  useEffect(() => {
    if (!loading && user === null) {
      console.log('[Dashboard] User is null, redirecting to login');
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  const go = useCallback((path: string) => {
    navigate(path);
    setPaletteOpen(false);
    setSidebarOpen(false);
  }, [navigate]);

  const toggleTheme = useCallback((el: HTMLElement) => {
    changeMode(resolved === 'light' ? 'dark' : 'light', el);
  }, [changeMode, resolved]);

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[var(--av-bg)]">
        <div className="flex flex-col items-center gap-5">
          <div
            className="relative flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ background: 'var(--av-accent-soft)', boxShadow: 'inset 0 0 0 1px var(--av-line-strong)' }}
          >
            <Shield className="h-6 w-6" style={{ color: 'var(--av-accent)' }} />
            <span
              className="absolute inset-0 rounded-2xl border-2 border-transparent motion-safe:animate-spin"
              style={{ borderTopColor: 'var(--av-accent)' }}
            />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-[var(--av-text)]">Unlocking your vault</p>
            <p className="mt-1 text-xs text-[var(--av-text-dim)]">Verifying this session</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const renderTool = () => {
    const page = (content: React.ReactNode) => <ToolPageShell>{content}</ToolPageShell>;

    switch (activeTool) {
      case 'dashboard':          return page(<SecurityDashboard />);
      case 'password-generator': return page(<PasswordGenerator />);
      case 'password-analyzer':  return page(<PasswordAnalyzer />);
      case 'hash-generator':     return page(<HashGenerator />);
      case 'phishing-detector':  return page(<PhishingDetector />);
      case 'ip-intelligence':    return page(<IPIntelligence />);
      case 'email-breach':       return page(<EmailBreachChecker />);
      case 'url-scanner':        return page(<URLScanner />);
      case 'whois':              return page(<WhoisLookup isDark={resolved === 'dark'} />);
      case 'encryption':         return page(<EncryptionTool />);
      case 'threat-detection':   return page(<ThreatDetection />);
      case 'port-scanner':       return page(<PortScanner />);
      case 'malware-hash':       return page(<MalwareHashAnalyzer />);
      case 'apikey-strength':    return page(<APIKeyStrengthChecker />);
      case 'file-hash':          return page(<FileHashGenerator />);
      case 'dns-lookup':         return page(<DNSLookupTool />);
      case 'http-header':        return page(<HTTPHeaderAnalyzer />);
      case 'jwt-validator':      return page(<JWTDecoderValidator />);
      case 'darkweb':            return page(<DarkWebExposureChecker />);
      case 'ssl-monitor':        return page(<SSLCertificateChecker />);
      case 'analytics':          return page(<SecurityAnalytics />);
      case 'secure-notes':       return page(<SecureNotesVault userId={user?.id} userEmail={user?.email} />);
      case 'ipchat':             return page(<IPChat />);
      default:                   return page(<SecurityDashboard />);
    }
  };

  const activeToolName = activeMeta?.name ?? 'Security Dashboard';
  const username = profile?.username || user?.email?.split('@')[0] || 'operator';
  const secScore = profile?.security_score ?? 50;
  const meta = scoreMeta(secScore);
  const clock = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const telegramUrl = 'https://t.me/Axelle_vault';

  return (
    <div className="min-h-[100dvh] bg-[var(--av-bg)] text-[var(--av-text)] antialiased">
      {/* Ambient light: one warm source top-left, one cool source bottom-right. */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full blur-[130px]" style={{ background: 'var(--av-glow-a)' }} />
        <div className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full blur-[130px]" style={{ background: 'var(--av-glow-b)' }} />
      </div>

      <div className="relative flex h-[100dvh] overflow-hidden">

        {/* ── Sidebar ── */}
        <aside
          className={`
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
            fixed inset-y-0 left-0 z-50 md:static
            w-[280px] ${collapsed ? 'md:w-[76px]' : 'md:w-[272px]'}
            flex flex-col border-r border-[var(--av-line)] bg-[var(--av-bg-alt)] backdrop-blur-xl
            transition-[transform,width] duration-300 ease-out will-change-transform
          `}
        >
          {/* Brand */}
          <div className={`flex shrink-0 items-center gap-3 border-b border-[var(--av-line)] px-4 py-[18px] ${collapsed ? 'md:justify-center md:px-0' : ''}`}>
            <button
              onClick={() => go('/dashboard')}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--av-accent)]"
              style={{ background: 'var(--av-brand)', color: 'var(--av-accent-ink)' }}
              aria-label="Go to dashboard"
            >
              <Shield className="h-5 w-5" strokeWidth={2.3} />
            </button>
            <div className={`min-w-0 flex-1 ${collapsed ? 'md:hidden' : ''}`}>
              <p className="text-[15px] font-semibold leading-none tracking-tight text-[var(--av-text)]">
                Axelle<span style={{ color: 'var(--av-accent)' }}>Vault</span>
              </p>
              <p className="mt-1.5 text-[11px] leading-none text-[var(--av-text-dim)]">Security workspace</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-1.5 text-[var(--av-text-dim)] transition hover:bg-[var(--av-hover)] hover:text-[var(--av-text)] md:hidden"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Search / palette trigger */}
          <div className={`shrink-0 px-3 py-3 ${collapsed ? 'md:px-2' : ''}`}>
            {collapsed && (
              <button
                onClick={() => setPaletteOpen(true)}
                className="hidden w-full items-center justify-center rounded-xl border border-[var(--av-line)] bg-[var(--av-field)] py-2.5 text-[var(--av-text-dim)] transition hover:border-[var(--av-accent)] hover:text-[var(--av-accent)] md:flex"
                aria-label="Search tools"
              >
                <Search className="h-4 w-4" />
              </button>
            )}
            <div className={`relative ${collapsed ? 'md:hidden' : ''}`}>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--av-text-dim)]" />
              <input
                type="text"
                placeholder="Search tools"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-[var(--av-line)] bg-[var(--av-field)] py-2.5 pl-9 pr-16 text-sm text-[var(--av-text)] placeholder-[var(--av-text-dim)] transition focus:border-[var(--av-accent)] focus:outline-none"
              />
              <button
                onClick={() => setPaletteOpen(true)}
                className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-0.5 rounded-md border border-[var(--av-line)] px-1.5 py-1 font-mono text-[10px] text-[var(--av-text-dim)] transition hover:border-[var(--av-accent)] hover:text-[var(--av-accent)]"
                aria-label="Open command palette"
              >
                <Command className="h-3 w-3" />K
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className={`av-scroll flex-1 space-y-5 overflow-y-auto px-3 pb-4 ${collapsed ? 'md:px-2' : ''}`}>
            {filteredToolGroups.length > 0 && filteredToolGroups[0].items.length > 0 ? (
              filteredToolGroups.map((group) => (
                <div key={group.label}>
                  <p className={`mb-1.5 px-2 text-[11px] font-medium text-[var(--av-text-dim)] ${collapsed ? 'md:hidden' : ''}`}>
                    {group.label}
                  </p>
                  {collapsed && <div className="mx-2 mb-2 hidden h-px bg-[var(--av-line)] md:block" />}
                  <div className="space-y-0.5">
                    {group.items.map((tool) => {
                      const Icon = tool.icon;
                      const isActive = activeTool === tool.id && !onProfilePage && !onSettingsPage;
                      return (
                        <button
                          key={tool.id}
                          onClick={() => go(tool.path)}
                          title={collapsed ? tool.name : undefined}
                          className={`
                            group relative flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left
                            transition-colors duration-150
                            focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--av-accent)]
                            ${collapsed ? 'md:justify-center md:px-0' : ''}
                          `}
                          style={{
                            background: isActive ? 'var(--av-active)' : 'transparent',
                            color: isActive ? 'var(--av-text)' : 'var(--av-text-soft)',
                          }}
                          onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--av-hover)'; }}
                          onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                        >
                          {isActive && (
                            <span
                              className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full"
                              style={{ background: 'var(--av-accent)' }}
                            />
                          )}
                          <Icon
                            className="h-[17px] w-[17px] shrink-0"
                            style={{ color: isActive ? 'var(--av-accent)' : 'var(--av-text-dim)' }}
                          />
                          <span className={`truncate text-[13px] ${collapsed ? 'md:hidden' : ''}`}>{tool.name}</span>

                          {collapsed && (
                            <span
                              className="pointer-events-none absolute left-full z-50 ml-2 hidden whitespace-nowrap rounded-lg border border-[var(--av-line)] bg-[var(--av-elevated)] px-2.5 py-1.5 text-xs text-[var(--av-text)] opacity-0 transition-opacity group-hover:opacity-100 md:block"
                              style={{ boxShadow: 'var(--av-shadow)' }}
                            >
                              {tool.name}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-3 py-10 text-center">
                <p className="text-sm text-[var(--av-text-soft)]">No tool by that name</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-2 text-xs underline-offset-4 hover:underline"
                  style={{ color: 'var(--av-accent)' }}
                >
                  Clear the search
                </button>
              </div>
            )}
          </nav>

          {/* Account block */}
          <div className={`shrink-0 border-t border-[var(--av-line)] p-3 ${collapsed ? 'md:px-2' : ''}`}>
            <div className={`grid grid-cols-2 gap-2 ${collapsed ? 'md:hidden' : ''}`}>
              <button
                onClick={() => go('/profile')}
                className="flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs transition"
                style={{
                  borderColor: onProfilePage ? 'var(--av-accent)' : 'var(--av-line)',
                  background: onProfilePage ? 'var(--av-accent-soft)' : 'var(--av-field)',
                  color: onProfilePage ? 'var(--av-accent)' : 'var(--av-text-soft)',
                }}
              >
                <User className="h-3.5 w-3.5" /> Profile
              </button>
              <button
                onClick={() => go('/settings')}
                className="flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs transition"
                style={{
                  borderColor: onSettingsPage ? 'var(--av-accent)' : 'var(--av-line)',
                  background: onSettingsPage ? 'var(--av-accent-soft)' : 'var(--av-field)',
                  color: onSettingsPage ? 'var(--av-accent)' : 'var(--av-text-soft)',
                }}
              >
                <SettingsIcon className="h-3.5 w-3.5" /> Settings
              </button>
            </div>

            <div className={`mt-2 flex items-center gap-3 rounded-xl border border-[var(--av-line)] bg-[var(--av-field)] p-3 ${collapsed ? 'md:hidden' : ''}`}>
              <ScoreRing score={secScore} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-[var(--av-text)]">{username}</p>
                <p className="truncate font-mono text-[11px] text-[var(--av-text-dim)]">{user?.email}</p>
                <p className="mt-1 text-[11px]" style={{ color: meta.color }}>Security score: {meta.label}</p>
              </div>
            </div>

            {/* Collapsed rail keeps only the score */}
            <div className={`hidden justify-center py-1 ${collapsed ? 'md:flex' : ''}`}>
              <ScoreRing score={secScore} size={36} stroke={3} />
            </div>

            <button
              onClick={() => setShowLogoutModal(true)}
              className={`mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--av-line)] bg-[var(--av-field)] py-2.5 text-xs text-[var(--av-text-soft)] transition ${collapsed ? 'md:px-0' : ''}`}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--av-danger-soft)';
                e.currentTarget.style.color = 'var(--av-danger)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--av-field)';
                e.currentTarget.style.color = 'var(--av-text-soft)';
              }}
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className={collapsed ? 'md:hidden' : ''}>Sign out</span>
            </button>
          </div>
        </aside>

        {/* ── Main column ── */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <header
            className="shrink-0 border-b border-[var(--av-line)] px-4 py-3 backdrop-blur-xl md:px-6"
            style={{ background: 'var(--av-header)' }}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-2.5">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="shrink-0 rounded-lg p-2 text-[var(--av-text-soft)] transition hover:bg-[var(--av-hover)] hover:text-[var(--av-text)] md:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setCollapsed((p) => !p)}
                  className="hidden shrink-0 rounded-lg p-2 text-[var(--av-text-dim)] transition hover:bg-[var(--av-hover)] hover:text-[var(--av-text)] md:block"
                  aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                  title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-[11px] text-[var(--av-text-dim)]">
                    <span className="hidden sm:inline">{activeGroup}</span>
                    <ChevronRight className="hidden h-3 w-3 sm:inline" />
                    <span className="truncate text-[var(--av-text-soft)]">{activeToolName}</span>
                  </div>
                  <h1 className="truncate text-[15px] font-semibold tracking-tight text-[var(--av-text)] md:text-base">
                    {onProfilePage ? 'Your profile' : onSettingsPage ? 'Settings' : activeToolName}
                  </h1>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <div className="hidden items-center gap-2 lg:flex">
                  <span className="flex items-center gap-2 rounded-lg border border-[var(--av-line)] bg-[var(--av-field)] px-3 py-1.5 text-xs text-[var(--av-text-soft)]">
                    <ShieldCheck className="h-3.5 w-3.5" style={{ color: 'var(--av-ok)' }} />
                    Session encrypted
                  </span>
                  <span className="flex items-center gap-2 rounded-lg border border-[var(--av-line)] bg-[var(--av-field)] px-3 py-1.5 text-xs text-[var(--av-text-soft)]">
                    <Zap className="h-3.5 w-3.5" style={{ color: 'var(--av-accent)' }} />
                    <span className="tabular-nums text-[var(--av-text)]">{profile?.total_logins ?? 0}</span> sign-ins
                  </span>
                  <span className="flex items-center gap-2 rounded-lg border border-[var(--av-line)] bg-[var(--av-field)] px-3 py-1.5 font-mono text-xs text-[var(--av-text-soft)]">
                    <Clock className="h-3.5 w-3.5 text-[var(--av-text-dim)]" />
                    <span className="tabular-nums">{clock}</span>
                  </span>
                </div>

                <button
                  onClick={() => setPaletteOpen(true)}
                  className="rounded-lg border border-[var(--av-line)] bg-[var(--av-field)] p-2 text-[var(--av-text-soft)] transition hover:border-[var(--av-accent)] hover:text-[var(--av-accent)] lg:hidden"
                  aria-label="Search tools"
                >
                  <Search className="h-4 w-4" />
                </button>

                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Join AxelleVault on Telegram"
                  className="hidden items-center gap-2 rounded-xl border border-[var(--av-line)] bg-[var(--av-field)] px-2.5 py-2 text-left transition hover:border-[var(--av-accent)] hover:bg-[var(--av-hover)] sm:flex"
                >
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-lg"
                    style={{ background: 'var(--av-accent-soft)', color: 'var(--av-accent)' }}
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[9px] font-medium uppercase tracking-[0.14em] text-[var(--av-text-dim)]">Community</span>
                    <span className="block truncate text-[11px] font-semibold text-[var(--av-text)]">@Axelle_vault</span>
                  </span>
                </a>

                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Join AxelleVault on Telegram"
                  className="flex items-center justify-center rounded-xl border border-[var(--av-line)] bg-[var(--av-field)] p-2 text-[var(--av-accent)] transition hover:border-[var(--av-accent)] hover:bg-[var(--av-hover)] sm:hidden"
                >
                  <MessageSquare className="h-4 w-4" />
                </a>

                <ThemeToggle resolved={resolved} onToggle={toggleTheme} />

                <UserMenu
                  username={username}
                  email={user?.email}
                  score={secScore}
                  mode={mode}
                  onPickTheme={(m, el) => changeMode(m, el)}
                  onProfile={() => go('/profile')}
                  onSettings={() => go('/settings')}
                  onSignOut={() => setShowLogoutModal(true)}
                />
              </div>
            </div>
          </header>

          <main className="av-scroll flex-1 overflow-y-auto px-4 py-6 md:px-8">
            <div className="mx-auto max-w-7xl">
              {renderTool()}
            </div>
          </main>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 backdrop-blur-sm md:hidden"
          style={{ background: 'var(--av-scrim)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} onPick={go} />}

      <LogoutConfirmModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} />
    </div>
  );
};