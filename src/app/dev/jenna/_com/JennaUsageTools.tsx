'use client';
import { Box, Group, Progress, Stack, Text } from '@mantine/core';
import type { Snapshot } from 'valtio';
import type { JennaToolUsage } from '@/lib/jenna/usage-types';
import { useDarkMode } from '@/state/darkModeStore';
import { themeTokens } from '@/utils/themeTokens';
import { SectionCard } from '../../_com/SectionCard';
import { formatNumber } from '../../_com/format';
import { toolBars } from '../penggunaan/penggunaan.logic';

type Props = { tools: Snapshot<JennaToolUsage[]> };

/** Tool yang paling sering dipanggil Jenna dalam 7 hari terakhir, dengan bar sebanding jumlahnya. */
export function JennaUsageTools({ tools }: Props) {
  const { isDark } = useDarkMode();
  const tokens = themeTokens(isDark);
  const bars = toolBars(tools);

  return (
    <SectionCard
      title="Tool paling sering dipakai (7 hari)"
      description="Jumlah giliran yang memakai tiap tool. Panjang bar dibandingkan dengan tool yang paling sering dipakai."
    >
      {bars.length === 0 ? (
        <Text size="sm" c={tokens.colors.text.secondary} ta="center" py="xl">
          Belum ada tool yang dipakai dalam 7 hari terakhir.
        </Text>
      ) : (
        <Stack component="ul" gap="sm" m={0} p={0} style={{ listStyle: 'none' }}>
          {bars.map((bar) => (
            <Box component="li" key={bar.name}>
              <Group justify="space-between" gap="sm" wrap="nowrap" mb={4}>
                <Text size="sm" ff="monospace" c={tokens.colors.text.primary} style={{ wordBreak: 'break-all' }}>
                  {bar.name}
                </Text>
                <Text size="sm" fw={600} c={tokens.colors.text.primary} style={{ flexShrink: 0 }}>
                  {formatNumber(bar.count)}
                </Text>
              </Group>
              <Progress
                value={bar.percent}
                size="sm"
                radius="xl"
                aria-label={`${bar.name}: ${formatNumber(bar.count)} kali dipakai`}
              />
            </Box>
          ))}
        </Stack>
      )}
    </SectionCard>
  );
}
