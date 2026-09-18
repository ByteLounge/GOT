import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ThemeColors {
  isDark: boolean;
  background: string;
  surface: string;
  surfaceVariant: string;
  card: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
  border: string;
  badgeBg: string;
  badgeText: string;
}

const lightTheme: ThemeColors = {
  isDark: false,
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceVariant: '#F1F5F9',
  card: '#FFFFFF',
  cardBorder: '#E2E8F0',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  primary: '#1E40AF',       // Deep authoritative government blue
  primaryLight: '#3B82F6',
  primaryDark: '#1E3A8A',
  accent: '#0D9488',        // Teal
  success: '#10B981',       // Emerald
  warning: '#F59E0B',       // Amber
  danger: '#EF4444',        // Red
  border: '#E2E8F0',
  badgeBg: '#EFF6FF',
  badgeText: '#1D4ED8',
};

const darkTheme: ThemeColors = {
  isDark: true,
  background: '#0B0F19',
  surface: '#111827',
  surfaceVariant: '#1F2937',
  card: '#131D31',
  cardBorder: '#1E293B',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  primary: '#3B82F6',
  primaryLight: '#60A5FA',
  primaryDark: '#1D4ED8',
  accent: '#14B8A6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  border: '#1E293B',
  badgeBg: '#1E293B',
  badgeText: '#93C5FD',
};

interface ThemeState {
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
  initTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDark: false,
  colors: lightTheme,

  initTheme: async () => {
    try {
      const saved = await AsyncStorage.getItem('@govalert_theme');
      if (saved === 'dark') {
        set({ isDark: true, colors: darkTheme });
      } else {
        set({ isDark: false, colors: lightTheme });
      }
    } catch {
      set({ isDark: false, colors: lightTheme });
    }
  },

  toggleTheme: async () => {
    const nextDark = !get().isDark;
    set({ isDark: nextDark, colors: nextDark ? darkTheme : lightTheme });
    await AsyncStorage.setItem('@govalert_theme', nextDark ? 'dark' : 'light');
  },
}));
