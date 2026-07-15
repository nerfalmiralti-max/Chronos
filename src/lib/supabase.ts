import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
export const isSupabaseConfigured = Boolean(supabaseUrl && publishableKey);

export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl!, publishableKey!, { auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false, flowType: 'pkce' } })
  : null;

export function requireSupabase(): SupabaseClient<Database> {
  if (!supabase) throw new Error('CHRONOS_SUPABASE_NOT_CONFIGURED');
  return supabase;
}

export const appScheme = process.env.EXPO_PUBLIC_APP_SCHEME?.trim() || 'chronos';
export const authRedirect = `${appScheme}://auth/confirm`;
export const recoveryRedirect = `${appScheme}://auth/reset-password`;
