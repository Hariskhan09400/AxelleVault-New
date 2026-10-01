import { useState, useEffect, useLayoutEffect } from 'react';
import type { CSSProperties } from 'react';
import {
  Activity,
  AlertTriangle,
  Shield,
  Clock,
  ScanLine,
  Key,
  Hash,
  Globe,
  Mail,
  LogIn,
} from 'lucide-react';
import { supabase, SecurityLog } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { calculateSecurityScore } from '../utils/securityTools';

/* ─────────────────────────────────────────────────────────────────────────
   Risk-level tokens
   These are specific to this file (one log entry's risk is a different axis
   from the aggregate score, so it earns its own four-way palette rather than
   reusing --av-ok/--av-warn/--av-danger). Injected once, keyed off the same
   [data-av-theme] attribute the rest of the app already uses, so it repaints
   automatically with the global toggle.
   ───────────────────────────────────────────────────────────────────────── */
const RISK_CSS = `
:root, [data-av-theme="dark"] {
  --av-risk-critical: #FB7185;
  --av-risk-critical-soft: rgba(251,113,133,0.12);
  --av-risk-high: #FB923C;
  --av-risk-high-soft: rgba(251,146,60,0.12);
  --av-risk-medium: #E0A94C;
  --av-risk-medium-soft: rgba(224,169,76,0.12);
  --av-risk-low: #6EE7B7;
  --av-risk-low-soft: rgba(110,231,183,0.12);
}
[data-av-theme="light"] {
  --av-risk-critical: #C0392B;
  --av-risk-critical-soft: rgba(192,57,43,0.10);
  --av-risk-high: #C2660E;
  --av-risk-high-soft: rgba(194,102,14,0.10);
  --av-risk-medium: #9A6B12;
  --av-risk-medium-soft: rgba(154,107,18,0.10);
  --av-risk-low: #15803D;
  --av-risk-low-soft: rgba(21,128,61,0.10);
}
`;

const injectRiskCss = () => {
  if (typeof document === 'undefined') return;
  if (document.getElementById('av-risk-tokens')) return;
  const el = document.createElement('style');
  el.id = 'av-risk-tokens';
  el.textContent = RISK_CSS;
  document.head.appendChild(el);
};

const riskMeta = (level: string) => {
  switch (level) {
    case 'critical': return { color: 'var(--av-risk-critical)', soft: 'var(--av-risk-critical-soft)' };
    case 'high':      return { color: 'var(--av-risk-high)', soft: 'var(--av-risk-high-soft)' };
    case 'medium':    return { color: 'var(--av-risk-medium)', soft: 'var(--av-risk-medium-soft)' };
    default:           return { color: 'var(--av-risk-low)', soft: 'var(--av-risk-low-soft)' };
  }
};

/* Overall score tiers — same thresholds and labels as the sidebar's ring in
   Dashboard.tsx, so "Fair" or "At risk" means the same thing everywhere. */
const scoreMeta = (score: number) => {
  if (score >= 80) return { color: 'var(--av-ok)', label: 'Strong', description: 'Excellent security posture' };
  if (score >= 60) return { color: 'var(--av-warn)', label: 'Fair', description: 'Good security practices' };
  if (score >= 40) return { color: 'var(--av-warn)', label: 'Needs work', description: 'Needs improvement' };
  return { color: 'var(--av-danger)', label: 'At risk', description: 'Critical improvements needed' };
};

/* Picks an icon for a log row from its event_type string. Purely cosmetic —
   falls back to a generic activity icon for anything unrecognized. */
const eventIcon = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes('password')) return Key;
  if (t.includes('hash')) return Hash;
  if (t.includes('ip')) return Globe;
  if (t.includes('phishing') || t.includes('url')) return AlertTriangle;
  if (t.includes('email') || t.includes('breach')) return Mail;
  if (t.includes('login')) return LogIn;
  return Activity;
};

const formatRelativeTime = (iso: string) => {
  const date = new Date(iso);
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? '' : 's'} ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
  return date.toLocaleDateString();
};

/* ─── Radial score gauge ────────────────────────────────────────────────── */
const ScoreGauge = ({
  score,
  loading,
  size = 128,
  stroke = 10,
}: {
  score: number;
  loading: boolean;
  size?: number;
  stroke?: number;
}) => {
  const meta = scoreMeta(score);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(Math.max(score, 0), 100);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--av-ring-track)" strokeWidth={stroke} />
        {!loading && (
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
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {loading ? (
          <span className="h-8 w-14 rounded-md bg-[var(--av-hover)] motion-safe:animate-pulse" />
        ) : (
          <>
            <span className="text-3xl font-semibold tabular-nums" style={{ color: meta.color }}>
              {score}
            </span>
            <span className="text-[11px] text-[var(--av-text-dim)]">out of 100</span>
          </>
        )}
      </div>
    </div>
  );
};

/* ─── Stat tile ─────────────────────────────────────────────────────────── */
const StatTile = ({
  icon: Icon,
  label,
  value,
  sublabel,
  loading,
  reveal,
}: {
  icon: typeof Activity;
  label: string;
  value: number | string;
  sublabel: string;
  loading?: boolean;
  reveal: { className: string; style: CSSProperties };
}) => (
  <div
    className={`rounded-2xl border border-[var(--av-line)] bg-[var(--av-elevated)] p-5 ${reveal.className}`}
    style={reveal.style}
  >
    <div className="flex items-center gap-3">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ background: 'var(--av-accent-soft)' }}
      >
        <Icon className="h-[18px] w-[18px]" style={{ color: 'var(--av-accent)' }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-[var(--av-text-dim)]">{label}</p>
        {loading ? (
          <span className="mt-1 block h-6 w-10 rounded bg-[var(--av-hover)] motion-safe:animate-pulse" />
        ) : (
          <p className="text-2xl font-semibold tabular-nums text-[var(--av-text)]">{value}</p>
        )}
      </div>
    </div>
    <p className="mt-3 text-xs text-[var(--av-text-dim)]">{sublabel}</p>
  </div>
);

