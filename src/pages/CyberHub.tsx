import { useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useHubTheme } from '../hooks/useHubTheme';
import { blogPosts } from '../data/blogPosts';
import { MobileMenu, DesktopNav } from './MobileMenu';
import { HeroHacker } from './HeroHacker';
import { LogoutConfirmModal } from '../components/LogoutConfirmModal';
import { SafeLink, useSafeNavigate } from '../lib/navigation';
import {
  ArrowUpRight,
  Eye,
  Menu,
  MessageCircle,
  Moon,
  Radio,
  Send,
  Shield,
  Sun,
  X,
} from 'lucide-react';

const TELEGRAM_URL = 'https://t.me/Axelle_vault';
const WHATSAPP_URL = `https://wa.me/917208428589?text=${encodeURIComponent('Hi, I found you on AxelleVault.')}`;

const heroStats = [
  { value: '5+', label: 'Security tools' },
  { value: '24/7', label: 'Monitored' },
  { value: 'Free', label: 'No paywalls' },
];

const offerItems = [
  { number: '01', title: 'Password Security', description: 'Generate ultra-strong passwords and manage your credentials safely.', linkLabel: 'Try Generator', href: '/vault' },
  { number: '02', title: 'Breach Detection', description: 'Check if your email or password has been exposed in a data breach.', linkLabel: 'Check Now', href: '/vault' },
  { number: '03', title: 'Phishing Defense', description: 'Detect suspicious links and phishing attempts before they reach you.', linkLabel: 'Scan Link', href: '/vault' },
  { number: '04', title: 'IP Intelligence', description: 'Trace and analyze any IP address for threats and geolocation data.', linkLabel: 'Lookup IP', href: '/vault' },
];

interface AppCard {
  id: string;
  icon: ReactNode;
  name: string;
  description: string;
  badge: 'live' | 'soon';
  route?: string; // app ke andar ka page
  href?: string; // bahar ka link (same tab me khulta hai, back dabane par wapas aa jaate hain)
}

const apps: AppCard[] = [
  { id: 'vault', icon: <Shield className="h-6 w-6" />, name: 'AxelleVault', description: 'Password generator, breach checker, phishing detector, IP intelligence and more.', badge: 'live', route: '/vault' },
  { id: 'securenet', icon: <Radio className="h-6 w-6" />, name: 'Axelle Sentinel', description: 'Network scanner and real-time threat monitor for your connections.', badge: 'live', href: 'https://axelle-essiential.vercel.app/' },
  { id: 'darkwatch', icon: <Eye className="h-6 w-6" />, name: 'Axelle Shield', description: 'Dark web monitoring — get alerted if your credentials surface online.', badge: 'soon' },
];

const focusRing = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e8b74a]';
const iconBtn = `flex h-10 w-10 touch-manipulation items-center justify-center rounded-full border transition duration-200 active:scale-90 motion-reduce:transition-none ${focusRing}`;
const eyebrow = 'text-[10px] font-semibold tracking-[0.25em] text-[#e8b74a]';
const textLink = `-ml-1 mt-5 inline-flex touch-manipulation items-center gap-1.5 rounded-lg px-1 py-2 text-sm font-semibold text-[#e8b74a] transition-opacity hover:opacity-75 active:opacity-60 ${focusRing}`;

