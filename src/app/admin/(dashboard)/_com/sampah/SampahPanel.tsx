'use client';
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import { Accordion, Box, Button, Center, Group, Loader, Pagination, Stack, Text } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { useEffect, useMemo } from 'react';
import { useSnapshot } from 'valtio';
import { SampahPanelList } from './SampahPanelList';
import {
  judulSampahPanel,
  teksKonfirmasiHapusPermanenPanel,
  totalHalamanSampahPanel,
  type SampahPanelItem,
  type SampahPanelTarget,
  type SampahSumber,
} from './sampah-panel.logic';
import { createSampahPanelState, type SampahPanelBusy } from './sampah-panel.state';

const PANEL_KEY = 'sampah';

/** Data tampilan panel (snapshot state) — dipisah agar view bisa dirender tanpa fetch. */
export type SampahPanelViewData = {
  items: readonly SampahPanelItem[];
  total: number;
  page: number;
  limit: number;
  retensiHari: number;
  loaded: boolean;
  loading: boolean;
  error: string | null;
  busy: SampahPanelBusy;
  hapusTarget: SampahPanelItem | null;
};

type ViewProps = {
  sumber: SampahSumber;
  data: SampahPanelViewData;
  /** Buka bagian lipat sejak awal (bawaan: tertutup). */
  defaultOpened?: boolean;
  onPage: (page: number) => void;
  onRetry: () => void;
  onPulihkan: (item: SampahPanelItem) => void;
  onPilihHapus: (item: SampahPanelItem | null) => void;
  onKonfirmasiHapus: () => void;
};

function KontenPanel({ data, onPage, onRetry, onPulihkan, onPilihHapus }: Omit<ViewProps, 'sumber' | 'onKonfirmasiHapus'>) {
  if (!data.loaded && data.loading) {
    return (
      <Group justify="center" py="sm">
        <Loader size="sm" />
      </Group>
    );
  }
  if (data.error) {
    return (
      <Stack gap="xs" align="flex-start">
        <Text fz="sm" c="red">
          {data.error}
        </Text>
        <Button size="xs" variant="light" onClick={onRetry}>
          Coba lagi
        </Button>
      </Stack>
    );
  }
  const totalHalaman = totalHalamanSampahPanel(data.total, data.limit);
  return (
    <Stack gap="sm">
      <SampahPanelList
        items={data.items}
        retensiHari={data.retensiHari}
        busy={data.busy}
        onPulihkan={onPulihkan}
        onHapus={onPilihHapus}
      />
      {data.total > data.limit && (
        <Center>
          <Pagination size="sm" value={data.page} total={totalHalaman} onChange={onPage} disabled={data.loading} />
        </Center>
      )}
    </Stack>
  );
}

/** Tampilan panel Sampah: bagian lipat "Sampah (n)" + daftar + pagination + modal hapus permanen. */
export function SampahPanelView({ sumber, data, defaultOpened = false, onKonfirmasiHapus, ...rest }: ViewProps) {
  return (
    <Box mt="md" data-testid="sampah-panel" data-sumber={sumber}>
      <Accordion variant="contained" chevronSize={14} defaultValue={defaultOpened ? PANEL_KEY : null}>
        <Accordion.Item value={PANEL_KEY}>
          <Accordion.Control icon={<IconTrash size={16} style={{ color: 'var(--mantine-color-dimmed)' }} />}>
            <Text fw={500} fz="sm">
              {judulSampahPanel(data.loaded ? data.total : null)}
            </Text>
          </Accordion.Control>
          <Accordion.Panel>
            <KontenPanel data={data} {...rest} />
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
      <ModalKonfirmasiHapus
        opened={data.hapusTarget !== null}
        loading={data.busy?.aksi === 'hapus'}
        onClose={() => rest.onPilihHapus(null)}
        onConfirm={onKonfirmasiHapus}
        text={data.hapusTarget ? teksKonfirmasiHapusPermanenPanel(data.hapusTarget.judul) : ''}
      />
    </Box>
  );
}

type Props = SampahPanelTarget & {
  /** Dipanggil setelah item dipulihkan, agar halaman induk memuat ulang daftar utamanya. */
  onPulihkan?: () => void;
  /** Nilai yang bila berubah memicu muat ulang daftar (mis. penghitung hapus di halaman induk). */
  reloadKey?: number;
};

/** Panel Sampah satu fitur (dokumen APBDes / foto BUMDes / dokumen perencanaan): dimuat saat dipasang. */
export function SampahPanel({ sumber, scopeId, onPulihkan, reloadKey }: Props) {
  const store = useMemo(() => createSampahPanelState({ sumber, scopeId }), [sumber, scopeId]);
  const snap = useSnapshot(store);

  useEffect(() => {
    void store.load();
  }, [store, reloadKey]);

  return (
    <SampahPanelView
      sumber={sumber}
      data={snap}
      onPage={(page) => void store.load(page)}
      onRetry={() => void store.load()}
      onPulihkan={(item) => void store.pulihkan(item, onPulihkan)}
      onPilihHapus={(item) => store.pilihHapus(item)}
      onKonfirmasiHapus={() => void store.hapusPermanen()}
    />
  );
}
