import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import type { z } from 'zod';
import { AuthShell } from '@/features/auth/AuthShell';
import { Field, PrimaryButton, TextButton } from '@/components/ui';
import { authErrorMessage } from '@/lib/auth-errors';
import { registerSchema, normalizeEmail } from '@/lib/validation';
import { authRedirect, requireSupabase } from '@/lib/supabase';
import { radius, spacing, useTheme } from '@/theme/tokens';

type Form = z.infer<typeof registerSchema>;
export default function RegisterScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [serverError, setServerError] = useState('');
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(registerSchema), defaultValues: { name: '', email: '', password: '', confirmPassword: '', accepted: false } });
  const submit = handleSubmit(async (values) => {
    setServerError('');
    const email = normalizeEmail(values.email);
    try {
      const { error } = await requireSupabase().auth.signUp({ email, password: values.password, options: { data: { display_name: values.name.trim() }, emailRedirectTo: authRedirect } });
      if (error) throw error;
      router.replace({ pathname: '/(auth)/check-email', params: { email } });
    } catch (error) { setServerError(authErrorMessage(error)); }
  });
  return <AuthShell title="Начните осознанно" subtitle="Один аккаунт для целей, фокус-сессий и вашей истории времени.">
    <View style={styles.form}>
      <Controller control={control} name="name" render={({ field: { onChange, onBlur, value } }) => <Field label="Имя" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.name?.message} autoComplete="name" textContentType="name" returnKeyType="next" />} />
      <Controller control={control} name="email" render={({ field: { onChange, onBlur, value } }) => <Field label="Email" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.email?.message} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" textContentType="emailAddress" returnKeyType="next" />} />
      <Controller control={control} name="password" render={({ field: { onChange, onBlur, value } }) => <Field label="Пароль" password value={value} onChangeText={onChange} onBlur={onBlur} error={errors.password?.message} autoComplete="new-password" textContentType="newPassword" returnKeyType="next" />} />
      <Text style={[styles.hint, { color: colors.textSecondary }]}>Не менее 10 символов, одна буква и одна цифра.</Text>
      <Controller control={control} name="confirmPassword" render={({ field: { onChange, onBlur, value } }) => <Field label="Повторите пароль" password value={value} onChangeText={onChange} onBlur={onBlur} error={errors.confirmPassword?.message} autoComplete="new-password" textContentType="newPassword" returnKeyType="done" onSubmitEditing={submit} />} />
      <Controller control={control} name="accepted" render={({ field: { onChange, value } }) => <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: value }} onPress={() => onChange(!value)} style={styles.consent}><View style={[styles.checkbox, { borderColor: errors.accepted ? colors.danger : colors.border, backgroundColor: value ? colors.accent : colors.surface }]}>{value ? <Check size={16} color="#FFFFFF" strokeWidth={2.4} /> : null}</View><Text style={[styles.consentText, { color: colors.text }]}>Я принимаю Условия использования и Политику конфиденциальности.</Text></Pressable>} />
      {errors.accepted ? <Text style={[styles.hint, { color: colors.danger }]}>{errors.accepted.message}</Text> : null}
      {serverError ? <Text accessibilityRole="alert" style={[styles.hint, { color: colors.danger }]}>{serverError}</Text> : null}
      <PrimaryButton label="Создать аккаунт" loading={isSubmitting} onPress={submit} />
      <View style={styles.switch}><Text style={{ color: colors.textSecondary }}>Уже есть аккаунт?</Text><TextButton label="Войти" onPress={() => router.replace('/(auth)/login')} /></View>
    </View>
  </AuthShell>;
}

const styles = StyleSheet.create({ form: { gap: spacing.lg }, hint: { fontSize: 13, lineHeight: 18, marginTop: -spacing.sm }, consent: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' }, checkbox: { width: 24, height: 24, borderRadius: radius.small, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center' }, consentText: { flex: 1, fontSize: 14, lineHeight: 21 }, switch: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs } });
