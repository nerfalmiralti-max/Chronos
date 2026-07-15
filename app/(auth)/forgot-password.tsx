import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthShell } from '@/features/auth/AuthShell';
import { Field, PrimaryButton, SecondaryButton } from '@/components/ui';
import { emailSchema, normalizeEmail } from '@/lib/validation';
import { recoveryRedirect, requireSupabase } from '@/lib/supabase';
import { spacing, useTheme } from '@/theme/tokens';

const schema = z.object({ email: emailSchema });
type Form = z.infer<typeof schema>;
export default function ForgotPasswordScreen() {
  const router = useRouter(); const { colors } = useTheme(); const [sent, setSent] = useState(false);
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { email: '' } });
  const submit = handleSubmit(async ({ email }) => {
    try { await requireSupabase().auth.resetPasswordForEmail(normalizeEmail(email), { redirectTo: recoveryRedirect }); } finally { setSent(true); }
  });
  return <AuthShell title={sent ? 'Письмо отправлено' : 'Восстановление'} subtitle={sent ? 'Если аккаунт с таким адресом существует, мы отправили письмо для восстановления пароля.' : 'Укажите email, привязанный к Chronos.'}>
    {sent ? <View style={styles.form}><Text style={[styles.note, { color: colors.textSecondary }]}>Проверьте входящие и папку «Спам». Ссылка откроет защищённый экран смены пароля.</Text><PrimaryButton label="Открыть почту позже" onPress={() => router.replace('/(auth)/login')} /><SecondaryButton label="Отправить ещё раз" onPress={() => setSent(false)} /></View> : <View style={styles.form}><Controller control={control} name="email" render={({ field: { onChange, onBlur, value } }) => <Field label="Email" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.email?.message} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" returnKeyType="send" onSubmitEditing={submit} />} /><PrimaryButton label="Отправить ссылку" loading={isSubmitting} onPress={submit} /></View>}
  </AuthShell>;
}

const styles = StyleSheet.create({ form: { gap: spacing.md }, note: { fontSize: 15, lineHeight: 23, marginBottom: spacing.xl } });
