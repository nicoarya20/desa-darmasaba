'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Group, Pagination, Paper, Skeleton, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title } from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';

import HeaderSearch from '@/app/admin/(dashboard)/_com/header';
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import fasilitasKesehatanState from '@/app/admin/(dashboard)/_state/kesehatan/data_kesehatan_warga/fasilitasKesehatan';
import { useState } from 'react';

function TarifLayanan() {
  const [search, setSearch] = useState("");
  const router = useRouter();
  return (
    <Box>
      <Box mb="sm">
        <Button variant="subtle" onClick={() => router.push('/admin/kesehatan/data-kesehatan-warga/fasilitas_kesehatan')}>
          <IconArrowBack color={colors['blue-button']} size={25} />
        </Button>
      </Box>
      <HeaderSearch
        title='Tarif dan Layanan'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListTarifLayanan search={search} />
    </Box>
  );
}

function ListTarifLayanan({ search }: { search: string }) {
  const stateFasilitasKesehatan = useProxy(fasilitasKesehatanState.tarif);
  const router = useRouter();
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  const {
    data,
    loading,
    load,
    page,
    totalPages
  } = stateFasilitasKesehatan.findMany;

  useShallowEffect(() => {
    load(page, 10, debouncedSearch);
  }, [page, debouncedSearch]);

  const handleDelete = () => {
    if (selectedId) {
      stateFasilitasKesehatan.delete.byId(selectedId);
      setModalHapus(false);
      setSelectedId(null);
      load(page, 10, debouncedSearch);
    }
  };

  const filteredData = data || [];

  if (loading || !data) {
    return (
      <Box py="lg">
        <Skeleton h={500} />
      </Box>
    );
  }

  return (
    <Box py="lg">
      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
        {/* Judul + Tombol Tambah */}
        <Group justify="space-between" mb="md">
          <Title order={4} lh={1.2}>
            Daftar Tarif dan Layanan
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() =>
              router.push(
                '/admin/kesehatan/data-kesehatan-warga/fasilitas_kesehatan/tarif-layanan/create'
              )
            }
          >
            Tambah Baru
          </Button>
        </Group>

        {/* Desktop Table */}
       <Box visibleFrom="md" style={{ overflowX: 'auto' }}>
         <Table highlightOnHover
    layout="fixed" // 🔥 PENTING
    withColumnBorders={false}>
            <TableThead>
              <TableTr>
                <TableTh>
                  <Text fz="sm" fw={600} lh={1.4} ta="left">
                    Layanan
                  </Text>
                </TableTh>
                <TableTh>
                  <Text fz="sm" fw={600} lh={1.4} ta="left">
                    Tarif
                  </Text>
                </TableTh>
                <TableTh>
                  <Text fz="sm" fw={600} lh={1.4} ta="center">
                    Edit
                  </Text>
                </TableTh>
                <TableTh>
                  <Text fz="sm" fw={600} lh={1.4} ta="center">
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
                      <Text fz="md" fw={500} lh={1.5} truncate="end" lineClamp={1}>
                        {item.layanan || '-'}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="md" fw={500} lh={1.5} truncate="end" lineClamp={1}>
                        {item.tarif}
                      </Text>
                    </TableTd>
                    <TableTd ta="center">
                      <Button
                        variant="light"
                        color="green"
                        onClick={() =>
                          router.push(
                            `/admin/kesehatan/data-kesehatan-warga/fasilitas_kesehatan/tarif-layanan/${item.id}`
                          )
                        }
                        size="compact-sm"
                      >
                        <IconEdit size={18} />
                      </Button>
                    </TableTd>
                    <TableTd ta="center">
                      <Button
                        variant="light"
                        color="red"
                        disabled={stateFasilitasKesehatan.delete.loading}
                        onClick={() => {
                          setSelectedId(item.id);
                          setModalHapus(true);
                        }}
                        size="compact-sm"
                      >
                        <IconTrash size={18} />
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={4}>
                    <Center py="lg">
                      <Text c="dimmed" fz="sm" lh={1.4}>
                        Tidak ada fasilitas kesehatan yang cocok
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
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <Paper key={item.id} withBorder p="md" mb="xs" radius="sm">
                <Box mb="xs">
                  <Text fz="sm" fw={600} lh={1.4}>
                    Layanan
                  </Text>
                  <Text fz="sm" fw={500} lh={1.4}>
                    {item.layanan || '-'}
                  </Text>
                </Box>
                <Box mb="md">
                  <Text fz="sm" fw={600} lh={1.4}>
                    Tarif
                  </Text>
                  <Text fz="sm" fw={500} lh={1.4}>
                    {item.tarif}
                  </Text>
                </Box>
                <Group justify="center" gap="xs">
                  <Button
                    variant="light"
                    color="green"
                    size="compact-xs"
                    onClick={() =>
                      router.push(
                        `/admin/kesehatan/data-kesehatan-warga/fasilitas_kesehatan/tarif-layanan/${item.id}`
                      )
                    }
                  >
                    <IconEdit size={16} />
                  </Button>
                  <Button
                    variant="light"
                    color="red"
                    size="compact-xs"
                    disabled={stateFasilitasKesehatan.delete.loading}
                    onClick={() => {
                      setSelectedId(item.id);
                      setModalHapus(true);
                    }}
                  >
                    <IconTrash size={16} />
                  </Button>
                </Group>
              </Paper>
            ))
          ) : (
            <Center py="lg">
              <Text c="dimmed" fz="sm" lh={1.4}>
                Tidak ada fasilitas kesehatan yang cocok
              </Text>
            </Center>
          )}
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
          mt="md"
          mb="md"
          color="blue"
          radius="md"
        />
      </Center>

      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleDelete}
        text="Apakah anda yakin ingin menghapus tarif layanan ini?"
      />
    </Box>
  );
}

export default TarifLayanan;