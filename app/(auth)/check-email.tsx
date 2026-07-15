import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MailCheck } from 'lucide-react-native';
import { AuthShell } from '@/features/auth/AuthShell';
import { PrimaryButton, SecondaryButton, TextButton } from '@/components/ui';
import { authErrorMessage } from '@/lib/auth-errors';
import { authRedirect, requireSupabase } from '@/lib/supabase';
import { spacing, useTheme } from '@/theme/tokens';

export default function CheckEmailScreen() {
  const { email = '' } = useLocalSearchParams<{ email?: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const [cooldown, setCooldown] = useState(60);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => { if (cooldown <= 0) return; const id = setInterval(() => setCooldown((value) => Math.max(0, value - 1)), 1000); return () => clearInterval(id); }, [cooldown]);
  const resend = async () => {
    if (!email || cooldown > 0 || loading) return;
    setLoading(true); setMessage('');
    try { const { error } = await requireSupabase().auth.resend({ type: 'signup', email, options: { emailRedirectTo: authRedirect } }); if (error) throw error; setCooldown(60); setMessage('Письмо отправлено повторно.'); }
    catch (error) { setMessage(authErrorMessage(error)); } finally { setLoading(false); }
  };
  return <AuthShell title="Проверьте почту" subtitle={`Мы отправили безопасную ссылку подтверждения на ${email || 'указанный адрес'}.`}>
    <View style={styles.content}><View style={[styles.icon, { backgroundColor: colors.accentSoft }]}><MailCheck size={28} color={colors.accent} /></View><Text style={[styles.body, { color: colors.textSecondary }]}>Откройте письмо на этом устройстве. После подтверждения Chronos продолжит настройку аккаунта.</Text>
      {message ? <Text accessibilityLiveRegion="polite" style={[styles.message, { color: colors.text }]}>{message}</Text> : null}
      <PrimaryButton label={cooldown > 0 ? `Отправить снова через ${cooldown}с` : 'Отправить письмо снова'} loading={loading} disabled={cooldown > 0} onPress={resend} />
      <SecondaryButton label="Я уже подтвердил email" onPress={() => router.replace('/(auth)/login')} />
      <TextButton label="Исправить адрес" onPress={() => router.replace('/(auth)/register')} />
    </View>
  </AuthShell>;
}

const styles = StyleSheet.create({ content: { gap: spacing.md }, icon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm }, body: { fontSize: 15, lineHeight: 23, marginBottom: spacing.xl }, message: { fontSize: 14, lineHeight: 20, marginBottom: spacing.xs } });
