// ============================================================
// 디자인 토큰 — 색상, 타이포그래피, 간격
// ============================================================

export const colors = {
  // Primary
  primary: '#2563EB',
  primaryLight: '#EFF6FF',

  // Neutral / Slate
  white: '#FFFFFF',
  black: '#000000',
  slate50: '#F8FAFC',
  slate100: '#F1F5F9',
  slate200: '#E2E8F0',
  slate300: '#CBD5E1',
  slate400: '#94A3B8',
  slate500: '#64748B',
  slate600: '#475569',
  slate900: '#0F172A',

  // Semantic
  success: '#22C55E',
  successBg: '#F0FDF4',
  warning: '#F59E0B',
  warningBg: '#FFF7ED',
  error: '#EF4444',
  errorBg: '#FEF2F2',
} as const;

export const fontSize = {
  xs: 13,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 22,
  '2xl': 28,
  '3xl': 48,
} as const;

export const lineHeight = {
  xs: 18,
  sm: 20,
  base: 24,
  lg: 24,
  xl: 28,
  '2xl': 36,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
} as const;

export const radius = {
  sm: 4,
  md: 8,
  lg: 10,
  xl: 12,
  '2xl': 16,
  '3xl': 20,
  full: 9999,
} as const;
