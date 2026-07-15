import 'react-native-reanimated';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/theme/tokens';

function Navigator() {
  const { session, profile, loading, recovery } = useAuth();
  const { colors, isDark } = useTheme();
  if (loading) return <View style={[styles.loading, { backgroundColor: colors.background }]}><ActivityIndicator color={colors.accent} /></View>;
  return <>
    <StatusBar style={isDark ? 'light' : 'dark'} />
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background }, animation: 'fade_from_bottom' }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={!session}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={Boolean(session) && !profile?.onboarding_completed && !recovery}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>
      <Stack.Protected guard={Boolean(session) && Boolean(profile?.onboarding_completed) && !recovery}>
        <Stack.Screen name="(app)" />
        <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
        <Stack.Screen name="change-email" options={{ presentation: 'modal' }} />
        <Stack.Screen name="change-password" options={{ presentation: 'modal' }} />
        <Stack.Screen name="delete-account" options={{ presentation: 'modal' }} />
        <Stack.Screen name="new-task" options={{ presentation: 'modal' }} />
        <Stack.Screen name="new-goal" options={{ presentation: 'modal' }} />
      </Stack.Protected>
      <Stack.Protected guard={Boolean(session) && recovery}>
        <Stack.Screen name="recovery" />
      </Stack.Protected>
    </Stack>
  </>;
}

export default function RootLayout() {
  return <GestureHandlerRootView style={styles.root}><AuthProvider><Navigator /></AuthProvider></GestureHandlerRootView>;
}

const styles = StyleSheet.create({ root: { flex: 1 }, loading: { flex: 1, alignItems: 'center', justifyContent: 'center' } });
