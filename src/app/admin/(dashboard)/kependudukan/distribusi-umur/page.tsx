/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import colors from '@/con/colors';
import {
  Box,
  Button,
  Center,
  Flex,
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
import { YearFilter } from '../_components/YearFilter';
import HeaderSearch from '../../_com/header';
import { ModalKonfirmasiHapus } from '../../_com/modalKonfirmasiHapus';
import distribusiUmur from '../../_state/kependudukan/distribusi-umur';

function DistribusiUmurAdmin() {
  const [search, setSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  return (
    <Box>
      <HeaderSearch
        title='Distribusi Umur'
        placeholder='Cari rentang umur...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.currentTarget.value)}
      />
      <Box mt="md">
        <YearFilter value={selectedYear} onChange={(year) => {
          setSelectedYear(year);
          distribusiUmur.findMany.page = 1;
        }} />
      </Box>
      <ListDistribusiUmur search={search} year={selectedYear} />
    </Box>
  );
}

function ListDistribusiUmur({ search, year }: { search: string; year?: number }) {
  type DistribusiUmurType = {
    id: string;
    rentangUmur: string;
    jumlah: number;
    tahun: number;
  };

  const router = useRouter();
  const stateDistribusiUmur = useProxy(distribusiUmur);
  const [modalHapus, setModalHapus] = useState(false);
  const [debouncedSearch] = useDebouncedValue(search, 1000);
  const [selectedId, setSelectedId] = useState<string | null>(null);


  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = stateDistribusiUmur.findMany;

  const handleDelete = () => {
    if (selectedId) {
      stateDistribusiUmur.delete.byId(selectedId);
      setModalHapus(false);
      setSelectedId(null);
    }
  };

  useShallowEffect(() => {
    load(page, 10, debouncedSearch, year);
  }, [page, debouncedSearch, year]);

  const filteredData = data || [];

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py={{ base: 'sm', md: 'md' }}>
      <Paper withBorder bg={colors['white-1']} p={{ base: 'md', md: 'lg' }} shadow="md" radius="md">
        <Group justify="space-between" mb={{ base: 'sm', md: 'md' }}>
          <Title order={4} lh={{ base: 1.2, md: 1.15 }}>
            List Distribusi Umur
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() => router.push('/admin/kependudukan/distribusi-umur/create')}
            fz={{ base: 'sm', md: 'md' }}
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
                <TableTh style={{ width: '40%' }}>Rentang Umur</TableTh>
                <TableTh style={{ width: '20%' }}>Jumlah</TableTh>
                <TableTh style={{ width: '20%' }}>Tahun</TableTh>
                <TableTh style={{ width: '10%' }}>Edit</TableTh>
                <TableTh style={{ width: '10%' }}>Hapus</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item: DistribusiUmurType) => (
                  <TableTr key={item.id}>
                    <TableTd>{item.rentangUmur}</TableTd>
                    <TableTd>{item.jumlah.toLocaleString('id-ID')}</TableTd>
                    <TableTd>{item.tahun}</TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="green"
                        onClick={() =>
                          router.push(`/admin/kependudukan/distribusi-umur/${item.id}`)
                        }
                        fz="sm"
                        px="xs"
                        py="xs"
                      >
                        <IconEdit size={16} />
                      </Button>
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="red"
                        disabled={stateDistribusiUmur.delete.loading}
                        onClick={() => {
                          setSelectedId(item.id);
                          setModalHapus(true);
                        }}
                        fz="sm"
                        px="xs"
                        py="xs"
                      >
                        <IconTrash size={16} />
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={5}>
                    <Center py={20}>
                      <Text c="dimmed" fz="sm" lh={1.4}>
                        Tidak ada data distribusi umur yang cocok
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
          <Stack gap="xs">
            {filteredData.length > 0 ? (
              filteredData.map((item: DistribusiUmurType) => (
                <Paper key={item.id} withBorder p="sm" radius="sm">
                  <Stack gap={"xs"}>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>
                        Rentang Umur
                      </Text>
                      <Text fz="sm" fw={500} lh={1.4}>
                        {item.rentangUmur}
                      </Text>
                    </Box>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>
                        Jumlah
                      </Text>
                      <Text fz="sm" fw={500} lh={1.4}>
                        {item.jumlah.toLocaleString('id-ID')}
                      </Text>
                    </Box>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>
                        Tahun
                      </Text>
                      <Text fz="sm" fw={500} lh={1.4}>
                        {item.tahun}
                      </Text>
                    </Box>
                    <Group justify="flex-end" gap="xs">
                      <Button
                        variant="light"
                        color="green"
                        onClick={() =>
                          router.push(`/admin/kependudukan/distribusi-umur/${item.id}`)
                        }
                        fz="xs"
                        px="xs"
                        py="xs"
                      >
                        <IconEdit size={14} />
                      </Button>
                      <Button
                        variant="light"
                        color="red"
                        disabled={stateDistribusiUmur.delete.loading}
                        onClick={() => {
                          setSelectedId(item.id);
                          setModalHapus(true);
                        }}
                        fz="xs"
                        px="xs"
                        py="xs"
                      >
                        <IconTrash size={14} />
                      </Button>
                    </Group>
                  </Stack>
                </Paper>
              ))
            ) : (
              <Center py={20}>
                <Text c="dimmed" fz="sm" lh={1.4}>
                  Tidak ada data distribusi umur yang cocok
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
        onConfirm={handleDelete}
        text="Apakah anda yakin ingin menghapus data distribusi umur ini?"
      />
    </Box>
  );
}

export default DistribusiUmurAdmin;
