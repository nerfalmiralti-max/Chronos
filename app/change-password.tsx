import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Field, IconButton, PrimaryButton, Screen } from '@/components/ui';
import { resetSchema } from '@/lib/validation';
import { requireSupabase } from '@/lib/supabase';
import { authErrorMessage } from '@/lib/auth-errors';
import { spacing, useTheme } from '@/theme/tokens';

type Form = z.infer<typeof resetSchema>;
export default function ChangePasswordScreen() {
  const router = useRouter(); const { colors } = useTheme(); const [message, setMessage] = useState('');
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(resetSchema), defaultValues: { password: '', confirmPassword: '' } });
  const submit = handleSubmit(async ({ password }) => { setMessage(''); try { const { error } = await requireSupabase().auth.updateUser({ password }); if (error) throw error; reset(); setMessage('Пароль изменён.'); } catch (error) { setMessage(authErrorMessage(error)); } });
  return <Screen><View style={styles.header}><IconButton icon={ArrowLeft} label="Назад" onPress={() => router.back()} /></View><Text style={[styles.title, { color: colors.text }]}>Новый пароль</Text><Text style={[styles.subtitle, { color: colors.textSecondary }]}>Используйте длинную фразу, которую не применяете в других сервисах.</Text><View style={styles.form}><Controller control={control} name="password" render={({ field: { value, onChange, onBlur } }) => <Field label="Новый пароль" password value={value} onChangeText={onChange} onBlur={onBlur} error={errors.password?.message} autoComplete="new-password" textContentType="newPassword" />} /><Controller control={control} name="confirmPassword" render={({ field: { value, onChange, onBlur } }) => <Field label="Повторите пароль" password value={value} onChangeText={onChange} onBlur={onBlur} error={errors.confirmPassword?.message} autoComplete="new-password" textContentType="newPassword" returnKeyType="done" onSubmitEditing={submit} />} />{message ? <Text style={{ color: colors.text }}>{message}</Text> : null}<PrimaryButton label="Сохранить пароль" loading={isSubmitting} onPress={submit} /></View></Screen>;
}
const styles = StyleSheet.create({ header: { paddingTop: spacing.md }, title: { fontSize: 36, lineHeight: 42, fontWeight: '600', marginTop: spacing.xl }, subtitle: { fontSize: 16, lineHeight: 24, marginTop: spacing.sm }, form: { marginTop: spacing.huge, gap: spacing.lg } });
