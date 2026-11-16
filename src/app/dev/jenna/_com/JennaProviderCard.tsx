'use client';
import { Badge, Box, Button, Group, Text, UnstyledButton } from '@mantine/core';
import type { JennaProviderDTO } from '@/lib/jenna/types';
import { useDarkMode } from '@/state/darkModeStore';
import { themeTokens } from '@/utils/themeTokens';
import { providerStatus } from '../jenna-form.logic';
import { JennaProviderStatus } from './JennaProviderStatus';
import { PROTOCOL_LABEL } from './protocol';

type Props = {
  provider: JennaProviderDTO;
  /** Protokol aktif untuk chat publik. */
  active: boolean;
  selected: boolean;
  dirty: boolean;
  testing: boolean;
  /** id panel form yang dikendalikan kartu ini. */
  panelId: string;
  activateDisabled: boolean;
  onSelect: () => void;
  onActivate: () => void;
};

/** Kartu satu slot provider chat: klik untuk membuka form-nya, "Jadikan aktif" untuk mengganti protokol. */
export function JennaProviderCard({
  provider,
  active,
  selected,
  dirty,
  testing,
  panelId,
  activateDisabled,
  onSelect,
  onActivate,
}: Props) {
  const { isDark } = useDarkMode();
  const tokens = themeTokens(isDark);

  return (
    <Box
      style={{
        border: `1px solid ${selected ? tokens.colors.primary : tokens.colors.border.default}`,
        boxShadow: selected ? `0 0 0 1px ${tokens.colors.primary}` : undefined,
        borderRadius: 'var(--mantine-radius-md)',
        background: selected ? tokens.colors.bg.surface : 'transparent',
      }}
    >
      <UnstyledButton
        onClick={onSelect}
        aria-pressed={selected}
        aria-controls={panelId}
        w="100%"
        p="md"
        style={{ display: 'block', borderRadius: 'var(--mantine-radius-md)' }}
      >
        <Group justify="space-between" gap="xs" wrap="nowrap">
          <Text fw={600} c={tokens.colors.text.primary} truncate>
            {PROTOCOL_LABEL[provider.protocol]}
          </Text>
          <Group gap={6} wrap="nowrap">
            {dirty && (
              <Badge size="xs" variant="light" color="yellow">
                Draf belum disimpan
              </Badge>
            )}
            {active && (
              <Badge size="xs" variant="filled" color="blue">
                Aktif
              </Badge>
            )}
          </Group>
        </Group>
        <Text size="sm" mt={4} c={provider.model ? tokens.colors.text.secondary : tokens.colors.text.muted} truncate>
          {provider.model || 'Model belum diatur'}
        </Text>
        <Box mt={6}>
          <JennaProviderStatus status={providerStatus(provider, testing)} compact />
        </Box>
      </UnstyledButton>
      {!active && (
        <Box px="md" pb="md">
          <Button size="xs" variant="light" onClick={onActivate} disabled={activateDisabled}>
            Jadikan aktif
          </Button>
        </Box>
      )}
    </Box>
  );
}
