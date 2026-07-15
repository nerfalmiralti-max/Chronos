import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Compass, Target, TimerReset } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { BrandMark, PrimaryButton, Screen } from '@/components/ui';
import { requireSupabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { radius, spacing, useTheme } from '@/theme/tokens';

const values = [{ icon: Compass, title: 'Планируйте день', body: 'Оставляйте место для важного.' }, { icon: Target, title: 'Двигайтесь к целям', body: 'Видьте темп, а не только итог.' }, { icon: TimerReset, title: 'Защищайте фокус', body: 'Считайте время, которое имеет смысл.' }];
export default function OnboardingScreen() {
  const { colors } = useTheme(); const { session, refreshProfile } = useAuth(); const router = useRouter(); const [loading, setLoading] = useState(false);
  const finish = async () => { if (!session) return; setLoading(true); try { const { error } = await requireSupabase().from('profiles').update({ onboarding_completed: true, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, locale: 'ru' }).eq('id', session.user.id); if (error) throw error; await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); await refreshProfile(); router.replace('/'); } finally { setLoading(false); } };
  return <Screen><View style={styles.top}><BrandMark size={52} /></View><Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>Настроим ваш ритм.</Text><Text style={[styles.subtitle, { color: colors.textSecondary }]}>Chronos не заполняет день сильнее. Он помогает увидеть, куда уходит ваше внимание.</Text><View style={styles.list}>{values.map(({ icon: Icon, title, body }) => <View key={title} style={styles.row}><View style={[styles.icon, { backgroundColor: colors.accentSoft }]}><Icon size={21} color={colors.accent} /></View><View style={styles.copy}><Text style={[styles.rowTitle, { color: colors.text }]}>{title}</Text><Text style={[styles.rowBody, { color: colors.textSecondary }]}>{body}</Text></View></View>)}</View><View style={styles.bottom}><PrimaryButton label="Начать" loading={loading} onPress={finish} /></View></Screen>;
}

const styles = StyleSheet.create({ top: { paddingTop: spacing.xl, marginBottom: spacing.huge }, title: { fontSize: 40, lineHeight: 47, fontWeight: '600' }, subtitle: { fontSize: 17, lineHeight: 26, marginTop: spacing.md, maxWidth: 480 }, list: { marginTop: spacing.huge, gap: spacing.xl }, row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md }, icon: { width: 48, height: 48, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' }, copy: { flex: 1 }, rowTitle: { fontSize: 17, lineHeight: 23, fontWeight: '600' }, rowBody: { fontSize: 14, lineHeight: 20, marginTop: 2 }, bottom: { marginTop: 'auto', paddingTop: spacing.huge } });
