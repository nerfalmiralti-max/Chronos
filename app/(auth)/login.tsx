import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { AuthShell } from '@/features/auth/AuthShell';
import { Field, PrimaryButton, TextButton } from '@/components/ui';
import { authErrorMessage } from '@/lib/auth-errors';
import { loginSchema, normalizeEmail } from '@/lib/validation';
import { requireSupabase } from '@/lib/supabase';
import { spacing, useTheme } from '@/theme/tokens';
import type { z } from 'zod';

type Form = z.infer<typeof loginSchema>;
export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [serverError, setServerError] = useState('');
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } });
  const submit = handleSubmit(async (values) => {
    setServerError('');
    try {
      const { error } = await requireSupabase().auth.signInWithPassword({ email: normalizeEmail(values.email), password: values.password });
      if (error) throw error;
      router.replace('/');
    } catch (error) { setServerError(authErrorMessage(error)); }
  });
  return <AuthShell title="С возвращением" subtitle="Войдите, чтобы продолжить с того часа, на котором остановились.">
    <View style={styles.form}>
      <Controller control={control} name="email" render={({ field: { onChange, onBlur, value } }) => <Field label="Email" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.email?.message} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" textContentType="emailAddress" returnKeyType="next" />} />
      <Controller control={control} name="password" render={({ field: { onChange, onBlur, value } }) => <Field label="Пароль" password value={value} onChangeText={onChange} onBlur={onBlur} error={errors.password?.message} autoComplete="current-password" textContentType="password" returnKeyType="done" onSubmitEditing={submit} />} />
      <View style={styles.forgot}><TextButton label="Забыли пароль?" onPress={() => router.push('/(auth)/forgot-password')} /></View>
      {serverError ? <Text accessibilityRole="alert" style={[styles.error, { color: colors.danger }]}>{serverError}</Text> : null}
      <PrimaryButton label="Войти" loading={isSubmitting} onPress={submit} />
      <View style={styles.switch}><Text style={{ color: colors.textSecondary }}>Ещё нет аккаунта?</Text><TextButton label="Создать" onPress={() => router.replace('/(auth)/register')} /></View>
    </View>
  </AuthShell>;
}

const styles = StyleSheet.create({ form: { gap: spacing.lg }, forgot: { alignItems: 'flex-end', marginTop: -spacing.sm }, error: { fontSize: 14, lineHeight: 20 }, switch: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, marginTop: spacing.sm } });
