import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Pause, Play, RotateCcw, Square } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { ProgressRing } from '@/components/ProgressRing';
import { Screen, SecondaryButton } from '@/components/ui';
import { useChronosData } from '@/features/app/useChronosData';
import { requireSupabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { radius, spacing, useTheme } from '@/theme/tokens';

const TOTAL = 25 * 60;
export default function TimerScreen() {
  const { task: taskId } = useLocalSearchParams<{ task?: string }>(); const { colors } = useTheme(); const { session } = useAuth(); const data = useChronosData();
  const task = useMemo(() => data.tasks.find((item) => item.id === taskId) ?? data.tasks.find((item) => !item.completed_at) ?? null, [data.tasks, taskId]);
  const [remaining, setRemaining] = useState(TOTAL); const [running, setRunning] = useState(false); const [sessionId, setSessionId] = useState<string | null>(null);
  useEffect(() => { if (!running) return; const timer = setInterval(() => setRemaining((value) => { if (value <= 1) { setRunning(false); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); return 0; } return value - 1; }), 1000); return () => clearInterval(timer); }, [running]);
  const start = async () => { if (!session) return; if (!sessionId) { const { data: created, error } = await requireSupabase().from('focus_sessions').insert({ user_id: session.user.id, task_id: task?.id ?? null, started_at: new Date().toISOString(), duration_seconds: 0 }).select('id').single(); if (error) return; setSessionId(created.id); } await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setRunning(true); };
  const finish = async () => { setRunning(false); const elapsed = TOTAL - remaining; if (sessionId) await requireSupabase().from('focus_sessions').update({ ended_at: new Date().toISOString(), duration_seconds: elapsed }).eq('id', sessionId); setSessionId(null); await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); };
  const reset = () => { setRunning(false); setRemaining(TOTAL); setSessionId(null); };
  const mins = Math.floor(remaining / 60).toString().padStart(2, '0'); const secs = (remaining % 60).toString().padStart(2, '0');
  return <Screen><View style={styles.top}><Text style={[styles.eyebrow, { color: colors.textSecondary }]}>ГЛУБОКАЯ РАБОТА</Text><Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>Фокус</Text></View>
    <View style={styles.center}><View><ProgressRing value={(TOTAL - remaining) / TOTAL * 100} size={260} label={running ? 'сессия идёт' : '25 минут'} /><View pointerEvents="none" style={styles.timerOverlay}><Text style={[styles.timer, { color: colors.text }]}>{mins}:{secs}</Text></View></View><Text numberOfLines={2} style={[styles.taskTitle, { color: colors.text }]}>{task?.title ?? 'Свободная фокус-сессия'}</Text><Text style={[styles.taskMeta, { color: colors.textSecondary }]}>{running ? 'Не спешите. Сейчас существует только одно дело.' : 'Начните, когда будете готовы защищать это время.'}</Text></View>
    <View style={styles.controls}><Pressable accessibilityRole="button" accessibilityLabel={running ? 'Пауза' : 'Начать'} onPress={running ? () => setRunning(false) : start} style={({ pressed }) => [styles.mainControl, { backgroundColor: colors.text }, pressed && styles.pressed]}>{running ? <Pause size={30} color={colors.surface} fill={colors.surface} /> : <Play size={30} color={colors.surface} fill={colors.surface} />}</Pressable><Pressable accessibilityRole="button" accessibilityLabel="Сбросить" onPress={reset} style={[styles.smallControl, { backgroundColor: colors.surface }]}><RotateCcw size={21} color={colors.text} /></Pressable></View>
    {sessionId ? <View style={styles.finish}><SecondaryButton label="Завершить сессию" icon={Square} onPress={finish} /></View> : null}
  </Screen>;
}

const styles = StyleSheet.create({ top: { paddingTop: spacing.lg }, eyebrow: { fontSize: 12, fontWeight: '600' }, title: { fontSize: 38, lineHeight: 44, fontWeight: '600', marginTop: spacing.xs }, center: { alignItems: 'center', marginTop: spacing.huge }, timerOverlay: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', paddingTop: 4 }, timer: { fontSize: 44, fontWeight: '600', fontVariant: ['tabular-nums'] }, taskTitle: { fontSize: 24, lineHeight: 31, fontWeight: '600', textAlign: 'center', marginTop: spacing.xxl, maxWidth: 420 }, taskMeta: { fontSize: 14, lineHeight: 21, textAlign: 'center', maxWidth: 360, marginTop: spacing.sm }, controls: { marginTop: spacing.xxxl, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: spacing.md }, mainControl: { width: 72, height: 72, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' }, smallControl: { width: 48, height: 48, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', position: 'absolute', right: '18%' }, pressed: { opacity: 0.75, transform: [{ scale: 0.97 }] }, finish: { marginTop: spacing.xxl } });
