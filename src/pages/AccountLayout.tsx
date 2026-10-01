import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { LogOut, Moon, Settings as Cog, Shield, Sun, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useHubTheme } from '../hooks/useHubTheme';
import { LogoutConfirmModal } from '../components/LogoutConfirmModal';
import { SafeLink, SafeNavLink } from '../lib/navigation';

export const AccountLayout = () => {
  const { user } = useAuth();
  const { isDark, toggle } = useHubTheme();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const link = ({ isActive }: { isActive: boolean }) => `av-nav-link${isActive ? ' is-active' : ''}`;

  return (
    <div className="av-shell">
      <header className="av-bar">
        <div className="av-bar-in">
          <SafeLink to="/home" className="av-brand" aria-label="Back to AxelleVault home">
            <Shield className="av-icon" />
            <span>AxelleVault</span>
          </SafeLink>

          <nav className="av-bar-actions" aria-label="Account">
            {user && (
              <>
                <SafeNavLink to="/profile" className={link}>
                  <User className="w-4 h-4" />
                  <span className="av-hide-sm">Profile</span>
                </SafeNavLink>
                <SafeNavLink to="/settings" className={link}>
                  <Cog className="w-4 h-4" />
                  <span className="av-hide-sm">Settings</span>
                </SafeNavLink>
              </>
            )}

            <button
              type="button"
              className="av-icon-btn"
              onClick={toggle}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {user && (
              <button type="button" className="av-icon-btn av-icon-btn--danger" onClick={() => setShowLogoutModal(true)} aria-label="Log out">
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="av-main">
        <Outlet />
      </main>

      <footer className="av-foot">
        <span>© 2026 AxelleVault</span>
        <SafeLink to="/privacy">Privacy</SafeLink>
        <SafeLink to="/terms">Terms</SafeLink>
      </footer>

      <LogoutConfirmModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} />
    </div>
  );
};