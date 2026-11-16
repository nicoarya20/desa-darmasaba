'use client';
import colors from '@/con/colors';
import {
  ActionIcon,
  Badge,
  Button,
  Center,
  Group,
  Pagination,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconEdit, IconPlus, IconSearch, IconTrash, IconUpload } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import penerimaState, {
  PENERIMA_ADMIN_LIMIT,
  type FormPenerima,
} from '../../../_state/ekonomi/penerima-program-kemiskinan';
import { PenerimaFormModal } from './PenerimaFormModal';
import { PenerimaImportModal } from './PenerimaImportModal';

const SEMUA = 'semua';

/**
 * Panel kelola penerima di detail program admin: saring per tahun, cari nama/alamat, daftar berpaginasi,
 * tambah/ubah/hapus manual, dan impor CSV (pratinjau dulu, opsi ganti seluruh data satu tahun).
 */
export function PenerimaPanel({ programId }: { programId: string }) {
  const s = useSnapshot(penerimaState);
  const [cari, setCari] = useState('');
  const [cariTertunda] = useDebouncedValue(cari, 400);
  const [form, setForm] = useState<FormPenerima | null>(null);
  const [impor, setImpor] = useState(false);
  const [hapusId, setHapusId] = useState<string | null>(null);

  useEffect(() => {
    void penerimaState.pilihProgram(programId);
  }, [programId]);

  useEffect(() => {
    if (penerimaState.search === cariTertunda) return;
    Object.assign(penerimaState, { search: cariTertunda, page: 1 });
    void penerimaState.load();
  }, [cariTertunda]);

  const tahunDefault = s.tahun ?? s.tahunList[0]?.tahun ?? new Date().getFullYear();
  const pilihanTahun = [
    { value: SEMUA, label: 'Semua tahun' },
    ...s.tahunList.map((t) => ({ value: String(t.tahun), label: `${t.tahun} (${t.jumlah})` })),
  ];

  const gantiTahun = (v: string | null) => {
    Object.assign(penerimaState, { tahun: !v || v === SEMUA ? null : Number(v), page: 1 });
    void penerimaState.load();
  };

  const gantiHalaman = (page: number) => {
    penerimaState.page = page;
    void penerimaState.load();
  };

  const hapus = async () => {
    if (hapusId) await penerimaState.hapus(hapusId);
    setHapusId(null);
  };

  return (
    <Paper withBorder bg={colors['white-1']} p="lg" radius="md" shadow="sm" mt="md">
      <Stack gap="md">
        <Group justify="space-between" wrap="wrap">
          <Text fz="xl" fw="bold" c={colors['blue-button']}>
            Penerima Bantuan
          </Text>
          <Group gap="xs">
            <Button
              variant="light"
              leftSection={<IconUpload size={16} />}
              onClick={() => setImpor(true)}
            >
              Impor CSV
            </Button>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setForm({ nama: '', alamat: '', tahun: tahunDefault, isActive: true })}
            >
              Tambah
            </Button>
          </Group>
        </Group>
        <Text fz="sm" c="dimmed">
          Hanya nama dan alamat yang disimpan dan ditampilkan di website. Jangan masukkan NIK, tanggal lahir, atau nomor KK.
        </Text>
        <Group grow wrap="wrap">
          <Select
            label="Tahun"
            data={pilihanTahun}
            value={s.tahun === null ? SEMUA : String(s.tahun)}
            onChange={gantiTahun}
            allowDeselect={false}
          />
          <TextInput
            label="Cari"
            placeholder="Nama atau alamat"
            leftSection={<IconSearch size={16} />}
            value={cari}
            onChange={(e) => setCari(e.currentTarget.value)}
          />
        </Group>
        <Text fz="sm">{s.loading ? 'Memuat…' : `${s.total} penerima`}</Text>
        <Table.ScrollContainer minWidth={560}>
          <Table striped highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th w={56}>No</Table.Th>
                <Table.Th>Nama</Table.Th>
                <Table.Th>Alamat</Table.Th>
                <Table.Th w={72}>Tahun</Table.Th>
                <Table.Th w={110}>Status</Table.Th>
                <Table.Th w={96}>Aksi</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {s.data.length === 0 && !s.loading && (
                <Table.Tr>
                  <Table.Td colSpan={6}>
                    <Text ta="center" c="dimmed" fz="sm">
                      Belum ada penerima untuk filter ini
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
              {s.data.map((p, i) => (
                <Table.Tr key={p.id}>
                  <Table.Td>{(s.page - 1) * PENERIMA_ADMIN_LIMIT + i + 1}</Table.Td>
                  <Table.Td>{p.nama}</Table.Td>
                  <Table.Td>{p.alamat}</Table.Td>
                  <Table.Td>{p.tahun}</Table.Td>
                  <Table.Td>
                    <Badge color={p.isActive ? 'green' : 'gray'} variant="light">
                      {p.isActive ? 'Tampil' : 'Disembunyikan'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap={4} wrap="nowrap">
                      <ActionIcon variant="light" color="green" aria-label="Ubah penerima" onClick={() => setForm({ ...p })}>
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon variant="light" color="red" aria-label="Hapus penerima" onClick={() => setHapusId(p.id)}>
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
        {s.totalPages > 1 && (
          <Center>
            <Pagination value={s.page} total={s.totalPages} onChange={gantiHalaman} />
          </Center>
        )}
      </Stack>

      {form && (
        <PenerimaFormModal awal={form} saving={s.saving} onClose={() => setForm(null)} onSimpan={penerimaState.simpan} />
      )}
      {impor && (
        <PenerimaImportModal
          tahunAwal={tahunDefault}
          tahunList={s.tahunList}
          saving={s.saving}
          onClose={() => setImpor(false)}
          onImpor={penerimaState.impor}
        />
      )}
      <ModalKonfirmasiHapus
        opened={hapusId !== null}
        onClose={() => setHapusId(null)}
        onConfirm={hapus}
        text="Hapus permanen penerima ini?"
      />
    </Paper>
  );
}
