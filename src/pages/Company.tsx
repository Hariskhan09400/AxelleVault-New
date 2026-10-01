import { useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { MessageCircle, Send } from 'lucide-react';
import { SafeNavLink } from '../lib/navigation';

const WHATSAPP = `https://wa.me/917208428589?text=${encodeURIComponent('Hi, I have a question about AxelleVault.')}`;
const TELEGRAM = 'https://t.me/Axelle_vault';

type Block = { title: string; body?: string[]; list?: string[] };
type Page = { title: string; intro: string; blocks: Block[] };

const pages: Record<string, Page> = {
  about: {
    title: 'About AxelleVault',
    intro: 'AxelleVault is a free security toolkit that makes everyday protection simple: no paywalls, no jargon.',
    blocks: [
      {
        title: 'What you can do here',
        list: [
          'Generate strong passwords and keep encrypted notes.',
          'Check whether your email or password has appeared in a breach.',
          'Scan suspicious links for phishing signs.',
          'Look up an IP address and see what is known about it.',
          'Check your dark web exposure.',
        ],
      },
      {
        title: 'Why it exists',
        body: ['Good security habits should not depend on money or technical skill. AxelleVault puts the most useful checks in one place so anyone can use them in a minute.'],
      },
    ],
  },
  security: {
    title: 'Security',
    intro: 'How we protect your account, and what you control.',
    blocks: [
      {
        title: 'Protection built in',
        list: [
          'Your vault notes are stored encrypted.',
          'Sign in with email and password, or with Google.',
          'Changing your password signs you out, so you log in fresh.',
          'Changing your email needs confirmation from both your old and new inbox.',
        ],
      },
      {
        title: 'You stay in control',
        body: ['You can update your details in Profile, change credentials in Settings, and delete your account and all its data at any time.'],
      },
      {
        title: 'Found a vulnerability?',
        body: ['Please tell us privately using the contact options below, and give us time to fix it before sharing it publicly. We read every report.'],
      },
    ],
  },
  careers: {
    title: 'Careers',
    intro: 'AxelleVault is a young project and we are not hiring right now.',
    blocks: [
      {
        title: 'Want to help anyway?',
        body: ['If you enjoy testing, design, writing or security research and want to contribute, send us a message with a line about what you would like to work on.'],
      },
    ],
  },
  contact: {
    title: 'Contact',
    intro: 'Questions, feedback or a security report? Message us. We usually reply fastest on WhatsApp.',
    blocks: [],
  },
};

const tabs = [
  ['about', 'About'],
  ['security', 'Security'],
  ['careers', 'Careers'],
  ['contact', 'Contact'],
] as const;

export const Company = () => {
  const { section = 'about' } = useParams();
  const page = pages[section];

  useEffect(() => {
    if (page) document.title = `${page.title} · AxelleVault`;
    window.scrollTo(0, 0);
  }, [page]);

  if (!page) return <Navigate to="/company/about" replace />;

  return (
    <div className="av-wrap" style={{ maxWidth: '42rem' }}>
      <nav aria-label="Company" className="flex flex-wrap gap-1">
        {tabs.map(([key, label]) => (
          <SafeNavLink key={key} to={`/company/${key}`} className={({ isActive }) => `av-nav-link${isActive ? ' is-active' : ''}`}>
            {label}
          </SafeNavLink>
        ))}
      </nav>

      <article className="av-card av-prose" style={{ margin: 0 }}>
        <h1>{page.title}</h1>
        <p className="av-muted">{page.intro}</p>

        {page.blocks.map((b) => (
          <section key={b.title}>
            <h2>{b.title}</h2>
            {b.body?.map((p) => <p key={p}>{p}</p>)}
            {b.list && <ul>{b.list.map((li) => <li key={li}>{li}</li>)}</ul>}
          </section>
        ))}

        {(section === 'contact' || section === 'careers' || section === 'security') && (
          <div className="av-form av-contact-actions" style={{ marginTop: '1.5rem' }}>
            <a className="av-btn" href={WHATSAPP} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <MessageCircle className="w-4 h-4" />
              Message on WhatsApp
            </a>
            <a
              className="av-btn"
              href={TELEGRAM}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none', background: 'var(--av-surface-2)', color: 'var(--av-text)', borderColor: 'var(--av-border)' }}
            >
              <Send className="w-4 h-4" />
              Join Telegram channel
            </a>
          </div>
        )}
      </article>
    </div>
  );
};