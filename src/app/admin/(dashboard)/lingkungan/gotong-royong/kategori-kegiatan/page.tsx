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
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconEdit, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import gotongRoyongState from '../../../_state/lingkungan/gotong-royong';

function KategoriKegiatan() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Kategori Kegiatan'
        placeholder='Cari kategori kegiatan...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListKategoriKegiatan search={search} />
    </Box>
  );
}

function ListKategoriKegiatan({ search }: { search: string }) {
  const stateKategori = useProxy(gotongRoyongState.kategoriKegiatan);
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const router = useRouter();
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = stateKategori.findMany;

  const handleHapus = () => {
    if (selectedId) {
      stateKategori.delete.byId(selectedId);
      setModalHapus(false);
      setSelectedId(null);
    }
  };

  useShallowEffect(() => {
    load(page, 10, debouncedSearch);
  }, [page, debouncedSearch]);

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
        <Group justify="space-between" mb="md">
          <Title order={4} lh={1.2}>
            Daftar Kategori Kegiatan
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() =>
              router.push('/admin/lingkungan/gotong-royong/kategori-kegiatan/create')
            }
          >
            Tambah Baru
          </Button>
        </Group>

        {/* Desktop Table */}
        <Box visibleFrom="md">
          <Table
            highlightOnHover
            miw={0}
            style={{
              tableLayout: 'fixed',
              width: '100%',
            }}
          >
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '60%' }}>
                  <Text fz="sm" fw={600} lh={1.2} ta="left">
                    Nama Kategori
                  </Text>
                </TableTh>
                <TableTh style={{ width: '20%' }}>
                  <Text fz="sm" fw={600} lh={1.2} ta="center">
                    Edit
                  </Text>
                </TableTh>
                <TableTh style={{ width: '20%' }}>
                  <Text fz="sm" fw={600} lh={1.2} ta="center">
                    Delete
                  </Text>
                </TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fz="md" fw={500} lh={1.5} truncate="end">
                        {item.nama}
                      </Text>
                    </TableTd>
                    <TableTd ta="center">
                      <Button
                        size="xs"
                        radius="md"
                        variant="light"
                        color="green"
                        leftSection={<IconEdit size={16} />}
                        onClick={() =>
                          router.push(
                            `/admin/lingkungan/gotong-royong/kategori-kegiatan/${item.id}`
                          )
                        }
                      >
                        Edit
                      </Button>
                    </TableTd>
                    <TableTd ta="center">
                      <Button
                        size="xs"
                        radius="md"
                        variant="light"
                        color="red"
                        leftSection={<IconTrash size={16} />}
                        onClick={() => {
                          setSelectedId(item.id);
                          setModalHapus(true);
                        }}
                      >
                        Hapus
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={3}>
                    <Center py="xl">
                      <Text c="dimmed" fz="sm" lh={1.4}>
                        Tidak ada kategori kegiatan yang cocok
                      </Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>

        {/* Mobile Cards */}
        <Box hiddenFrom="md">
          <Stack gap="sm">
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <Paper key={item.id} withBorder p="md" radius="md">
                  <Stack gap={"xs"}>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>
                        Nama Kategori
                      </Text>
                      <Text fz="sm" fw={500} lh={1.45}>
                        {item.nama}
                      </Text>
                    </Box>
                    <Group justify="flex-end" mt="xs">
                      <Button
                        size="xs"
                        radius="md"
                        variant="light"
                        color="green"
                        leftSection={<IconEdit size={16} />}
                        onClick={() =>
                          router.push(
                            `/admin/lingkungan/gotong-royong/kategori-kegiatan/${item.id}`
                          )
                        }
                      >
                        Edit
                      </Button>
                      <Button
                        size="xs"
                        radius="md"
                        variant="light"
                        color="red"
                        leftSection={<IconTrash size={16} />}
                        onClick={() => {
                          setSelectedId(item.id);
                          setModalHapus(true);
                        }}
                      >
                        Hapus
                      </Button>
                    </Group>
                  </Stack>
                </Paper>
              ))
            ) : (
              <Center py="xl">
                <Text c="dimmed" fz="sm" lh={1.4}>
                  Tidak ada kategori kegiatan yang cocok
                </Text>
              </Center>
            )}
          </Stack>
        </Box>
      </Paper>

      <Center>
        <Pagination
          value={page}
          onChange={(newPage) => {
            load(newPage, 10);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          total={totalPages}
          mt="md"
          mb="md"
          color="blue"
          radius="md"
        />
      </Center>

      {/* Modal Konfirmasi Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text='Apakah anda yakin ingin menghapus kategori kegiatan ini?'
      />
    </Box>
  );
}

export default KategoriKegiatan;