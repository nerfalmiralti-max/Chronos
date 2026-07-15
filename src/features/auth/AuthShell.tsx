import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BrandMark, IconButton, PageEnter, Screen } from '@/components/ui';
import { ArrowLeft } from 'lucide-react-native';
import { isSupabaseConfigured } from '@/lib/supabase';
import { spacing, useTheme } from '@/theme/tokens';

export function AuthShell({ title, subtitle, children, back = true }: { title: string; subtitle: string; children: ReactNode; back?: boolean }) {
  const { colors } = useTheme();
  const router = useRouter();
  return <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <Screen>
      <PageEnter>
        <View style={styles.top}>{back ? <IconButton icon={ArrowLeft} label="Назад" onPress={() => router.back()} /> : <BrandMark size={48} />}</View>
        <View style={styles.intro}><Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>{title}</Text><Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text></View>
        {!isSupabaseConfigured ? <View style={[styles.config, { backgroundColor: colors.accentSoft }]}><Text style={[styles.configText, { color: colors.text }]}>Для реальной авторизации добавьте URL и publishable key Supabase в `.env`.</Text></View> : null}
        {children}
      </PageEnter>
    </Screen>
  </KeyboardAvoidingView>;
}

const styles = StyleSheet.create({ top: { minHeight: 76, justifyContent: 'center', alignItems: 'flex-start' }, intro: { marginTop: spacing.xl, marginBottom: spacing.xxl }, title: { fontSize: 32, lineHeight: 38, fontWeight: '600' }, subtitle: { fontSize: 16, lineHeight: 24, marginTop: spacing.sm, maxWidth: 430 }, config: { padding: spacing.md, borderRadius: 8, marginBottom: spacing.xl }, configText: { fontSize: 13, lineHeight: 19 } });
