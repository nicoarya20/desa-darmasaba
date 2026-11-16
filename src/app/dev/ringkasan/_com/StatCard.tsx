'use client';
import { Badge, Group, Stack, Text, ThemeIcon } from '@mantine/core';
import { useId } from 'react';
import { UnifiedCard } from '@/components/admin/UnifiedSurface';
import { useDarkMode } from '@/state/darkModeStore';
import { themeTokens } from '@/utils/themeTokens';

export type StatTone = 'ok' | 'warn' | 'error' | 'neutral';

const TONE_COLOR: Record<StatTone, string> = {
  ok: 'green',
  warn: 'orange',
  error: 'red',
  neutral: 'gray',
};

type Props = {
  icon: React.ReactNode;
  title: string;
  value: string;
  status?: { tone: StatTone; label: string };
  details?: React.ReactNode;
};

/** Kartu satu metrik/layanan di Ringkasan Sistem. */
export function StatCard({ icon, title, value, status, details }: Props) {
  const { isDark } = useDarkMode();
  const tokens = themeTokens(isDark);
  const titleId = useId();

  return (
    <UnifiedCard padding="lg" style={{ height: '100%' }}>
      <Stack gap="xs" role="group" aria-labelledby={titleId}>
        <Group justify="space-between" align="flex-start" wrap="nowrap" gap="sm">
          <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
            <ThemeIcon variant="light" color={status ? TONE_COLOR[status.tone] : 'blue'} radius="md" size="lg">
              {icon}
            </ThemeIcon>
            <Text id={titleId} size="sm" fw={500} c={tokens.colors.text.secondary}>
              {title}
            </Text>
          </Group>
          {status && (
            <Badge color={TONE_COLOR[status.tone]} variant="light" style={{ flexShrink: 0 }}>
              {status.label}
            </Badge>
          )}
        </Group>
        <Text size="xl" fw={700} c={tokens.colors.text.primary} style={{ wordBreak: 'break-word' }}>
          {value}
        </Text>
        {details && (
          <Text size="xs" c={tokens.colors.text.muted} component="div" style={{ wordBreak: 'break-word' }}>
            {details}
          </Text>
        )}
      </Stack>
    </UnifiedCard>
  );
}
