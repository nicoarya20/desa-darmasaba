/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import {
  Box,
  Button,
  Center,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Text,
  Title,
} from '@mantine/core';
import { IconEdit, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import stateDesaPengumuman from '../../../_state/desa/pengumuman';
import { useDebouncedValue } from '@mantine/hooks';

function KategoriPengumuman() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title='Kategori Pengumuman'
        placeholder='Cari nama kategori...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListKategoriPengumuman search={search} />
    </Box>
  );
}

function ListKategoriPengumuman({ search }: { search: string }) {
  const listDataState = useProxy(stateDesaPengumuman.category);
  const router = useRouter();
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [debouncedSearch] = useDebouncedValue(search, 500);
  const { data, page, totalPages, loading, load } = listDataState.findMany;

  useEffect(() => {
    load(page, 10, debouncedSearch);
  }, [page, debouncedSearch]);

  const handleDelete = () => {
    if (selectedId) {
      listDataState.delete.delete(selectedId);
      setModalHapus(false);
      setSelectedId(null);
      load(page, 10, search);
    }
  };

  const filteredData = data || [];

  if (loading || !data) {
    return (
      <Stack py={{ base: 'md', md: 'lg' }}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py={{ base: 'md', md: 'lg' }}>
      <Paper withBorder bg={colors['white-1']} p={{ base: 'md', md: 'lg' }} shadow="md" radius="md">
        <Stack gap={'lg'}>
          <Box
            visibleFrom="md"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Title order={4} lh={1.1}>
              List Kategori Pengumuman
            </Title>
            <Button
              leftSection={<IconPlus size={18} />}
              color="blue"
              variant="light"
              onClick={() =>
                router.push('/admin/desa/pengumuman/kategori-pengumuman/create')
              }
            >
              Tambah Baru
            </Button>
          </Box>

          <Box hiddenFrom="md">
            <Stack gap="xs">
              <Title order={2} size="md" lh={1.1} ta="left">
                List Kategori Pengumuman
              </Title>
              <Button
                leftSection={<IconPlus size={18} />}
                color="blue"
                variant="light"
                onClick={() =>
                  router.push('/admin/desa/pengumuman/kategori-pengumuman/create')
                }
                fullWidth
              >
                Tambah Baru
              </Button>
            </Stack>
          </Box>

          <Box visibleFrom="md">
            <Table highlightOnHover striped withRowBorders>
              <TableThead>
                <TableTr>
                  <TableTh w="60%">
                    <Text fz="sm" fw={600} lh={1.4}>
                      Nama
                    </Text>
                  </TableTh>
                  <TableTh w="15%">
                    <Text fz="sm" fw={600} lh={1.4}>
                      Edit
                    </Text>
                  </TableTh>
                  <TableTh w="15%">
                    <Text fz="sm" fw={600} lh={1.4}>
                      Hapus
                    </Text>
                  </TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <TableTr key={item.id}>
                      <TableTd>
                        <Text fz="md" fw={500} lh={1.5} truncate>
                          {item.name}
                        </Text>
                      </TableTd>
                      <TableTd>
                        <Button
                          variant="light"
                          color="green"
                          onClick={() =>
                            router.push(
                              `/admin/desa/pengumuman/kategori-pengumuman/${item.id}`
                            )
                          }
                          size="compact-sm"
                        >
                          <IconEdit size={16} />
                        </Button>
                      </TableTd>
                      <TableTd>
                        <Button
                          variant="light"
                          color="red"
                          disabled={listDataState.delete.loading}
                          onClick={() => {
                            setSelectedId(item.id);
                            setModalHapus(true);
                          }}
                          size="compact-sm"
                        >
                          <IconTrash size={16} />
                        </Button>
                      </TableTd>
                    </TableTr>
                  ))
                ) : (
                  <TableTr>
                    <TableTd colSpan={4}>
                      <Center py={24}>
                        <Text c="dimmed" fz="sm" lh={1.4}>
                          Tidak ada data kategori pengumuman yang cocok
                        </Text>
                      </Center>
                    </TableTd>
                  </TableTr>
                )}
              </TableTbody>
            </Table>
          </Box>

          <Stack hiddenFrom="md" gap="sm">
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <Paper
                  key={item.id}
                  withBorder
                  p="md"
                  radius="md"
                  bg={colors['white-1']}
                >
                  <Stack gap="xs">
                    <Box>
                      <Text fz="xs" fw={600} lh={1.4}>
                        Nama
                      </Text>
                      <Text fz="sm" fw={500} lh={1.4}>
                        {item.name}
                      </Text>
                    </Box>
                    <Box
                      style={{
                        display: 'flex',
                        gap: 8,
                        justifyContent: 'flex-end',
                      }}
                    >
                      <Button
                        variant="light"
                        color="green"
                        onClick={() =>
                          router.push(
                            `/admin/desa/pengumuman/kategori-pengumuman/${item.id}`
                          )
                        }
                        size="compact-xs"
                      >
                        <IconEdit size={14} />
                      </Button>
                      <Button
                        variant="light"
                        color="red"
                        disabled={listDataState.delete.loading}
                        onClick={() => {
                          setSelectedId(item.id);
                          setModalHapus(true);
                        }}
                        size="compact-xs"
                      >
                        <IconTrash size={14} />
                      </Button>
                    </Box>
                  </Stack>
                </Paper>
              ))
            ) : (
              <Paper withBorder p="xl" radius="md" bg={colors['white-1']}>
                <Center>
                  <Text c="dimmed" fz="sm" lh={1.4}>
                    Tidak ada data kategori pengumuman yang cocok
                  </Text>
                </Center>
              </Paper>
            )}
          </Stack>
        </Stack>
      </Paper>

      <Center mt="md">
        <Pagination
          value={page}
          onChange={(newPage) => load(newPage, 10, search)}
          total={totalPages}
          color="blue"
          radius="md"
        />
      </Center>

      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleDelete}
        text='Apakah anda yakin ingin menghapus kategori Pengumuman ini?'
      />
    </Box>
  );
}

export default KategoriPengumuman;