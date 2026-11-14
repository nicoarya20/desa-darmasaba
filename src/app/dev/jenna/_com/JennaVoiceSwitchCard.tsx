'use client';
import { Badge, Group, Stack, Switch, Text } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useSnapshot } from 'valtio';
import { useDarkMode } from '@/state/darkModeStore';
import { themeTokens } from '@/utils/themeTokens';
import jennaState from '../../_state/jenna-state';
import { SectionCard } from '../../_com/SectionCard';
import { voiceSwitchWarnings } from '../suara/suara.logic';

/** Sakelar suara untuk website. Disimpan langsung; mengatur tampilnya tombol mikrofon di widget publik. */
export function JennaVoiceSwitchCard() {
  const { isDark } = useDarkMode();
  const tokens = themeTokens(isDark);
  const snap = useSnapshot(jennaState);

  const config = snap.config;
  if (!config) return null;

  const { settings, cryptoConfigured, voiceProvider } = config;
  const warnings = voiceSwitchWarnings({
    voiceEnabled: settings.voiceEnabled,
    voiceProviderReady: voiceProvider.ready && cryptoConfigured,
    voiceDailyMinutesGlobal: settings.voiceDailyMinutesGlobal,
    chatEnabled: settings.enabled,
  });

  const toggle = (voiceEnabled: boolean) =>
    void jennaState.saveSettings(
      'voiceSwitch',
      { voiceEnabled },
      voiceEnabled ? 'Suara diaktifkan.' : 'Suara dinonaktifkan.',
    );

  return (
    <SectionCard
      title="Sakelar"
      description="Menyalakan atau mematikan suara realtime Jenna untuk pengunjung website desa."
      aside={
        <Badge
          size="lg"
          variant="light"
          color={settings.voiceEnabled ? 'green' : 'gray'}
          aria-label={`Status suara: ${settings.voiceEnabled ? 'aktif' : 'nonaktif'}`}
        >
          {settings.voiceEnabled ? 'Aktif' : 'Nonaktif'}
        </Badge>
      }
    >
      <Stack gap="sm">
        <Switch
          size="md"
          label="Suara di website desa"
          description="Menampilkan tombol mikrofon di widget Jenna untuk pengunjung yang browsernya mendukung. Perubahan langsung berlaku."
          checked={settings.voiceEnabled}
          disabled={snap.saving !== null}
          onChange={(e) => toggle(e.currentTarget.checked)}
        />
        {warnings.length > 0 && (
          <Stack gap={4} aria-live="polite">
            {warnings.map((warning) => (
              <Group key={warning} gap={6} wrap="nowrap" align="flex-start">
                <IconAlertTriangle
                  size={16}
                  color="var(--mantine-color-orange-6)"
                  style={{ flexShrink: 0, marginTop: 2 }}
                  aria-hidden
                />
                <Text size="sm" c={tokens.colors.text.secondary}>
                  {warning}
                </Text>
              </Group>
            ))}
          </Stack>
        )}
      </Stack>
    </SectionCard>
  );
}
