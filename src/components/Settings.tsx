import { useState } from 'react';
import { Shield, Key, Trash2, AlertTriangle, Mail, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../contexts/ToastContext';
import { useSafeNavigate } from '../lib/navigation';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const strength = (pw: string) => {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 4);
};
const STRENGTH_LABEL = ['Too weak', 'Weak', 'Okay', 'Strong', 'Very strong'];

const PasswordInput = ({
  id, label, value, onChange, autoComplete,
}: {
  id: string; label: string; value: string;
  onChange: (v: string) => void; autoComplete: string;
}) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="av-label" htmlFor={id}>{label}</label>
      <div className="av-field">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          className="av-input"
          required
        />
        <button
          type="button"
          className="av-eye"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

export const Settings = () => {
  const { user, changePassword, updateEmail, deleteAccount, signOut } = useAuth();
  const { showToast } = useToast();
  const navigate = useSafeNavigate();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwBusy, setPwBusy] = useState(false);

  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailBusy, setEmailBusy] = useState(false);

  const [confirmText, setConfirmText] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [delBusy, setDelBusy] = useState(false);

  const score = strength(newPassword);
  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwBusy) return;
    if (newPassword.length < 8) return showToast('error', 'New password must be at least 8 characters.');
    if (newPassword !== confirmPassword) return showToast('error', 'New password and confirmation do not match.');
    if (newPassword === oldPassword) return showToast('error', 'New password must be different from the current one.');

    setPwBusy(true);
    try {
      const { error } = await changePassword(oldPassword, newPassword);
      if (error) {
        showToast('error', error.message || 'Password change failed.');
        return;
      }
      showToast('success', 'Password changed. Please sign in again.');
      await signOut();
      navigate('/login', { replace: true });
    } catch {
      showToast('error', 'Password update timed out or failed. Check your connection and try again.');
    } finally {
      setPwBusy(false);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailBusy) return;
    const email = newEmail.trim().toLowerCase();
    if (!EMAIL_RE.test(email)) return showToast('error', 'Enter a valid email address.');
    if (email === user?.email?.toLowerCase()) return showToast('error', 'That is already your email.');
    if (!emailPassword) return showToast('error', 'Enter your current password to confirm.');

    setEmailBusy(true);
    try {
      const { error } = await updateEmail(email, emailPassword);
      if (error) {
        showToast('error', error.message || 'Email change failed.');
        return;
      }
      showToast('success', 'Confirmation links sent to your old and new inbox.');
      setNewEmail('');
      setEmailPassword('');
    } catch {
      showToast('error', 'Email update timed out or failed. Check your connection and try again.');
    } finally {
      setEmailBusy(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE' || delBusy) return;
    setDelBusy(true);
    try {
      const { error } = await deleteAccount();
      if (error) {
        showToast('error', error.message || 'Could not delete the account.');
        return;
      }
      showToast('success', 'Account deleted.');
      navigate('/login', { replace: true });
    } catch {
      showToast('error', 'Network problem. Please try again.');
    } finally {
      setDelBusy(false);
    }
  };

  return (
    <div className="av-wrap">
      <section className="av-card">
        <div className="av-head">
          <Shield className="av-icon" />
          <h2>Change password</h2>
        </div>
        <p className="av-muted">
          Signed in as <strong>{user?.email || 'unknown'}</strong>. You'll be signed out after changing your password.
        </p>

        <form onSubmit={handleChangePassword} className="av-form">
          <PasswordInput id="old-pw" label="Current password" value={oldPassword} onChange={setOldPassword} autoComplete="current-password" />
          <div>
            <PasswordInput id="new-pw" label="New password" value={newPassword} onChange={setNewPassword} autoComplete="new-password" />
            {newPassword && (
              <>
                <div className="av-meter" aria-hidden="true"><i style={{ width: `${(score / 4) * 100}%` }} /></div>
                <p className="av-hint">{STRENGTH_LABEL[score]}. Use 12+ characters with numbers and symbols.</p>
              </>
            )}
          </div>
          <div>
            <PasswordInput id="confirm-pw" label="Confirm new password" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" />
            {mismatch && <p className="av-hint av-hint--bad">Passwords don't match yet.</p>}
          </div>
          <button type="submit" disabled={pwBusy || mismatch} className="av-btn">
            <Key className="w-4 h-4" />
            {pwBusy ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </section>

      <section className="av-card">
        <div className="av-head">
          <Mail className="av-icon" />
          <h2>Change email</h2>
        </div>
        <p className="av-muted">
          We'll send a link to both your current and new address. The change applies after you confirm.
        </p>

        <form onSubmit={handleChangeEmail} className="av-form" noValidate>
          <div>
            <label className="av-label" htmlFor="new-email">New email address</label>
            <input
              id="new-email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="new@example.com"
              autoComplete="email"
              className="av-input"
              required
            />
          </div>
          <PasswordInput id="email-pw" label="Current password" value={emailPassword} onChange={setEmailPassword} autoComplete="current-password" />
          <button type="submit" disabled={emailBusy} className="av-btn">
            <Mail className="w-4 h-4" />
            {emailBusy ? 'Sending…' : 'Send confirmation links'}
          </button>
        </form>
      </section>

      <section className="av-card av-card--danger">
        <div className="av-head">
          <AlertTriangle className="av-icon" style={{ color: 'var(--av-danger)' }} />
          <h2>Delete account</h2>
        </div>
        <p className="av-muted">
          This permanently removes your account, encrypted notes and history. It can't be undone.
        </p>

        {!showDelete ? (
          <button type="button" className="av-btn av-btn--danger" onClick={() => setShowDelete(true)}>
            <Trash2 className="w-4 h-4" />
            Delete my account
          </button>
        ) : (
          <div className="av-form">
            <div>
              <label className="av-label" htmlFor="del-confirm">Type DELETE to confirm</label>
              <input
                id="del-confirm"
                className="av-input"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                autoComplete="off"
              />
            </div>
            <button
              type="button"
              className="av-btn av-btn--danger"
              disabled={confirmText !== 'DELETE' || delBusy}
              onClick={handleDeleteAccount}
            >
              <Trash2 className="w-4 h-4" />
              {delBusy ? 'Deleting…' : 'Permanently delete'}
            </button>
            <button
              type="button"
              className="av-btn"
              style={{ background: 'var(--av-surface-2)', color: 'var(--av-text)', borderColor: 'var(--av-border)' }}
              onClick={() => { setShowDelete(false); setConfirmText(''); }}
            >
              Cancel
            </button>
          </div>
        )}
      </section>
    </div>
  );
};