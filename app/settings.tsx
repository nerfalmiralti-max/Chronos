import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, ChevronRight, KeyRound, LogOut, Mail, Trash2, UserRound } from 'lucide-react-native';
import { IconButton, Screen, SecondaryButton } from '@/components/ui';
import { useAuth } from '@/providers/AuthProvider';
import { spacing, useTheme } from '@/theme/tokens';

export default function SettingsScreen() {
  const { colors } = useTheme(); const router = useRouter(); const { profile, session, signOut } = useAuth();
  const rows = [{ icon: Mail, title: 'Изменить email', detail: session?.user.email ?? '', route: '/change-email' as const }, { icon: KeyRound, title: 'Изменить пароль', detail: 'Обновить данные входа', route: '/change-password' as const }];
  return <Screen><View style={styles.header}><IconButton icon={ArrowLeft} label="Закрыть" onPress={() => router.back()} /></View><Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>Аккаунт</Text><View style={styles.identity}><View style={[styles.avatar, { backgroundColor: colors.accentSoft }]}><UserRound size={26} color={colors.accent} /></View><View><Text style={[styles.name, { color: colors.text }]}>{profile?.display_name || 'Пользователь Chronos'}</Text><Text style={[styles.email, { color: colors.textSecondary }]}>{session?.user.email}</Text></View></View>
    <View style={styles.section}><Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>БЕЗОПАСНОСТЬ</Text>{rows.map(({ icon: Icon, title, detail, route }) => <View key={title} style={[styles.row, { borderBottomColor: colors.border }]}><Icon size={20} color={colors.textSecondary} /><View style={styles.rowCopy}><Text style={[styles.rowTitle, { color: colors.text }]}>{title}</Text><Text style={[styles.rowDetail, { color: colors.textSecondary }]} numberOfLines={1}>{detail}</Text></View><IconButton icon={ChevronRight} label={title} onPress={() => router.push(route)} /></View>)}</View>
    <View style={styles.section}><SecondaryButton label="Выйти из аккаунта" icon={LogOut} onPress={signOut} /><View style={styles.gap} /><SecondaryButton label="Удалить аккаунт" icon={Trash2} danger onPress={() => router.push('/delete-account')} /></View>
    <Text style={[styles.version, { color: colors.textSecondary }]}>Chronos 1.0 · Данные защищены политиками RLS</Text>
  </Screen>;
}

const styles = StyleSheet.create({ header: { paddingTop: spacing.md, alignItems: 'flex-start' }, title: { fontSize: 38, lineHeight: 44, fontWeight: '600', marginTop: spacing.xl }, identity: { marginTop: spacing.xxl, flexDirection: 'row', alignItems: 'center', gap: spacing.md }, avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' }, name: { fontSize: 18, fontWeight: '600' }, email: { fontSize: 14, marginTop: 3 }, section: { marginTop: spacing.huge }, sectionLabel: { fontSize: 12, fontWeight: '600', marginBottom: spacing.xs }, row: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth }, rowCopy: { flex: 1 }, rowTitle: { fontSize: 16, fontWeight: '500' }, rowDetail: { fontSize: 12, marginTop: 3 }, gap: { height: spacing.sm }, version: { fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: spacing.huge } });
