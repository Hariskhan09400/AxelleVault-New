import { ReactNode } from 'react';
import { Shield } from 'lucide-react';

interface AuthShellProps {
  headline: string;
  accent: string;
  description: string;
  children: ReactNode;
}

const Brand = ({ onDark = false }: { onDark?: boolean }) => (
  <div className="flex items-center gap-3">
    <div
      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
        onDark ? 'bg-white/10' : 'bg-[#0b1f3d]'
      }`}
    >
      <Shield className="h-5 w-5 text-[#e8b74a]" />
    </div>
    <span className={`text-lg font-bold tracking-tight ${onDark ? 'text-white' : 'text-[#0b1f3d]'}`}>
      AxelleVault
    </span>
  </div>
);

const Chip = ({ children }: { children: ReactNode }) => (
  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 font-mono text-[11px] text-white/80">
    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
    {children}
  </span>
);

export const AuthShell = ({ headline, accent, description, children }: AuthShellProps) => (
  <div className="min-h-[100dvh] bg-[#f4f1ea] text-[#0b1f3d] lg:grid lg:grid-cols-2">
    {/* Left brand panel: sirf desktop par */}
    <aside className="relative hidden overflow-hidden bg-[#0b1f3d] p-10 lg:flex lg:flex-col lg:justify-between xl:p-14">
      <div className="pointer-events-none absolute -right-40 -top-40 h-[28rem] w-[28rem] rounded-full border border-white/10" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full border border-white/10" />

      <div className="relative">
        <Brand onDark />
      </div>

      <div className="relative max-w-md">
        <h2 className="text-5xl font-extrabold leading-[1.08] tracking-tight text-white xl:text-6xl">
          {headline} <span className="text-[#e8b74a]">{accent}</span>
        </h2>
        <p className="mt-5 max-w-sm text-sm leading-6 text-white/70">{description}</p>
      </div>

      <div className="relative flex gap-3">
        <Chip>AES-256</Chip>
        <Chip>TLS 1.3</Chip>
      </div>
    </aside>

    {/* Right form panel */}
    <main className="flex min-h-[100dvh] flex-col px-5 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-10 lg:min-h-0">
      <div className="lg:hidden">
        <Brand />
      </div>

      <div className="flex flex-1 items-center justify-center py-8">
        <div className="w-full max-w-[26rem]">{children}</div>
      </div>

      <footer className="flex items-center justify-center gap-3 text-[11px] text-[#8a8272]">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
          Encrypted
        </span>
        <span>© 2026 AxelleVault</span>
      </footer>
    </main>
  </div>
);