import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import {
  BookOpen, Briefcase, Building2, ChevronDown, Compass, Home, Info, Layers, LogOut,
  Mail, MessageCircle, Send, Settings, Shield, User, Wrench,
} from 'lucide-react';
import type { useHubTheme } from '../hooks/useHubTheme';
import { useSafeNavigate } from '../lib/navigation';

type Theme = ReturnType<typeof useHubTheme>['theme'];

/* ------------------------------------------------------------------ */
/*  Shared data: 3 parent menus, everything else lives inside them     */
/* ------------------------------------------------------------------ */
interface Entry {
  label: string;
  desc: string;
  icon: ReactNode;
  to?: string;        // internal route
  scrollId?: string;  // scroll to section on page
  url?: string;       // external link (new tab)
  match?: (p: string) => boolean;
}
interface Group {
  id: string;
  label: string;
  icon: ReactNode;
  tagline: string;
  entries: Entry[];
}

const ic = 'h-[18px] w-[18px] shrink-0';

function buildGroups(whatsappUrl: string, telegramUrl: string): Group[] {
  return [
    {
      id: 'explore',
      label: 'Explore',
      icon: <Compass className={ic} />,
      tagline: 'Everything you can use, read and browse.',
      entries: [
        { label: 'Home', desc: 'Back to the start', icon: <Home className={ic} />, to: '/home', match: (p) => p === '/' || p === '/home' },
        { label: 'Tools', desc: 'Browse all tools', icon: <Wrench className={ic} />, to: '/vault' },
        { label: 'Blog', desc: 'Latest articles', icon: <BookOpen className={ic} />, scrollId: 'blog' },
        { label: 'Features', desc: 'What we offer', icon: <Layers className={ic} />, scrollId: 'offer' },
        { label: 'Portfolio', desc: 'Our work', icon: <Building2 className={ic} />, to: '/portfolio' },
      ],
    },
    {
      id: 'company',
      label: 'Company',
      icon: <Briefcase className={ic} />,
      tagline: 'Meet the company, explore opportunities, or start a conversation.',
      entries: [
        { label: 'About', desc: 'Who we are', icon: <Info className={ic} />, to: '/company/about' },
        { label: 'Security', desc: 'How we protect you', icon: <Shield className={ic} />, to: '/company/security' },
        { label: 'Careers', desc: 'Join the team', icon: <Briefcase className={ic} />, to: '/company/careers' },
        { label: 'Contact', desc: 'Get in touch', icon: <Mail className={ic} />, to: '/company/contact' },
      ],
    },
    {
      id: 'account',
      label: 'Account',
      icon: <User className={ic} />,
      tagline: 'Your profile, preferences and community.',
      entries: [
        { label: 'Profile', desc: 'Your details', icon: <User className={ic} />, to: '/profile' },
        { label: 'Settings', desc: 'Preferences', icon: <Settings className={ic} />, to: '/settings' },
        { label: 'WhatsApp', desc: 'Chat with us', icon: <MessageCircle className={ic} />, url: whatsappUrl },
        { label: 'Join Telegram', desc: 'Community channel', icon: <Send className={ic} />, url: telegramUrl },
      ],
    },
  ];
}

const isActive = (e: Entry, pathname: string) => (e.match ? e.match(pathname) : e.to === pathname);

/** same navigation logic as before (go / scrollTo / ext), one place */
function useRunner() {
  const navigate = useSafeNavigate();
  return (e: Entry, done: () => void) => {
    done();
    if (e.to) navigate(e.to);
    else if (e.scrollId) document.getElementById(e.scrollId)?.scrollIntoView({ behavior: 'smooth' });
    else if (e.url) window.open(e.url, '_blank', 'noopener,noreferrer');
  };
}

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8b74a]/70';

interface CommonProps {
  onLogout: () => void;
  theme: Theme;
  email?: string | null;
  initials: string;
  whatsappUrl: string;
  telegramUrl: string;
}

/* ------------------------------------------------------------------ */
/*  MOBILE  (same props as before)                                     */
/* ------------------------------------------------------------------ */
interface Props extends CommonProps {
  open: boolean;
  onClose: () => void;
}

