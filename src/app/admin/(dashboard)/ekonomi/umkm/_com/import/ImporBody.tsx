import { bolehImpor, type Pratinjau } from '@/lib/umkm/umkm-impor-pratinjau';
import { IMPOR_UMKM_MAKS_BARIS, type ModeImporUmkm } from '@/lib/umkm/umkm-impor.rules';
import { Alert, Badge, Button, FileInput, Group, List, Loader, Radio, ScrollArea, Stack, Table, Text } from '@mantine/core';
import { IconDownload, IconFileTypeCsv } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { DAFTAR_MAKS, PRATINJAU_BARIS } from './impor.logic';

export type TahapImpor = 'kosong' | 'membaca' | 'siap' | 'mengimpor';
export type KolomPratinjau<R> = { judul: string; sel: (baris: R) => ReactNode };

export type ImporBodyProps<R extends { baris: number }> = {
  mode: ModeImporUmkm;
  tahap: TahapImpor;
  hasil: { rows: readonly R[]; ditolak?: readonly { baris: number; alasan: string }[]; galat: string | null } | null;
  pratinjau: Pratinjau | null;
  error: string | null;
  onMode: (mode: ModeImporUmkm) => void;
  onBerkas: (file: File | null) => void;
  onTemplate: () => void;
  onBatal: () => void;
  onImpor: () => void;
};

/** Yang berbeda antar impor (UMKM, Produk): teks petunjuk, teks mode, kolom tabel contoh, dan catatan tambahan. */
export type KonfigImporBody<R extends { baris: number }> = {
  petunjuk: ReactNode;
  labelMode: string;
  deskripsiMode: Record<ModeImporUmkm, string>;
  kolom: KolomPratinjau<R>[];
  catatan?: (pratinjau: Pratinjau) => ReactNode;
};

function DaftarPesan({ judul, warna, total, items }: { judul: string; warna: 'red' | 'yellow'; total: number; items: { baris: number; alasan: string }[] }) {
  const tampil = items.slice(0, DAFTAR_MAKS);
  return (
    <Alert color={warna} title={judul}>
      <ScrollArea.Autosize mah={180}>
        <List size="sm" spacing={2}>
          {tampil.map((d, i) => (
            <List.Item key={`${d.baris}-${i}`}>
              Baris {d.baris}: {d.alasan}
            </List.Item>
          ))}
        </List>
      </ScrollArea.Autosize>
      {total > tampil.length && (
        <Text fz="xs" mt={4}>
          dan {total - tampil.length} lainnya
        </Text>
      )}
    </Alert>
  );
}

/** Isi modal impor CSV (tanpa pembungkus Modal, agar bisa dirender/diuji sendiri). Dipakai impor UMKM dan Produk. */
export function ImporBody<R extends { baris: number }>({
  mode,
  tahap,
  hasil,
  pratinjau,
  error,
  onMode,
  onBerkas,
  onTemplate,
  onBatal,
  onImpor,
  petunjuk,
  labelMode,
  deskripsiMode,
  kolom,
  catatan,
}: ImporBodyProps<R> & KonfigImporBody<R>) {
  const sibuk = tahap === 'membaca' || tahap === 'mengimpor';
  const jumlah = (pratinjau?.ditambah ?? 0) + (pratinjau?.diperbarui ?? 0);
  const contohBaris = hasil?.rows.slice(0, PRATINJAU_BARIS) ?? [];

  return (
    <Stack gap="sm">
      <Alert color="blue" variant="light" title="Format berkas CSV">
        <Text fz="sm">
          {petunjuk} Maksimal {IMPOR_UMKM_MAKS_BARIS} baris dan 2 MB. Pemisah koma atau titik koma diterima.
        </Text>
        <Button mt="xs" size="xs" variant="light" leftSection={<IconDownload size={16} />} onClick={onTemplate}>
          Unduh template CSV
        </Button>
      </Alert>

      <Radio.Group label={labelMode} value={mode} onChange={(v) => onMode(v === 'perbarui' ? 'perbarui' : 'lewati')}>
        <Stack gap={6} mt={4}>
          <Radio value="lewati" disabled={sibuk} label="Lewati" description={deskripsiMode.lewati} />
          <Radio value="perbarui" disabled={sibuk} label="Perbarui" description={deskripsiMode.perbarui} />
        </Stack>
      </Radio.Group>

      <FileInput
        label="Berkas CSV"
        placeholder="Pilih berkas .csv"
        accept=".csv,text/csv"
        leftSection={<IconFileTypeCsv size={18} />}
        onChange={onBerkas}
        disabled={sibuk}
        clearable
      />

      {tahap === 'membaca' && (
        <Group gap="xs">
          <Loader size="xs" />
          <Text fz="sm" c="dimmed">
            Memeriksa berkas...
          </Text>
        </Group>
      )}
      {hasil?.galat && <Alert color="red">{hasil.galat}</Alert>}
      {error && <Alert color="red">{error}</Alert>}

      {pratinjau && (
        <Stack gap="xs">
          <Group gap="xs">
            <Badge color="green" variant="light">{pratinjau.ditambah} ditambah</Badge>
            <Badge color="blue" variant="light">{pratinjau.diperbarui} diperbarui</Badge>
            <Badge color="gray" variant="light">{pratinjau.dilewati} dilewati</Badge>
            <Badge color={pratinjau.totalGalat > 0 ? 'red' : 'gray'} variant="light">{pratinjau.totalGalat} galat</Badge>
          </Group>

          {pratinjau.totalGalat > 0 && (
            <DaftarPesan judul="Perbaiki berkas lalu pilih ulang. Impor ditolak selama ada galat" warna="red" total={pratinjau.totalGalat} items={pratinjau.galat} />
          )}
          {catatan?.(pratinjau)}
          {pratinjau.totalPeringatan > 0 && (
            <DaftarPesan judul="Peringatan (tidak menghalangi impor)" warna="yellow" total={pratinjau.totalPeringatan} items={pratinjau.peringatan} />
          )}

          {contohBaris.length > 0 && (
            <>
              <Table.ScrollContainer minWidth={420}>
                <Table striped withTableBorder fz="sm">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Baris</Table.Th>
                      {kolom.map((k) => (
                        <Table.Th key={k.judul}>{k.judul}</Table.Th>
                      ))}
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {contohBaris.map((r) => (
                      <Table.Tr key={r.baris}>
                        <Table.Td>{r.baris}</Table.Td>
                        {kolom.map((k) => (
                          <Table.Td key={k.judul}>{k.sel(r)}</Table.Td>
                        ))}
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
              <Text fz="xs" c="dimmed">
                Menampilkan {contohBaris.length} dari {hasil?.rows.length} baris yang terbaca.
              </Text>
            </>
          )}
        </Stack>
      )}

      <Group justify="flex-end">
        <Button variant="default" onClick={onBatal} disabled={tahap === 'mengimpor'}>
          Batal
        </Button>
        <Button onClick={onImpor} disabled={!bolehImpor(pratinjau) || sibuk} loading={tahap === 'mengimpor'}>
          Impor ({jumlah})
        </Button>
      </Group>
    </Stack>
  );
}
