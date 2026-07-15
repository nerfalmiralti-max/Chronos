import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { CalendarDays, ChartNoAxesCombined, CircleGauge, Focus, Target } from 'lucide-react-native';
import { FloatingSceneNavigation } from '@/components/FloatingSceneNavigation';
import { useTheme } from '@/theme/tokens';

const icons = { index: CircleGauge, goals: Target, analytics: ChartNoAxesCombined, calendar: CalendarDays, timer: Focus };
export default function AppTabs() {
  const { colors } = useTheme();
  return <Tabs screenOptions={({ route }) => {
    const Icon = icons[route.name as keyof typeof icons] ?? CircleGauge;
    return {
      headerShown: false,
      tabBarActiveTintColor: colors.accent,
      tabBarInactiveTintColor: colors.textSecondary,
      tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: Platform.OS === 'web' ? 98 : 86, paddingTop: 8 },
      tabBarLabelStyle: { fontSize: 11, fontWeight: '500', marginTop: 2 },
      tabBarIcon: ({ color, size, focused }) => Platform.OS === 'web' && route.name === 'index'
        ? <FloatingSceneNavigation focused={focused} />
        : <Icon size={Math.min(size, 22)} color={color} strokeWidth={1.8} />,
    };
  }}>
    <Tabs.Screen name="index" options={{ title: 'Сегодня' }} />
    <Tabs.Screen name="goals" options={{ title: 'Цели' }} />
    <Tabs.Screen name="analytics" options={{ title: 'Аналитика' }} />
    <Tabs.Screen name="calendar" options={{ title: 'Календарь' }} />
    <Tabs.Screen name="timer" options={{ title: 'Фокус' }} />
  </Tabs>;
}