export function CyberHub() {
  const { isDark, toggle, theme } = useHubTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useSafeNavigate();
  const location = useLocation();
  const reduce = useReducedMotion();
  const { user } = useAuth();

  useEffect(() => setMobileOpen(false), [location.pathname]);

  useEffect(() => {
    const target = (location.state as { scrollTo?: string } | null)?.scrollTo;
    if (!target) return;
    const t = setTimeout(() => document.getElementById(target)?.scrollIntoView({ behavior: 'auto' }), 50);
    return () => clearTimeout(t);
  }, [location.state]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Page behind the menu / popup should not scroll
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  // Rotating the phone or resizing to desktop closes the mobile menu
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setMobileOpen(false);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const askLogout = () => {
    setMobileOpen(false);
    setShowLogoutModal(true);
  };

  const openExternal = (url: string) => window.open(url, '_blank', 'noopener,noreferrer');
  const initials = user?.email ? user.email.charAt(0).toUpperCase() : 'U';

  // Card ka button: bahar ka link ho to same tab me kholo, warna app ke andar navigate karo
  const openApp = (app: AppCard) => {
    if (app.href) {
      window.location.assign(app.href);
      return;
    }
    if (app.route) navigate(app.route);
  };

  return (
    <div className={`min-h-[100dvh] overflow-x-hidden ${theme.page}`}>
      {/* Mobile menu backdrop */}
      <div
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 md:hidden ${
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <header className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-md ${theme.nav}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8">
          <SafeLink to="/home" className={`flex items-center gap-2.5 rounded-lg ${focusRing}`}>
            <Shield className="h-5 w-5 text-[#e8b74a]" />
            <span className="text-base font-bold tracking-tight">AxelleVault</span>
          </SafeLink>

          <DesktopNav
            theme={theme}
            email={user?.email}
            initials={initials}
            onLogout={askLogout}
            whatsappUrl={WHATSAPP_URL}
            telegramUrl={TELEGRAM_URL}
          />

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              onClick={toggle}
              className={`${iconBtn} ${theme.toggleBg}`}
            >
              <motion.span
                key={isDark ? 'sun' : 'moon'}
                initial={{ rotate: reduce ? 0 : -60, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="flex"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </motion.span>
            </button>

            <button
              type="button"
              aria-label="Chat on WhatsApp"
              onClick={() => openExternal(WHATSAPP_URL)}
              className={`${iconBtn} hidden border-[#e8b74a]/50 text-[#e8b74a] hover:bg-[#e8b74a]/10 md:flex`}
            >
              <MessageCircle className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Join our Telegram channel"
              onClick={() => openExternal(TELEGRAM_URL)}
              className={`${iconBtn} hidden border-[#e8b74a]/50 text-[#e8b74a] hover:bg-[#e8b74a]/10 md:flex`}
            >
              <Send className="h-4 w-4" />
            </button>

            <button
              type="button"
              title={user?.email ?? undefined}
              aria-label="Open profile"
              onClick={() => navigate('/profile')}
              className={`hidden h-9 w-9 items-center justify-center rounded-full bg-[#e8b74a] text-sm font-semibold text-[#080e1a] transition active:scale-90 md:flex ${focusRing}`}
            >
              {initials}
            </button>

            <button
              type="button"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((p) => !p)}
              className={`${iconBtn} md:hidden ${theme.toggleBg}`}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <MobileMenu
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          onLogout={askLogout}
          theme={theme}
          email={user?.email}
          initials={initials}
          whatsappUrl={WHATSAPP_URL}
          telegramUrl={TELEGRAM_URL}
        />
      </header>

      <main>
        <section className="mx-auto max-w-7xl px-5 pb-16 pt-28 sm:px-8 sm:pb-24 sm:pt-32">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className={eyebrow}>CYBER SECURITY PLATFORM</p>
              <h1 className="mt-5 text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
                <span className={theme.text}>Stay ahead of</span>
                <br />
                <span className="text-[#e8b74a]">every threat.</span>
              </h1>
              <p className={`mt-5 max-w-md text-base leading-7 ${theme.muted}`}>
                Tools, insights and intelligence — built for the modern web.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate('/vault')}
                  className={`inline-flex touch-manipulation items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 active:scale-[0.97] motion-reduce:transition-none ${focusRing} ${theme.primaryBtn}`}
                >
                  Explore Tools
                  <ArrowUpRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => openExternal(TELEGRAM_URL)}
                  className={`inline-flex touch-manipulation items-center justify-center gap-2 rounded-full border px-5 py-3.5 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 active:scale-[0.97] motion-reduce:transition-none ${focusRing} ${theme.outlineBtn}`}
                >
                  Join Telegram
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <HeroHacker />
          </div>

          <div className={`mt-14 grid grid-cols-3 gap-3 border-t pt-8 sm:gap-8 ${theme.divider}`}>
            {heroStats.map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold sm:text-3xl">{s.value}</p>
                <p className={`mt-1 text-xs sm:text-sm ${theme.muted}`}>{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="offer" className={`scroll-mt-20 border-t px-5 py-20 sm:px-8 sm:py-28 ${theme.divider}`}>
          <div className="mx-auto max-w-7xl">
            <p className={eyebrow}>WHAT WE OFFER</p>
            <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <h2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:w-1/2">
                One place to protect, detect and stay secure.
              </h2>
              <p className={`max-w-md text-base leading-7 lg:w-1/2 ${theme.muted}`}>
                Whether you are just starting out or managing a team&apos;s security, begin with the tool that fits your need.
              </p>
            </div>

            <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              {offerItems.map((item) => (
                <div key={item.number} className="flex flex-col">
                  <span className="font-mono text-xs text-[#e8b74a]">{item.number}</span>
                  <span className={`mt-3 block border-t ${theme.divider}`} />
                  <h3 className="mt-5 text-lg font-semibold">{item.title}</h3>
                  <p className={`mt-2 text-sm leading-6 ${theme.muted}`}>{item.description}</p>
                  <button type="button" onClick={() => navigate(item.href)} className={`${textLink} self-start`}>
                    {item.linkLabel}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="blog" className={`scroll-mt-20 border-t px-5 py-20 sm:px-8 sm:py-28 ${theme.divider}`}>
          <div className="mx-auto max-w-7xl">
            <p className={eyebrow}>LATEST INSIGHTS</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">From the blog</h2>

            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              {blogPosts.map((post) => (
                <article key={post.slug} className={`flex flex-col rounded-2xl border p-6 ${theme.card} ${theme.cardHover}`}>
                  <span className="inline-flex self-start rounded-full bg-[#e8b74a]/10 px-2.5 py-1 text-[10px] font-semibold text-[#e8b74a]">
                    {post.category}
                  </span>
                  <h3 className="mt-4 text-base font-bold leading-snug">{post.title}</h3>
                  <p className={`mt-3 text-sm leading-6 ${theme.muted}`}>{post.excerpt}</p>
                  <button type="button" onClick={() => navigate(`/blog/${post.slug}`)} className={`${textLink} self-start`}>
                    Read more
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={`border-t px-5 py-20 sm:px-8 sm:py-28 ${theme.divider}`}>
          <div className="mx-auto max-w-7xl">
            <p className={eyebrow}>SECURITY TOOLS</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">AxelleVault &amp; More</h2>
            <p className={`mt-3 max-w-md text-base leading-7 ${theme.muted}`}>
              A growing suite of security tools — free to use.
            </p>

            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {apps.map((app) => (
                <div key={app.id} className={`rounded-2xl border p-6 ${theme.card} ${theme.cardHover}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8b74a]/10 text-[#e8b74a]">
                      {app.icon}
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        app.badge === 'live' ? 'bg-[#4ade80]/10' : 'bg-[#e8b74a]/10'
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${app.badge === 'live' ? 'bg-[#4ade80]' : 'bg-[#e8b74a]'}`} />
                      <span className={app.badge === 'live' ? theme.green : 'text-[#e8b74a]'}>
                        {app.badge === 'live' ? 'Live' : 'Soon'}
                      </span>
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-bold">{app.name}</h3>
                  <p className={`mt-2 text-sm leading-6 ${theme.muted}`}>{app.description}</p>

                  {app.badge === 'live' && (app.route || app.href) ? (
                    <button
                      type="button"
                      onClick={() => openApp(app)}
                      className={`mt-6 inline-flex w-full touch-manipulation items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 active:scale-[0.98] motion-reduce:transition-none ${focusRing} ${theme.primaryBtn}`}
                    >
                      Open Tools
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className={`mt-6 inline-flex w-full items-center justify-center rounded-xl border px-4 py-3 text-sm font-semibold opacity-70 ${theme.divider} ${theme.muted}`}
                    >
                      Coming Soon
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#e8b74a] px-5 py-16 text-[#080e1a] sm:px-8">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="flex items-start gap-4">
              <Send className="mt-1 h-8 w-8 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Stay updated on Telegram</h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-[#080e1a]/80">
                  Security tips, breach alerts and platform updates.
                </p>
              </div>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <button
                type="button"
                onClick={() => openExternal(TELEGRAM_URL)}
                className="inline-flex touch-manipulation items-center justify-center gap-2 rounded-full bg-[#080e1a] px-6 py-3.5 text-sm font-semibold text-[#e8b74a] transition duration-200 hover:-translate-y-0.5 active:scale-[0.97] motion-reduce:transition-none"
              >
                Join Channel
                <ArrowUpRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => openExternal(WHATSAPP_URL)}
                className="inline-flex touch-manipulation items-center justify-center gap-2 rounded-full border border-[#080e1a]/40 px-6 py-3.5 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 hover:bg-[#080e1a]/10 active:scale-[0.97] motion-reduce:transition-none"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className={`border-t px-5 py-10 pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:px-8 ${theme.footer}`}>
        <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <Shield className="h-4 w-4 text-[#e8b74a]" />
            <span className="text-sm font-bold">AxelleVault</span>
          </div>
          <div className={`flex flex-wrap items-center gap-x-5 gap-y-2 text-sm ${theme.muted}`}>
            <SafeLink to="/portfolio" className="hover:underline">Portfolio</SafeLink>
            <SafeLink to="/company/about" className="hover:underline">Company</SafeLink>
            <SafeLink to="/privacy" className="hover:underline">Privacy</SafeLink>
            <SafeLink to="/terms" className="hover:underline">Terms</SafeLink>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="hover:underline">Contact</a>
          </div>
        </div>

        <div className={`mx-auto mt-6 flex max-w-7xl flex-col gap-2 border-t pt-5 text-sm sm:flex-row sm:items-center sm:justify-between ${theme.divider} ${theme.muted}`}>
          <p>© 2026 AxelleVault. All rights reserved.</p>
          <p>Encrypted &amp; Secure 🔒</p>
        </div>
      </footer>

      <LogoutConfirmModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} />
    </div>
  );
}