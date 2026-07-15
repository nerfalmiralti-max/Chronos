import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Field, IconButton, PrimaryButton, Screen } from '@/components/ui';
import { normalizeEmail, emailSchema } from '@/lib/validation';
import { authErrorMessage } from '@/lib/auth-errors';
import { requireSupabase } from '@/lib/supabase';
import { spacing, useTheme } from '@/theme/tokens';

export default function ChangeEmailScreen() {
  const router = useRouter(); const { colors } = useTheme(); const [email, setEmail] = useState(''); const [message, setMessage] = useState(''); const [loading, setLoading] = useState(false);
  const submit = async () => { const parsed = emailSchema.safeParse(email); if (!parsed.success) { setMessage(parsed.error.issues[0]?.message ?? 'Проверьте email'); return; } setLoading(true); try { const { error } = await requireSupabase().auth.updateUser({ email: normalizeEmail(email) }); if (error) throw error; setMessage('Проверьте новый адрес и подтвердите изменение.'); } catch (error) { setMessage(authErrorMessage(error)); } finally { setLoading(false); } };
  return <Screen><View style={styles.header}><IconButton icon={ArrowLeft} label="Назад" onPress={() => router.back()} /></View><Text style={[styles.title, { color: colors.text }]}>Новый email</Text><Text style={[styles.subtitle, { color: colors.textSecondary }]}>Мы отправим подтверждение на новый адрес. До подтверждения текущий email останется активным.</Text><View style={styles.form}><Field label="Новый email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" returnKeyType="done" onSubmitEditing={submit} />{message ? <Text style={[styles.message, { color: colors.text }]}>{message}</Text> : null}<PrimaryButton label="Отправить подтверждение" loading={loading} onPress={submit} /></View></Screen>;
}
const styles = StyleSheet.create({ header: { paddingTop: spacing.md }, title: { fontSize: 36, lineHeight: 42, fontWeight: '600', marginTop: spacing.xl }, subtitle: { fontSize: 16, lineHeight: 24, marginTop: spacing.sm, maxWidth: 480 }, form: { marginTop: spacing.huge, gap: spacing.lg }, message: { fontSize: 14, lineHeight: 20 } });
