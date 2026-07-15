import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '@/theme/tokens';

export function ProgressRing({ value, size = 188, label = 'прогресс дня' }: { value: number; size?: number; label?: string }) {
  const { colors } = useTheme(); const stroke = 12; const radius = (size - stroke) / 2; const circumference = 2 * Math.PI * radius; const progress = Math.max(0, Math.min(100, value));
  return <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(progress) }} style={{ width: size, height: size }}>
    <Svg width={size} height={size} style={StyleSheet.absoluteFill}><Circle cx={size / 2} cy={size / 2} r={radius} stroke={colors.surfaceSecondary} strokeWidth={stroke} fill="none" /><Circle cx={size / 2} cy={size / 2} r={radius} stroke={colors.accent} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={circumference * (1 - progress / 100)} rotation={-90} origin={`${size / 2}, ${size / 2}`} /></Svg>
    <View style={styles.center}><Text style={[styles.value, { color: colors.text }]}>{Math.round(progress)}%</Text><Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text></View>
  </View>;
}

const styles = StyleSheet.create({ center: { flex: 1, alignItems: 'center', justifyContent: 'center' }, value: { fontSize: 38, lineHeight: 44, fontWeight: '600', fontVariant: ['tabular-nums'] }, label: { fontSize: 12, marginTop: 2 } });
