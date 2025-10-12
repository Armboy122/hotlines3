/**
 * Modern Minimal + Glassmorphism Theme Configuration
 * Design System for HotlineS3 - Utility Maintenance Management System
 */

export const colors = {
  // Primary Colors
  primary: {
    green: {
      main: '#10B981',        // emerald-500
      light: '#34D399',       // emerald-400
      dark: '#059669',        // emerald-600
      darker: '#047857',      // emerald-700
      glass: 'rgba(16, 185, 129, 0.1)',
      glassMedium: 'rgba(16, 185, 129, 0.2)',
    },
    blue: {
      main: '#3B82F6',        // blue-500
      light: '#60A5FA',       // blue-400
      dark: '#2563EB',        // blue-600
      darker: '#1D4ED8',      // blue-700
      glass: 'rgba(59, 130, 246, 0.1)',
      glassMedium: 'rgba(59, 130, 246, 0.2)',
    },
  },

  // Accent Colors
  accent: {
    yellow: {
      main: '#FBBF24',        // amber-400
      dark: '#F59E0B',        // amber-500
      glass: 'rgba(251, 191, 36, 0.1)',
    },
    orange: {
      main: '#F59E0B',        // amber-500
      dark: '#D97706',        // amber-600
      glass: 'rgba(245, 158, 11, 0.1)',
    },
    purple: {
      main: '#A855F7',        // purple-500
      light: '#C084FC',       // purple-400
      dark: '#9333EA',        // purple-600
      glass: 'rgba(168, 85, 247, 0.1)',
    },
    teal: {
      main: '#14B8A6',        // teal-500
      light: '#2DD4BF',       // teal-400
      dark: '#0D9488',        // teal-600
      glass: 'rgba(20, 184, 166, 0.1)',
    },
  },

  // Semantic Colors
  semantic: {
    success: '#10B981',       // emerald-500
    warning: '#F59E0B',       // amber-500
    error: '#EF4444',         // red-500
    info: '#3B82F6',          // blue-500
  },

  // Glass Effects
  glass: {
    white: 'rgba(255, 255, 255, 0.7)',
    whiteMedium: 'rgba(255, 255, 255, 0.8)',
    whiteLight: 'rgba(255, 255, 255, 0.5)',
    dark: 'rgba(0, 0, 0, 0.4)',
    border: 'rgba(255, 255, 255, 0.18)',
    borderMedium: 'rgba(255, 255, 255, 0.3)',
  },

  // Neutral Colors
  neutral: {
    white: '#FFFFFF',
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
  },
}

// Gradient Presets
export const gradients = {
  primary: {
    greenEmerald: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    greenTeal: 'linear-gradient(135deg, #10B981 0%, #14B8A6 100%)',
    greenYellow: 'linear-gradient(135deg, #10B981 0%, #34D399 50%, #FBBF24 100%)',
  },
  secondary: {
    blueLight: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
    blueDark: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
  },
  accent: {
    yellowOrange: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
    purpleLight: 'linear-gradient(135deg, #A855F7 0%, #C084FC 100%)',
  },
  hero: {
    greenEmeraldTeal: 'linear-gradient(135deg, #10B981 0%, #059669 50%, #14B8A6 100%)',
    multiColor: 'linear-gradient(135deg, #10B981 0%, #3B82F6 50%, #A855F7 100%)',
  },
  background: {
    subtle: 'linear-gradient(180deg, #F0FDF4 0%, #FFFFFF 50%, #EFF6FF 100%)',
  },
}

// Shadow Presets
export const shadows = {
  glass: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
  glassLg: '0 16px 48px 0 rgba(31, 38, 135, 0.2)',
  colored: {
    green: '0 10px 40px -10px rgba(16, 185, 129, 0.3)',
    greenLg: '0 20px 60px -10px rgba(16, 185, 129, 0.4)',
    blue: '0 10px 40px -10px rgba(59, 130, 246, 0.3)',
    blueLg: '0 20px 60px -10px rgba(59, 130, 246, 0.4)',
    yellow: '0 10px 40px -10px rgba(251, 191, 36, 0.3)',
    purple: '0 10px 40px -10px rgba(168, 85, 247, 0.3)',
  },
}

// Blur Levels
export const blur = {
  sm: '4px',      // backdrop-blur-sm
  md: '12px',     // backdrop-blur-md
  lg: '16px',     // backdrop-blur-lg
  xl: '24px',     // backdrop-blur-xl
  '2xl': '40px',  // backdrop-blur-2xl
}

// Animation Durations
export const animation = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
}

// Spacing Scale (consistent with Tailwind)
export const spacing = {
  xs: '0.5rem',   // 8px
  sm: '0.75rem',  // 12px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  '2xl': '3rem',  // 48px
  '3xl': '4rem',  // 64px
}

// Border Radius
export const borderRadius = {
  sm: '0.5rem',   // 8px
  md: '0.75rem',  // 12px
  lg: '1rem',     // 16px
  xl: '1.5rem',   // 24px
  '2xl': '2rem',  // 32px
  full: '9999px',
}

// Typography
export const typography = {
  fontFamily: {
    sans: 'var(--font-geist-sans), Arial, Helvetica, sans-serif',
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
}

// Breakpoints (consistent with Tailwind)
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}

// Z-Index Scale
export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
}

// Export default theme object
export const theme = {
  colors,
  gradients,
  shadows,
  blur,
  animation,
  spacing,
  borderRadius,
  typography,
  breakpoints,
  zIndex,
}

export default theme
