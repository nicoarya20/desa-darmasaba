'use client';
import { Box, Group, Stack, Text } from '@mantine/core';
import { useDarkMode } from '@/state/darkModeStore';
import { themeTokens } from '@/utils/themeTokens';
import type { ProviderStatus } from '../jenna-form.logic';

type Props = {
  status: ProviderStatus;
  /** Kartu: satu baris tanpa detail. */
  compact?: boolean;
  /** Teks tambahan setelah label (mis. "Disimpan …"), hanya versi lengkap. */
  note?: string;
};

export function JennaProviderStatus({ status, compact = false, note }: Props) {
  const { isDark } = useDarkMode();
  const tokens = themeTokens(isDark);
  const dot = (
    <Box
      aria-hidden
      w={8}
      h={8}
      style={{ borderRadius: '50%', flex: '0 0 auto', background: `var(--mantine-color-${status.tone}-6)` }}
    />
  );

  if (compact) {
    return (
      <Group gap={6} wrap="nowrap">
        {dot}
        <Text size="xs" c={tokens.colors.text.secondary} truncate>
          {status.label}
        </Text>
      </Group>
    );
  }

  return (
    <Stack gap={2} aria-live="polite">
      <Group gap="xs" wrap="wrap">
        {dot}
        <Text size="sm" fw={500} c={tokens.colors.text.primary}>
          {status.label}
        </Text>
        {note && (
          <Text size="xs" c={tokens.colors.text.muted}>
            {note}
          </Text>
        )}
      </Group>
      {status.detail && (
        <Text size="xs" c={tokens.colors.text.secondary} pl={16}>
          {status.detail}
        </Text>
      )}
    </Stack>
  );
}
