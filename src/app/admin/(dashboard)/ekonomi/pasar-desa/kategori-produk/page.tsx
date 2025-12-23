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
import { IconEdit, IconPlus, IconSearch, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import pasarDesaState from '../../../_state/ekonomi/pasar-desa/pasar-desa';

function KategoriProduk() {
  const [search2, setSearch2] = useState('');
  return (
    <Box>
      <HeaderSearch
        title='Kategori Produk'
        placeholder='Cari nama kategori produk...'
        searchIcon={<IconSearch size={20} />}
        value={search2}
        onChange={(e) => setSearch2(e.currentTarget.value)}
      />
      <ListKategoriProduk search2={search2} />
    </Box>
  );
}

function ListKategoriProduk({ search2 }: { search2: string }) {
  const statePasar = useProxy(pasarDesaState.kategoriProduk);
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const router = useRouter();
  const [debouncedSearch] = useDebouncedValue(search2, 1000);

  const { data, page, totalPages, loading, load } = statePasar.findMany;

  useShallowEffect(() => {
    load(page, 10, debouncedSearch);
  }, [page, debouncedSearch]);

  const handleHapus = () => {
    if (selectedId) {
      statePasar.delete.byId(selectedId);
      setModalHapus(false);
      setSelectedId(null);
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
        <Group justify="space-between" mb="md">
          <Title order={4} lh={1.2}>
            Daftar Kategori Produk
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() =>
              router.push('/admin/ekonomi/pasar-desa/kategori-produk/create')
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
                  <Text fz="sm" fw={600} lh={1.4}>
                    Nama Kategori
                  </Text>
                </TableTh>
                <TableTh style={{ width: '20%' }}>
                  <Text fz="sm" fw={600} lh={1.4} ta="center">
                    Edit
                  </Text>
                </TableTh>
                <TableTh style={{ width: '20%' }}>
                  <Text fz="sm" fw={600} lh={1.4} ta="center">
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
                    <TableTd>
                      <Center>
                        <Button
                          color="green"
                          variant="light"
                          onClick={() =>
                            router.push(
                              `/admin/ekonomi/pasar-desa/kategori-produk/${item.id}`
                            )
                          }
                        >
                          <IconEdit size={18} />
                        </Button>
                      </Center>
                    </TableTd>
                    <TableTd>
                      <Center>
                        <Button
                          color="red"
                          variant="light"
                          onClick={() => {
                            setSelectedId(item.id);
                            setModalHapus(true);
                          }}
                        >
                          <IconX size={18} />
                        </Button>
                      </Center>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={3}>
                    <Center py="xl">
                      <Text c="dimmed" fz="sm" lh={1.4}>
                        Tidak ada data kategori produk yang cocok
                      </Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>

        {/* Mobile Card */}
        <Box hiddenFrom="md">
          {filteredData.length > 0 ? (
            <Stack gap="sm">
              {filteredData.map((item) => (
                <Paper
                  key={item.id}
                  withBorder
                  p="md"
                  radius="md"
                  bg={colors['white-1']}
                >
                  <Box mb="xs">
                    <Text fz="sm" fw={600} lh={1.4}>
                      Nama Kategori
                    </Text>
                    <Text fz="sm" fw={500} lh={1.4}>
                      {item.nama}
                    </Text>
                  </Box>
                  <Group justify="flex-end" mt="md">
                    <Button
                      color="green"
                      variant="light"
                      onClick={() =>
                        router.push(
                          `/admin/ekonomi/pasar-desa/kategori-produk/${item.id}`
                        )
                      }
                    >
                      <IconEdit size={18} />
                    </Button>
                    <Button
                      color="red"
                      variant="light"
                      onClick={() => {
                        setSelectedId(item.id);
                        setModalHapus(true);
                      }}
                    >
                      <IconX size={18} />
                    </Button>
                  </Group>
                </Paper>
              ))}
            </Stack>
          ) : (
            <Center py="xl">
              <Text c="dimmed" fz="sm" lh={1.4}>
                Tidak ada data kategori produk yang cocok
              </Text>
            </Center>
          )}
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
        text='Apakah anda yakin ingin menghapus kategori produk ini?'
      />
    </Box>
  );
}

export default KategoriProduk;