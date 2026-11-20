'use client'
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import stateLembagaKomunitas from '@/app/admin/(dashboard)/_state/desa/lembagaKomunitas';
import colors from '@/con/colors';
import { LEMBAGA_KOMUNITAS_ADMIN_PATH } from '@/lib/lembaga-komunitas';
import { Box, Button, Center, Group, Pagination, Paper, Select, Skeleton, Text, Title } from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconPlus } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSnapshot } from 'valtio';
import { LembagaKomunitasTable } from './LembagaKomunitasTable';
import { LEMBAGA_KOMUNITAS_ADMIN_TEXT as T } from './lembaga-komunitas.text';

const SEARCH_DEBOUNCE_MS = 800;

/** Pesan daftar kosong sesuai filter yang aktif (kata kunci > jenis > tanpa filter). */
export function emptyMessage(search: string, jenis: string): string {
  if (search) return T.emptySearch;
  return jenis ? T.emptyJenis : T.empty;
}

/** Daftar admin Lembaga & Komunitas: filter jenis, pencarian (dari header), tabel, paginasi, hapus dengan konfirmasi. */
export function LembagaKomunitasList({ search }: { search: string }) {
  const snap = useSnapshot(stateLembagaKomunitas);
  const router = useRouter();
  const [debouncedSearch] = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);
  const [jenis, setJenis] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, page, totalPages, loading } = snap.findMany;
  const load = (nextPage: number) => stateLembagaKomunitas.findMany.load(nextPage, debouncedSearch, jenis);

  useShallowEffect(() => {
    void stateLembagaKomunitas.jenis.load();
  }, []);

  useShallowEffect(() => {
    void stateLembagaKomunitas.findMany.load(1, debouncedSearch, jenis);
  }, [debouncedSearch, jenis]);

  const handleDelete = async () => {
    if (!deleteId) return;
    const removed = await stateLembagaKomunitas.delete.byId(deleteId);
    setDeleteId(null);
    if (!removed) return;
    // Jenis terakhir bisa ikut hilang dari saran/filter; hapus baris terakhir di halaman > 1 → mundur satu halaman.
    void stateLembagaKomunitas.jenis.load();
    await load(data.length === 1 && page > 1 ? page - 1 : page);
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
            onClick={() => router.push(`${LEMBAGA_KOMUNITAS_ADMIN_PATH}/create`)}
          >
            {T.addNew}
          </Button>
        </Group>

        <Select
          aria-label={T.filterJenis}
          placeholder={T.filterAll}
          data={snap.jenis.data as string[]}
          value={jenis || null}
          onChange={(value) => setJenis(value ?? '')}
          clearable
          searchable
          mb="md"
          maw={320}
        />

        {loading ? (
          <Skeleton height={400} radius="md" />
        ) : data.length === 0 ? (
          <Center py="xl">
            <Text c="dimmed" fz="sm">{emptyMessage(debouncedSearch, jenis)}</Text>
          </Center>
        ) : (
          <LembagaKomunitasTable
            items={data}
            onEdit={(id) => router.push(`${LEMBAGA_KOMUNITAS_ADMIN_PATH}/${id}/edit`)}
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
