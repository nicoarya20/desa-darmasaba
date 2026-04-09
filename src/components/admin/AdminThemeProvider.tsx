'use client';

import { useDarkMode } from '@/state/darkModeStore';
import { themeTokens } from '@/utils/themeTokens';
import { MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';
import '@/styles/dark-mode-table.css';
import type React from 'react';

/**
 * Admin Theme Provider
 * 
 * Wrapper untuk MantineProvider dengan custom theme
 * Mendukung dark mode otomatis
 * 
 * Usage:
 * import { AdminThemeProvider } from '@/components/admin/AdminThemeProvider';
 * 
 * <AdminThemeProvider>
 *   <YourComponent />
 * </AdminThemeProvider>
 */

interface AdminThemeProviderProps {
  children: React.ReactNode;
  forceTheme?: 'light' | 'dark';
}

export function AdminThemeProvider({ children, forceTheme }: AdminThemeProviderProps) {
  const { isDark } = useDarkMode();
  
  // Use forced theme if provided, otherwise use store
  const useDark = forceTheme ? forceTheme === 'dark' : isDark;
  const tokens = themeTokens(useDark);

  const theme = createTheme({
    colors: {
      primary: [
        tokens.colors.primaryLight,
        tokens.colors.primaryLight,
        tokens.colors.primary,
        tokens.colors.primary,
        tokens.colors.primary,
        tokens.colors.primary,
        tokens.colors.primaryDark,
        tokens.colors.primaryDark,
        tokens.colors.primaryDark,
        tokens.colors.primaryDark,
      ],
    },
    primaryColor: 'primary',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontFamilyMonospace: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
    
    // Override default colors based on mode
    white: tokens.colors.text.inverse,
    black: tokens.colors.text.primary,
    
    // CSS variables for table hover
    activeClassName: useDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.02)',
    
    // Component defaults
    components: {
      Paper: {
        defaultProps: {
          bg: tokens.colors.bg.card,
          radius: 'md',
          shadow: 'sm',
        },
      },
      Button: {
        defaultProps: {
          radius: 'md',
        },
      },
      TextInput: {
        defaultProps: {
          radius: 'md',
        },
      },
      Select: {
        defaultProps: {
          radius: 'md',
        },
      },
      Modal: {
        defaultProps: {
          radius: 'lg',
        },
      },
      Table: {
        defaultProps: {
          highlightOnHover: true,
        },
      },
    },
  });

  return (
    <MantineProvider
      theme={theme}
      forceColorScheme={useDark ? 'dark' : 'light'}
      defaultColorScheme={useDark ? 'dark' : 'light'}
    >
      <div
        style={{
          backgroundColor: tokens.colors.bg.main,
          color: tokens.colors.text.primary,
          minHeight: '100vh',
          transition: 'background-color 0.3s ease, color 0.3s ease',
        }}
      >
        {children}
      </div>
    </MantineProvider>
  );
}

export default AdminThemeProvider;
