'use client';
import { parseCsvPenerima, type HasilCsvPenerima } from '@/lib/program-kemiskinan/penerima-csv';
import { TAHUN_MIN, tahunMaks, validasiTahun } from '@/lib/program-kemiskinan/penerima.rules';
import { Alert, Button, FileInput, Group, List, Modal, NumberInput, Radio, Stack, Table, Text } from '@mantine/core';
import { IconFileTypeCsv } from '@tabler/icons-react';
import { useState } from 'react';
import type { JumlahTahun } from '@/lib/program-kemiskinan/penerima-rekap';

/** Batas ukuran berkas CSV yang dibaca di browser. */
const CSV_MAKS_BYTES = 2 * 1024 * 1024;
const PRATINJAU_BARIS = 10;

type Props = {
  tahunAwal: number;
  tahunList: readonly JumlahTahun[];
  saving: boolean;
  onClose: () => void;
  onImpor: (opts: { tahun: number; mode: 'tambah' | 'ganti'; rows: HasilCsvPenerima['rows'] }) => Promise<boolean>;
};

/**
 * Modal impor CSV penerima: pilih tahun & mode (tambah / ganti seluruh data tahun itu), baca berkas di
 * browser, pratinjau baris valid & ditolak, lalu kirim hanya nama + alamat. Kolom lain tidak dikirim.
 */
export function PenerimaImportModal({ tahunAwal, tahunList, saving, onClose, onImpor }: Props) {
  const [tahun, setTahun] = useState<number>(tahunAwal);
  const [mode, setMode] = useState<'tambah' | 'ganti'>('tambah');
  const [berkas, setBerkas] = useState<File | null>(null);
  const [hasil, setHasil] = useState<HasilCsvPenerima | null>(null);

  const pilihBerkas = async (file: File | null) => {
    setBerkas(file);
    setHasil(null);
    if (!file) return;
    if (file.size > CSV_MAKS_BYTES) {
      setHasil({ rows: [], ditolak: [], galat: 'Ukuran berkas maksimal 2 MB' });
      return;
    }
    setHasil(parseCsvPenerima(await file.text()));
  };

  const tahunValid = validasiTahun(tahun).ok;
  const lama = tahunList.find((t) => t.tahun === tahun)?.jumlah ?? 0;
  const siap = tahunValid && !!hasil && !hasil.galat && hasil.rows.length > 0;

  const kirim = async () => {
    if (!hasil || !siap) return;
    if (await onImpor({ tahun, mode, rows: hasil.rows })) onClose();
  };

  return (
    <Modal opened onClose={onClose} title={<Text fw="bold">Impor Penerima dari CSV</Text>} size="lg" centered>
      <Stack gap="sm">
        <Text fz="sm" c="dimmed">
          Header wajib memuat kolom <b>nama</b> dan <b>alamat</b>. Kolom lain (NIK, tanggal lahir, nomor KK, dst.) diabaikan
          dan tidak disimpan.
        </Text>
        <NumberInput
          label="Tahun data"
          required
          min={TAHUN_MIN}
          max={tahunMaks()}
          allowDecimal={false}
          value={tahun}
          onChange={(v) => setTahun(Number(v))}
        />
        <Radio.Group label="Cara simpan" value={mode} onChange={(v) => setMode(v === 'ganti' ? 'ganti' : 'tambah')}>
          <Stack gap={6} mt={4}>
            <Radio value="tambah" label={`Tambahkan ke data tahun ${tahun}`} />
            <Radio value="ganti" label={`Ganti seluruh data tahun ${tahun} (${lama} data lama dihapus)`} />
          </Stack>
        </Radio.Group>
        <FileInput
          label="Berkas CSV"
          accept=".csv,text/csv"
          leftSection={<IconFileTypeCsv size={18} />}
          value={berkas}
          onChange={pilihBerkas}
          clearable
        />
        {hasil?.galat && <Alert color="red">{hasil.galat}</Alert>}
        {hasil && !hasil.galat && (
          <Stack gap="xs">
            <Text fz="sm" fw={600}>
              {hasil.rows.length} baris siap diimpor, {hasil.ditolak.length} baris ditolak
            </Text>
            {hasil.rows.length > 0 && (
              <Table striped withTableBorder fz="sm">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Baris</Table.Th>
                    <Table.Th>Nama</Table.Th>
                    <Table.Th>Alamat</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {hasil.rows.slice(0, PRATINJAU_BARIS).map((r) => (
                    <Table.Tr key={r.baris}>
                      <Table.Td>{r.baris}</Table.Td>
                      <Table.Td>{r.nama}</Table.Td>
                      <Table.Td>{r.alamat}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
            {hasil.rows.length > PRATINJAU_BARIS && (
              <Text fz="xs" c="dimmed">
                Menampilkan {PRATINJAU_BARIS} dari {hasil.rows.length} baris.
              </Text>
            )}
            {hasil.ditolak.length > 0 && (
              <Alert color="yellow" title="Baris ditolak (tidak ikut diimpor)">
                <List size="sm">
                  {hasil.ditolak.slice(0, PRATINJAU_BARIS).map((d) => (
                    <List.Item key={d.baris}>
                      Baris {d.baris}: {d.alasan}
                    </List.Item>
                  ))}
                </List>
              </Alert>
            )}
          </Stack>
        )}
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Batal
          </Button>
          <Button color={mode === 'ganti' ? 'red' : undefined} onClick={kirim} disabled={!siap} loading={saving}>
            {mode === 'ganti' ? `Ganti data ${tahun}` : 'Simpan'} ({hasil?.rows.length ?? 0})
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
