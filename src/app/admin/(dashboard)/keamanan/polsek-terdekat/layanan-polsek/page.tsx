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
  Title,
} from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconEdit, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import statePolsekTerdekat from '../../../_state/keamanan/polsek-terdekat';


function LayananPolsek() {
  const [search, setSearch] = useState("");

  return (
    <Box>
      <HeaderSearch
        title='Layanan Polsek'
        placeholder='Cari layanan polsek...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />

      <ListLayananPolsek search={search} />
    </Box>
  );
}

function ListLayananPolsek({ search }: { search: string }) {
  const layananState = useProxy(statePolsekTerdekat.layananPolsek);
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
  } = layananState.findMany;

  useShallowEffect(() => {
    load(page, 10, debouncedSearch);
  }, [page, debouncedSearch]);

  const handleDelete = () => {
    if (selectedId) {
      layananState.delete.delete(selectedId);
      setModalHapus(false);
      setSelectedId(null);
      load(page, 10, search);
    }
  };

  const filteredData = data || [];

  if (loading || !data) {
    return (
      <Stack py={{ base: 'sm', md: 'lg' }}>
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py={{ base: 'sm', md: 'lg' }}>
      <Paper withBorder bg={colors['white-1']} p={{ base: 'md', md: 'lg' }} shadow="md" radius="md">
        <Group justify="space-between" mb={{ base: 'md', md: 'lg' }}>
          <Title order={4} lh={{ base: 1.2, md: 1.2 }}>
            Daftar Layanan Polsek
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() => router.push('/admin/keamanan/polsek-terdekat/layanan-polsek/create')}
          >
            Tambah Baru
          </Button>
        </Group>

        {/* Desktop Table */}
        <Box visibleFrom="md" style={{ overflowX: 'auto' }}>
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
                <TableTh style={{ width: '25%' }}>
                  <Text fz="sm" fw={600} lh={1.4}>
                    Nama Layanan Polsek
                  </Text>
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
                      <Text fz="md" fw={500} lh={1.5} truncate="end">
                        {item.nama}
                      </Text>
                    </TableTd>
                    <TableTd ta="center">
                      <Button
                        variant="light"
                        color="green"
                        onClick={() =>
                          router.push(
                            `/admin/keamanan/polsek-terdekat/layanan-polsek/${item.id}`
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
                        disabled={layananState.delete.loading}
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
                        Tidak ada data Polsek yang cocok
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
                <Paper key={item.id} withBorder p="sm" radius="sm">
                  <Stack gap={"xs"}>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>
                        Nama Layanan Polsek
                      </Text>
                      <Text fz="sm" fw={500} lh={1.45}>
                        {item.nama}
                      </Text>
                    </Box>
                    <Group mt="sm" justify="flex-end" gap="xs">
                      <Button
                        variant="light"
                        color="green"
                        size="compact-xs"
                        onClick={() =>
                          router.push(
                            `/admin/keamanan/polsek-terdekat/layanan-polsek/${item.id}`
                          )
                        }
                      >
                        <IconEdit size={14} />
                      </Button>
                      <Button
                        variant="light"
                        color="red"
                        size="compact-xs"
                        disabled={layananState.delete.loading}
                        onClick={() => {
                          setSelectedId(item.id);
                          setModalHapus(true);
                        }}
                      >
                        <IconTrash size={14} />
                      </Button>
                    </Group>
                  </Stack>
                </Paper>
              ))
            ) : (
              <Center py={24}>
                <Text c="dimmed" fz="sm" lh={1.4}>
                  Tidak ada data Layanan Polsek yang cocok
                </Text>
              </Center>
            )}
          </Stack>
        </Box>
      </Paper>

      {/* Pagination */}
      <Center>
        <Pagination
          value={page}
          onChange={(newPage) => {
            load(newPage, 10, search);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          total={totalPages}
          mt={{ base: 'lg', md: 'xl' }}
          mb={{ base: 'lg', md: 'xl' }}
          color="blue"
          radius="md"
        />
      </Center>

      {/* Modal Konfirmasi Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleDelete}
        text="Apakah anda yakin ingin menghapus layanan polsek ini?"
      />
    </Box>
  );
}

export default LayananPolsek;