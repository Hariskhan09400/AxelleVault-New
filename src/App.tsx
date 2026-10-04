import { lazy, Suspense } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';
import { Shield } from 'lucide-react';
import { Login } from './components/Login';
import { Profile } from './components/Profile';
import { Settings } from './components/Settings';
import { ForgotPassword } from './components/ForgotPassword';
import { ResetPassword } from './components/ResetPassword';
import { VerifyEmail } from './components/VerifyEmail';
import { useAuth } from './hooks/useAuth';
import { CyberHub } from './pages/CyberHub';
import { Portfolio } from './pages/Portfolio';
import { BlogPost } from './pages/BlogPost';
import { AccountLayout } from './pages/AccountLayout';
import { Privacy, Terms } from './pages/Legal';
import { Company } from './pages/Company';
import { useSafeNavigate } from './lib/navigation';

const Dashboard = lazy(() =>
  import('./components/Dashboard').then((module) => ({ default: module.Dashboard }))
);
const IPChat = lazy(() => import('./components/tools/ipchat'));
const DarkWebExposureChecker = lazy(() => import('./components/tools/DarkWebExposureChecker'));

/* One loading screen for everything, follows light/dark theme */
const Splash = () => (
  <div
    className="flex min-h-[100dvh] flex-col items-center justify-center gap-4"
    style={{ background: 'var(--av-page)', color: 'var(--av-text)' }}
  >
    <div className="relative flex h-12 w-12 items-center justify-center">
      <div
        className="absolute inset-0 animate-spin rounded-2xl border-2"
        style={{ borderColor: 'var(--av-border)', borderTopColor: 'var(--av-gold)' }}
      />
      <Shield className="h-5 w-5" style={{ color: 'var(--av-gold)' }} />
    </div>
    <p className="text-sm font-medium tracking-[0.2em] uppercase">Loading...</p>
  </div>
);

// Login chahiye: loading tak Splash, phir user ho to page, warna /login
const AuthGate = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  if (loading) return <Splash />;
  return user ? children : <Navigate to="/login" replace />;
};

// Sirf logged-out users ke liye: loading tak Splash, user ho to seedha home
const PublicOnly = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  if (loading) return <Splash />;
  return user ? <Navigate to="/home" replace /> : children;
};

const LoginPage = () => {
  const navigate = useSafeNavigate();
  return (
    <Login
      onToggleMode={() => navigate('/login')}
      onForgotPassword={() => navigate('/forgot-password')}
    />
  );
};

const ForgotPage = () => {
  const navigate = useSafeNavigate();
  return <ForgotPassword onBack={() => navigate('/login')} />;
};

const ComingSoon = () => {
  const navigate = useSafeNavigate();

  return (
    <div className="min-h-[100dvh] px-4 py-12" style={{ background: 'var(--av-page)', color: 'var(--av-text)' }}>
      <div className="av-card mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e8b74a]/15 text-[#e8b74a]">
          <Shield className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-black tracking-tight">Coming Soon</h1>
        <p className="av-muted mt-3 max-w-md">This tool is under development.</p>
        <button type="button" onClick={() => navigate('/home')} className="av-btn mt-2" style={{ maxWidth: '14rem' }}>
          Back to Home
        </button>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Splash />}>
        <Routes>
          <Route path="/login" element={<PublicOnly><LoginPage /></PublicOnly>} />

          <Route path="/" element={<AuthGate><Navigate to="/home" replace /></AuthGate>} />
          <Route path="/home" element={<AuthGate><CyberHub /></AuthGate>} />
          <Route path="/vault" element={<AuthGate><Dashboard /></AuthGate>} />
          <Route path="/app/:slug" element={<AuthGate><ComingSoon /></AuthGate>} />

          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/forgot-password" element={<PublicOnly><ForgotPage /></PublicOnly>} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<PublicOnly><VerifyEmail /></PublicOnly>} />

          <Route path="/dashboard" element={<AuthGate><Navigate to="/vault" replace /></AuthGate>} />

          {/* Header + footer wrapper. Profile/Settings need login, legal pages are public. */}
          <Route element={<AccountLayout />}>
            <Route path="/profile" element={<AuthGate><Profile /></AuthGate>} />
            <Route path="/settings" element={<AuthGate><Settings /></AuthGate>} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/company" element={<Navigate to="/company/about" replace />} />
            <Route path="/company/:section" element={<Company />} />
          </Route>

          <Route path="/tools" element={<AuthGate><Navigate to="/tools/ipchat" replace /></AuthGate>} />
          <Route path="/tools/ipchat" element={<AuthGate><IPChat /></AuthGate>} />
          <Route path="/tools/darkweb" element={<AuthGate><DarkWebExposureChecker /></AuthGate>} />
          <Route path="/tools/:toolId" element={<AuthGate><Dashboard /></AuthGate>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;