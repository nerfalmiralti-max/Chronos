import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Field, IconButton, PrimaryButton, Screen } from '@/components/ui';
import { requireSupabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { spacing, useTheme } from '@/theme/tokens';

export default function NewGoalScreen() {
  const { colors } = useTheme(); const router = useRouter(); const { session } = useAuth(); const [title, setTitle] = useState(''); const [target, setTarget] = useState('10'); const [unit, setUnit] = useState('часов'); const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  const save = async () => { const value = Number(target.replace(',', '.')); if (!session || title.trim().length < 2 || !Number.isFinite(value) || value <= 0) { setError('Проверьте название и числовую цель.'); return; } const due = new Date(); due.setDate(due.getDate() + 30); setLoading(true); const { error: saveError } = await requireSupabase().from('goals').insert({ user_id: session.user.id, title: title.trim(), target_value: value, current_value: 0, unit: unit.trim() || 'ед.', due_date: due.toISOString(), status: 'active' }); if (saveError) { setError('Не удалось сохранить цель.'); setLoading(false); return; } router.back(); };
  return <Screen><View style={styles.header}><IconButton icon={ArrowLeft} label="Закрыть" onPress={() => router.back()} /></View><Text style={[styles.title, { color: colors.text }]}>Новая цель</Text><Text style={[styles.subtitle, { color: colors.textSecondary }]}>Сформулируйте результат, который поможет принимать решения о времени.</Text><View style={styles.form}><Field label="Название" value={title} onChangeText={setTitle} autoFocus placeholder="Например, закончить портфолио" /><View style={styles.inline}><View style={styles.target}><Field label="Результат" value={target} onChangeText={setTarget} keyboardType="decimal-pad" /></View><View style={styles.unit}><Field label="Единица" value={unit} onChangeText={setUnit} /></View></View><Text style={[styles.note, { color: colors.textSecondary }]}>Контрольная дата будет установлена через 30 дней. Её можно изменить в деталях цели.</Text>{error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}<PrimaryButton label="Создать цель" loading={loading} onPress={save} /></View></Screen>;
}
const styles = StyleSheet.create({ header: { paddingTop: spacing.md }, title: { fontSize: 36, lineHeight: 42, fontWeight: '600', marginTop: spacing.xl }, subtitle: { fontSize: 16, lineHeight: 24, marginTop: spacing.sm, maxWidth: 480 }, form: { marginTop: spacing.huge, gap: spacing.xl }, inline: { flexDirection: 'row', gap: spacing.sm }, target: { flex: 1 }, unit: { flex: 1.4 }, note: { fontSize: 13, lineHeight: 19, marginTop: -spacing.sm } });
