/**
 * Unified Theme Tokens for Admin Dashboard
 * 
 * Berdasarkan spesifikasi: darkMode.md
 * 
 * Semua styling constants disimpan di sini untuk konsistensi
 * Edit di sini = edit di seluruh aplikasi
 * 
 * Usage:
 * import { themeTokens } from '@/utils/themeTokens';
 * 
 * // Light mode (default)
 * const tokens = themeTokens(false);
 * 
 * // Dark mode
 * const tokens = themeTokens(true);
 */

export type ThemeTokens = {
  // Colors
  colors: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    gradient: {
      from: string;
      to: string;
    };
    // Backgrounds
    bg: {
      base: string;
      main: string;
      app: string;
      surface: string;
      surfaceElevated: string;
      header: string;
      navbar: string;
      card: string;
      hover: string;
      tableHeader: string;
      tableHover: string;
    };
    // Text
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
      muted: string;
      brand: string;
      inverse: string;
      link: string;
    };
    // Borders
    border: {
      default: string;
      soft: string;
      strong: string;
    };
    // Status
    success: string;
    warning: string;
    error: string;
    info: string;
  };

  // Typography
  typography: {
    h1: {
      fz: string;
      fw: number;
      lh: number;
    };
    h2: {
      fz: string;
      fw: number;
      lh: number;
    };
    h3: {
      fz: string;
      fw: number;
      lh: number;
    };
    h4: {
      fz: string;
      fw: number;
      lh: number;
    };
    body: {
      fz: string;
      fw: number;
      lh: number;
    };
    small: {
      fz: string;
      fw: number;
      lh: number;
    };
    label: {
      fz: string;
      fw: number;
      lh: number;
    };
  };

  // Spacing
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };

  // Border Radius
  radius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };

  // Shadows
  shadows: {
    none: string;
    sm: string;
    md: string;
    lg: string;
  };

  // Layout
  layout: {
    headerHeight: number;
    navbarWidth: {
      base: number;
      sm: number;
      lg: number;
    };
  };
};

