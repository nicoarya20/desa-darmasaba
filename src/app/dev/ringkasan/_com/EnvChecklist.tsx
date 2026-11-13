'use client';
import { Box, Group, SimpleGrid, Text, ThemeIcon } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import type { SystemOverviewResponse } from '@/lib/jenna/types';
import { useDarkMode } from '@/state/darkModeStore';
import { themeTokens } from '@/utils/themeTokens';
import { SectionCard } from '../../_com/SectionCard';

type Props = { env: Readonly<SystemOverviewResponse['env']> };

/** Daftar env var penting: hanya status set/belum, nilainya tidak pernah dikirim ke browser. */
export function EnvChecklist({ env }: Props) {
  const { isDark } = useDarkMode();
  const tokens = themeTokens(isDark);
  const missing = env.filter((e) => !e.set).length;

  return (
    <SectionCard
      title="Variabel Lingkungan"
      description="Hanya menampilkan apakah variabel sudah diatur; nilainya tidak pernah ditampilkan."
      aside={
        <Text size="sm" fw={500} c={missing > 0 ? tokens.colors.warning : tokens.colors.success}>
          {missing > 0 ? `${missing} belum diatur` : 'Semua sudah diatur'}
        </Text>
      }
    >
      <SimpleGrid
        component="ul"
        cols={{ base: 1, sm: 2, lg: 3 }}
        spacing="xs"
        verticalSpacing="xs"
        p={0}
        m={0}
        style={{ listStyle: 'none' }}
      >
        {env.map(({ name, set }) => (
          <Box component="li" key={name}>
            <Group gap="xs" wrap="nowrap">
              <ThemeIcon size="sm" radius="xl" variant="light" color={set ? 'green' : 'red'} aria-hidden>
                {set ? <IconCheck size={12} /> : <IconX size={12} />}
              </ThemeIcon>
              <Text size="sm" ff="monospace" c={tokens.colors.text.primary} style={{ wordBreak: 'break-all' }}>
                {name}
              </Text>
              <Text size="xs" c={set ? tokens.colors.text.muted : tokens.colors.error} ml="auto">
                {set ? 'Diatur' : 'Belum diatur'}
              </Text>
            </Group>
          </Box>
        ))}
      </SimpleGrid>
    </SectionCard>
  );
}
