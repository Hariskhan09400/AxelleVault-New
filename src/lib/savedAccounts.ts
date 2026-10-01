// Sirf naam + email yaad rakhta hai — password KABHI yahan store nahi hota.
// Key ka naam 'axellevault' ya 'av_' se shuru nahi hota, taaki AuthContext ka
// clearAllStorage() (jo logout par 'axellevault'/'av_' wali keys hataata hai)
// ise galti se na mita de.
export interface SavedAccount {
  username: string | null;
  email: string;
}

const STORAGE_KEY = 'saved_login_accounts';
const MAX_ACCOUNTS = 5;

export const getSavedAccounts = (): SavedAccount[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const rememberAccount = (account: SavedAccount) => {
  const trimmedEmail = account.email.trim().toLowerCase();
  if (!trimmedEmail) return;

  const existing = getSavedAccounts().filter(
    (a) => a.email.toLowerCase() !== trimmedEmail,
  );
  const next = [{ username: account.username, email: trimmedEmail }, ...existing].slice(0, MAX_ACCOUNTS);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (error) {
    console.warn('[SavedAccounts] could not save:', error);
  }
};

export const forgetAccount = (email: string) => {
  const trimmedEmail = email.trim().toLowerCase();
  const next = getSavedAccounts().filter((a) => a.email.toLowerCase() !== trimmedEmail);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (error) {
    console.warn('[SavedAccounts] could not remove:', error);
  }
};