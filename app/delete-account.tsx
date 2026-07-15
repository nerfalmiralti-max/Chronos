import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Trash2 } from 'lucide-react-native';
import { Field, IconButton, PrimaryButton, Screen } from '@/components/ui';
import { requireSupabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { authErrorMessage } from '@/lib/auth-errors';
import { spacing, useTheme } from '@/theme/tokens';

export default function DeleteAccountScreen() {
  const { colors } = useTheme(); const router = useRouter(); const { signOut } = useAuth(); const [confirmation, setConfirmation] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(false); const allowed = confirmation.trim().toUpperCase() === 'УДАЛИТЬ';
  const remove = async () => { if (!allowed) return; setLoading(true); setError(''); try { const { error: invokeError } = await requireSupabase().functions.invoke('delete-account', { body: {} }); if (invokeError) throw invokeError; await signOut(); router.replace('/'); } catch (reason) { setError(authErrorMessage(reason)); setLoading(false); } };
  return <Screen><View style={styles.header}><IconButton icon={ArrowLeft} label="Назад" onPress={() => router.back()} /></View><View style={[styles.icon, { backgroundColor: colors.surfaceSecondary }]}><Trash2 size={26} color={colors.danger} /></View><Text style={[styles.title, { color: colors.text }]}>Удалить аккаунт?</Text><Text style={[styles.subtitle, { color: colors.textSecondary }]}>Это действие необратимо. Будут удалены профиль, цели, задачи, фокус-сессии и история Chronos.</Text><View style={styles.form}><Text style={[styles.instruction, { color: colors.text }]}>Введите УДАЛИТЬ для подтверждения</Text><Field label="Подтверждение" value={confirmation} onChangeText={setConfirmation} autoCapitalize="characters" returnKeyType="done" onSubmitEditing={remove} />{error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}<PrimaryButton label="Удалить навсегда" icon={Trash2} disabled={!allowed} loading={loading} onPress={remove} /></View></Screen>;
}
const styles = StyleSheet.create({ header: { paddingTop: spacing.md }, icon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginTop: spacing.xxl }, title: { fontSize: 36, lineHeight: 42, fontWeight: '600', marginTop: spacing.xl }, subtitle: { fontSize: 16, lineHeight: 24, marginTop: spacing.sm, maxWidth: 480 }, form: { marginTop: spacing.huge, gap: spacing.lg }, instruction: { fontSize: 15, fontWeight: '600' } });
