'use client';
import { Alert, Box, Button, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconRefresh, IconShieldLock } from '@tabler/icons-react';
import { useState } from 'react';
import { useSnapshot } from 'valtio';
import { useDarkMode } from '@/state/darkModeStore';
import { themeTokens } from '@/utils/themeTokens';
import jennaState from '../../_state/developer/jenna-state';
import { ConfirmModal } from '../_com/ConfirmModal';
import { DeveloperPageHeader } from '../_com/DeveloperPageHeader';
import { ErrorState } from '../_com/ErrorState';
import { formatDateTime } from '../_com/format';
import { useUnsavedChangesWarning } from '../_com/useUnsavedChangesWarning';
import { JennaIdentityCard } from './_com/JennaIdentityCard';
import { JennaLimitsCard } from './_com/JennaLimitsCard';
import { JennaProviderSection } from './_com/JennaProviderSection';
import { JennaSkeleton } from './_com/JennaSkeleton';
import { JennaStatusCard } from './_com/JennaStatusCard';

/** Developer › Pengaturan Jenna (asisten AI website publik). Guard role ada di ../layout.tsx. */
export default function JennaSettingsPage() {
  const { isDark } = useDarkMode();
  const tokens = themeTokens(isDark);
  const snap = useSnapshot(jennaState);
  const [confirmReload, setConfirmReload] = useState(false);

  useShallowEffect(() => {
    void jennaState.load();
  }, []);

  const hasUnsaved = Object.values(snap.dirty).some(Boolean);
  useUnsavedChangesWarning(hasUnsaved);

  const reload = () => {
    setConfirmReload(false);
    void jennaState.load();
  };

  const config = snap.config;
  const updatedBy = config?.updatedBy;

  return (
    <Box p={{ base: 'sm', sm: 'md' }} maw={960}>
      <DeveloperPageHeader
        title="Pengaturan Jenna"
        subtitle="Asisten AI untuk menjawab pertanyaan warga di website publik desa."
        action={
          <Button
            variant="default"
            leftSection={<IconRefresh size={16} />}
            onClick={() => (hasUnsaved ? setConfirmReload(true) : reload())}
            loading={snap.loading && config !== null}
            disabled={snap.loading || snap.saving !== null}
          >
            Muat ulang
          </Button>
        }
      />

      {!config && snap.error ? (
        <ErrorState
          title="Gagal memuat pengaturan Jenna"
          message={snap.error}
          onRetry={() => void jennaState.load()}
          retrying={snap.loading}
        />
      ) : !config ? (
        <JennaSkeleton />
      ) : (
        <Stack gap="lg">
          {snap.error && (
            <ErrorState
              title="Gagal memuat ulang"
              message={`${snap.error} Data di bawah adalah versi terakhir yang berhasil dimuat.`}
              onRetry={() => void jennaState.load()}
              retrying={snap.loading}
            />
          )}
          {!config.cryptoConfigured && (
            <Alert color="orange" variant="light" icon={<IconShieldLock size={18} />} title="Kunci enkripsi belum diatur">
              API key provider tidak dapat disimpan atau dipakai. Atur JENNA_CREDENTIALS_KEY (64 karakter
              heksadesimal) di server lalu restart aplikasi.
            </Alert>
          )}
          {updatedBy && (
            <Text size="xs" c={tokens.colors.text.muted}>
              Terakhir diubah oleh {updatedBy.name ?? updatedBy.email ?? 'pengguna tidak dikenal'},{' '}
              {formatDateTime(updatedBy.at)}
            </Text>
          )}

          <Stack gap="lg" key={snap.loadVersion}>
            <JennaStatusCard />
            <JennaIdentityCard settings={config.settings} />
            <JennaLimitsCard settings={config.settings} />
            <JennaProviderSection />
          </Stack>
        </Stack>
      )}

      <ConfirmModal
        opened={confirmReload}
        title="Buang perubahan?"
        message="Ada perubahan yang belum disimpan. Memuat ulang akan membuang semua perubahan tersebut."
        confirmLabel="Buang & muat ulang"
        confirmColor="red"
        onConfirm={reload}
        onClose={() => setConfirmReload(false)}
      />
    </Box>
  );
}
