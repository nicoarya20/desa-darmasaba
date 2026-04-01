/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Center,
  Group,
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
import potensiDesaState from '../../../_state/desa/potensi';
import { useDebouncedValue } from '@mantine/hooks';

function KategoriPotensi() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title='Kategori Potensi'
        placeholder='Cari nama kategori...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListKategoriPotensi search={search} />
    </Box>
  );
}

function ListKategoriPotensi({ search }: { search: string }) {
  const listDataState = useProxy(potensiDesaState.kategoriPotensi);
  const router = useRouter();
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data, page, totalPages, loading, load } = listDataState.findMany;
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  useEffect(() => {
    load(1, 10, debouncedSearch);
  }, [debouncedSearch]);

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
      <Stack py="md">
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py="md">
      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
        <Stack gap="xl">
          <Group justify="space-between" align="center">
            <Title order={4} lh={1.2}>
              List Kategori Potensi
            </Title>
            <Button
              leftSection={<IconPlus size={18} />}
              color="blue"
              variant="light"
              onClick={() =>
                router.push('/admin/desa/potensi/kategori-potensi/create')
              }
            >
              Tambah Baru
            </Button>
          </Group>

          {/* Desktop Table */}
         <Box visibleFrom="md" style={{ overflowX: 'auto' }}>
           <Table highlightOnHover
    layout="fixed" // 🔥 PENTING
    withColumnBorders={false} striped withRowBorders miw={700}>
              <TableThead>
                <TableTr>
                  <TableTh w="60%">
                    <Text fz="xs" fw={600} lh={1.4} c="black">
                      Nama
                    </Text>
                  </TableTh>
                  <TableTh w="15%">
                    <Text fz="xs" fw={600} lh={1.4} c="black">
                      Edit
                    </Text>
                  </TableTh>
                  <TableTh w="15%">
                    <Text fz="xs" fw={600} lh={1.4} c="black">
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
                        <Text fz="sm" lh={1.5} truncate>
                          {item.nama}
                        </Text>
                      </TableTd>
                      <TableTd>
                        <Button
                          variant="light"
                          color="green"
                          onClick={() =>
                            router.push(
                              `/admin/desa/potensi/kategori-potensi/${item.id}`
                            )
                          }
                        >
                          <IconEdit size={20} />
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
                        >
                          <IconTrash size={20} />
                        </Button>
                      </TableTd>
                    </TableTr>
                  ))
                ) : (
                  <TableTr>
                    <TableTd colSpan={4}>
                      <Center py="lg">
                        <Text c="dimmed" fz="sm" lh={1.5}>
                          Tidak ada data kategori potensi yang cocok
                        </Text>
                      </Center>
                    </TableTd>
                  </TableTr>
                )}
              </TableTbody>
            </Table>
          </Box>

          {/* Mobile Cards */}
          <Stack gap="sm" hiddenFrom="md">
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <Paper key={item.id} withBorder p="sm" radius="md">
                  <Stack gap={'xs'}>
                    <Box>
                      <Text fz="xs" fw={600} lh={1.4}>
                        No
                      </Text>
                      <Text fz="sm" lh={1.5}>
                        {(page - 1) * 10 + index + 1}
                      </Text>
                    </Box>
                    <Box>
                      <Text fz="xs" fw={600} lh={1.4}>
                        Nama
                      </Text>
                      <Text fz="sm" lh={1.5}>
                        {item.nama}
                      </Text>
                    </Box>
                    <Group justify="flex-end" mt="xs">
                      <Button
                        variant="light"
                        color="green"
                        size="xs"
                        onClick={() =>
                          router.push(
                            `/admin/desa/potensi/kategori-potensi/${item.id}`
                          )
                        }
                      >
                        <IconEdit size={16} />
                      </Button>
                      <Button
                        variant="light"
                        color="red"
                        size="xs"
                        disabled={listDataState.delete.loading}
                        onClick={() => {
                          setSelectedId(item.id);
                          setModalHapus(true);
                        }}
                      >
                        <IconTrash size={16} />
                      </Button>
                    </Group>
                  </Stack>
                </Paper>
              ))
            ) : (
              <Center py="lg">
                <Text c="dimmed" fz="sm" lh={1.5}>
                  Tidak ada data kategori potensi yang cocok
                </Text>
              </Center>
            )}
          </Stack>
        </Stack>
      </Paper>

      <Center mt="xl">
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
        text='Apakah anda yakin ingin menghapus kategori Potensi ini?'
      />
    </Box>
  );
}

export default KategoriPotensi;