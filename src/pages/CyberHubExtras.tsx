// Static, lightweight CyberHub learning sections; local checklist state resets on refresh.
import { useState } from 'react';
import { AlertCircle, Check, ChevronRight, Compass, ShieldCheck, Sparkles } from 'lucide-react';
import { SafeLink } from '../lib/navigation';

interface CyberHubExtrasProps {
  isDark: boolean;
}

const tips = [
  {
    title: 'Use a unique password for every account',
    detail: 'A password manager makes unique, long passwords practical and limits the impact of a breach.',
  },
  {
    title: 'Turn on multi-factor authentication',
    detail: 'Prefer an authenticator app or passkey where available, especially for email and financial accounts.',
  },
  {
    title: 'Pause before opening unexpected links',
    detail: 'Check the full domain and reach sensitive services through a saved bookmark instead of a message link.',
  },
  {
    title: 'Install security updates promptly',
    detail: 'Updates close known vulnerabilities in your browser, operating system, and everyday applications.',
  },
  {
    title: 'Keep a separate, recoverable backup',
    detail: 'Back up important files and verify that you can restore them before an emergency occurs.',
  },
  {
    title: 'Review account recovery options',
    detail: 'Keep recovery email addresses and phone numbers current, and store backup codes somewhere safe.',
  },
  {
    title: 'Use trusted networks for sensitive tasks',
    detail: 'Avoid entering credentials on unfamiliar shared devices and sign out when a session is complete.',
  },
];

const threatNotes = [
  {
    tag: 'PHISHING',
    title: 'Unexpected account-security messages',
    detail: 'Attackers imitate support teams to create urgency. Open the official app or website directly instead.',
  },
  {
    tag: 'CREDENTIALS',
    title: 'Reused passwords increase account risk',
    detail: 'A password exposed by one service may be tried against other sites. Replace reused passwords first.',
  },
  {
    tag: 'DEVICE SAFETY',
    title: 'Out-of-date software can miss protections',
    detail: 'Enable automatic updates for your operating system, browser, and security-critical applications.',
  },
];

const roadmap = [
  { level: 'Beginner', title: 'Build safe everyday habits', topics: 'Passwords, MFA, updates, backups, and phishing awareness.' },
  { level: 'Intermediate', title: 'Understand your digital footprint', topics: 'Account recovery, privacy settings, breach response, and secure Wi-Fi.' },
  { level: 'Advanced', title: 'Practice defensive analysis', topics: 'DNS and IP basics, security headers, threat triage, and incident notes.' },
];

const checklist = [
  'I use unique passwords for important accounts',
  'I have enabled MFA on my email account',
  'My phone, computer, and browser are up to date',
  'I know how to recover access to my accounts',
  'Important files have a separate backup',
];

const tools = [
  { name: 'Password Generator', description: 'Create a strong, unique password.', to: '/tools/password-generator' },
  { name: 'Phishing Detector', description: 'Review a link for common warning signs.', to: '/tools/phishing-detector' },
  { name: 'IP Intelligence', description: 'Inspect IP and network details.', to: '/tools/ip-intelligence' },
  { name: 'Email Breach Checker', description: 'Check an email against breach data.', to: '/tools/email-breach' },
];

