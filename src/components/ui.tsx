import React, { type ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { ArrowLeft, Check, Clock3, Eye, EyeOff, Plus, type LucideIcon } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { radius, spacing, useTheme } from '@/theme/tokens';

export function BrandMark({ size = 52 }: { size?: number }) {
  const { colors } = useTheme();
  return <View accessibilityLabel="Chronos" style={[styles.mark, { width: size, height: size, borderRadius: Math.round(size * 0.25), backgroundColor: colors.text }]}> 
    <View style={[styles.markRing, { borderColor: colors.accent, width: size * 0.55, height: size * 0.55, borderRadius: size }]} />
    <View style={[styles.markHand, { backgroundColor: colors.surface, height: size * 0.2 }]} />
  </View>;
}

export function Screen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  const { colors } = useTheme();
  const content = <View style={styles.screenInner}>{children}</View>;
  return <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
    {scroll ? <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>{content}</ScrollView> : content}
  </SafeAreaView>;
}

export function PageEnter({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  return <Animated.View entering={reduced ? undefined : FadeInDown.duration(260).springify().damping(20)} style={styles.flex}>{children}</Animated.View>;
}

export function PageHeader({ title, eyebrow, action, onBack }: { title: string; eyebrow?: string; action?: ReactNode; onBack?: () => void }) {
  const { colors } = useTheme();
  return <View style={styles.header}>
    <View style={styles.headerTop}>
      {onBack ? <IconButton icon={ArrowLeft} label="Назад" onPress={onBack} /> : <View style={styles.headerSpacer} />}
      {action ?? <View style={styles.headerSpacer} />}
    </View>
    {eyebrow ? <Text style={[styles.eyebrow, { color: colors.textSecondary }]}>{eyebrow}</Text> : null}
    <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>{title}</Text>
  </View>;
}

export function IconButton({ icon: Icon, label, onPress, disabled }: { icon: LucideIcon; label: string; onPress: () => void; disabled?: boolean }) {
  const { colors } = useTheme();
  return <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.iconButton, { backgroundColor: colors.surface }, pressed && styles.pressed, disabled && styles.disabled]}>
    <Icon size={20} strokeWidth={1.8} color={colors.text} />
  </Pressable>;
}

export function PrimaryButton({ label, onPress, loading, disabled, icon: Icon }: { label: string; onPress: () => void; loading?: boolean; disabled?: boolean; icon?: LucideIcon }) {
  const { colors } = useTheme();
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: disabled || loading, busy: loading }} onPress={onPress} disabled={disabled || loading} style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.accent }, pressed && styles.pressed, (disabled || loading) && styles.disabled]}>
    {loading ? <ActivityIndicator color="#FFFFFF" /> : <>{Icon ? <Icon size={19} color="#FFFFFF" strokeWidth={2} /> : null}<Text style={styles.primaryLabel}>{label}</Text></>}
  </Pressable>;
}

export function SecondaryButton({ label, onPress, icon: Icon, danger }: { label: string; onPress: () => void; icon?: LucideIcon; danger?: boolean }) {
  const { colors } = useTheme();
  const color = danger ? colors.danger : colors.text;
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.secondaryButton, { borderColor: colors.border, backgroundColor: colors.surface }, pressed && styles.pressed]}>
    {Icon ? <Icon size={19} color={color} strokeWidth={1.8} /> : null}<Text style={[styles.secondaryLabel, { color }]}>{label}</Text>
  </Pressable>;
}

export function TextButton({ label, onPress }: { label: string; onPress: () => void }) {
  const { colors } = useTheme();
  return <Pressable accessibilityRole="button" hitSlop={8} onPress={onPress} style={({ pressed }) => [styles.textButton, pressed && styles.pressed]}><Text style={[styles.textButtonLabel, { color: colors.accent }]}>{label}</Text></Pressable>;
}

