'use client';

import { useDarkMode } from '@/state/darkModeStore';
import { themeTokens } from '@/utils/themeTokens';
import { ActionIcon, Tooltip, Transition } from '@mantine/core';
import { IconMoon, IconSun } from '@tabler/icons-react';

/**
 * Dark Mode Toggle Button
 *
 * Component untuk toggle dark/light mode
 *
 * Usage:
 * import { DarkModeToggle } from '@/components/admin/DarkModeToggle';
 *
 * <DarkModeToggle />
 */

interface DarkModeToggleProps {
  variant?: 'light' | 'filled' | 'outline' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  showTooltip?: boolean;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
}

export function DarkModeToggle({
  variant = 'light',
  size = 'lg',
  color,
  showTooltip = true,
  tooltipPosition = 'bottom',
}: DarkModeToggleProps) {
  const { isDark, toggle } = useDarkMode();
  const tokens = themeTokens(isDark);

  const iconColor = color || tokens.colors.primary;

  return (
    <Tooltip
      label={isDark ? 'Mode Terang' : 'Mode Gelap'}
      position={tooltipPosition}
      withArrow
      disabled={!showTooltip}
    >
      <ActionIcon
        variant={variant}
        size={size}
        radius="xl"
        onClick={toggle}
        color={iconColor}
        style={{
          transition: 'all 0.3s ease',
          transform: 'scale(1)',
          '&:hover': {
            transform: 'scale(1.1)',
          },
        }}
      >
        {/* Icon Sun untuk Light Mode */}
        <Transition mounted={!isDark} transition="scale" duration={200}>
          {(style) => (
            <IconSun style={style} size={20} stroke={1.5} />
          )}
        </Transition>

        {/* Icon Moon untuk Dark Mode */}
        <Transition mounted={isDark} transition="scale" duration={200}>
          {(style) => (
            <IconMoon style={style} size={20} stroke={1.5} />
          )}
        </Transition>
      </ActionIcon>
    </Tooltip>
  );
}

export default DarkModeToggle;
