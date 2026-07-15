import { Redirect } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';

export default function Index() {
  const { session, profile, recovery } = useAuth();
  if (recovery) return <Redirect href="/recovery" />;
  if (!session) return <Redirect href="/(auth)/welcome" />;
  if (!profile?.onboarding_completed) return <Redirect href="/onboarding" />;
  return <Redirect href="/(app)" />;
}
