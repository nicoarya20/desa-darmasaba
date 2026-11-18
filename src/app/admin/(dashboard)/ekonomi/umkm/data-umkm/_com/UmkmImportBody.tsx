import type { HasilCsvUmkm } from '@/lib/umkm/umkm-impor-csv';
import { bolehImpor, type Pratinjau } from '@/lib/umkm/umkm-impor-pratinjau';
import { IMPOR_UMKM_MAKS_BARIS, type ModeImporUmkm } from '@/lib/umkm/umkm-impor.rules';
import { Alert, Badge, Button, FileInput, Group, List, Loader, Radio, ScrollArea, Stack, Table, Text } from '@mantine/core';
import { IconDownload, IconFileTypeCsv } from '@tabler/icons-react';
import { DAFTAR_MAKS, PRATINJAU_BARIS } from '../_lib/umkm-impor.logic';

export type TahapImpor = 'kosong' | 'membaca' | 'siap' | 'mengimpor';

type Props = {
  mode: ModeImporUmkm;
  tahap: TahapImpor;
  hasil: HasilCsvUmkm | null;
  pratinjau: Pratinjau | null;
  error: string | null;
  onMode: (mode: ModeImporUmkm) => void;
  onBerkas: (file: File | null) => void;
  onTemplate: () => void;
  onBatal: () => void;
  onImpor: () => void;
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

/** Isi modal impor CSV Data UMKM (tanpa pembungkus Modal, agar bisa dirender/diuji sendiri). */
export function UmkmImportBody({ mode, tahap, hasil, pratinjau, error, onMode, onBerkas, onTemplate, onBatal, onImpor }: Props) {
  const sibuk = tahap === 'membaca' || tahap === 'mengimpor';
  const jumlah = (pratinjau?.ditambah ?? 0) + (pratinjau?.diperbarui ?? 0);
  const contohBaris = hasil?.rows.slice(0, PRATINJAU_BARIS) ?? [];

  return (
    <Stack gap="sm">
      <Alert color="blue" variant="light" title="Format berkas CSV">
        <Text fz="sm">
          Baris pertama adalah header. Kolom wajib: <b>nama</b>, <b>pemilik</b>, <b>kategori</b>. Kolom opsional:{' '}
          <b>deskripsi</b>, <b>alamat</b>, <b>kontak</b>. Kategori harus sama dengan nama di tab Kategori Produk. Gambar tidak
          diimpor (unggah lewat Ubah UMKM). Maksimal {IMPOR_UMKM_MAKS_BARIS} baris dan 2 MB. Pemisah koma atau titik koma diterima.
        </Text>
        <Button mt="xs" size="xs" variant="light" leftSection={<IconDownload size={16} />} onClick={onTemplate}>
          Unduh template CSV
        </Button>
      </Alert>

      <Radio.Group label="Jika UMKM sudah ada (nama dan pemilik sama)" value={mode} onChange={(v) => onMode(v === 'perbarui' ? 'perbarui' : 'lewati')}>
        <Stack gap={6} mt={4}>
          <Radio value="lewati" disabled={sibuk} label="Lewati" description="Data yang sudah ada tidak diubah; hanya UMKM baru yang ditambahkan." />
          <Radio
            value="perbarui"
            disabled={sibuk}
            label="Perbarui"
            description="Kategori, deskripsi, alamat, dan kontak diperbarui; sel kosong di CSV tidak menimpa data lama."
          />
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
                      <Table.Th>Nama</Table.Th>
                      <Table.Th>Pemilik</Table.Th>
                      <Table.Th>Kategori</Table.Th>
                      <Table.Th>Kontak</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {contohBaris.map((r) => (
                      <Table.Tr key={r.baris}>
                        <Table.Td>{r.baris}</Table.Td>
                        <Table.Td>{r.nama}</Table.Td>
                        <Table.Td>{r.pemilik}</Table.Td>
                        <Table.Td>{r.kategori}</Table.Td>
                        <Table.Td>{r.kontak ?? '-'}</Table.Td>
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
