'use client';

import { useDarkMode } from '@/state/darkModeStore';
import { themeTokens } from '@/utils/themeTokens';
import { Paper, Box, BoxProps, Divider, DividerProps } from '@mantine/core';
import React from 'react';

/**
 * Unified Surface Components
 * 
 * Komponen container/card dengan styling konsisten
 * Mendukung dark mode sesuai spesifikasi darkMode.md
 * 
 * Usage:
 * import { UnifiedCard, UnifiedDivider } from '@/components/admin/UnifiedSurface';
 * 
 * <UnifiedCard>
 *   <UnifiedCard.Header>Title</UnifiedCard.Header>
 *   <UnifiedCard.Body>Content</UnifiedCard.Body>
 * </UnifiedCard>
 */

// ============================================================================
// Unified Card Component
 * ============================================================================

interface UnifiedCardProps extends BoxProps {
  withBorder?: boolean;
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  hoverable?: boolean;
  children: React.ReactNode;
}

export function UnifiedCard({
  withBorder = true,
  shadow = 'none',  // Sesuai spec: Jangan pakai shadow hitam
  padding = 'md',
  hoverable = false,
  children,
  style,
  ...props
}: UnifiedCardProps) {
  const { isDark } = useDarkMode();
  const tokens = themeTokens(isDark);

  const getPadding = () => {
    switch (padding) {
      case 'none':
        return 0;
      case 'xs':
        return tokens.spacing.xs;
      case 'sm':
        return tokens.spacing.sm;
      case 'md':
        return tokens.spacing.md;
      case 'lg':
        return tokens.spacing.lg;
      case 'xl':
        return tokens.spacing.xl;
      default:
        return tokens.spacing.md;
    }
  };

  return (
    <Paper
      withBorder={withBorder}
      bg={tokens.colors.bg.card}
      p={getPadding()}
      radius={tokens.radius.lg}  // 12-16px sesuai spec
      style={{
        borderColor: tokens.colors.border.default,
        transition: hoverable
          ? 'transform 0.2s ease, box-shadow 0.2s ease'
          : 'box-shadow 0.2s ease',
        '&:hover': hoverable
          ? {
              transform: 'translateY(-2px)',
            }
          : {},
        ...style,
      }}
      {...props}
    >
      {children}
    </Paper>
  );
}

// ============================================================================
// Unified Card Section Components
// ============================================================================

interface UnifiedCardSectionProps {
  children: React.ReactNode;
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg';
  border?: 'none' | 'top' | 'bottom';
  style?: React.CSSProperties;
}

UnifiedCard.Header = function UnifiedCardHeader({
  children,
  padding = 'md',
  border = 'bottom',
  style,
}: UnifiedCardSectionProps) {
  const { isDark } = useDarkMode();
  const tokens = themeTokens(isDark);

  const getPadding = () => {
    switch (padding) {
      case 'none':
        return 0;
      case 'xs':
        return tokens.spacing.xs;
      case 'sm':
        return tokens.spacing.sm;
      case 'md':
        return tokens.spacing.md;
      case 'lg':
        return tokens.spacing.lg;
      default:
        return tokens.spacing.md;
    }
  };

  const borderBottom = border === 'bottom' ? `1px solid ${tokens.colors.border.soft}` : 'none';
  const borderTop = border === 'top' ? `1px solid ${tokens.colors.border.soft}` : 'none';

  return (
    <Box
      style={{
        paddingBottom: getPadding(),
        borderBottom,
        borderTop,
        ...style,
      }}
    >
      {children}
    </Box>
  );
};

UnifiedCard.Body = function UnifiedCardBody({
  children,
  padding = 'md',
  style,
}: UnifiedCardSectionProps) {
  const { isDark } = useDarkMode();
  const tokens = themeTokens(isDark);

  const getPadding = () => {
    switch (padding) {
      case 'none':
        return 0;
      case 'xs':
        return tokens.spacing.xs;
      case 'sm':
        return tokens.spacing.sm;
      case 'md':
        return tokens.spacing.md;
      case 'lg':
        return tokens.spacing.lg;
      default:
        return tokens.spacing.md;
    }
  };

  return (
    <Box style={{ paddingTop: getPadding(), paddingBottom: getPadding(), ...style }}>
      {children}
    </Box>
  );
};

UnifiedCard.Footer = function UnifiedCardFooter({
  children,
  padding = 'md',
  border = 'top',
  style,
}: UnifiedCardSectionProps) {
  const { isDark } = useDarkMode();
  const tokens = themeTokens(isDark);

  const getPadding = () => {
    switch (padding) {
      case 'none':
        return 0;
      case 'xs':
        return tokens.spacing.xs;
      case 'sm':
        return tokens.spacing.sm;
      case 'md':
        return tokens.spacing.md;
      case 'lg':
        return tokens.spacing.lg;
      default:
        return tokens.spacing.md;
    }
  };

  const borderBottom = border === 'bottom' ? `1px solid ${tokens.colors.border.soft}` : 'none';
  const borderTop = border === 'top' ? `1px solid ${tokens.colors.border.soft}` : 'none';

  return (
    <Box
      style={{
        paddingTop: getPadding(),
        borderBottom,
        borderTop,
        ...style,
      }}
    >
      {children}
    </Box>
  );
};

// ============================================================================
// Unified Divider Component
// ============================================================================

interface UnifiedDividerProps extends DividerProps {
  variant?: 'default' | 'soft' | 'strong';
}

export function UnifiedDivider({
  variant = 'soft',  // Default soft sesuai spec
  my = 'md',
  ...props
}: UnifiedDividerProps) {
  const { isDark } = useDarkMode();
  const tokens = themeTokens(isDark);

  const getColor = () => {
    switch (variant) {
      case 'default':
        return tokens.colors.border.default;
      case 'soft':
        return tokens.colors.border.soft;
      case 'strong':
        return tokens.colors.border.strong;
      default:
        return tokens.colors.border.soft;
    }
  };

  return <Divider my={my} color={getColor()} {...props} />;
}

export default UnifiedCard;
