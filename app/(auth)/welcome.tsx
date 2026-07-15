import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight, LockKeyhole } from 'lucide-react-native';
import { BrandMark, PageEnter, PrimaryButton, Screen, SecondaryButton } from '@/components/ui';
import { spacing, useTheme } from '@/theme/tokens';

export default function WelcomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  return <Screen>
    <PageEnter>
      <View style={styles.brand}><BrandMark size={58} /><Text style={[styles.wordmark, { color: colors.text }]}>Chronos</Text></View>
      <View style={styles.hero}>
        <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>Каждый час имеет значение.</Text>
        <Text style={[styles.body, { color: colors.textSecondary }]}>Планируйте с намерением, сохраняйте фокус и замечайте свой настоящий прогресс.</Text>
      </View>
      <View style={[styles.timeVisual, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        <View style={[styles.orbit, { borderColor: colors.accentSoft }]}><View style={[styles.hand, { backgroundColor: colors.accent }]} /><View style={[styles.pin, { backgroundColor: colors.accent }]} /></View>
        <View><Text style={[styles.metric, { color: colors.text }]}>24:00</Text><Text style={[styles.metricLabel, { color: colors.textSecondary }]}>ваш день, в вашем ритме</Text></View>
      </View>
      <View style={styles.actions}>
        <PrimaryButton label="Создать аккаунт" icon={ArrowRight} onPress={() => router.push('/(auth)/register')} />
        <SecondaryButton label="Войти" icon={LockKeyhole} onPress={() => router.push('/(auth)/login')} />
      </View>
      <Text style={[styles.footnote, { color: colors.textSecondary }]}>Продолжая, вы принимаете Условия использования и Политику конфиденциальности.</Text>
    </PageEnter>
  </Screen>;
}

const styles = StyleSheet.create({
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingTop: spacing.xl }, wordmark: { fontSize: 24, fontWeight: '600' }, hero: { marginTop: 72, maxWidth: 520 }, title: { fontSize: 48, lineHeight: 54, fontWeight: '600' }, body: { fontSize: 17, lineHeight: 26, marginTop: spacing.lg, maxWidth: 440 },
  timeVisual: { marginTop: spacing.huge, minHeight: 150, borderWidth: StyleSheet.hairlineWidth, borderRadius: 8, padding: spacing.xl, flexDirection: 'row', alignItems: 'center', gap: spacing.xl }, orbit: { width: 82, height: 82, borderRadius: 99, borderWidth: 8, alignItems: 'center', justifyContent: 'center' }, hand: { width: 3, height: 25, position: 'absolute', top: 15, borderRadius: 2 }, pin: { width: 8, height: 8, borderRadius: 8 }, metric: { fontSize: 36, fontWeight: '600', fontVariant: ['tabular-nums'] }, metricLabel: { fontSize: 14, marginTop: 2 },
  actions: { gap: spacing.sm, marginTop: 'auto', paddingTop: spacing.huge }, footnote: { fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: spacing.md, paddingHorizontal: spacing.md },
});
