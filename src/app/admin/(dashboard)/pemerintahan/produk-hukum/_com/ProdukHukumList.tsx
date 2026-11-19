'use client'
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import stateProdukHukum from '@/app/admin/(dashboard)/_state/desa/produkHukum';
import colors from '@/con/colors';
import { KATEGORI_PRODUK_HUKUM, KATEGORI_PRODUK_HUKUM_LABEL } from '@/lib/produk-hukum';
import { Box, Button, Center, Group, Pagination, Paper, ScrollArea, SegmentedControl, Skeleton, Text, Title } from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconPlus } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSnapshot } from 'valtio';
import { ProdukHukumTable } from './ProdukHukumTable';
import { PRODUK_HUKUM_ADMIN_PATH } from './produk-hukum.meta';
import { PRODUK_HUKUM_ADMIN_TEXT as T } from './produk-hukum.text';

/** Nilai pilihan filter "semua kategori" (bukan nilai kategori sah, jadi tidak bentrok). */
const FILTER_ALL = 'semua';
const SEARCH_DEBOUNCE_MS = 800;
const filterOptions = [
  { value: FILTER_ALL, label: T.filterAll },
  ...KATEGORI_PRODUK_HUKUM.map((value) => ({ value, label: KATEGORI_PRODUK_HUKUM_LABEL[value] })),
];

/** Pesan daftar kosong sesuai filter yang aktif (kata kunci > kategori > tanpa filter). */
export function emptyMessage(search: string, kategori: string): string {
  if (search) return T.emptySearch;
  return kategori ? T.emptyKategori : T.empty;
}

/** Daftar admin Produk Hukum: filter kategori, pencarian (dari header), tabel, paginasi, hapus dengan konfirmasi. */
export function ProdukHukumList({ search }: { search: string }) {
  const snap = useSnapshot(stateProdukHukum);
  const router = useRouter();
  const [debouncedSearch] = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);
  const [filter, setFilter] = useState(FILTER_ALL);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, page, totalPages, loading } = snap.findMany;
  const kategori = filter === FILTER_ALL ? '' : filter;
  const load = (nextPage: number) => stateProdukHukum.findMany.load(nextPage, debouncedSearch, kategori);

  useShallowEffect(() => {
    void stateProdukHukum.findMany.load(1, debouncedSearch, kategori);
  }, [debouncedSearch, kategori]);

  const handleDelete = async () => {
    if (!deleteId) return;
    const removed = await stateProdukHukum.delete.byId(deleteId);
    setDeleteId(null);
    // Hapus baris terakhir di halaman > 1 → mundur satu halaman agar tidak menampilkan halaman kosong.
    if (removed) await load(data.length === 1 && page > 1 ? page - 1 : page);
  };

  return (
    <Box py="md">
      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={4}>{T.listTitle}</Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() => router.push(`${PRODUK_HUKUM_ADMIN_PATH}/create`)}
          >
            {T.addNew}
          </Button>
        </Group>

        <ScrollArea type="never" mb="md">
          <SegmentedControl data={filterOptions} value={filter} onChange={setFilter} radius="lg" />
        </ScrollArea>

        {loading ? (
          <Skeleton height={400} radius="md" />
        ) : data.length === 0 ? (
          <Center py="xl">
            <Text c="dimmed" fz="sm">{emptyMessage(debouncedSearch, kategori)}</Text>
          </Center>
        ) : (
          <ProdukHukumTable
            items={data}
            onEdit={(id) => router.push(`${PRODUK_HUKUM_ADMIN_PATH}/${id}/edit`)}
            onDelete={setDeleteId}
          />
        )}

        {totalPages > 1 && (
          <Center mt="md">
            <Pagination value={page} onChange={(next) => void load(next)} total={totalPages} radius="xl" />
          </Center>
        )}
      </Paper>

      <ModalKonfirmasiHapus
        opened={deleteId !== null}
        loading={snap.delete.loading}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        text={T.confirmDelete}
      />
    </Box>
  );
}
