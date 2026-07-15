import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as Linking from 'expo-linking';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types/database.types';

type AuthContextValue = {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  recovery: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  finishRecovery: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function consumeAuthUrl(url: string) {
  if (!supabase) return;
  const parsed = Linking.parse(url);
  const code = typeof parsed.queryParams?.code === 'string' ? parsed.queryParams.code : null;
  const tokenHash = typeof parsed.queryParams?.token_hash === 'string' ? parsed.queryParams.token_hash : null;
  const type = typeof parsed.queryParams?.type === 'string' ? parsed.queryParams.type : null;
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
  } else if (tokenHash && (type === 'signup' || type === 'recovery' || type === 'email_change')) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (error) throw error;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [recovery, setRecovery] = useState(false);

  const loadProfile = useCallback(async (user: Session['user']) => {
    if (!supabase) return;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    if (error) throw error;
    if (data) { setProfile(data); return; }
    const { data: created, error: createError } = await supabase.from('profiles').insert({ id: user.id, display_name: String(user.user_metadata.display_name ?? '') || null }).select('*').single();
    if (createError) throw createError;
    setProfile(created);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!session) { setProfile(null); return; }
    await loadProfile(session.user);
  }, [loadProfile, session]);

  useEffect(() => {
    let mounted = true;
    if (!supabase) return;
    supabase.auth.getSession().then(async ({ data }) => { if (!mounted) return; setSession(data.session); if (data.session) await loadProfile(data.session.user); }).finally(() => { if (mounted) setLoading(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      if (nextSession && event !== 'SIGNED_OUT') setTimeout(() => { void loadProfile(nextSession.user).catch(() => setProfile(null)); }, 0);
      if (event === 'PASSWORD_RECOVERY') setRecovery(true);
      if (event === 'SIGNED_OUT') { setProfile(null); setRecovery(false); }
    });
    Linking.getInitialURL().then((url) => { if (url) void consumeAuthUrl(url).catch(() => undefined); });
    const linkSubscription = Linking.addEventListener('url', ({ url }) => consumeAuthUrl(url).catch(() => undefined));
    return () => { mounted = false; listener.subscription.unsubscribe(); linkSubscription.remove(); };
  }, [loadProfile]);

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut({ scope: 'local' });
    setSession(null); setProfile(null); setRecovery(false);
  }, []);

  const value = useMemo(() => ({ session, profile, loading, recovery, refreshProfile, signOut, finishRecovery: () => setRecovery(false) }), [session, profile, loading, recovery, refreshProfile, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
