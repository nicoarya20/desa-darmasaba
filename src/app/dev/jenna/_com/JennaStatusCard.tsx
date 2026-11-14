'use client';
import { Badge, Group, Stack, Switch, Text } from '@mantine/core';
import { IconCircleCheck, IconAlertCircle, IconEyeOff } from '@tabler/icons-react';
import { useState } from 'react';
import { useSnapshot } from 'valtio';
import { JENNA_PROTOCOL_SLOT } from '@/lib/jenna/types';
import { useDarkMode } from '@/state/darkModeStore';
import { themeTokens } from '@/utils/themeTokens';
import jennaState from '../../_state/jenna-state';
import { ConfirmModal } from '../../_com/ConfirmModal';
import { SectionCard } from '../../_com/SectionCard';
import { publicWidgetHiddenReason } from '../jenna-status.logic';
import { PROTOCOL_LABEL } from './protocol';

type Pending = 'enable' | 'disable' | null;

/** Switch aktif/nonaktif Jenna + badge kesiapan provider aktif. Disimpan langsung (dengan konfirmasi bila berisiko). */
export function JennaStatusCard() {
  const { isDark } = useDarkMode();
  const tokens = themeTokens(isDark);
  const snap = useSnapshot(jennaState);
  const [pending, setPending] = useState<Pending>(null);

  const config = snap.config;
  if (!config) return null;

  const { settings, cryptoConfigured } = config;
  const activeSlot = JENNA_PROTOCOL_SLOT[settings.chatProtocol];
  const active = config.providers.find((p) => p.slot === activeSlot);
  const providerReady = Boolean(active?.ready) && cryptoConfigured;
  const saving = snap.saving === 'status';
  const hiddenReason = publicWidgetHiddenReason({
    enabled: settings.enabled,
    providerReady,
    dailyTokensGlobal: settings.dailyTokensGlobal,
  });

  const apply = async (enabled: boolean) => {
    const result = await jennaState.saveSettings(
      'status',
      { enabled },
      enabled ? 'Jenna diaktifkan.' : 'Jenna dinonaktifkan.',
    );
    if (result) setPending(null);
  };

  const handleToggle = (enabled: boolean) => {
    if (!enabled) setPending('disable');
    else if (!providerReady) setPending('enable');
    else void apply(true);
  };

  return (
    <SectionCard
      title="Status"
      description="Saat aktif, warga dapat mengobrol dengan Jenna di website publik."
      aside={
        <Badge
          size="lg"
          variant="light"
          color={settings.enabled ? 'green' : 'gray'}
          aria-label={`Status Jenna: ${settings.enabled ? 'aktif' : 'nonaktif'}`}
        >
          {settings.enabled ? 'Aktif' : 'Nonaktif'}
        </Badge>
      }
    >
      <Stack gap="sm">
        <Switch
          size="md"
          label="Aktifkan Jenna"
          description="Perubahan langsung berlaku untuk semua pengunjung."
          checked={settings.enabled}
          disabled={snap.saving !== null}
          onChange={(e) => handleToggle(e.currentTarget.checked)}
        />
        <Group gap="xs" wrap="wrap">
          <Text size="sm" c={tokens.colors.text.secondary}>
            Provider aktif ({PROTOCOL_LABEL[settings.chatProtocol]}):
          </Text>
          {providerReady ? (
            <Badge color="green" variant="light" leftSection={<IconCircleCheck size={14} />}>
              Siap
            </Badge>
          ) : (
            <Badge color="orange" variant="light" leftSection={<IconAlertCircle size={14} />}>
              Belum siap
            </Badge>
          )}
          {active?.lastTestOk === false && (
            <Badge color="red" variant="outline">
              Tes koneksi terakhir gagal
            </Badge>
          )}
        </Group>
        {!providerReady && (
          <Text size="xs" c={tokens.colors.text.muted}>
            {cryptoConfigured
              ? 'Lengkapi Base URL, model, dan API key provider aktif di halaman Provider.'
              : 'Kunci enkripsi server belum diatur, sehingga API key tidak dapat dipakai.'}
          </Text>
        )}
        {hiddenReason && (
          <Group gap={6} wrap="nowrap" align="flex-start">
            <IconEyeOff size={16} color="var(--mantine-color-orange-6)" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden />
            <Text size="sm" c={tokens.colors.text.secondary}>
              {hiddenReason}
            </Text>
          </Group>
        )}
      </Stack>

      <ConfirmModal
        opened={pending === 'disable'}
        title="Nonaktifkan Jenna?"
        message="Chat Jenna di website publik akan langsung dimatikan untuk semua pengunjung."
        confirmLabel="Nonaktifkan"
        confirmColor="red"
        loading={saving}
        onConfirm={() => void apply(false)}
        onClose={() => setPending(null)}
      />
      <ConfirmModal
        opened={pending === 'enable'}
        title="Provider belum siap"
        message={`Provider ${PROTOCOL_LABEL[settings.chatProtocol]} belum siap dipakai. Jika Jenna diaktifkan sekarang, pengunjung akan menerima pesan galat sampai provider dilengkapi. Tetap aktifkan?`}
        confirmLabel="Tetap aktifkan"
        confirmColor="orange"
        loading={saving}
        onConfirm={() => void apply(true)}
        onClose={() => setPending(null)}
      />
    </SectionCard>
  );
}
