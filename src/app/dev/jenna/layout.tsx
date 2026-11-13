'use client';
import { Alert, Button, Stack, Text } from '@mantine/core';
import { IconRefresh, IconShieldLock } from '@tabler/icons-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';
import { useDarkMode } from '@/state/darkModeStore';
import { themeTokens } from '@/utils/themeTokens';
import jennaState from '../_state/jenna-state';
import { ConfirmModal } from '../_com/ConfirmModal';
import { DeveloperPageHeader } from '../_com/DeveloperPageHeader';
import { ErrorState } from '../_com/ErrorState';
import { formatDateTime } from '../_com/format';
import { hasDirtySection } from '../_com/leave-guard.logic';
import { useUnsavedChangesWarning } from '../_com/useUnsavedChangesWarning';
import { JennaSkeleton } from './_com/JennaSkeleton';
import { jennaPageMeta } from './jenna-pages';

/**
 * Developer › Jenna: header, muat config (sekali; tidak diulang saat pindah sub-halaman), dan
 * status bersama. Sub-halaman hanya dirender setelah config ada. Guard role ada di ../layout.tsx.
 */
export default function JennaLayout({ children }: { children: React.ReactNode }) {
  const { isDark } = useDarkMode();
  const tokens = themeTokens(isDark);
  const pathname = usePathname();
  const snap = useSnapshot(jennaState);
  const [confirmReload, setConfirmReload] = useState(false);

  useEffect(() => {
    if (!jennaState.config && !jennaState.loading) void jennaState.load();
  }, []);

  const hasUnsaved = hasDirtySection(snap.dirty);
  useUnsavedChangesWarning(hasUnsaved);

  const reload = () => {
    setConfirmReload(false);
    void jennaState.load();
  };

  const meta = jennaPageMeta(pathname);
  const config = snap.config;
  const updatedBy = config?.updatedBy;

  return (
    <>
      <DeveloperPageHeader
        title={meta.title}
        subtitle={meta.subtitle}
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
        <JennaSkeleton heights={meta.skeletonHeights} />
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
          {children}
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
    </>
  );
}
