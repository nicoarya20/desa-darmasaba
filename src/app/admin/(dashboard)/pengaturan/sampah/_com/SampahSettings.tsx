'use client';
import { useState } from 'react';
import { Alert, Button, Group, Pagination, Stack, Text, TextInput, Title } from '@mantine/core';
import { useDebouncedCallback, useShallowEffect } from '@mantine/hooks';
import { IconInfoCircle, IconSearch, IconTrashX } from '@tabler/icons-react';
import { useSnapshot } from 'valtio';
import type { SampahItem } from '@/lib/sampah/sampah-item';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import sampahState from '../../../_state/pengaturan/sampah-state';
import {
  SAMPAH_KETERANGAN,
  SAMPAH_TAB_SEMUA,
  sampahTabs,
  teksKonfirmasiHapus,
  teksKonfirmasiKosongkan,
  totalHalamanSampah,
} from '../_lib/sampah-view.logic';
import { SampahItemList } from './SampahItemList';
import { SampahKelompokTabs } from './SampahKelompokTabs';
import { SampahPratinjauModal } from './SampahPratinjauModal';

const CARI_DEBOUNCE_MS = 400;

/** Isi halaman Sampah: bar tab kelompok ber-jumlah, cari, daftar item, pagination, modal konfirmasi & pratinjau. */
export function SampahSettings() {
  const snap = useSnapshot(sampahState);
  const [cariInput, setCariInput] = useState(snap.cari);
  const [hapusTarget, setHapusTarget] = useState<SampahItem | null>(null);
  const [kosongkanOpen, setKosongkanOpen] = useState(false);
  const [pratinjau, setPratinjau] = useState<SampahItem | null>(null);
  const setCariDebounced = useDebouncedCallback((q: string) => void sampahState.setCari(q.trim()), CARI_DEBOUNCE_MS);

  useShallowEffect(() => {
    void sampahState.load();
  }, []);

  const tabs = sampahTabs(snap.kelompok, snap.counts);
  const tabAktif = tabs.find((t) => t.id === snap.kelompokAktif) ?? { ...SAMPAH_TAB_SEMUA, jumlah: 0 };
  const totalHalaman = totalHalamanSampah(snap.total, snap.limit);

  const konfirmasiHapus = async () => {
    if (!hapusTarget) return;
    if (await sampahState.hapusPermanen(hapusTarget)) setHapusTarget(null);
  };
  const konfirmasiKosongkan = async () => {
    if (await sampahState.kosongkan()) setKosongkanOpen(false);
  };

  return (
    <Stack p="md" gap="md">
      <Group justify="space-between" align="flex-start" gap="sm">
        <Stack gap={4} style={{ flex: '1 1 320px' }}>
          <Title order={3}>Sampah</Title>
          <Text fz="sm" c="dimmed">
            {SAMPAH_KETERANGAN}
          </Text>
        </Stack>
        <TextInput
          aria-label="Cari di Sampah"
          placeholder="Cari judul…"
          leftSection={<IconSearch size={16} />}
          value={cariInput}
          onChange={(e) => {
            setCariInput(e.currentTarget.value);
            setCariDebounced(e.currentTarget.value);
          }}
          w={{ base: '100%', sm: 260 }}
        />
      </Group>

      <Alert variant="light" color="blue" icon={<IconInfoCircle size={18} />} p="sm">
        <Text fz="xs">
          <b>Pulihkan</b> mengembalikan item: dokumen (DAK, APBDes, Galeri BUMDes, Dokumen Perencanaan) kembali ke
          tempat asalnya; file kembali ke Pustaka File dan bisa dipasang ulang di menu asalnya.
        </Text>
      </Alert>

      <Group justify="space-between" align="center" gap="sm" wrap="wrap">
        <div style={{ flex: '1 1 0', minWidth: 0 }}>
          <SampahKelompokTabs tabs={tabs} aktif={snap.kelompokAktif} onChange={(id) => void sampahState.setKelompok(id)} />
        </div>
        <Button
          variant="light"
          color="red"
          leftSection={<IconTrashX size={16} />}
          disabled={tabAktif.jumlah === 0 || snap.cari !== ''}
          title={snap.cari ? 'Hapus kata kunci pencarian dulu untuk mengosongkan kelompok ini' : undefined}
          onClick={() => setKosongkanOpen(true)}
        >
          Kosongkan
        </Button>
      </Group>

      {snap.error && snap.items.length === 0 && !snap.loading ? (
        <Alert color="red" title="Gagal memuat Sampah">
          <Group justify="space-between" gap="sm">
            <Text fz="sm">{snap.error}</Text>
            <Button size="xs" variant="light" color="red" onClick={() => void sampahState.load()}>
              Coba lagi
            </Button>
          </Group>
        </Alert>
      ) : (
        <SampahItemList
          items={snap.items}
          loading={snap.loading}
          namaKelompok={tabAktif.nama}
          cari={snap.cari}
          busy={snap.busy}
          onPulihkan={(item) => void sampahState.pulihkan(item)}
          onHapus={setHapusTarget}
          onPratinjau={setPratinjau}
        />
      )}

      {totalHalaman > 1 && (
        <Group justify="center">
          <Pagination total={totalHalaman} value={snap.page} onChange={(p) => void sampahState.setPage(p)} />
        </Group>
      )}

      <ModalKonfirmasiHapus
        opened={hapusTarget !== null}
        loading={snap.busy?.aksi === 'hapus'}
        onClose={() => setHapusTarget(null)}
        onConfirm={() => void konfirmasiHapus()}
        text={hapusTarget ? teksKonfirmasiHapus(hapusTarget.judul) : ''}
      />
      <ModalKonfirmasiHapus
        opened={kosongkanOpen}
        loading={snap.kosongkanLoading}
        onClose={() => setKosongkanOpen(false)}
        onConfirm={() => void konfirmasiKosongkan()}
        text={teksKonfirmasiKosongkan(tabAktif.jumlah, tabAktif)}
      />
      <SampahPratinjauModal item={pratinjau} onClose={() => setPratinjau(null)} />
    </Stack>
  );
}
