'use client'
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import stateBumdes from '@/app/admin/(dashboard)/_state/ekonomi/bumdes/bumdes';
import colors from '@/con/colors';
import { Badge, Box, Button, Center, Group, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconEdit, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import { UNIT_USAHA_LIST_PATH } from '../_lib/UnitUsahaForm';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 500;

/** Admin: daftar unit usaha BUMDes (cari, paginasi, ubah, hapus). */
function UnitUsahaBumdesAdmin() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title="Unit Usaha BUMDes"
        placeholder="pencarian"
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListUnitUsaha search={search} />
    </Box>
  );
}

function ListUnitUsaha({ search }: { search: string }) {
  const router = useRouter();
  const unit = useProxy(stateBumdes.unitUsaha);
  const [debouncedSearch] = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data, page, totalPages, loading } = unit.findMany;

  const reload = (nextPage: number) =>
    stateBumdes.unitUsaha.findMany.load(nextPage, PAGE_SIZE, debouncedSearch, true);

  useEffect(() => {
    void stateBumdes.unitUsaha.findMany.load(1, PAGE_SIZE, debouncedSearch, true);
  }, [debouncedSearch]);

  const handleDelete = async () => {
    if (!deleteId) return;
    const ok = await stateBumdes.unitUsaha.delete.byId(deleteId);
    setDeleteId(null);
    // Hapus item terakhir di halaman > 1 → mundur satu halaman agar tidak menampilkan halaman kosong.
    if (ok) await reload(data?.length === 1 && page > 1 ? page - 1 : page);
  };

  const header = (
    <Group justify="space-between" mb="md">
      <Title order={3}>Daftar Unit Usaha BUMDes</Title>
      <Button
        leftSection={<IconPlus size={18} />}
        color="blue"
        variant="light"
        onClick={() => router.push(`${UNIT_USAHA_LIST_PATH}/create`)}
      >
        Tambah Baru
      </Button>
    </Group>
  );

  if (loading && !data) {
    return <Stack py="md"><Skeleton height={300} /></Stack>;
  }

  return (
    <Box py="md">
      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
        {header}
        {!data || data.length === 0 ? (
          <Center py="xl">
            <Text c="dimmed" fz={{ base: 'sm', md: 'md' }} ta="center">
              {debouncedSearch ? 'Tidak ada unit usaha yang cocok dengan pencarian' : 'Belum ada unit usaha BUMDes. Klik "Tambah Baru" untuk mulai.'}
            </Text>
          </Center>
        ) : (
          <>
            <Box visibleFrom="md" style={{ overflowX: 'auto' }}>
              <Table highlightOnHover miw={0} style={{ tableLayout: 'fixed', width: '100%' }}>
                <TableThead>
                  <TableTr>
                    <TableTh style={{ width: '8%' }}>Urutan</TableTh>
                    <TableTh style={{ width: '27%' }}>Nama</TableTh>
                    <TableTh style={{ width: '35%' }}>Deskripsi</TableTh>
                    <TableTh style={{ width: '12%' }}>Status</TableTh>
                    <TableTh style={{ width: '18%' }}>Aksi</TableTh>
                  </TableTr>
                </TableThead>
                <TableTbody>
                  {data.map((item) => (
                    <TableTr key={item.id}>
                      <TableTd>{item.urutan}</TableTd>
                      <TableTd><Text fw={500} truncate="end">{item.nama}</Text></TableTd>
                      <TableTd><Text c="dimmed" fz="sm" truncate="end">{item.deskripsi}</Text></TableTd>
                      <TableTd>
                        <Badge color={item.isActive ? 'green' : 'red'}>{item.isActive ? 'Aktif' : 'Tidak Aktif'}</Badge>
                      </TableTd>
                      <TableTd>
                        <Group gap="xs" wrap="nowrap">
                          <Button size="xs" radius="md" variant="light" color="green" leftSection={<IconEdit size={16} />}
                            onClick={() => router.push(`${UNIT_USAHA_LIST_PATH}/${item.id}/edit`)}>
                            Edit
                          </Button>
                          <Button size="xs" radius="md" variant="light" color="red" aria-label={`Hapus ${item.nama}`}
                            onClick={() => setDeleteId(item.id)}>
                            <IconTrash size={16} />
                          </Button>
                        </Group>
                      </TableTd>
                    </TableTr>
                  ))}
                </TableTbody>
              </Table>
            </Box>

            <Stack gap="sm" hiddenFrom="md">
              {data.map((item) => (
                <Paper key={item.id} withBorder p="md" radius="md">
                  <Stack gap="xs">
                    <Box><Text fz="xs" c="dimmed">Nama</Text><Text fz="sm" fw={600}>{item.nama}</Text></Box>
                    <Box><Text fz="xs" c="dimmed">Urutan</Text><Text fz="sm">{item.urutan}</Text></Box>
                    <Box>
                      <Text fz="xs" c="dimmed">Status</Text>
                      <Badge color={item.isActive ? 'green' : 'red'}>{item.isActive ? 'Aktif' : 'Tidak Aktif'}</Badge>
                    </Box>
                    <Group gap="xs">
                      <Button size="xs" radius="md" variant="light" color="green" leftSection={<IconEdit size={16} />}
                        onClick={() => router.push(`${UNIT_USAHA_LIST_PATH}/${item.id}/edit`)}>
                        Edit
                      </Button>
                      <Button size="xs" radius="md" variant="light" color="red" leftSection={<IconTrash size={16} />}
                        onClick={() => setDeleteId(item.id)}>
                        Hapus
                      </Button>
                    </Group>
                  </Stack>
                </Paper>
              ))}
            </Stack>

            <Center mt="lg">
              <Pagination
                value={page}
                onChange={(next) => {
                  void reload(next);
                  window.scrollTo(0, 0);
                }}
                total={totalPages}
                withEdges
                radius="md"
              />
            </Center>
          </>
        )}
      </Paper>

      <ModalKonfirmasiHapus
        opened={deleteId !== null}
        loading={unit.delete.loading}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        text="Apakah Anda yakin ingin menghapus unit usaha ini?"
      />
    </Box>
  );
}

export default UnitUsahaBumdesAdmin;
