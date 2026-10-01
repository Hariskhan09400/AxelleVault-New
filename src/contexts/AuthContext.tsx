import { createContext, useEffect, useState, ReactNode, useRef } from 'react';
import { AuthError, User } from '@supabase/supabase-js';
import { hasSupabaseEnv, supabase } from '../lib/supabase';
import { createToken, getDeviceId, hashToken, sanitizeEmail } from '../lib/authSecurity';
import { rememberAccount } from '../lib/savedAccounts';
import '../lib/sessionPolicy'; // 8 ghante session guard, app ke saath hamesha load

export interface UserLoginDetail {
  id: string;
  username: string | null;
  email: string;
  password_hash: string | null;
  role: string;
  security_score: number;
  total_logins: number;
  failed_attempts: number;
  login_history: Array<{ time: string; success: boolean }>;
  last_login: string | null;
  email_verified: boolean;
  created_at: string;
  updated_at: string | null;
}

const makeAuthError = (message: string): AuthError => ({
  name: 'AuthApiError',
  message,
} as AuthError);

// User ko wait karaye bina peeche chalne wale kaam (logging, bookkeeping)
const runInBackground = (task: () => Promise<unknown>) => {
  Promise.resolve()
    .then(task)
    .catch((err) => console.warn('[Auth] background task warning:', err));
};

const revokeUserSessions = async (userId: string, deviceId?: string) => {
  try {
    const now = new Date().toISOString();
    let query = supabase
      .from('sessions')
      .update({ revoked_at: now })
      .eq('user_id', userId)
      .is('revoked_at', null);

    // deviceId diya ho to sirf usi device ka session revoke hoga (normal logout),
    // nahi to sab devices ka (password change, account delete, "logout everywhere")
    if (deviceId) {
      query = query.eq('device_id', deviceId);
    }

    await query;
  } catch (error) {
    console.warn('[Auth] revokeUserSessions warning:', error);
  }
};

// Email verified flag sync + profile row (self-heal) — aur ab wahi row wapas bhi deta hai,
// taaki alag se fetchProfile ki ek aur request na lagni pade.
// knownUser mile to getUser() ki network call bach jaati hai.
const syncUserEmailVerification = async (
  userId: string,
  knownUser?: User | null,
): Promise<UserLoginDetail | null> => {
  try {
    let authUser: User | null = knownUser ?? null;

    if (!authUser) {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) return null;
      authUser = userData.user;
    }

    const emailVerified = !!authUser.email_confirmed_at;
    const now = new Date().toISOString();

    const { data: updated } = await supabase
      .from('user_login_detail')
      .update({ email_verified: emailVerified, updated_at: now })
      .eq('id', userId)
      .select('*');

    if (updated && updated.length > 0) {
      return updated[0] as UserLoginDetail;
    }

    // Safety net: signup ke time (bina session) profile row RLS se block ho gayi ho to
    // ab session hai, isliye yahan create kar do. Existing row ko touch nahi karta.
    const { data: inserted, error: insertError } = await supabase
      .from('user_login_detail')
      .insert({
        id: userId,
        username: (authUser.user_metadata?.username as string | undefined) ?? null,
        email: authUser.email ?? '',
        password_hash: null,
        role: 'free',
        security_score: 50,
        total_logins: 0,
        failed_attempts: 0,
        login_history: [],
        email_verified: emailVerified,
        created_at: now,
        last_login: now,
        updated_at: now,
      })
      .select('*')
      .maybeSingle();

    if (insertError) {
      console.warn('[Auth] profile self-heal insert warning:', insertError.message);
      return null;
    }

    return (inserted as UserLoginDetail | null) ?? null;
  } catch (error) {
    console.warn('[Auth] syncUserEmailVerification warning:', error);
    return null;
  }
};