const rowCls =
  `relative flex min-h-[48px] w-full touch-manipulation items-center gap-3 rounded-xl px-3 py-3 text-left text-[15px] font-medium ` +
  `transition-colors duration-150 active:bg-[#e8b74a]/15 motion-reduce:transition-none ${focusRing}`;

export function MobileMenu({ open, onClose, onLogout, theme, email, initials, whatsappUrl, telegramUrl }: Props) {
  const { pathname } = useLocation();
  const run = useRunner();
  const groups = buildGroups(whatsappUrl, telegramUrl);

  const groupOfPath = groups.find((g) => g.entries.some((e) => isActive(e, pathname)))?.id ?? null;
  const [openId, setOpenId] = useState<string | null>(groupOfPath);

  // original behaviour: the group holding the current page opens automatically
  useEffect(() => {
    if (groupOfPath) setOpenId(groupOfPath);
  }, [groupOfPath]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !window.matchMedia('(max-width: 767px)').matches) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const t = open ? 0 : -1;

  return (
    <>
      <div
        aria-hidden
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 motion-reduce:transition-none md:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <div
        id="mobile-menu"
        role="dialog"
        aria-label="Main menu"
        aria-hidden={!open}
        className={`relative z-40 grid transition-[grid-template-rows,visibility] duration-300 ease-out motion-reduce:transition-none md:hidden ${
          open ? 'visible grid-rows-[1fr]' : 'invisible grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-1">
            <div className={`max-h-[calc(100dvh-6rem)] overflow-y-auto overscroll-contain rounded-2xl border p-2 shadow-2xl ${theme.card}`}>
              {groups.map((g) => {
                const expanded = openId === g.id;
                const hasActive = g.entries.some((e) => isActive(e, pathname));
                return (
                  <div key={g.id}>
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={`mm-${g.id}`}
                      tabIndex={t}
                      onClick={() => setOpenId(expanded ? null : g.id)}
                      className={`${rowCls} ${hasActive && !expanded ? 'bg-[#e8b74a]/10 text-[#e8b74a]' : theme.text}`}
                    >
                      {g.icon}
                      <span className="flex-1 text-base font-semibold">{g.label}</span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-300 motion-reduce:transition-none ${
                          expanded ? 'rotate-180 text-[#e8b74a]' : ''
                        }`}
                      />
                    </button>
                    <div
                      id={`mm-${g.id}`}
                      className={`grid transition-[grid-template-rows,visibility] duration-300 ease-out motion-reduce:transition-none ${
                        expanded ? 'visible grid-rows-[1fr]' : 'invisible grid-rows-[0fr]'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="ml-[1.4rem] border-l-2 border-[#e8b74a]/40 py-1 pl-3">
                          {g.entries.map((e) => {
                            const active = isActive(e, pathname);
                            return (
                              <button
                                key={e.label}
                                type="button"
                                tabIndex={expanded ? t : -1}
                                aria-current={active ? 'page' : undefined}
                                onClick={() => run(e, onClose)}
                                className={`${rowCls} ${active ? 'bg-[#e8b74a]/10 text-[#e8b74a]' : theme.text}`}
                              >
                                {e.icon}
                                {e.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className={`mt-2 flex items-center gap-3 border-t px-3 pb-1 pt-3 ${theme.divider}`}>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e8b74a] text-sm font-semibold text-[#080e1a]">
                  {initials}
                </div>
                <p className={`min-w-0 flex-1 truncate text-sm ${theme.muted}`}>{email}</p>
                <button
                  type="button"
                  onClick={onLogout}
                  aria-label="Log out"
                  tabIndex={t}
                  className={`flex h-11 w-11 touch-manipulation items-center justify-center rounded-full text-red-400 transition active:scale-90 active:bg-red-400/10 ${focusRing}`}
                >
                  <LogOut className="h-[18px] w-[18px]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  DESKTOP  (drop inside your header, it shows only from md upwards)  */
/*  <DesktopNav theme={theme} email={email} initials={initials}         */
/*     onLogout={...} whatsappUrl={...} telegramUrl={...} />           */
/* ------------------------------------------------------------------ */
export function DesktopNav({ onLogout, theme, email, initials, whatsappUrl, telegramUrl }: CommonProps) {
  const { pathname } = useLocation();
  const run = useRunner();
  const groups = buildGroups(whatsappUrl, telegramUrl);
  const [openId, setOpenId] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number>();

  const close = () => { setOpenId(null); setHover(null); };
  const enter = (id: string) => { window.clearTimeout(timer.current); setOpenId(id); setHover(null); };
  const leave = () => { window.clearTimeout(timer.current); timer.current = window.setTimeout(close, 140); };

  useEffect(() => {
    if (!openId) return;
    const onDown = (e: MouseEvent) => { if (!wrapRef.current?.contains(e.target as Node)) close(); };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [openId]);

  useEffect(() => close(), [pathname]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <div ref={wrapRef} className="relative hidden items-center gap-1 md:flex" onMouseLeave={leave} onMouseEnter={() => window.clearTimeout(timer.current)}>
      {groups.map((g) => {
        const isOpen = openId === g.id;
        const hasActive = g.entries.some((e) => isActive(e, pathname));
        const focused = g.entries.find((e) => e.label === hover) ?? g.entries[0];
        return (
          <div key={g.id} onMouseEnter={() => enter(g.id)}>
            <button
              type="button"
              aria-haspopup="true"
              aria-expanded={isOpen}
              onClick={() => (isOpen ? close() : enter(g.id))}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors motion-reduce:transition-none ${focusRing} ${
                isOpen || hasActive ? 'text-[#e8b74a]' : `${theme.muted} hover:text-[#e8b74a]`
              }`}
            >
              {g.label}
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 motion-reduce:transition-none ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* dropdown panel */}
            <div
              className={`absolute left-1/2 top-full z-50 w-[min(720px,92vw)] -translate-x-1/2 pt-3 transition duration-200 ease-out motion-reduce:transition-none ${
                isOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0'
              }`}
            >
              <div className={`grid grid-cols-[1fr_1.05fr] overflow-hidden rounded-2xl border shadow-2xl ${theme.card}`}>
                {/* left: list */}
                <div className={`border-r p-5 ${theme.divider}`}>
                  <p className="mb-3 px-2 text-sm font-semibold text-[#e8b74a]">{g.label}</p>
                  <ul className="space-y-1">
                    {g.entries.map((e) => {
                      const active = isActive(e, pathname);
                      return (
                        <li key={e.label}>
                          <button
                            type="button"
                            tabIndex={isOpen ? 0 : -1}
                            onMouseEnter={() => setHover(e.label)}
                            onFocus={() => setHover(e.label)}
                            onClick={() => run(e, close)}
                            className={`group flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-[#e8b74a]/10 motion-reduce:transition-none ${focusRing}`}
                          >
                            <span
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors group-hover:border-[#e8b74a]/60 group-hover:text-[#e8b74a] ${theme.divider} ${
                                active ? 'border-[#e8b74a]/60 text-[#e8b74a]' : theme.muted
                              }`}
                            >
                              {e.icon}
                            </span>
                            <span className="min-w-0">
                              <span className={`block text-sm font-semibold ${active ? 'text-[#e8b74a]' : theme.text}`}>{e.label}</span>
                              <span className={`block truncate text-xs ${theme.muted}`}>{e.desc}</span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* right: context panel */}
                <div className="flex flex-col justify-between gap-6 p-6">
                  <div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8b74a]/15 text-[#e8b74a]">
                      {focused.icon}
                    </div>
                    <h3 className={`mt-4 text-lg font-semibold ${theme.text}`}>{focused.label}</h3>
                    <p className={`mt-1 text-sm ${theme.muted}`}>{focused.desc}</p>
                    <p className={`mt-5 text-sm leading-relaxed ${theme.muted}`}>{g.tagline}</p>
                  </div>

                  {g.id === 'account' && (
                    <div className={`flex items-center gap-3 border-t pt-4 ${theme.divider}`}>
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e8b74a] text-sm font-semibold text-[#080e1a]">
                        {initials}
                      </div>
                      <p className={`min-w-0 flex-1 truncate text-sm ${theme.muted}`}>{email}</p>
                      <button
                        type="button"
                        onClick={() => { close(); onLogout(); }}
                        aria-label="Log out"
                        tabIndex={isOpen ? 0 : -1}
                        className={`flex h-10 w-10 items-center justify-center rounded-full text-red-400 transition hover:bg-red-400/10 ${focusRing}`}
                      >
                        <LogOut className="h-[18px] w-[18px]" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}