import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { requireSupabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import type { FocusSession, Goal, Task } from '@/types/database.types';

export function useChronosData() {
  const { session } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true); setError('');
    try {
      const client = requireSupabase();
      const [goalsResult, tasksResult, sessionsResult] = await Promise.all([
        client.from('goals').select('*').order('created_at', { ascending: false }),
        client.from('tasks').select('*').order('scheduled_at', { ascending: true, nullsFirst: false }),
        client.from('focus_sessions').select('*').order('started_at', { ascending: false }).limit(120),
      ]);
      const firstError = goalsResult.error || tasksResult.error || sessionsResult.error;
      if (firstError) throw firstError;
      setGoals(goalsResult.data ?? []); setTasks(tasksResult.data ?? []); setSessions(sessionsResult.data ?? []);
    } catch { setError('Не удалось обновить данные. Проверьте подключение.'); } finally { setLoading(false); }
  }, [session]);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  return { goals, tasks, sessions, loading, error, reload: load };
}
