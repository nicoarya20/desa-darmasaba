/* eslint-disable react-hooks/exhaustive-deps */
'use client'
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
  Title
} from '@mantine/core';
import { IconEdit, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import stateDashboardBerita from '../../../_state/desa/berita';
import { useDebouncedValue } from '@mantine/hooks';

function KategoriBerita() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title="Kategori Berita"
        placeholder="Cari nama kategori berita..."
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListKategoriBerita search={search} />
    </Box>
  );
}

function ListKategoriBerita({ search }: { search: string }) {
  const listDataState = useProxy(stateDashboardBerita.kategoriBerita);
  const router = useRouter();
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  const {
    data,
    loading,
    load,
    page,
    totalPages,
  } = listDataState.findMany;

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
      <Stack py={10}>
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py={{ base: 'sm', md: 'lg' }}>
      <Paper withBorder bg={colors['white-1']} p={{ base: 'md', md: 'lg' }} shadow="md" radius="md">
        <Group justify="space-between" mb={{ base: 'md', md: 'lg' }}>
          <Title order={4} lh={1.2}>
            Daftar Kategori Berita
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() =>
              router.push('/admin/pemerintahan/berita/kategori-berita/create')
            }
          >
            Tambah Baru
          </Button>
        </Group>

        {/* Desktop Table */}
       <Box visibleFrom="md" style={{ overflowX: 'auto' }}>
         <Table highlightOnHover
    layout="fixed" // 🔥 PENTING
    withColumnBorders={false} miw={0}>
            <TableThead>
              <TableTr>
                <TableTh w="50%">
                  <Text fz="sm" fw={600} lh={1.4}>Kategori</Text>
                </TableTh>
                <TableTh w="20%">
                  <Text fz="sm" fw={600} lh={1.4} ta="center">Edit</Text>
                </TableTh>
                <TableTh w="20%">
                  <Text fz="sm" fw={600} lh={1.4} ta="center">Hapus</Text>
                </TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fz="sm" fw={500} lh={1.45} truncate="end">
                        {item.name}
                      </Text>
                    </TableTd>
                    <TableTd ta="center">
                      <Button
                        variant="light"
                        color="green"
                        onClick={() =>
                          router.push(
                            `/admin/pemerintahan/berita/kategori-berita/${item.id}`
                          )
                        }
                        size="compact-sm"
                      >
                        <IconEdit size={16} />
                      </Button>
                    </TableTd>
                    <TableTd ta="center">
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
                  <TableTd colSpan={3}>  {/* ✅ Match column count (3 columns) */}
                    <Center py={24}>
                      <Text c="dimmed" fz="sm" lh={1.4}>
                        Tidak ada data kategori berita yang cocok
                      </Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>

        {/* Mobile Cards */}
        <Stack hiddenFrom="md" gap="xs" mt="md">
          {filteredData.length > 0 ? (  
            filteredData.map((item) => (
              <Paper key={item.id} withBorder radius="md" p="sm" bg="white">
                  <Box flex={1} ml="md">
                    <Text fz="sm" fw={600} lh={1.4}>Kategori</Text>
                    <Text fz="sm" fw={500} lh={1.45} truncate>
                      {item.name}
                    </Text>
                  </Box>
                <Group mt="sm" justify="flex-end" gap="xs">
                  <Button
                    variant="light"
                    color="green"
                    size="compact-xs"
                    onClick={() =>
                      router.push(
                        `/admin/pemerintahan/berita/kategori-berita/${item.id}`
                      )
                    }
                  >
                    <IconEdit size={14} />
                  </Button>
                  <Button
                    variant="light"
                    color="red"
                    size="compact-xs"
                    disabled={listDataState.delete.loading}
                    onClick={() => {
                      setSelectedId(item.id);
                      setModalHapus(true);
                    }}
                  >
                    <IconTrash size={14} />
                  </Button>
                </Group>
              </Paper>
            ))
          ) : (
            <Center py={32}>
              <Text c="dimmed" fz="sm" lh={1.4}>
                Tidak ada data kategori berita yang cocok
              </Text>
            </Center>
          )}
        </Stack>
      </Paper>

        <Center mt={{ base: 'lg', md: 'xl' }}>
          <Pagination
            value={page}
            onChange={(newPage) => {
              load(newPage, 10, search);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            total={totalPages}
            color="blue"
            radius="md"
          />
        </Center>

      {/* Modal Konfirmasi Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleDelete}
        text="Apakah anda yakin ingin menghapus kategori berita ini?"
      />
    </Box>
  );
}

export default KategoriBerita;