export function CyberHubExtras({ isDark }: CyberHubExtrasProps) {
  const [checked, setChecked] = useState<boolean[]>(() => checklist.map(() => false));
  const panel = isDark
    ? 'border-[#263954] bg-[#0f1c30] text-[#f0ede6]'
    : 'border-[#e4ddc9] bg-white text-[#0b1f3d]';
  const muted = isDark ? 'text-[#a1aec2]' : 'text-[#6f6858]';
  const inset = isDark ? 'border-[#263954] bg-[#14243a]' : 'border-[#e4ddc9] bg-[#f8f5ee]';
  const todayIndex = Math.floor(Date.now() / 86_400_000) % tips.length;
  const todayTip = tips[todayIndex];

  const toggleCheck = (index: number) => {
    setChecked((current) => current.map((value, itemIndex) =>
      itemIndex === index ? !value : value
    ));
  };

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-5 py-14 sm:px-8 sm:py-20">
      <section aria-labelledby="daily-security-tip">
        <div className="mb-5 flex items-center gap-2 text-[#b88420] dark:text-[#e8b74a]">
          <Sparkles aria-hidden="true" className="h-4 w-4" />
          <p className="text-[10px] font-semibold tracking-[0.25em]">SECURITY TIP OF THE DAY</p>
        </div>
        <article className={`rounded-2xl border p-5 shadow-sm sm:p-7 ${panel}`}>
          <h2 id="daily-security-tip" className="text-xl font-bold sm:text-2xl">{todayTip.title}</h2>
          <p className={`mt-2 max-w-3xl text-sm leading-6 sm:text-base ${muted}`}>{todayTip.detail}</p>
        </article>
      </section>

      <section aria-labelledby="threat-watch-title">
        <div className="mb-5 flex items-center gap-2 text-[#b88420] dark:text-[#e8b74a]">
          <AlertCircle aria-hidden="true" className="h-4 w-4" />
          <p className="text-[10px] font-semibold tracking-[0.25em]">THREAT WATCH</p>
        </div>
        <h2 id="threat-watch-title" className="mb-5 text-2xl font-bold">Common security risks to watch for</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {threatNotes.map((note) => (
            <article key={note.tag} className={`rounded-2xl border p-5 ${panel}`}>
              <span className="text-[10px] font-bold tracking-[0.18em] text-[#b88420] dark:text-[#e8b74a]">{note.tag}</span>
              <h3 className="mt-3 text-base font-bold">{note.title}</h3>
              <p className={`mt-2 text-sm leading-6 ${muted}`}>{note.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="learning-roadmap-title">
        <div className="mb-5 flex items-center gap-2 text-[#b88420] dark:text-[#e8b74a]">
          <Compass aria-hidden="true" className="h-4 w-4" />
          <p className="text-[10px] font-semibold tracking-[0.25em]">LEARNING ROADMAP</p>
        </div>
        <h2 id="learning-roadmap-title" className="mb-5 text-2xl font-bold">Learn at your own pace</h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {roadmap.map((step, index) => (
            <li key={step.level} className={`rounded-2xl border p-5 ${panel}`}>
              <p className="text-xs font-semibold text-[#b88420] dark:text-[#e8b74a]">0{index + 1} · {step.level}</p>
              <h3 className="mt-3 text-lg font-bold">{step.title}</h3>
              <p className={`mt-2 text-sm leading-6 ${muted}`}>{step.topics}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="security-checklist-title">
        <div className="mb-5 flex items-center gap-2 text-[#b88420] dark:text-[#e8b74a]">
          <ShieldCheck aria-hidden="true" className="h-4 w-4" />
          <p className="text-[10px] font-semibold tracking-[0.25em]">QUICK SECURITY CHECKLIST</p>
        </div>
        <div className={`rounded-2xl border p-5 sm:p-7 ${panel}`}>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <h2 id="security-checklist-title" className="text-xl font-bold">Small steps, stronger accounts</h2>
            <p className={`text-sm ${muted}`}>{checked.filter(Boolean).length} of {checklist.length} complete</p>
          </div>
          <ul className="space-y-2">
            {checklist.map((item, index) => (
              <li key={item}>
                <label className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 ${inset}`}>
                  <input
                    type="checkbox"
                    checked={checked[index]}
                    onChange={() => toggleCheck(index)}
                    className="h-4 w-4 accent-[#b88420] dark:accent-[#e8b74a]"
                  />
                  <span className={`flex-1 text-sm ${checked[index] ? muted : ''}`}>{item}</span>
                  {checked[index] && <Check aria-label="Complete" className="h-4 w-4 text-[#3f7d58] dark:text-[#4ade80]" />}
                </label>
              </li>
            ))}
          </ul>
          <p className={`mt-3 text-xs ${muted}`}>Checklist progress stays on this page and is not saved to your account.</p>
        </div>
      </section>

      <section aria-labelledby="tool-directory-title">
        <div className="mb-5 flex items-center gap-2 text-[#b88420] dark:text-[#e8b74a]">
          <ShieldCheck aria-hidden="true" className="h-4 w-4" />
          <p className="text-[10px] font-semibold tracking-[0.25em]">TOOL DIRECTORY</p>
        </div>
        <h2 id="tool-directory-title" className="mb-5 text-2xl font-bold">Choose a tool to get started</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {tools.map((tool) => (
            <SafeLink
              key={tool.to}
              to={tool.to}
              className={`group rounded-2xl border p-5 transition-colors hover:border-[#b88420] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b88420] dark:hover:border-[#e8b74a] dark:focus-visible:outline-[#e8b74a] ${panel}`}
            >
              <h3 className="font-bold">{tool.name}</h3>
              <p className={`mt-2 text-sm leading-6 ${muted}`}>{tool.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#95680e] dark:text-[#e8b74a]">
                Open tool <ChevronRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </SafeLink>
          ))}
        </div>
      </section>
    </div>
  );
}
