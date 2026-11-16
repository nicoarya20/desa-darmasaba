'use client';
import { Button, Group, Stack, Text } from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';
import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { useDarkMode } from '@/state/darkModeStore';
import { themeTokens } from '@/utils/themeTokens';
import jennaState from '../../_state/jenna-state';
import jennaUsageState from '../../_state/jenna-usage-state';
import { ErrorState } from '../../_com/ErrorState';
import { formatDateTime } from '../../_com/format';
import { JennaSkeleton } from '../_com/JennaSkeleton';
import { JennaUsageProviders } from '../_com/JennaUsageProviders';
import { JennaUsageTools } from '../_com/JennaUsageTools';
import { JennaUsageWindow } from '../_com/JennaUsageWindow';
import { JENNA_PAGES } from '../jenna-pages';

const SKELETON_HEIGHTS = JENNA_PAGES['/dev/jenna/penggunaan'].skeletonHeights;

/** Developer › Jenna › Penggunaan (read-only). "Muat ulang" di ../layout.tsx menaikkan loadVersion → data dimuat ulang. */
export default function JennaPenggunaanPage() {
  const { loadVersion } = useSnapshot(jennaState);
  const snap = useSnapshot(jennaUsageState);
  const { isDark } = useDarkMode();
  const tokens = themeTokens(isDark);

  useEffect(() => {
    void jennaUsageState.load();
  }, [loadVersion]);

  const data = snap.data;

  if (!data && snap.error) {
    return (
      <ErrorState
        title="Gagal memuat penggunaan Jenna"
        message={snap.error}
        onRetry={() => void jennaUsageState.load()}
        retrying={snap.loading}
      />
    );
  }

  if (!data) return <JennaSkeleton heights={SKELETON_HEIGHTS} label="Memuat penggunaan Jenna" />;

  return (
    <Stack gap="lg">
      {snap.error && (
        <ErrorState
          title="Gagal memuat ulang penggunaan"
          message={`${snap.error} Angka di bawah adalah versi terakhir yang berhasil dimuat.`}
          onRetry={() => void jennaUsageState.load()}
          retrying={snap.loading}
        />
      )}
      <Group justify="space-between" gap="sm" wrap="wrap">
        <Text size="sm" c={tokens.colors.text.secondary} aria-live="polite">
          Diperbarui {formatDateTime(data.generatedAt)}
        </Text>
        <Button
          size="xs"
          variant="default"
          leftSection={<IconRefresh size={14} />}
          onClick={() => void jennaUsageState.load()}
          loading={snap.loading}
        >
          Perbarui
        </Button>
      </Group>
      <JennaUsageWindow title="24 jam terakhir" usage={data.last24h} />
      <JennaUsageWindow title="7 hari terakhir" usage={data.last7d} />
      <JennaUsageProviders providers={data.providers7d} />
      <JennaUsageTools tools={data.tools7d} />
    </Stack>
  );
}
