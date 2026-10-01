import { supabase } from './supabase';

// ─── Session policy ────────────────────────────────────────
// User tab tak logged in rehta hai jab tak:
//   1) wo khud logout na kare, ya
//   2) login ke 8 ghante poore na ho jayein (tab apne aap logout).
// Browser band karne / home page par jaane / app hatane se logout NAHI hota.

export const SESSION_MAX_MS = 8 * 60 * 60 * 1000;
export const LOGIN_AT_KEY = 'av_login_at';
export const EXPIRED_KEY = 'av_session_expired';
export const PERSIST_KEY = 'av_persist_session';
const ACTIVE_COOKIE = 'av_active_session'; // purana session cookie, ab sirf saaf karte hain

// Purane code ke saath compatible signature: argument ab ignore hota hai,
// kyunki session hamesha persistent rehta hai.
export const markSession = (_remember?: boolean) => {
  try {
    localStorage.setItem(PERSIST_KEY, '1');
    document.cookie = `${ACTIVE_COOKIE}=; Max-Age=0; path=/`;
  } catch { /* storage blocked ho to ignore */ }
};

const enforceSessionLimit = () => {
  try {
    const raw = localStorage.getItem(LOGIN_AT_KEY);
    if (!raw) return;
    const loginAt = Number(raw);
    if (!Number.isFinite(loginAt)) { localStorage.removeItem(LOGIN_AT_KEY); return; }
    if (Date.now() - loginAt >= SESSION_MAX_MS) {
      localStorage.removeItem(LOGIN_AT_KEY);
      localStorage.setItem(EXPIRED_KEY, '1');
      // 'local': sirf isi device ka session khatam, dusre devices ke 8 ghante alag chalte hain
      supabase.auth.signOut({ scope: 'local' });
    }
  } catch { /* ignore */ }
};

if (typeof window !== 'undefined' && !(window as any).__avSessionGuard) {
  (window as any).__avSessionGuard = true; // HMR / double import se bachne ke liye

  // Purane "Remember me nahi" wale flag / cookie ko saaf karo, taaki purane sessions bhi na udein
  try {
    if (localStorage.getItem(PERSIST_KEY) === '0') localStorage.setItem(PERSIST_KEY, '1');
    document.cookie = `${ACTIVE_COOKIE}=; Max-Age=0; path=/`;
  } catch { /* ignore */ }

  enforceSessionLimit(); // app khulte hi check

  supabase.auth.onAuthStateChange((event, session) => {
    try {
      // Manual logout: timer saaf
      if (event === 'SIGNED_OUT') { localStorage.removeItem(LOGIN_AT_KEY); return; }
      // Naya login: pehli baar login time save
      if (session && !localStorage.getItem(LOGIN_AT_KEY)) {
        localStorage.setItem(LOGIN_AT_KEY, String(Date.now()));
      }
    } catch { /* ignore */ }
  });

  setInterval(enforceSessionLimit, 60 * 1000); // tab khula ho tab bhi har minute check
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) enforceSessionLimit(); // phone me wapas aate hi check
  });
}