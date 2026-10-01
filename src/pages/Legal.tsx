import { useEffect } from 'react';

const UPDATED = '29 September 2026';
const WHATSAPP = `https://wa.me/917208428589?text=${encodeURIComponent('Hi, I have a question about AxelleVault.')}`;
const TELEGRAM = 'https://t.me/Axelle_vault';

type Block = { title: string; body?: string[]; list?: string[] };

const Doc = ({ title, intro, blocks }: { title: string; intro: string; blocks: Block[] }) => {
  useEffect(() => {
    document.title = `${title} · AxelleVault`;
    window.scrollTo(0, 0);
  }, [title]);

  return (
    <article className="av-card av-prose">
      <h1>{title}</h1>
      <p className="av-muted">Last updated {UPDATED}</p>
      <p>{intro}</p>
      {blocks.map((b) => (
        <section key={b.title}>
          <h2>{b.title}</h2>
          {b.body?.map((p) => <p key={p}>{p}</p>)}
          {b.list && <ul>{b.list.map((li) => <li key={li}>{li}</li>)}</ul>}
        </section>
      ))}
      <section>
        <h2>Contact</h2>
        <p>
          Questions about this page? Message us on{' '}
          <a href={WHATSAPP} target="_blank" rel="noopener noreferrer">WhatsApp</a> or{' '}
          <a href={TELEGRAM} target="_blank" rel="noopener noreferrer">Telegram</a>.
        </p>
      </section>
    </article>
  );
};

export const Privacy = () => (
  <Doc
    title="Privacy Policy"
    intro="AxelleVault is a free security toolkit. This page explains what we store when you use it, why, and how you can remove it."
    blocks={[
      {
        title: 'What we collect',
        list: [
          'Account details: your email, username and the full name you choose to add.',
          'Sign-in method: email and password, or Google sign-in.',
          'Security activity: events such as sign-ins and password or email changes, used to calculate your security score and protect your account.',
          'Notes you save in the vault. These are stored encrypted.',
        ],
      },
      {
        title: 'What we do with it',
        list: [
          'Run your account and keep it secure.',
          'Show your profile, login count and security score.',
          'Send confirmation emails, for example when you change your email.',
        ],
        body: ['We do not sell your data and we do not show ads.'],
      },
      {
        title: 'Where it is stored',
        body: ['Account and vault data is hosted with our backend provider, Supabase. Google handles authentication if you choose Google sign-in.'],
      },
      {
        title: 'Tools that check things for you',
        body: ['Some tools, such as breach, phishing and IP lookups, send the value you enter to a third-party service to get a result. Do not enter information you are not comfortable sharing with such services.'],
      },
      {
        title: 'Your choices',
        list: [
          'Update your name in Profile at any time.',
          'Change your password or email in Settings.',
          'Delete your account in Settings. This removes your account, encrypted notes and history permanently.',
        ],
      },
      {
        title: 'Changes',
        body: ['If this policy changes, the date at the top will be updated.'],
      },
    ]}
  />
);

export const Terms = () => (
  <Doc
    title="Terms of Use"
    intro="By creating an account or using AxelleVault, you agree to these terms."
    blocks={[
      {
        title: 'Using the service',
        list: [
          'Use the tools only on accounts, devices and networks you own or have permission to test.',
          'Do not use AxelleVault for harassment, fraud, unauthorised access or anything illegal.',
          'Do not try to disrupt the service or access other users\u2019 data.',
        ],
      },
      {
        title: 'Your account',
        body: ['You are responsible for keeping your password safe and for activity on your account. Tell us quickly if you think it has been compromised.'],
      },
      {
        title: 'Results are guidance, not guarantees',
        body: ['Breach, phishing and IP results come from data sources that may be incomplete or out of date. A clean result does not prove something is safe.'],
      },
      {
        title: 'Availability',
        body: ['The service is free and provided as is. Tools may change, pause or be removed, and we cannot promise it will always be available.'],
      },
      {
        title: 'Ending your account',
        body: ['You can delete your account from Settings at any time. We may suspend accounts that break these terms.'],
      },
      {
        title: 'Changes',
        body: ['We may update these terms. Continuing to use AxelleVault after an update means you accept the new version.'],
      },
    ]}
  />
);