/**
 * Production Theme Constants for Expo React Native Boilerplate
 * Clean, modern design tokens for consistent mobile UI
 */

export const THEME = {
  colors: {
    primary: '#2563EB',       // Blue 600
    primaryLight: '#DBEAFE',  // Blue 100
    primaryDark: '#1D4ED8',   // Blue 700
    secondary: '#0F172A',     // Slate 900
    background: '#F8FAFC',    // Slate 50
    card: '#FFFFFF',
    surface: '#F1F5F9',       // Slate 100
    textPrimary: '#0F172A',   // Slate 900
    textSecondary: '#64748B', // Slate 500
    textMuted: '#94A3B8',     // Slate 400
    border: '#E2E8F0',        // Slate 200
    borderLight: '#F1F5F9',
    success: '#16A34A',       // Green 600
    successLight: '#DCFCE7',
    warning: '#D97706',       // Amber 600
    warningLight: '#FEF3C7',
    danger: '#DC2626',        // Red 600
    dangerLight: '#FEE2E2',
    white: '#FFFFFF',
    black: '#000000',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
  borderRadius: {
    sm: 6,
    md: 10,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  typography: {
    title: {
      fontSize: 24,
      fontWeight: '700' as const,
      lineHeight: 30,
      color: '#0F172A',
    },
    subtitle: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 24,
      color: '#1E293B',
    },
    body: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
      color: '#334155',
    },
    bodyMedium: {
      fontSize: 14,
      fontWeight: '500' as const,
      lineHeight: 20,
      color: '#334155',
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16,
      color: '#64748B',
    },
    button: {
      fontSize: 15,
      fontWeight: '600' as const,
      lineHeight: 20,
      color: '#FFFFFF',
    },
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 3,
    },
  },
};

export type Theme = typeof THEME;
