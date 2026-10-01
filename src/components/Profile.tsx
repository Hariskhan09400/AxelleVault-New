import { useEffect, useMemo, useState } from 'react';
import { User, Save } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../contexts/ToastContext';

export const Profile = () => {
  const { user, profile, updateProfile, refreshProfile } = useAuth();
  const { showToast } = useToast();

  const savedName = profile?.full_name || '';
  const [fullName, setFullName] = useState(savedName);
  const [isSaving, setIsSaving] = useState(false);

  // Profile loads async: keep the input in sync once it arrives
  useEffect(() => {
    setFullName(profile?.full_name || '');
  }, [profile?.full_name]);

  const username = profile?.username || user?.email?.split('@')[0] || 'Anonymous';
  const trimmed = fullName.trim();
  const dirty = trimmed !== savedName.trim();
  const tooLong = trimmed.length > 80;
  const canSave = dirty && trimmed.length >= 2 && !tooLong && !isSaving;

  const initials = useMemo(() => {
    const src = trimmed || username;
    return src
      .split(/\s+/)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join('');
  }, [trimmed, username]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;

    setIsSaving(true);
    try {
      const { error } = await updateProfile(trimmed);
      if (error) {
        showToast('error', error.message || 'Could not update your profile.');
      } else {
        showToast('success', 'Profile updated.');
        await refreshProfile();
      }
    } catch {
      showToast('error', 'Network problem. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="av-wrap">
      <section className="av-card">
        <div className="av-head" style={{ marginBottom: '1.25rem' }}>
          <div className="av-avatar" aria-hidden="true">
            {initials || <User className="av-icon" style={{ color: 'inherit' }} />}
          </div>
          <div>
            <h1>{trimmed || username}</h1>
            <p className="av-muted" style={{ margin: 0 }}>{user?.email || 'unknown'}</p>
          </div>
        </div>

        <div className="av-stats">
          <div className="av-stat"><small>Username</small><span>{username}</span></div>
          <div className="av-stat"><small>Security score</small><span>{profile?.security_score ?? 0} / 100</span></div>
          <div className="av-stat"><small>Total logins</small><span>{profile?.total_logins ?? 0}</span></div>
        </div>

        <form onSubmit={handleSave} className="av-form" noValidate>
          <div>
            <label className="av-label" htmlFor="full-name">Full name</label>
            <input
              id="full-name"
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name as it appears on certificates"
              className="av-input"
              maxLength={90}
              aria-invalid={tooLong}
            />
            <p className={`av-hint ${tooLong ? 'av-hint--bad' : ''}`}>
              {tooLong ? 'Keep it under 80 characters.' : 'Shown on your profile. Minimum 2 characters.'}
            </p>
          </div>

          <button type="submit" disabled={!canSave} className="av-btn">
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving…' : dirty ? 'Save changes' : 'Saved'}
          </button>
        </form>
      </section>
    </div>
  );
};