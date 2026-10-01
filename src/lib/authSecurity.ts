export const sanitizeEmail = (email: string) => email.trim().toLowerCase();

export const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const createToken = (bytes = 32) => {
  const random = new Uint8Array(bytes);
  crypto.getRandomValues(random);
  return Array.from(random)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};

export const hashToken = async (token: string) => {
  const text = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest('SHA-256', text);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};

export const isStrongPassword = (password: string) => password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password);

export const getDeviceId = () => {
  const storageKey = 'axellevault_device_id';
  const existing = localStorage.getItem(storageKey);
  if (existing) return existing;

  const fingerprint = `${crypto.randomUUID ? crypto.randomUUID() : createToken(16)}-${Date.now()}`;
  localStorage.setItem(storageKey, fingerprint);
  return fingerprint;
};
