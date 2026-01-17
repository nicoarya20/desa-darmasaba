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
import PendapatanAsliDesa from '../../../_state/ekonomi/PADesa';

function Belanja() {
  const [search, setSearch] = useState("");
  return (
    <Stack gap="xl">
      <HeaderSearch
        title="Belanja"
        placeholder="Cari belanja berdasarkan nama atau nilai..."
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListBelanja search={search} />
    </Stack>
  );
}

function ListBelanja({ search }: { search: string }) {
  const belanjaState = useProxy(PendapatanAsliDesa.belanja);
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
  } = belanjaState.findMany;

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);

  const totalBelanja = data?.reduce((sum, item) => sum + item.value, 0) || 0;

  const handleDelete = () => {
    if (selectedId) {
      belanjaState.delete.byId(selectedId);
      setModalHapus(false);
      setSelectedId(null);
      load(page, 10, debouncedSearch);
    }
  };

  useShallowEffect(() => {
    load(page, 10, debouncedSearch);
  }, [page, debouncedSearch]);

  const filteredData = data || [];

  if (loading || !data) {
    return (
      <Stack py="md">
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  return (
    <Stack gap="xl">
      {/* Desktop Table */}
      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title
            order={4}
            lh={{ base: 1.2, md: 1.1 }}
          >
            Daftar Belanja
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() =>
              router.push('/admin/ekonomi/PADesa-pendapatan-asli-desa/belanja/create')
            }
          >
            Tambah Baru
          </Button>
        </Group>

       <Box visibleFrom="md" style={{ overflowX: 'auto' }}>
          <Table
            highlightOnHover
            miw={0}
            striped
            withTableBorder
            withRowBorders
            style={{
              tableLayout: 'fixed',
              width: '100%',
            }}
          >
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '40%' }}>
                  <Text fz="sm" fw={600} lh={1.4}>Nama</Text>
                </TableTh>
                <TableTh style={{ width: '25%' }}>
                  <Text fz="sm" fw={600} lh={1.4}>Nilai</Text>
                </TableTh>
                <TableTh style={{ width: '15%' }}>
                  <Text fz="sm" fw={600} lh={1.4}>Edit</Text>
                </TableTh>
                <TableTh style={{ width: '20%' }}>
                  <Text fz="sm" fw={600} lh={1.4}>Delete</Text>
                </TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                <>
                  {filteredData.map((item) => (
                    <TableTr key={item.id}>
                      <TableTd>
                        <Text fz="md" fw={500} lh={1.45} truncate="end" lineClamp={1}>
                          {item.name}
                        </Text>
                      </TableTd>
                      <TableTd>
                        <Text fz="md" lh={1.45}>{formatRupiah(item.value)}</Text>
                      </TableTd>
                      <TableTd>
                        <Text fz="md" lh={1.45}>
                          {totalBelanja > 0
                            ? ((item.value / totalBelanja) * 100).toFixed(0) + '%'
                            : '0%'}
                        </Text>
                      </TableTd>
                      <TableTd>
                        <Group gap="xs">
                          <Button
                            size="xs"
                            variant="light"
                            color="green"
                            onClick={() =>
                              router.push(
                                `/admin/ekonomi/PADesa-pendapatan-asli-desa/belanja/${item.id}`
                              )
                            }
                          >
                            <IconEdit size={16} />
                          </Button>
                          <Button
                            size="xs"
                            variant="light"
                            color="red"
                            disabled={belanjaState.delete.loading}
                            onClick={() => {
                              setSelectedId(item.id);
                              setModalHapus(true);
                            }}
                          >
                            <IconTrash size={16} />
                          </Button>
                        </Group>
                      </TableTd>
                    </TableTr>
                  ))}
                  <TableTr>
                    <TableTd colSpan={2}>
                      <Text fz="md" fw={600} lh={1.45}>Total</Text>
                    </TableTd>
                    <TableTd colSpan={2}>
                      <Text fz="md" fw={600} lh={1.45}>{formatRupiah(totalBelanja)}</Text>
                    </TableTd>
                  </TableTr>
                </>
              ) : (
                <TableTr>
                  <TableTd colSpan={4}>
                    <Center py="xl">
                      <Text c="dimmed" fz="sm" lh={1.4}>
                        Tidak ada data belanja yang cocok
                      </Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>
      </Paper>

      {/* Mobile Cards */}
      <Stack visibleFrom="xs" hiddenFrom="md" gap="sm">
        {filteredData.length > 0 ? (
          filteredData.map((item) => (
            <Paper key={item.id} withBorder p="md" radius="md">
              <Stack gap={'xs'}>
                <Box>
                  <Text fz="sm" fw={600} lh={1.4}>
                    Nama
                  </Text>
                  <Text fz="sm" fw={500} lh={1.4} truncate="end">
                    {item.name}
                  </Text>
                </Box>
                <Box>
                  <Text fz="sm" fw={600} lh={1.4}>
                    Nilai
                  </Text>
                  <Text fz="sm" fw={500} lh={1.4}>
                    {formatRupiah(item.value)}
                  </Text>
                </Box>
                <Box>
                  <Text fz="sm" fw={600} lh={1.4}>
                    Persentase
                  </Text>
                  <Text fz="sm" fw={500} lh={1.4}>
                    {totalBelanja > 0
                      ? ((item.value / totalBelanja) * 100).toFixed(0) + '%'
                      : '0%'}
                  </Text>
                </Box>
                <Group justify="flex-end" mt="xs">
                  <Button
                    size="xs"
                    variant="light"
                    color="green"
                    onClick={() =>
                      router.push(
                        `/admin/ekonomi/PADesa-pendapatan-asli-desa/belanja/${item.id}`
                      )
                    }
                  >
                    <IconEdit size={16} />
                  </Button>
                  <Button
                    size="xs"
                    variant="light"
                    color="red"
                    disabled={belanjaState.delete.loading}
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
          <Paper withBorder p="xl" radius="md">
            <Center>
              <Text c="dimmed" fz="sm" lh={1.4}>
                Tidak ada data belanja yang cocok
              </Text>
            </Center>
          </Paper>
        )}

        {filteredData.length > 0 && (
          <Paper withBorder p="md" radius="md">
            <Group justify="space-between">
              <Text fz="sm" fw={600} lh={1.4}>
                Total
              </Text>
              <Text fz="sm" fw={500} lh={1.4}>
                {formatRupiah(totalBelanja)}
              </Text>
            </Group>
          </Paper>
        )}
      </Stack>

      {/* Pagination */}
      {(totalPages > 1 || page > 1) && (
        <Center>
          <Pagination
            value={page}
            onChange={(newPage) => {
              load(newPage, 10, search);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            total={totalPages}
            mt="md"
            color="blue"
            radius="md"
          />
        </Center>
      )}

      {/* Modal Konfirmasi Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleDelete}
        text="Apakah anda yakin ingin menghapus belanja ini?"
      />
    </Stack>
  );
}

export default Belanja;