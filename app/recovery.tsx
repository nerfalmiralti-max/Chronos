import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { AuthShell } from '@/features/auth/AuthShell';
import { Field, PrimaryButton } from '@/components/ui';
import { resetSchema } from '@/lib/validation';
import { requireSupabase } from '@/lib/supabase';
import { authErrorMessage } from '@/lib/auth-errors';
import { useAuth } from '@/providers/AuthProvider';
import { spacing, useTheme } from '@/theme/tokens';

type Form = z.infer<typeof resetSchema>;
export default function RecoveryScreen() {
  const { colors } = useTheme(); const { finishRecovery } = useAuth(); const [done, setDone] = useState(false); const [error, setError] = useState('');
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(resetSchema), defaultValues: { password: '', confirmPassword: '' } });
  const submit = handleSubmit(async ({ password }) => { setError(''); try { const { error: updateError } = await requireSupabase().auth.updateUser({ password }); if (updateError) throw updateError; setDone(true); } catch (reason) { setError(authErrorMessage(reason)); } });
  if (done) return <AuthShell title="Пароль изменён" subtitle="Новый пароль уже защищает ваш аккаунт." back={false}><PrimaryButton label="Продолжить в Chronos" onPress={finishRecovery} /></AuthShell>;
  return <AuthShell title="Новый пароль" subtitle="Создайте новый пароль. Ссылка восстановления будет считаться использованной.">
    <View style={styles.form}><Controller control={control} name="password" render={({ field: { value, onChange, onBlur } }) => <Field label="Новый пароль" password value={value} onChangeText={onChange} onBlur={onBlur} error={errors.password?.message} autoComplete="new-password" textContentType="newPassword" />} /><Controller control={control} name="confirmPassword" render={({ field: { value, onChange, onBlur } }) => <Field label="Повторите пароль" password value={value} onChangeText={onChange} onBlur={onBlur} error={errors.confirmPassword?.message} autoComplete="new-password" textContentType="newPassword" returnKeyType="done" onSubmitEditing={submit} />} />{error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}<PrimaryButton label="Сохранить пароль" loading={isSubmitting} onPress={submit} /></View>
  </AuthShell>;
}

const styles = StyleSheet.create({ form: { gap: spacing.lg } });
