/** Premium design system colors */
export const AppColors = {
  // Brand
  primary: '#1A6B3C',
  primaryDark: '#0F4D2A',
  primaryLight: '#2D9F5B',
  accent: '#E8A838',
  accentLight: '#FFF3E0',

  // Backgrounds
  background: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  card: '#FFFFFF',

  // Text
  text: '#1A1D1F',
  textSecondary: '#6F767E',
  textTertiary: '#9A9FA5',
  textMuted: '#9A9FA5',
  textOnPrimary: '#FFFFFF',

  // Borders & dividers
  border: '#EFEFEF',
  borderLight: '#F4F4F4',
  divider: '#E8ECEF',

  // Inputs
  inputBg: '#F8F9FA',

  // Feedback
  danger: '#EF4444',
  dangerLight: '#FEF2F2',
  success: '#22C55E',
  successLight: '#F0FDF4',
  warning: '#F59E0B',
  warningLight: '#FFFBEB',

  // Misc
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0,0,0,0.5)',
  shadow: '#111111',

  // Gradients (used manually via LinearGradient later if needed)
  gradientStart: '#1A6B3C',
  gradientEnd: '#2D9F5B',
};

/** Spacing scale */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

/** Border radius scale */
export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

/** Common shadow presets */
export const Shadows = {
  sm: {
    shadowColor: '#111',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#111',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  lg: {
    shadowColor: '#111',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
};
