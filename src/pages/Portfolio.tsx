import { type ReactNode } from 'react';
import { ArrowLeft, ArrowUpRight, MessageCircle, Moon, Send, Shield, Sun } from 'lucide-react';
import { useHubTheme } from '../hooks/useHubTheme';
import { useSafeNavigate } from '../lib/navigation';

/* ✏️ EDIT ONLY THIS OBJECT: baaki page apne aap update ho jayega.
   Khali ('') chhodne par wo link/section dikhega hi nahi. */
const profile = {
  name: 'Haris Khan',
  role: 'BCA Computer System Student & Cybersecurity Learner',
  intro: 'Learning cybersecurity from the fundamentals, building web projects, and documenting the journey to help other beginners.',
  location: 'India',
  about: [
    'Cybersecurity is an area that I have been genuinely interested in and want to build my career in. As a BCA Computer System student, I started exploring cybersecurity to understand how websites, applications, networks, and systems can be protected from real-world security threats.',
    'I am learning networking fundamentals (OSI model, TCP/IP, DNS, DHCP), working with Kali Linux, VirtualBox, Termux, Wireshark and Nmap, studying web application security, and focusing on Python for automation and security tools.',
    'My long-term goal is to build a cybersecurity company that helps businesses secure their websites and applications, working in vulnerability assessment, penetration testing, web security and security awareness.',
  ],
  why: [
    'I learn best by building. While studying web security (authentication, secure login systems, input validation, APIs and databases), I wanted a real project where I could apply these ideas instead of only reading about them.',
    'AxelleVault is that project: a free platform with practical security tools, built to help beginners protect their accounts. It is also where I document what I learn, and this is just the beginning.',
  ],
  project: {
    name: 'AxelleVault',
    status: 'Live',
    summary: 'A free cyber security platform with everyday tools to protect your accounts and data.',
    features: [
      'Password generator and credential safety',
      'Data breach checker for emails and passwords',
      'Phishing link detection',
      'IP intelligence and geolocation lookup',
      'Dark web exposure checker',
    ],
    stack: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Supabase', 'Framer Motion'],
  },
  links: {
    whatsapp: 'https://wa.me/917208428589',
    telegram: 'https://t.me/Axelle_vault',
    email: '',
    github: '',
    linkedin: '',
  },
};

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="border-t border-current/10 py-10 sm:py-14">
    <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
    <div className="mt-5">{children}</div>
  </section>
);

export function Portfolio() {
  const navigate = useSafeNavigate();
  const { isDark, toggle, theme } = useHubTheme();
  const { links, project } = profile;
  const initials = profile.name.trim().charAt(0).toUpperCase() || 'A';

  const contactLinks = [
    { label: 'WhatsApp', href: links.whatsapp, icon: <MessageCircle className="h-4 w-4" /> },
    { label: 'Telegram', href: links.telegram, icon: <Send className="h-4 w-4" /> },
    { label: 'Email', href: links.email && `mailto:${links.email}`, icon: <ArrowUpRight className="h-4 w-4" /> },
    { label: 'GitHub', href: links.github, icon: <ArrowUpRight className="h-4 w-4" /> },
    { label: 'LinkedIn', href: links.linkedin, icon: <ArrowUpRight className="h-4 w-4" /> },
  ].filter((l) => l.href);

  return (
    <div className={`min-h-[100dvh] overflow-x-hidden ${theme.page}`}>
      <header className={`sticky top-0 z-40 border-b backdrop-blur-md ${theme.nav}`}>
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3.5 pt-[max(0.875rem,env(safe-area-inset-top))]">
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="inline-flex touch-manipulation items-center gap-2 rounded-full py-2 pr-3 text-sm font-medium active:opacity-60"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <button
            type="button"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={toggle}
            className={`flex h-10 w-10 touch-manipulation items-center justify-center rounded-full border transition duration-200 active:scale-90 ${theme.toggleBg}`}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 pb-16 pt-10 sm:pt-16">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#e8b74a] text-2xl font-black text-[#080e1a] sm:h-20 sm:w-20 sm:text-3xl">
            {initials}
          </div>
          <div className="min-w-0">
            <h1 className="break-words text-3xl font-black tracking-tight sm:text-5xl">{profile.name}</h1>
            <p className="mt-1 text-sm font-semibold text-[#e8b74a] sm:text-base">{profile.role}</p>
          </div>
        </div>
        <p className={`mt-6 max-w-xl text-base leading-7 ${theme.muted}`}>{profile.intro}</p>
        {profile.location && <p className={`mt-2 text-sm ${theme.muted}`}>{profile.location}</p>}

        <div className="mt-6 flex flex-wrap gap-3">
          {contactLinks.map((l) => (
            <a
              key={l.label}
              href={l.href as string}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex touch-manipulation items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition duration-200 active:scale-95 ${theme.outlineBtn}`}
            >
              {l.icon}
              {l.label}
            </a>
          ))}
        </div>

        <div className="mt-10">
          <Section title="About me">
            <div className={`space-y-4 text-base leading-7 ${theme.muted}`}>
              {profile.about.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </Section>

          <Section title={`Why I built ${project.name}`}>
            <div className="space-y-4 border-l-2 border-[#e8b74a] pl-5 text-base leading-7">
              {profile.why.map((p, i) => <p key={i} className={theme.muted}>{p}</p>)}
            </div>
          </Section>

          <Section title="Project details">
            <div className={`rounded-2xl border p-5 sm:p-6 ${theme.card}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8b74a]/10 text-[#e8b74a]">
                    <Shield className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold">{project.name}</h3>
                </div>
                <span className={`inline-flex items-center gap-1.5 rounded-full bg-[#4ade80]/10 px-2.5 py-1 text-xs font-semibold ${theme.green}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#4ade80]" />
                  {project.status}
                </span>
              </div>
              <p className={`mt-4 text-sm leading-6 ${theme.muted}`}>{project.summary}</p>

              <ul className="mt-5 space-y-2.5 text-sm">
                {project.features.map((f) => (
                  <li key={f} className="flex gap-2.5">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e8b74a]" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex flex-wrap gap-2">
                {project.stack.map((s) => (
                  <span key={s} className={`rounded-full border px-3 py-1 text-xs font-medium ${theme.divider} ${theme.muted}`}>
                    {s}
                  </span>
                ))}
              </div>

              <button
                type="button"
                onClick={() => navigate('/vault')}
                className={`mt-6 inline-flex w-full touch-manipulation items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold transition duration-200 active:scale-[0.98] sm:w-auto ${theme.primaryBtn}`}
              >
                Open {project.name}
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </Section>

          <Section title="My journey">
            <p className={`text-base leading-7 ${theme.muted}`}>
              The full story of how I started, what I am learning and where I am heading.
            </p>
            <button
              type="button"
              onClick={() => navigate('/blog/my-cybersecurity-journey')}
              className={`mt-5 inline-flex touch-manipulation items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition duration-200 active:scale-95 ${theme.outlineBtn}`}
            >
              Read my cybersecurity journey
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </Section>
        </div>
      </main>
    </div>
  );
}

export default Portfolio;