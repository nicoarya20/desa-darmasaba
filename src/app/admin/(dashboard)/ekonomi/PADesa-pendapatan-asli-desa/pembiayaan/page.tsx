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
import PendapatanAsliDesa from '../../../_state/ekonomi/PADesa';

function Pembiayaan() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title="Pembiayaan"
        placeholder="Cari nama pembiayaan..."
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListPembiayaan search={search} />
    </Box>
  );
}

function ListPembiayaan({ search }: { search: string }) {
  const pembiayaanState = useProxy(PendapatanAsliDesa.pembiayaan);
  const router = useRouter();
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = pembiayaanState.findMany;

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);

  const totalPembiayaan = (data || []).reduce((sum, item) => sum + item.value, 0);

  const handleDelete = () => {
    if (selectedId) {
      pembiayaanState.delete.byId(selectedId);
      setModalHapus(false);
      setSelectedId(null);
      load(page, 10, debouncedSearch);
    }
  };

  useShallowEffect(() => {
    load(page, 10, debouncedSearch);
  }, [page, debouncedSearch]);

  if (loading || !data) {
    return (
      <Stack py="lg">
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  const filteredData = data || [];

  return (
    <Stack gap="xl" py="lg">
      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={4} lh={1.2}>Daftar Pembiayaan</Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() =>
              router.push('/admin/ekonomi/PADesa-pendapatan-asli-desa/pembiayaan/create')
            }
          >
            Tambah Baru
          </Button>
        </Group>

        {/* Desktop Table */}
        <Box visibleFrom="md">
          <Table
            highlightOnHover
            striped
            withTableBorder
            withRowBorders
            miw={0}
            style={{
              tableLayout: 'fixed',
              width: '100%',
            }}
          >
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '35%' }}>Nama</TableTh>
                <TableTh style={{ width: '25%' }}>Nilai</TableTh>
                <TableTh style={{ width: '20%' }}>Persentase</TableTh>
                <TableTh style={{ width: '20%' }}>Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                <>
                  {filteredData.map((item) => (
                    <TableTr key={item.id}>
                      <TableTd>
                        <Text fz="md" fw={500} lh={1.5} truncate="end" lineClamp={1}>
                          {item.name}
                        </Text>
                      </TableTd>
                      <TableTd>
                        <Text fz="md" fw={500} lh={1.5}>{formatRupiah(item.value)}</Text>
                      </TableTd>
                      <TableTd>
                        <Text fz="md" fw={500} lh={1.5}>
                          {totalPembiayaan > 0
                            ? ((item.value / totalPembiayaan) * 100).toFixed(0) + '%'
                            : '0%'}
                        </Text>
                      </TableTd>
                      <TableTd>
                        <Group gap="xs">
                          <Button
                            color="green"
                            variant="light"
                            onClick={() =>
                              router.push(
                                `/admin/ekonomi/PADesa-pendapatan-asli-desa/pembiayaan/${item.id}`
                              )
                            }
                          >
                            <IconEdit size={18} />
                          </Button>
                          <Button
                            color="red"
                            variant="light"
                            disabled={pembiayaanState.delete.loading}
                            onClick={() => {
                              setSelectedId(item.id);
                              setModalHapus(true);
                            }}
                          >
                            <IconTrash size={18} />
                          </Button>
                        </Group>
                      </TableTd>
                    </TableTr>
                  ))}
                  {/* Total Row */}
                  <TableTr>
                    <TableTd colSpan={2}>
                      <Text fz="md" fw={600} lh={1.5}>Total</Text>
                    </TableTd>
                    <TableTd colSpan={2}>
                      <Text fz="md" fw={600} lh={1.5}>{formatRupiah(totalPembiayaan)}</Text>
                    </TableTd>
                  </TableTr>
                </>
              ) : (
                <TableTr>
                  <TableTd colSpan={4}>
                    <Center py={20}>
                      <Text c="dimmed" fz="sm" lh={1.4}>
                        Tidak ada data pembiayaan yang cocok
                      </Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>

        {/* Mobile Card View */}
        <Stack gap="sm" hiddenFrom="md">
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <Paper key={item.id} withBorder p="md" radius="md">
                <Stack gap={"xs"}>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>Nama</Text>
                    <Text fz="sm" fw={500} lh={1.4} truncate="end">
                      {item.name}
                    </Text>
                  </Box>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>Nilai</Text>
                    <Text fz="sm" fw={500} lh={1.4}>
                      {formatRupiah(item.value)}
                    </Text>
                  </Box>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>Persentase</Text>
                    <Text fz="sm" fw={500} lh={1.4}>
                      {totalPembiayaan > 0
                        ? ((item.value / totalPembiayaan) * 100).toFixed(0) + '%'
                        : '0%'}
                    </Text>
                  </Box>
                  <Group justify="flex-end" mt="xs">
                    <Button
                      color="green"
                      variant="light"
                      size="xs"
                      onClick={() =>
                        router.push(
                          `/admin/ekonomi/PADesa-pendapatan-asli-desa/pembiayaan/${item.id}`
                        )
                      }
                    >
                      <IconEdit size={16} />
                    </Button>
                    <Button
                      color="red"
                      variant="light"
                      size="xs"
                      disabled={pembiayaanState.delete.loading}
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
            <Center py={20}>
              <Text c="dimmed" fz="sm" lh={1.4}>
                Tidak ada data pembiayaan yang cocok
              </Text>
            </Center>
          )}

          {filteredData.length > 0 && (
            <Paper withBorder p="md" radius="md">
              <Stack gap={4}>
                <Text fz="sm" fw={600} lh={1.4}>Total</Text>
                <Text fz="sm" fw={500} lh={1.4}>{formatRupiah(totalPembiayaan)}</Text>
              </Stack>
            </Paper>
          )}
        </Stack>
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
        text="Apakah anda yakin ingin menghapus pembiayaan ini?"
      />
    </Stack>
  );
}

export default Pembiayaan;