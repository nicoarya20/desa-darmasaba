'use client';
import { Box, Button, Stack } from '@mantine/core';
import { useState } from 'react';
import { useDarkMode } from '@/state/darkModeStore';
import { themeTokens } from '@/utils/themeTokens';
import { clipErrorDetail } from '../percakapan/percakapan.logic';

type Props = {
  detail: string;
  /** Tampilkan ringkas dulu dengan tombol untuk membuka seluruh teks. */
  collapsible?: boolean;
};

/** Rincian galat dari provider/server. Selalu teks polos monospace: tidak pernah dirender sebagai HTML/Markdown. */
export function JennaErrorDetailText({ detail, collapsible = false }: Props) {
  const { isDark } = useDarkMode();
  const tokens = themeTokens(isDark);
  const [expanded, setExpanded] = useState(false);
  const clip = clipErrorDetail(detail);
  const canToggle = collapsible && clip.clipped;

  return (
    <Stack gap={4} align="flex-start" w="100%">
      <Box
        component="pre"
        m={0}
        p="xs"
        w="100%"
        tabIndex={collapsible ? undefined : 0}
        aria-label="Rincian galat"
        style={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          fontFamily: 'var(--mantine-font-family-monospace)',
          fontSize: 'var(--mantine-font-size-xs)',
          color: tokens.colors.text.primary,
          background: tokens.colors.bg.surface,
          border: `1px solid ${tokens.colors.border.soft}`,
          borderRadius: 8,
          maxHeight: collapsible ? undefined : 360,
          overflowY: collapsible ? undefined : 'auto',
        }}
      >
        {canToggle && !expanded ? clip.text : detail}
      </Box>
      {canToggle && (
        <Button variant="subtle" size="compact-xs" aria-expanded={expanded} onClick={() => setExpanded((open) => !open)}>
          {expanded ? 'Ringkas' : 'Tampilkan semua'}
        </Button>
      )}
    </Stack>
  );
}