type FieldProps = TextInputProps & { label: string; error?: string; password?: boolean };
export function Field({ label, error, password, ...props }: FieldProps) {
  const { colors } = useTheme();
  const [visible, setVisible] = React.useState(false);
  return <View style={styles.fieldWrap}>
    <Text style={[styles.fieldLabel, { color: colors.text }]}>{label}</Text>
    <View style={[styles.field, { backgroundColor: colors.surface, borderColor: error ? colors.danger : colors.border }]}>
      <TextInput {...props} accessibilityLabel={props.accessibilityLabel ?? label} secureTextEntry={password && !visible} placeholderTextColor={colors.textSecondary} style={[styles.input, { color: colors.text }]} />
      {password ? <Pressable accessibilityRole="button" accessibilityLabel={visible ? 'Скрыть пароль' : 'Показать пароль'} onPress={() => setVisible((value) => !value)} style={styles.eyeButton}>{visible ? <EyeOff size={20} color={colors.textSecondary} /> : <Eye size={20} color={colors.textSecondary} />}</Pressable> : null}
    </View>
    {error ? <Text accessibilityRole="alert" style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
  </View>;
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  const { colors } = useTheme();
  return <View style={styles.empty}><View style={[styles.emptyIcon, { backgroundColor: colors.accentSoft }]}><Clock3 size={24} color={colors.accent} /></View><Text style={[styles.emptyTitle, { color: colors.text }]}>{title}</Text><Text style={[styles.emptyBody, { color: colors.textSecondary }]}>{body}</Text>{action}</View>;
}

export const AddIcon = Plus;
export const DoneIcon = Check;

const styles = StyleSheet.create({
  safe: { flex: 1 }, flex: { flex: 1 }, scroll: { flexGrow: 1 }, screenInner: { width: '100%', maxWidth: 680, alignSelf: 'center', paddingHorizontal: spacing.lg, paddingBottom: 120, flex: 1 },
  mark: { alignItems: 'center', justifyContent: 'center', boxShadow: '0 7px 14px rgba(0,0,0,0.14)' }, markRing: { borderWidth: 4 }, markHand: { position: 'absolute', width: 2, top: '27%', left: '49%', transformOrigin: 'bottom' },
  header: { paddingTop: spacing.sm, paddingBottom: spacing.xl }, headerTop: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg }, headerSpacer: { width: 44, height: 44 }, eyebrow: { fontSize: 14, lineHeight: 20, marginBottom: spacing.xs }, title: { fontSize: 36, lineHeight: 42, fontWeight: '600', letterSpacing: 0 },
  iconButton: { width: 44, height: 44, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' }, pressed: { opacity: 0.72, transform: [{ scale: 0.985 }] }, disabled: { opacity: 0.45 },
  primaryButton: { minHeight: 52, borderRadius: radius.medium, paddingHorizontal: spacing.lg, flexDirection: 'row', gap: spacing.xs, alignItems: 'center', justifyContent: 'center' }, primaryLabel: { color: '#FFFFFF', fontSize: 16, lineHeight: 22, fontWeight: '600' },
  secondaryButton: { minHeight: 52, borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.medium, paddingHorizontal: spacing.lg, flexDirection: 'row', gap: spacing.xs, alignItems: 'center', justifyContent: 'center' }, secondaryLabel: { fontSize: 16, fontWeight: '600' },
  textButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xs }, textButtonLabel: { fontSize: 15, fontWeight: '600' },
  fieldWrap: { gap: spacing.xs }, fieldLabel: { fontSize: 14, lineHeight: 20, fontWeight: '500' }, field: { minHeight: 54, borderRadius: radius.medium, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', alignItems: 'center' }, input: { flex: 1, minHeight: 52, paddingHorizontal: spacing.md, fontSize: 16 }, eyeButton: { width: 48, height: 52, alignItems: 'center', justifyContent: 'center' }, error: { fontSize: 13, lineHeight: 18 },
  empty: { alignItems: 'center', paddingVertical: spacing.huge, paddingHorizontal: spacing.xl }, emptyIcon: { width: 48, height: 48, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md }, emptyTitle: { fontSize: 20, lineHeight: 26, fontWeight: '600', textAlign: 'center' }, emptyBody: { fontSize: 15, lineHeight: 22, textAlign: 'center', maxWidth: 320, marginTop: spacing.xs, marginBottom: spacing.xl },
});