/* ─── Main component ────────────────────────────────────────────────────── */
export const SecurityDashboard = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [securityScore, setSecurityScore] = useState(50);
  const [scoreLoading, setScoreLoading] = useState(true);
  const [totalScans, setTotalScans] = useState(0);
  const [ready, setReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useLayoutEffect(() => { injectRiskCss(); }, []);

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (user) {
      fetchLogs();
      calculateUserSecurityScore();
    }
  }, [user]);

  const fetchLogs = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('security_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) {
      setLogs(data);
      const scanCount = data.filter((log) =>
        ['ip_lookup', 'phishing_scan', 'password_analyzed', 'hash_verified'].includes(log.event_type)
      ).length;
      setTotalScans(scanCount);
    }

    setLoading(false);
  };

  const calculateUserSecurityScore = async () => {
    if (!user || !profile) return;

    const accountAge = Math.floor(
      (new Date().getTime() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    const { data: logsData } = await supabase
      .from('security_logs')
      .select('*')
      .eq('user_id', user.id);

    const toolUsage = logsData?.length || 0;

    const score = calculateSecurityScore({
      passwordStrength: 75,
      recentFailedLogins: profile.failed_attempts || 0,
      accountAge,
      toolUsage,
    });

    setSecurityScore(score);
    setScoreLoading(false);

    try {
      await supabase.from('user_login_detail').update({ security_score: score }).eq('id', user.id);
    } catch (err) {
      console.warn('[Dashboard] Failed to update security score:', err);
    }

    refreshProfile();
  };

  const formatEventType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // A single staggered reveal on mount — not per-card hover effects.
  const reveal = (index: number) => ({
    className: `transition-all duration-500 ease-out ${
      reducedMotion || ready ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
    }`,
    style: { transitionDelay: reducedMotion ? '0ms' : `${index * 70}ms` } as CSSProperties,
  });

  const meta = scoreMeta(securityScore);

  return (
    <div className="space-y-6">
      {/* ── Hero: score + supporting stats ── */}
      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-5">
        <div
          className="rounded-2xl border border-[var(--av-line)] bg-[var(--av-elevated)] p-6 lg:col-span-2"
          {...reveal(0)}
        >
          <div className="flex items-center gap-5">
            <ScoreGauge score={securityScore} loading={scoreLoading} />
            <div className="min-w-0">
              <p className="text-xs text-[var(--av-text-dim)]">Security score</p>
              <p className="mt-0.5 text-sm font-medium" style={{ color: meta.color }}>{meta.label}</p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--av-text-soft)]">
                {scoreLoading ? 'Calculating your score…' : meta.description}
              </p>
            </div>
          </div>
          <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'var(--av-ring-track)' }}>
            <div
              className="h-full rounded-full"
              style={{
                width: scoreLoading ? '0%' : `${Math.min(Math.max(securityScore, 0), 100)}%`,
                background: meta.color,
                transition: 'width 900ms cubic-bezier(.22,1,.36,1)',
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-3">
          <StatTile
            icon={Activity}
            label="Total activities"
            value={logs.length}
            sublabel="Security events logged"
            loading={loading}
            reveal={reveal(1)}
          />
          <StatTile
            icon={ScanLine}
            label="Total scans"
            value={totalScans}
            sublabel="IP and security tool scans"
            loading={loading}
            reveal={reveal(2)}
          />
          <StatTile
            icon={AlertTriangle}
            label="Failed logins"
            value={profile?.failed_attempts || 0}
            sublabel={
              logs[0]?.created_at
                ? `Last activity ${formatRelativeTime(logs[0].created_at)}`
                : 'No activity yet'
            }
            reveal={reveal(3)}
          />
        </div>
      </div>

      {/* ── Recent activity ── */}
      <div
        className="rounded-2xl border border-[var(--av-line)] bg-[var(--av-elevated)] p-6"
        {...reveal(4)}
      >
        <div className="mb-5 flex items-center gap-2.5">
          <Clock className="h-[18px] w-[18px] text-[var(--av-text-dim)]" />
          <h3 className="text-[15px] font-semibold text-[var(--av-text)]">Recent activity</h3>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-[68px] rounded-xl border border-[var(--av-line)] bg-[var(--av-field)] motion-safe:animate-pulse"
              />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-full"
              style={{ background: 'var(--av-accent-soft)' }}
            >
              <Shield className="h-5 w-5" style={{ color: 'var(--av-accent)' }} />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--av-text)]">No activity yet</p>
              <p className="mt-1 text-xs text-[var(--av-text-dim)]">
                Run a scan or check a password to see it show up here.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {logs.map((log) => {
              const Icon = eventIcon(log.event_type);
              const risk = riskMeta(log.risk_level);
              return (
                <div
                  key={log.id}
                  className="group flex items-center gap-3 rounded-xl border border-[var(--av-line)] bg-[var(--av-field)] p-3.5 transition-colors hover:border-[var(--av-line-strong)]"
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: risk.soft }}
                  >
                    <Icon className="h-4 w-4" style={{ color: risk.color }} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-[var(--av-text)]">
                        {formatEventType(log.event_type)}
                      </span>
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide"
                        style={{ background: risk.soft, color: risk.color }}
                      >
                        {log.risk_level.toUpperCase()}
                      </span>
                    </div>
                    <p
                      className="mt-0.5 truncate text-xs text-[var(--av-text-dim)]"
                      title={new Date(log.created_at).toLocaleString()}
                    >
                      {formatRelativeTime(log.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};