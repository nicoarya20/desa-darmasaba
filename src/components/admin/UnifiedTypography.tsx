'use client';

import { useDarkMode } from '@/state/darkModeStore';
import { themeTokens, getResponsiveFz } from '@/utils/themeTokens';
import { Text, Title, Box, type BoxProps } from '@mantine/core';
import type React from 'react';

type TextTruncate = 'end' | 'start' | boolean;

/**
 * Unified Typography Components
 * 
 * Komponen text dengan styling konsisten di seluruh aplikasi
 * Mendukung dark mode sesuai spesifikasi darkMode.md
 * 
 * Usage:
 * import { UnifiedText, UnifiedTitle } from '@/components/admin/UnifiedTypography';
 * 
 * <UnifiedTitle order={1}>Judul Halaman</UnifiedTitle>
 * <UnifiedText size="body">Konten teks</UnifiedText>
 */

// ============================================================================
// Unified Title Component
// ============================================================================

interface UnifiedTitleProps {
  order?: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  color?: 'primary' | 'secondary' | 'brand' | string;
  mb?: string;
  mt?: string;
  ml?: string;
  mr?: string;
  mx?: string;
  my?: string;
  style?: React.CSSProperties;
}

export function UnifiedTitle({
  order = 1,
  children,
  align = 'left',
  color = 'primary',
  mb,
  mt,
  ml,
  mr,
  mx,
  my,
  style,
}: UnifiedTitleProps) {
  const { isDark } = useDarkMode();
  const tokens = themeTokens(isDark);
  const responsiveFz = getResponsiveFz(isDark);

  const getTypography = () => {
    switch (order) {
      case 1:
        return tokens.typography.h1;
      case 2:
        return tokens.typography.h2;
      case 3:
        return tokens.typography.h3;
      case 4:
        return tokens.typography.h4;
      default:
        return tokens.typography.body;
    }
  };

  const typo = getTypography();

  const getColor = () => {
    if (color === 'primary') return tokens.colors.text.primary;
    if (color === 'secondary') return tokens.colors.text.secondary;
    if (color === 'brand') return tokens.colors.text.brand;
    return color;
  };

  return (
    <Title
      order={order}
      ta={align}
      fz={{ base: responsiveFz.base, md: typo.fz }}
      fw={typo.fw}
      lh={typo.lh}
      c={getColor()}
      mb={mb}
      mt={mt}
      ml={ml}
      mr={mr}
      mx={mx}
      my={my}
      style={style}
    >
      {children}
    </Title>
  );
}

// ============================================================================
// Unified Text Component
// ============================================================================

interface UnifiedTextProps {
  size?: 'small' | 'body' | 'label';
  weight?: 'normal' | 'medium' | 'bold';
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  color?: 'primary' | 'secondary' | 'tertiary' | 'muted' | 'brand' | 'link' | string;
  lineClamp?: number;
  truncate?: TextTruncate;
  span?: boolean;
  mt?: string;
  mb?: string;
  ml?: string;
  mr?: string;
  mx?: string;
  my?: string;
  style?: React.CSSProperties;
}

export function UnifiedText({
  size = 'body',
  weight = 'normal',
  children,
  align = 'left',
  color = 'primary',
  lineClamp,
  truncate,
  span = false,
  mt,
  mb,
  ml,
  mr,
  mx,
  my,
  style,
}: UnifiedTextProps) {
  const { isDark } = useDarkMode();
  const tokens = themeTokens(isDark);

  const getTypography = () => {
    switch (size) {
      case 'small':
        return tokens.typography.small;
      case 'label':
        return tokens.typography.label;
      default:
        return tokens.typography.body;
    }
  };

  const getWeight = () => {
    switch (weight) {
      case 'normal':
        return 400;
      case 'medium':
        return 500;
      case 'bold':
        return 700;
      default:
        return 400;
    }
  };

  const getColor = () => {
    switch (color) {
      case 'primary':
        return tokens.colors.text.primary;
      case 'secondary':
        return tokens.colors.text.secondary;
      case 'tertiary':
        return tokens.colors.text.tertiary;
      case 'muted':
        return tokens.colors.text.muted;
      case 'brand':
        return tokens.colors.text.brand;
      case 'link':
        return tokens.colors.text.link;
      default:
        return color;
    }
  };

  const typo = getTypography();
  const fw = getWeight();
  const textColor = getColor();

  if (span) {
    return (
      <Text
        ta={align}
        fz={typo.fz}
        fw={fw}
        lh={typo.lh}
        c={textColor}
        lineClamp={lineClamp}
        truncate={truncate}
        mt={mt}
        mb={mb}
        ml={ml}
        mr={mr}
        mx={mx}
        my={my}
        style={style}
      >
        {children}
      </Text>
    );
  }

  return (
    <Text
      ta={align}
      fz={typo.fz}
      fw={fw}
      lh={typo.lh}
      c={textColor}
      lineClamp={lineClamp}
      truncate={truncate}
      mt={mt}
      mb={mb}
      ml={ml}
      mr={mr}
      mx={mx}
      my={my}
      style={style}
    >
      {children}
    </Text>
  );
}

// ============================================================================
// Unified Page Header Component
// 
// Header standar untuk setiap halaman admin
// Sesuai spesifikasi: Section Header dengan font weight lebih besar
// ============================================================================

interface UnifiedPageHeaderProps extends BoxProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  showBorder?: boolean;
}

export function UnifiedPageHeader({
  title,
  subtitle,
  action,
  showBorder = true,
  style,
  ...props
}: UnifiedPageHeaderProps) {
  const { isDark } = useDarkMode();
  const tokens = themeTokens(isDark);

  return (
    <Box
      mb="lg"
      style={{
        borderBottom: showBorder ? `1px solid ${tokens.colors.border.soft}` : 'none',
        paddingBottom: showBorder ? tokens.spacing.md : 0,
        ...style,
      }}
      {...props}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: tokens.spacing.md,
        }}
      >
        <div>
          <UnifiedTitle order={3} color="primary">{title}</UnifiedTitle>
          {subtitle && (
            <UnifiedText size="small" color="secondary" mt="xs">
              {subtitle}
            </UnifiedText>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
    </Box>
  );
}

export default UnifiedText;