export const themeTokens = (isDark: boolean = false): ThemeTokens => {
  // Base colors - tetap menggunakan colors.ts sebagai base untuk light mode
  const baseColors = {
    'orange': '#FCAE00',
    'blue-button': '#0A4E78',
    'blue-button-1': '#E5F2FA',
    'blue-button-2': '#B8DAEF',
    'blue-button-3': '#8AC1E3',
    'blue-button-4': '#5DA9D8',
    'blue-button-5': '#2F91CC',
    'blue-button-6': '#083F61',
    'blue-button-7': '#062F49',
    'blue-button-8': '#041F32',
    'blue-button-trans': '#628EC6',
    'white-1': '#FBFBFC',
    'white-trans-1': 'rgba(255, 255, 255, 0.5)',
    'white-trans-2': 'rgba(255, 255, 255, 0.7)',
    'white-trans-3': 'rgba(255, 255, 255, 0.9)',
    'grey-1': '#F4F5F6',
    'grey-2': '#CBCACD',
    'Bg': '#D1d9e8',
    'BG-trans': '#B1C5F2',
  };

  /**
   * DARK MODE PALETTE
   * Berdasarkan spesifikasi: darkMode.md
   */
  const darkColors = {
    // Background Layers
    bgBase: '#0B1220',
    bgApp: '#0F172A',
    bgCard: '#162235',
    bgSurface: '#1E2A3D',
    
    // Borders
    borderDefault: '#2A3A52',
    borderSoft: '#22314A',
    
    // Text
    textPrimary: '#E5E7EB',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    textInverse: '#020617',
    
    // Accent & Actions
    primaryAction: '#3B82F6',
    primaryHover: '#2563EB',
    primaryActive: '#1D4ED8',
    link: '#60A5FA',
    
    // Status
    success: '#22C55E',
    warning: '#FACC15',
    error: '#EF4444',
    info: '#38BDF8',
    
    // Hover states
    hoverSoft: 'rgba(255,255,255,0.03)',
    hoverMedium: 'rgba(255,255,255,0.04)',
    activeAccent: 'rgba(59,130,246,0.15)',
  };

  /**
   * LIGHT MODE PALETTE
   * Original light theme
   */
  const lightColors = {
    bgBase: '#f6f9fc',
    bgApp: '#ffffff',
    bgCard: '#ffffff',
    bgSurface: '#f8fafc',
    borderDefault: '#e2e8f0',
    borderSoft: '#e9ecef',
    textPrimary: '#1a1b1e',
    textSecondary: '#495057',
    textMuted: '#868e96',
    textInverse: '#ffffff',
    primaryAction: baseColors['blue-button'],
    primaryHover: '#083F61',
    primaryActive: '#062F49',
    link: '#2563eb',
    hoverSoft: 'rgba(25, 113, 194, 0.03)',
    hoverMedium: 'rgba(25, 113, 194, 0.05)',
    activeAccent: 'rgba(25, 113, 194, 0.1)',
    success: '#22c55e',
    warning: '#facc15',
    error: '#ef4444',
    info: '#38bdf8',
  };

  const current = isDark ? darkColors : lightColors;

  return {
    colors: {
      primary: current.primaryAction,
      primaryLight: isDark ? current.activeAccent : baseColors['blue-button-1'],
      primaryDark: current.primaryActive,
      gradient: {
        from: current.primaryAction,
        to: isDark ? '#60A5FA' : '#228be6',
      },
      bg: {
        base: current.bgBase,
        main: isDark ? current.bgBase : 'linear-gradient(180deg, #fdfdfd, #f6f9fc)',
        app: current.bgApp,
        surface: current.bgSurface,
        surfaceElevated: isDark ? '#253347' : '#ffffff',
        header: isDark
          ? `linear-gradient(180deg, ${current.bgApp} 0%, ${current.bgBase} 100%)`
          : 'linear-gradient(90deg, #ffffff, #f9fbff)',
        navbar: current.bgApp,
        card: current.bgCard,
        hover: current.hoverMedium,
        tableHeader: current.bgSurface,
        tableHover: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.02)',
      },
      text: {
        primary: current.textPrimary,
        secondary: current.textSecondary,
        tertiary: current.textMuted,
        muted: current.textMuted,
        brand: current.primaryAction,
        inverse: current.textInverse,
        link: current.link,
      },
      border: {
        default: current.borderDefault,
        soft: current.borderSoft,
        strong: isDark ? '#3A4A62' : '#ced4da',
      },
      success: current.success,
      warning: current.warning,
      error: current.error,
      info: current.info,
    },

    typography: {
      h1: {
        fz: isDark ? '2rem' : '2.25rem',
        fw: 700,
        lh: 1.2,
      },
      h2: {
        fz: isDark ? '1.75rem' : '2rem',
        fw: 700,
        lh: 1.25,
      },
      h3: {
        fz: isDark ? '1.5rem' : '1.75rem',
        fw: 700,
        lh: 1.3,
      },
      h4: {
        fz: isDark ? '1.25rem' : '1.5rem',
        fw: 600,
        lh: 1.35,
      },
      body: {
        fz: '1rem',
        fw: 400,
        lh: 1.5,
      },
      small: {
        fz: '0.875rem',
        fw: 400,
        lh: 1.4,
      },
      label: {
        fz: '0.75rem',
        fw: 600,
        lh: 1.4,
      },
    },

    spacing: {
      xs: '0.625rem',
      sm: '1rem',
      md: '1.5rem',
      lg: '2rem',
      xl: '2.5rem',
    },

    radius: {
      sm: '0.5rem',    // 8px
      md: '0.75rem',   // 12px
      lg: '1rem',      // 16px
      xl: '1.25rem',   // 20px
    },

    shadows: {
      none: 'none',
      sm: isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
      md: isDark ? '0 4px 6px rgba(0,0,0,0.3)' : '0 4px 6px rgba(0,0,0,0.1)',
      lg: isDark ? '0 10px 15px rgba(0,0,0,0.3)' : '0 10px 15px rgba(0,0,0,0.1)',
    },

    layout: {
      headerHeight: 64,
      navbarWidth: {
        base: 260,
        sm: 280,
        lg: 300,
      },
    },
  };
};

// Export default theme instances
export const lightTheme = themeTokens(false);
export const darkTheme = themeTokens(true);

// Helper untuk mendapatkan responsive font size
export const getResponsiveFz = (isDark: boolean = false) => ({
  base: isDark ? 'md' : 'lg',
  md: isDark ? 'lg' : 'xl',
});

// Helper untuk mendapatkan color berdasarkan state
export const getActiveColor = (isActive: boolean, isDark: boolean = false) => 
  isActive ? themeTokens(isDark).colors.primary : isDark ? themeTokens(isDark).colors.text.secondary : 'gray';

// Helper untuk mendapatkan background hover
export const getHoverBackground = (isActive: boolean, isDark: boolean = false) => {
  const tokens = themeTokens(isDark);
  return isActive 
    ? tokens.colors.bg.hover
    : tokens.colors.bg.hover;
};

// Helper untuk active state dengan accent bar (sidebar)
export const getActiveStateStyles = (isActive: boolean, isDark: boolean = false) => {
  const tokens = themeTokens(isDark);
  
  if (isActive) {
    return {
      backgroundColor: isDark ? tokens.colors.bg.hover : 'rgba(25, 113, 194, 0.1)',
      borderLeft: isDark ? `3px solid ${tokens.colors.primary}` : '3px solid #1971c2',
    };
  }
  
  return {
    '&:hover': {
      backgroundColor: tokens.colors.bg.hover,
    },
  };
};
