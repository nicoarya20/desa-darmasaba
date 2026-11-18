'use client'
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import laporanBulanan from '@/app/admin/(dashboard)/_state/kependudukan/laporan-bulanan';
import { BULAN_LABEL } from '@/app/api/[[...slugs]]/_lib/kependudukan/laporan-bulanan/laporan-bulanan.rules';
import colors from '@/con/colors';
import { Box, Button, Center, Group, Pagination, Paper, Select, Title } from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import { YearFilter } from '../_components/YearFilter';
import LaporanBulananTable from './_com/LaporanBulananTable';

const BASE_PATH = '/admin/kependudukan/laporan-bulanan';
const SEARCH_DEBOUNCE_MS = 800;
const bulanOptions = BULAN_LABEL.map((label, i) => ({ value: String(i + 1), label }));

/** Admin: daftar laporan penduduk bulanan dengan filter tahun/bulan, cari banjar, edit, hapus. */
export default function LaporanBulananAdmin() {
  const state = useProxy(laporanBulanan);
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [tahun, setTahun] = useState<number | undefined>(undefined);
  const [bulan, setBulan] = useState<number | undefined>(undefined);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [debouncedSearch] = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);

  const { data, page, totalPages, loading } = state.findMany;
  const filter = { tahun, bulan, banjar: debouncedSearch.trim() || undefined };

  useShallowEffect(() => {
    laporanBulanan.findMany.load(1, filter);
  }, [tahun, bulan, debouncedSearch]);

  const handleDelete = async () => {
    if (!deleteId) return;
    await laporanBulanan.delete.byId(deleteId);
    setDeleteId(null);
  };

  return (
    <Box>
      <HeaderSearch
        title="Laporan Bulanan"
        placeholder="Cari nama banjar..."
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <Group mt="md" align="flex-end">
        <YearFilter value={tahun} onChange={setTahun} />
        <Select
          placeholder="Semua Bulan"
          data={bulanOptions}
          value={bulan ? String(bulan) : null}
          onChange={(v) => setBulan(v ? Number(v) : undefined)}
          clearable
          w={200}
          aria-label="Filter bulan"
        />
      </Group>
      <Box py="md">
        <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
          <Group justify="space-between" mb="md">
            <Title order={4}>Daftar Laporan Penduduk Bulanan</Title>
            <Button leftSection={<IconPlus size={18} />} color="blue" variant="light" onClick={() => router.push(`${BASE_PATH}/create`)}>
              Tambah Baru
            </Button>
          </Group>
          <LaporanBulananTable
            rows={data}
            loading={loading}
            deleting={state.delete.loading}
            onEdit={(id) => router.push(`${BASE_PATH}/${id}/edit`)}
            onDelete={setDeleteId}
          />
          {totalPages > 1 && (
            <Center mt="md">
              <Pagination value={page} onChange={(p) => laporanBulanan.findMany.load(p, filter)} total={totalPages} radius="xl" />
            </Center>
          )}
        </Paper>
      </Box>
      <ModalKonfirmasiHapus
        opened={deleteId !== null}
        loading={state.delete.loading}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        text="Apakah anda yakin ingin menghapus laporan bulanan ini?"
      />
    </Box>
  );
}
