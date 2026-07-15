import { useColorScheme } from 'react-native';

export const palette = {
  light: {
    background: '#F5F4F1', surface: '#FFFFFF', surfaceSecondary: '#ECEAE6',
    text: '#17171A', textSecondary: '#67666C', border: '#DEDDD9',
    accent: '#6C4DFF', accentSoft: '#E9E4FF', success: '#268A59',
    warning: '#B46916', danger: '#C33D48', info: '#3478C8', scrim: 'rgba(17,17,19,0.46)',
  },
  dark: {
    background: '#111113', surface: '#1A1A1D', surfaceSecondary: '#232327',
    text: '#F7F7F8', textSecondary: '#A6A5AB', border: '#303035',
    accent: '#8B74FF', accentSoft: '#2D274A', success: '#53C88B',
    warning: '#E3A24D', danger: '#FF727C', info: '#62A8F5', scrim: 'rgba(0,0,0,0.62)',
  },
} as const;

export const spacing = { xxs: 4, xs: 8, sm: 12, md: 16, lg: 20, xl: 24, xxl: 32, xxxl: 40, huge: 48 } as const;
export const radius = { small: 4, medium: 8, large: 12, full: 999 } as const;
export const motion = { tap: 100, standard: 220, sheet: 300, progress: 700 } as const;

export function useTheme() {
  const scheme = useColorScheme();
  return { colors: scheme === 'dark' ? palette.dark : palette.light, isDark: scheme === 'dark' };
}

export type ThemeColors = typeof palette.light | typeof palette.dark;
