'use client';
import { Box, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { IconAlertTriangle, IconClock, IconCoins, IconMessageQuestion } from '@tabler/icons-react';
import { useId } from 'react';
import type { Snapshot } from 'valtio';
import type { JennaUsageWindow as UsageWindow } from '@/lib/jenna/usage-types';
import { useDarkMode } from '@/state/darkModeStore';
import { themeTokens } from '@/utils/themeTokens';
import { formatDateTime, formatLatency, formatNumber } from '../../_com/format';
import { StatCard } from '../../ringkasan/_com/StatCard';

type Props = { title: string; usage: Snapshot<UsageWindow> };

/** Empat angka pemakaian Jenna untuk satu jendela waktu bergulir. */
export function JennaUsageWindow({ title, usage }: Props) {
  const { isDark } = useDarkMode();
  const tokens = themeTokens(isDark);
  const headingId = useId();

  return (
    <Box component="section" aria-labelledby={headingId}>
      <Stack gap="sm">
        <Group gap="xs" align="baseline" wrap="wrap">
          <Title order={4} id={headingId} c={tokens.colors.text.primary}>
            {title}
          </Title>
          <Text size="xs" c={tokens.colors.text.muted}>
            sejak {formatDateTime(usage.since)}
          </Text>
        </Group>
        <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing="md">
          <StatCard
            icon={<IconMessageQuestion size={20} />}
            title="Pertanyaan"
            value={formatNumber(usage.questions)}
            details={`terjawab ${formatNumber(usage.answered)}`}
          />
          <StatCard
            icon={<IconCoins size={20} />}
            title="Token"
            value={formatNumber(usage.inputTokens + usage.outputTokens)}
            details={`${formatNumber(usage.inputTokens)} masuk / ${formatNumber(usage.outputTokens)} keluar`}
          />
          <StatCard
            icon={<IconClock size={20} />}
            title="Rerata respons"
            value={formatLatency(usage.avgLatencyMs)}
            details={
              usage.avgLatencyMs === null
                ? 'Belum ada giliran dengan waktu respons tercatat.'
                : 'Rata-rata lama satu giliran sampai selesai.'
            }
          />
          <StatCard
            icon={<IconAlertTriangle size={20} />}
            title="Gagal"
            value={formatNumber(usage.failed)}
            status={usage.failed > 0 ? { tone: 'warn', label: 'Perlu dicek' } : undefined}
            details={`dibatalkan ${formatNumber(usage.cancelled)}`}
          />
        </SimpleGrid>
      </Stack>
    </Box>
  );
}
