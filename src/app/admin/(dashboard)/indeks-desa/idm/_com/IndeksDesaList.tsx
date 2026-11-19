'use client'
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import stateIndeksDesa from '@/app/admin/(dashboard)/_state/indeks-desa/indeksDesa';
import colors from '@/con/colors';
import { INDEKS_DESA_ADMIN_PATH } from '@/lib/indeks-desa';
import { Box, Button, Center, Group, Pagination, Paper, Skeleton, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconPlus } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSnapshot } from 'valtio';
import { IndeksDesaTable } from './IndeksDesaTable';
import { INDEKS_DESA_ADMIN_TEXT as T } from './indeks-desa.text';

/** Daftar admin Indeks Desa: tabel per tahun (terbaru dulu), paginasi, hapus dengan konfirmasi. */
export function IndeksDesaList() {
  const snap = useSnapshot(stateIndeksDesa);
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, page, totalPages, loading } = snap.findMany;

  useShallowEffect(() => {
    void stateIndeksDesa.findMany.load(1);
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    const removed = await stateIndeksDesa.delete.byId(deleteId);
    setDeleteId(null);
    // Hapus baris terakhir di halaman > 1 → mundur satu halaman agar tidak menampilkan halaman kosong.
    if (removed) await stateIndeksDesa.findMany.load(data.length === 1 && page > 1 ? page - 1 : page);
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
            onClick={() => router.push(`${INDEKS_DESA_ADMIN_PATH}/create`)}
          >
            {T.addNew}
          </Button>
        </Group>

        {loading ? (
          <Skeleton height={300} radius="md" />
        ) : data.length === 0 ? (
          <Center py="xl">
            <Text c="dimmed" fz="sm">{T.empty}</Text>
          </Center>
        ) : (
          <IndeksDesaTable
            items={data}
            onEdit={(id) => router.push(`${INDEKS_DESA_ADMIN_PATH}/${id}/edit`)}
            onDelete={setDeleteId}
          />
        )}

        {totalPages > 1 && (
          <Center mt="md">
            <Pagination value={page} onChange={(next) => void stateIndeksDesa.findMany.load(next)} total={totalPages} radius="xl" />
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
