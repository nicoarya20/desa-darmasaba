'use client';
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import { Accordion, Badge, Button, Divider, Group, Loader, Stack, Text } from '@mantine/core';
import { IconHistory } from '@tabler/icons-react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { pesanPulihkan } from '../_lib/detail-view';
import { hapusPermanenSampah, muatSampah, pulihkanSampah, type SampahItemView } from '../_lib/sampah-api';
import { DokumenSampahList, type SampahBusy } from './DokumenSampahList';

type Props = {
  programId: string;
  folders: readonly { id: string; nama: string }[];
  /** Dipanggil setelah dokumen dipulihkan, untuk memuat ulang detail program. */
  onRestored: () => void;
};

const SAMPAH_KEY = 'sampah';

/** Teks konfirmasi hapus permanen satu dokumen terhapus. */
export function konfirmasiHapusPermanenText(judul: string): string {
  return `Hapus permanen dokumen "${judul}"? Tindakan ini tidak bisa dibatalkan.`;
}

/** Judul bagian "Dokumen terhapus" + badge jumlah (badge tampil setelah daftar dimuat). */
export function DokumenTerhapusJudul({ jumlah }: { jumlah: number | null }) {
  return (
    <Group gap="xs" wrap="nowrap">
      <Text fw={500} fz="xs" c="dimmed">
        Dokumen terhapus
      </Text>
      {jumlah !== null && (
        <Badge variant="outline" color="gray" size="xs">
          {jumlah}
        </Badge>
      )}
    </Group>
  );
}

/**
 * Bagian "Dokumen terhapus" di detail program: dimuat saat pertama dibuka, pulihkan / hapus permanen.
 * Sengaja bergaya sekunder (redup, tanpa kartu) dan dipisah Divider agar tidak dikira folder.
 */
export function DokumenSampahPanel({ programId, folders, onRestored }: Props) {
  const [items, setItems] = useState<SampahItemView[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<SampahBusy>(null);
  const [hapusTarget, setHapusTarget] = useState<SampahItemView | null>(null);

  const muat = async () => {
    setLoading(true);
    setError(null);
    const res = await muatSampah(programId);
    setLoading(false);
    if (res.ok) setItems(res.data);
    else setError(res.message);
  };

  const buang = (id: string) => setItems((list) => list?.filter((i) => i.id !== id) ?? null);

  const pulihkan = async (item: SampahItemView) => {
    setBusy({ id: item.id, aksi: 'pulihkan' });
    const res = await pulihkanSampah(item.id);
    setBusy(null);
    if (!res.ok) {
      toast.error(res.message);
      return;
    }
    toast.success(pesanPulihkan(res.data.folderId, folders));
    buang(item.id);
    onRestored();
  };

  const hapusPermanen = async () => {
    if (!hapusTarget) return;
    const target = hapusTarget;
    setBusy({ id: target.id, aksi: 'hapus' });
    const res = await hapusPermanenSampah(target.id);
    setBusy(null);
    setHapusTarget(null);
    if (!res.ok) {
      toast.error(res.message);
      return;
    }
    toast.success('Dokumen dihapus permanen');
    buang(target.id);
  };

  return (
    <>
      <Divider my="xs" label="Riwayat" labelPosition="left" />
      <Accordion
        variant="default"
        chevronSize={14}
        onChange={(value) => {
          // Lazy: daftar (dan pembersihan otomatis di backend) hanya dimuat saat bagian dibuka pertama kali.
          if (value === SAMPAH_KEY && items === null && !loading) void muat();
        }}
      >
        <Accordion.Item value={SAMPAH_KEY} data-testid="panel-sampah">
          <Accordion.Control icon={<IconHistory size={16} style={{ color: 'var(--mantine-color-dimmed)' }} />} py={4}>
            <DokumenTerhapusJudul jumlah={items === null ? null : items.length} />
          </Accordion.Control>
          <Accordion.Panel>
            {loading ? (
              <Group justify="center" py="sm">
                <Loader size="sm" />
              </Group>
            ) : error ? (
              <Stack gap="xs" align="flex-start">
                <Text fz="sm" c="red">
                  {error}
                </Text>
                <Button size="xs" variant="light" onClick={() => void muat()}>
                  Coba lagi
                </Button>
              </Stack>
            ) : (
              <DokumenSampahList
                items={items ?? []}
                folders={folders}
                busy={busy}
                onPulihkan={(item) => void pulihkan(item)}
                onHapus={setHapusTarget}
              />
            )}
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
      <ModalKonfirmasiHapus
        opened={hapusTarget !== null}
        loading={busy?.aksi === 'hapus'}
        onClose={() => setHapusTarget(null)}
        onConfirm={() => void hapusPermanen()}
        text={hapusTarget ? konfirmasiHapusPermanenText(hapusTarget.judul) : ''}
      />
    </>
  );
}
