'use client';
import { Paper, Switch, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { useProxy } from 'valtio/utils';
import umkmState from '../../../../_state/ekonomi/umkm/umkm';

export const HARGA_PUBLIK_LABEL = 'Sembunyikan harga di website publik';
export const HARGA_PUBLIK_KETERANGAN =
  'Bila aktif, harga produk tidak tampil di halaman UMKM publik (katalog, detail produk, dan detail toko), beserta filter dan urutan harga. Harga tetap tersimpan dan tetap terlihat di admin.';

/** Saklar global tampil/sembunyi harga produk di website publik (tab Produk admin). */
export function HargaPublikSwitch() {
  const state = useProxy(umkmState.hargaPublik);

  useShallowEffect(() => {
    state.load();
  }, []);

  return (
    <Paper withBorder p="md" radius="md">
      <Switch
        size="md"
        label={HARGA_PUBLIK_LABEL}
        description={HARGA_PUBLIK_KETERANGAN}
        checked={state.data?.sembunyikanHarga ?? false}
        disabled={state.loading || state.saving || state.data === null}
        onChange={(e) => state.save(e.currentTarget.checked)}
      />
      {state.failed && (
        <Text size="xs" c="red" mt="xs">
          Pengaturan belum bisa dimuat. Muat ulang halaman untuk mengubahnya.
        </Text>
      )}
    </Paper>
  );
}
