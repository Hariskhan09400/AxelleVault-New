import { useCallback, useSyncExternalStore } from 'react';

const KEY = 'av_theme';
type Mode = 'dark' | 'light';
const t = 'transition-colors duration-300 motion-reduce:transition-none';

const darkTheme = {
  page: `bg-[#080e1a] text-[#f0ede6] ${t}`,
  nav: `bg-[#080e1a]/90 border-[#1a2d4a] ${t}`,
  card: `bg-[#0f1c30] border-[#1a2d4a] ${t}`,
  cardHover: 'hover:border-[#e8b74a]/40',
  muted: `text-[#8a9ab5] ${t}`,
  text: `text-[#f0ede6] ${t}`,
  divider: `border-[#1a2d4a] ${t}`,
  green: 'text-[#4ade80]',
  footer: `bg-[#050a12] border-[#1a2d4a] ${t}`,
  toggleBg: `bg-[#0f1c30] border-[#1a2d4a] text-[#e8b74a] ${t}`,
  primaryBtn: 'bg-[#e8b74a] text-[#080e1a]',
  outlineBtn: 'border-[#e8b74a]/40 text-[#f0ede6] hover:bg-[#e8b74a]/10',
};

const lightTheme = {
  page: `bg-[#f4f1ea] text-[#0b1f3d] ${t}`,
  nav: `bg-[#f4f1ea]/90 border-[#e4ddc9] ${t}`,
  card: `bg-white border-[#e4ddc9] ${t}`,
  cardHover: 'hover:border-[#e8b74a]/60',
  muted: `text-[#6f6858] ${t}`, // darker than before: better readability on cream
  text: `text-[#0b1f3d] ${t}`,
  divider: `border-[#e4ddc9] ${t}`,
  green: 'text-[#3f7d58]',
  footer: `bg-[#e8e2d6] border-[#e4ddc9] ${t}`,
  toggleBg: `bg-white border-[#e4ddc9] text-[#0b1f3d] ${t}`,
  primaryBtn: 'bg-[#0b1f3d] text-[#f4f1ea]',
  outlineBtn: 'border-[#0b1f3d]/20 text-[#0b1f3d] hover:bg-[#0b1f3d]/5',
};

const isBrowser = typeof window !== 'undefined';

const read = (): Mode => {
  try {
    return localStorage.getItem(KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
};

const apply = (m: Mode) => {
  const el = document.documentElement;
  el.dataset.theme = m;
  el.classList.toggle('dark', m === 'dark');
  el.style.colorScheme = m;
};

// ---- single shared store (every component sees the same theme) ----
let mode: Mode = isBrowser ? read() : 'dark';
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

if (isBrowser) {
  apply(mode); // runs at import time, before first paint of React tree

  // keep multiple browser tabs in sync
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    const next = read();
    if (next === mode) return;
    mode = next;
    apply(next);
    emit();
  };
  window.addEventListener('storage', onStorage);

  if (import.meta.hot) {
    import.meta.hot.dispose(() => window.removeEventListener('storage', onStorage));
  }
}

const setMode = (next: Mode) => {
  if (next === mode) return;
  mode = next;
  apply(next);
  try {
    localStorage.setItem(KEY, next);
  } catch {
    /* storage blocked: theme still works for this visit */
  }
  emit();
};

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};

export function useHubTheme() {
  const current = useSyncExternalStore(subscribe, () => mode, () => 'dark' as Mode);
  const isDark = current === 'dark';
  const toggle = useCallback(() => setMode(mode === 'dark' ? 'light' : 'dark'), []);
  return { isDark, toggle, theme: isDark ? darkTheme : lightTheme };
}