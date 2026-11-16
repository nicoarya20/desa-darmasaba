'use client';
import { Alert, Anchor, Box, Group, Stack, Text } from '@mantine/core';
import { IconAlertTriangle, IconCircleCheck } from '@tabler/icons-react';
import Link from 'next/link';
import { useDarkMode } from '@/state/darkModeStore';
import { themeTokens } from '@/utils/themeTokens';
import type { DevWarning } from '../dev-warnings.logic';

type Props = { warnings: readonly DevWarning[] };

/** Ringkasan "Perlu perhatian" di atas kartu status; satu baris "Semua baik" bila kosong. */
export function DevWarnings({ warnings }: Props) {
  const { isDark } = useDarkMode();
  const tokens = themeTokens(isDark);

  if (warnings.length === 0) {
    return (
      <Group gap="xs" c={tokens.colors.success}>
        <IconCircleCheck size={16} aria-hidden />
        <Text size="sm" fw={500}>
          Semua baik, tidak ada yang perlu diperhatikan.
        </Text>
      </Group>
    );
  }

  const hasDanger = warnings.some((w) => w.severity === 'danger');

  return (
    <Alert
      color={hasDanger ? 'red' : 'orange'}
      variant="light"
      title="Perlu perhatian"
      icon={<IconAlertTriangle size={18} />}
    >
      <Stack component="ul" gap="sm" p={0} m={0} style={{ listStyle: 'none' }}>
        {warnings.map((w) => (
          <Box component="li" key={w.id}>
            <Group justify="space-between" align="flex-start" wrap="nowrap" gap="sm">
              <Box style={{ minWidth: 0 }}>
                <Text size="sm" fw={600} c={w.severity === 'danger' ? tokens.colors.error : tokens.colors.text.primary}>
                  {w.title}
                </Text>
                <Text size="sm" c={tokens.colors.text.secondary} style={{ wordBreak: 'break-word' }}>
                  {w.detail}
                </Text>
              </Box>
              {w.href && (
                <Anchor component={Link} href={w.href} size="sm" fw={500} style={{ flexShrink: 0 }}>
                  Buka
                </Anchor>
              )}
            </Group>
          </Box>
        ))}
      </Stack>
    </Alert>
  );
}
