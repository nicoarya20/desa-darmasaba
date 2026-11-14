'use client';
import { Box, Stack, Text } from '@mantine/core';
import type { Snapshot } from 'valtio';
import type { JennaKnowledgeToolDTO } from '@/lib/jenna/knowledge-types';
import { useDarkMode } from '@/state/darkModeStore';
import { themeTokens } from '@/utils/themeTokens';
import { SectionCard } from '../../_com/SectionCard';

type Props = { tools: Snapshot<JennaKnowledgeToolDTO[]> };

/** Tool yang bisa dipanggil Jenna saat snapshot saja tidak cukup. Read-only. */
export function JennaKnowledgeTools({ tools }: Props) {
  const { isDark } = useDarkMode();
  const tokens = themeTokens(isDark);

  return (
    <SectionCard
      title="Tool"
      description="Kemampuan yang bisa dipakai Jenna untuk mengambil data tambahan saat menjawab. Semuanya hanya membaca data."
    >
      {tools.length === 0 ? (
        <Text size="sm" c={tokens.colors.text.secondary} ta="center" py="xl">
          Belum ada tool terdaftar.
        </Text>
      ) : (
        <Stack component="ul" gap="sm" m={0} p={0} style={{ listStyle: 'none' }}>
          {tools.map((tool) => (
            <Box
              component="li"
              key={tool.name}
              p="sm"
              style={{ border: `1px solid ${tokens.colors.border.soft}`, borderRadius: 8 }}
            >
              <Text size="sm" fw={600} ff="monospace" c={tokens.colors.text.primary} style={{ wordBreak: 'break-all' }}>
                {tool.name}
              </Text>
              <Text size="sm" c={tokens.colors.text.secondary} mt={4} style={{ wordBreak: 'break-word' }}>
                {tool.description}
              </Text>
            </Box>
          ))}
        </Stack>
      )}
    </SectionCard>
  );
}