export interface AuthContextType {
  user: User | null;
  profile: UserLoginDetail | null;
  loading: boolean;
  authError: string | null;
  signUp: (email: string, password: string, username: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  resendVerificationEmail: (email: string) => Promise<{ error: AuthError | null }>;
  signOut: (options?: { everywhere?: boolean; rememberLogin?: boolean }) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ error: AuthError | null }>;
  refreshProfile: () => Promise<void>;
  updateProfile: (fullName: string) => Promise<{ error: AuthError | null }>;
  updateEmail: (newEmail: string, currentPassword: string) => Promise<{ error: AuthError | null }>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ error: AuthError | null }>;
  deleteAccount: () => Promise<{ error: AuthError | null }>;
  userRole: string | null;
  isAdmin: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserLoginDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const isSigningUp = useRef(false);
  // Same user ka kaam do baar na ho (initSession + listener + tab focus par SIGNED_IN)
  const loadedUser = useRef<{ id: string; promise: Promise<void> } | null>(null);

  const applyProfile = (data: UserLoginDetail | null) => {
    setProfile(data);
    const role = data?.role ?? 'free';
    setUserRole(role);
    setIsAdmin(role === 'admin');
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_login_detail')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('[Auth] fetchProfile error:', error.message);
        return;
      }

      applyProfile((data as UserLoginDetail | null) ?? null);
    } catch (err) {
      console.error('[Auth] fetchProfile exception:', err);
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  const clearAllState = () => {
    loadedUser.current = null;
    setUser(null);
    setProfile(null);
    setUserRole(null);
    setIsAdmin(false);
    setAuthError(null);
  };

  const clearAllStorage = () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.includes('supabase') || key.includes('sb-') || key.includes('axellevault') || key.startsWith('av_')) {
        localStorage.removeItem(key);
      }
    });
    sessionStorage.clear();
  };

  // User + profile ek saath load: sync (1 request) -> agar row na mile to hi fetchProfile
  const loadUser = (u: User): Promise<void> => {
    if (loadedUser.current?.id === u.id) return loadedUser.current.promise;

    const promise = (async () => {
      const row = await syncUserEmailVerification(u.id, u);
      if (row) {
        setUser(u);
        applyProfile(row);
      } else {
        setUser(u);
        await fetchProfile(u.id);
      }
    })();

    loadedUser.current = { id: u.id, promise };
    return promise;
  };

  useEffect(() => {
    if (!hasSupabaseEnv) {
      setAuthError('Supabase not configured.');
      setLoading(false);
      return;
    }

    let isMounted = true;

    const initSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const sessionUser = data?.session?.user ?? null;
        if (!isMounted) return;

        if (sessionUser && !isSigningUp.current) {
          await loadUser(sessionUser);
        } else {
          clearAllState();
        }
      } catch (err) {
        console.error('[Auth] initSession error:', err);
        if (isMounted) clearAllState();
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initSession();

    // IMPORTANT: is callback ke andar seedha supabase call `await` karne se auth lock
    // deadlock ho jaata hai (yahi "kabhi fast kabhi 5 sec" ka bada reason tha).
    // Isliye kaam setTimeout(0) se callback ke bahar nikal diya hai.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;

      if (event === 'SIGNED_OUT') {
        clearAllState();
        setLoading(false);
        return;
      }

      // INITIAL_SESSION ko initSession sambhalta hai. Yahan loading false kar dene se
      // user load hone se pehle hi login page ek second ke liye dikh jaata tha (flash).
      if (event === 'INITIAL_SESSION') return;

      setTimeout(async () => {
        if (!isMounted) return;

        if (event === 'SIGNED_IN' && isSigningUp.current) {
          isSigningUp.current = false;
          await supabase.auth.signOut({ scope: 'global' });
          clearAllStorage();
          clearAllState();
          setLoading(false);
          return;
        }

        if (event === 'SIGNED_IN' && session?.user) {
          await loadUser(session.user);
        }

        if (event === 'TOKEN_REFRESHED' && session?.user) {
          setUser(session.user);
        }

        setLoading(false);
      }, 0);
    });

    const timeout = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 6000);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    if (!hasSupabaseEnv) return { error: makeAuthError('Supabase not configured.') };

    const normalizedEmail = sanitizeEmail(email);
    const now = new Date().toISOString();
    isSigningUp.current = true;

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: { username },
        emailRedirectTo: `${window.location.origin}/login?verified=true`,
      },
    });

    if (error) {
      isSigningUp.current = false;
      return { error };
    }

    if (!data.user) {
      isSigningUp.current = false;
      return { error: makeAuthError('Signup failed.') };
    }

    // Already registered (verified) email: Supabase error nahi deta, bas identities empty aati hai
    if (data.user.identities && data.user.identities.length === 0) {
      isSigningUp.current = false;
      return { error: makeAuthError('An account with this email already exists. Please sign in.') };
    }

    const token = createToken(32);
    const tokenHash = await hashToken(token);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30).toISOString();

    // Dono independent hain, isliye ek saath (pehle ek ke baad ek chalte the)
    const [profileResult] = await Promise.all([
      supabase.from('user_login_detail').upsert({
        id: data.user.id,
        username,
        email: normalizedEmail,
        password_hash: null,
        role: 'free',
        security_score: 50,
        total_logins: 0,
        failed_attempts: 0,
        login_history: [],
        email_verified: false,
        created_at: now,
        last_login: now,
        updated_at: now,
      }, { onConflict: 'id' }),
      supabase.from('email_verifications').upsert({
        user_id: data.user.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
        verified_at: null,
        created_at: now,
        email: normalizedEmail,
      }, { onConflict: 'user_id' }),
    ]);

    if (profileResult.error) {
      console.warn('[Auth] user_login_detail upsert warning:', profileResult.error.message);
    }

    await supabase.auth.signOut({ scope: 'global' });
    clearAllStorage();
    clearAllState();

    // clearAllStorage() 'axellevault' wali saari keys hata deta hai,
    // isliye pending email/token uske BAAD save karna zaroori hai
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('axellevault.pending_verification_email', normalizedEmail);
      window.localStorage.setItem('axellevault.pending_verification_token', token);
    }

    isSigningUp.current = false;
    return { error: null };
  };

  const resendVerificationEmail = async (email: string) => {
    if (!hasSupabaseEnv) return { error: makeAuthError('Supabase not configured.') };
    const normalizedEmail = sanitizeEmail(email);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: normalizedEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/login?verified=true`,
      },
    });
    return { error: error ?? null };
  };

  const signIn = async (email: string, password: string) => {
    if (!hasSupabaseEnv) return { error: makeAuthError('Supabase not configured.') };

    const normalizedEmail = sanitizeEmail(email);
    const now = new Date().toISOString();

    // Login se pehle ka check ab secure RPC se hota hai (table anon ke liye band hai).
    // Ye sirf 'not_found' | 'unverified' | 'ok' wapas deta hai, koi user data nahi.
    const { data: precheck, error: precheckError } = await supabase.rpc('login_precheck', {
      p_email: normalizedEmail,
    });

    if (precheckError) {
      return { error: makeAuthError(precheckError.message) };
    }

    if (precheck === 'not_found') {
      return { error: makeAuthError('Wrong email or password. Please try again.') };
    }

    if (precheck === 'unverified') {
      return { error: makeAuthError('Please verify your email before signing in.') };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    // Supabase khud bhi unverified email block karta hai — isko failed attempt mat gino
    const notConfirmed =
      !!error &&
      (/email not confirmed/i.test(error.message) ||
        (error as { code?: string }).code === 'email_not_confirmed');

    if (notConfirmed) {
      return { error: makeAuthError('Please verify your email before signing in.') };
    }

    if (error || !data.user) {
      // Failed attempt ki counting secure RPC se, peeche chalegi — error turant dikhega
      runInBackground(async () => {
        await supabase.rpc('record_failed_login', { p_email: normalizedEmail });
      });

      return { error: error ?? makeAuthError('Login failed.') };
    }

    const userId = data.user.id;
    const deviceId = getDeviceId();
    const sessionToken = data.session?.access_token ?? createToken(32);

    // Login stats + session record: user ko inka wait nahi karwana.
    // Ab user authenticated hai, isliye apni row RLS (own_select / own_update) se milti hai.
    // Khatam hone par profile refresh ho jaata hai (total_logins / last_login update dikhe).
    runInBackground(async () => {
      const { data: current } = await supabase
        .from('user_login_detail')
        .select('total_logins, login_history')
        .eq('id', userId)
        .maybeSingle();

      const history = [...(current?.login_history ?? []), { time: now, success: true }].slice(-10);
      const tokenHash = await hashToken(sessionToken);
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString();

      await Promise.all([
        supabase
          .from('user_login_detail')
          .update({
            last_login: now,
            total_logins: (current?.total_logins ?? 0) + 1,
            failed_attempts: 0,
            login_history: history,
          })
          .eq('id', userId),
        supabase.from('sessions').insert({
          user_id: userId,
          device_id: deviceId,
          session_token_hash: tokenHash,
          created_at: now,
          expires_at: expiresAt,
          revoked_at: null,
        }),
      ]);

      await fetchProfile(userId);
    });

    // Profile load onAuthStateChange (SIGNED_IN) khud kar deta hai — yahan dobara await nahi
    setUser(data.user);
    return { error: null };
  };

  const signOut = async (options?: { everywhere?: boolean; rememberLogin?: boolean }) => {
    const everywhere = options?.everywhere ?? false;
    const rememberLogin = options?.rememberLogin ?? false;

    try {
      setLoading(true);

      // Password save nahi hota, sirf naam + email — taaki agli baar "Continue as X" dikhe
      if (rememberLogin && user?.email) {
        rememberAccount({ username: profile?.username ?? null, email: user.email });
      }

      if (user) {
        const deviceId = getDeviceId();
        // everywhere=false (default): sirf isi device ka session revoke hota hai,
        // baaki devices logged-in rehte hain
        await revokeUserSessions(user.id, everywhere ? undefined : deviceId);
      }

      if (hasSupabaseEnv) {
        await supabase.auth.signOut({ scope: everywhere ? 'global' : 'local' });
      }

      clearAllState();
      clearAllStorage();
    } catch (err) {
      console.error('[Auth] signOut exception:', err);
      clearAllState();
      clearAllStorage();
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (fullName: string) => {
    if (!user) return { error: makeAuthError('Not authenticated') };
    const { error } = await supabase
      .from('user_login_detail')
      .update({ username: fullName, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) return { error };
    await refreshProfile();
    return { error: null };
  };

  const updateEmail = async (newEmail: string, currentPassword: string) => {
    if (!user) return { error: makeAuthError('Not authenticated') };

    const normalizedNewEmail = sanitizeEmail(newEmail);

    if (normalizedNewEmail === sanitizeEmail(user.email ?? '')) {
      return { error: makeAuthError('This is already your current email.') };
    }

    // Password dobara maango, taaki koi khali chhode hue session se email hijack na kar sake
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email ?? '',
      password: currentPassword,
    });

    if (verifyError) {
      return { error: makeAuthError('Current password is incorrect.') };
    }

    const { error } = await supabase.auth.updateUser(
      { email: normalizedNewEmail },
      { emailRedirectTo: `${window.location.origin}/login?verified=true` },
    );

    return { error: error ?? null };
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    if (!user) return { error: makeAuthError('Not authenticated') };

    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email ?? '',
      password: oldPassword,
    });

    if (verifyError) return { error: verifyError };

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (!error) {
      await revokeUserSessions(user.id);
    }

    return { error: error ?? null };
  };

  const deleteAccount = async () => {
    if (!user) return { error: makeAuthError('Not authenticated') };
    const { error } = await supabase.from('user_login_detail').delete().eq('id', user.id);
    if (error) return { error };
    await supabase.auth.signOut();
    clearAllState();
    clearAllStorage();
    return { error: null };
  };

  const requestPasswordReset = async (email: string) => {
    if (!hasSupabaseEnv) return { error: makeAuthError('Supabase not configured.') };

    const normalizedEmail = sanitizeEmail(email);
    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    return { error };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        authError,
        signUp,
        signIn,
        resendVerificationEmail,
        signOut,
        requestPasswordReset,
        refreshProfile,
        updateProfile,
        updateEmail,
        changePassword,
        deleteAccount,
        userRole,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};