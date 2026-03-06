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

function Pendapatan() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Pendapatan'
        placeholder='Cari pendapatan...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListPendapatan search={search} />
    </Box>
  );
}

function ListPendapatan({ search }: { search: string }) {
  const pendapatanState = useProxy(PendapatanAsliDesa.pendapatan);
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
  } = pendapatanState.findMany;

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);

  const handleDelete = () => {
    if (selectedId) {
      pendapatanState.delete.byId(selectedId);
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
      <Stack py={{ base: 'sm', md: 'md' }}>
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  const totalValue = filteredData.reduce((total, item) => total + item.value, 0);

  return (
    <Box py={{ base: 'sm', md: 'md' }}>
      <Paper withBorder bg={colors['white-1']} p={{ base: 'md', md: 'lg' }} shadow="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={2} lh={1.2}>
          Daftar Pendapatan
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() =>
              router.push('/admin/ekonomi/PADesa-pendapatan-asli-desa/pendapatan/create')
            }
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
                        <Text fz="md" fw={500} lh={1.5} truncate="end">
                          {item.name}
                        </Text>
                      </TableTd>
                      <TableTd>
                        <Text fz="md" fw={500} lh={1.5}>{formatRupiah(item.value)}</Text>
                      </TableTd>
                      <TableTd>
                        <Button
                          variant="light"
                          color="green"
                          onClick={() =>
                            router.push(`/admin/ekonomi/PADesa-pendapatan-asli-desa/pendapatan/${item.id}`)
                          }
                          fz="sm"
                          px="xs"
                        >
                          <IconEdit size={16} />
                        </Button>
                      </TableTd>
                      <TableTd>
                        <Button
                          variant="light"
                          color="red"
                          disabled={pendapatanState.delete.loading}
                          onClick={() => {
                            setSelectedId(item.id);
                            setModalHapus(true);
                          }}
                          fz="sm"
                          px="xs"
                        >
                          <IconTrash size={16} />
                        </Button>
                      </TableTd>
                    </TableTr>
                  ))}

                  {/* Row total */}
                  <TableTr>
                    <TableTd>
                      <Text fz="md" fw={700} lh={1.5}>Total</Text>
                    </TableTd>
                    <TableTd colSpan={3}>
                      <Text fz="md" fw={700} lh={1.5}>{formatRupiah(totalValue)}</Text>
                    </TableTd>
                  </TableTr>
                </>
              ) : (
                <TableTr>
                  <TableTd colSpan={4}>
                    <Center py={24}>
                      <Text c="dimmed" fz="sm" lh={1.4}>
                        Tidak ada data pendapatan yang cocok
                      </Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>

        {/* Mobile Cards */}
        <Stack gap="xs" hiddenFrom="md">
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <Paper key={item.id} withBorder radius="md" p="md">
                <Stack gap={4}>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>Nama</Text>
                    <Text fz="sm" fw={500} lh={1.4}>{item.name}</Text>
                  </Box>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>Nilai</Text>
                    <Text fz="sm" fw={500} lh={1.4}>{formatRupiah(item.value)}</Text>
                  </Box>
                  <Group justify="flex-end" mt="xs">
                    <Button
                      variant="light"
                      color="green"
                      size="xs"
                      onClick={() =>
                        router.push(`/admin/ekonomi/PADesa-pendapatan-asli-desa/pendapatan/${item.id}`)
                      }
                    >
                      <IconEdit size={14} />
                      <Text ml={4}>Edit</Text>
                    </Button>
                    <Button
                      variant="light"
                      color="red"
                      size="xs"
                      disabled={pendapatanState.delete.loading}
                      onClick={() => {
                        setSelectedId(item.id);
                        setModalHapus(true);
                      }}
                    >
                      <IconTrash size={14} />
                      <Text ml={4}>Hapus</Text>
                    </Button>
                  </Group>
                </Stack>
              </Paper>
            ))
          ) : (
            <Center py={24}>
              <Text c="dimmed" fz="sm" lh={1.4}>
                Tidak ada data pendapatan yang cocok
              </Text>
            </Center>
          )}

          {filteredData.length > 0 && (
            <Paper withBorder radius="md" p="md">
              <Box>
                <Text fz="xs" fw={600} lh={1.4}>Total</Text>
                <Text fz="sm" fw={700} lh={1.4}>{formatRupiah(totalValue)}</Text>
              </Box>
            </Paper>
          )}
        </Stack>
      </Paper>

        <Center mt={{ base: 'sm', md: 'md' }} mb={{ base: 'sm', md: 'md' }}>
          <Pagination
            value={page}
            onChange={(newPage) => {
              load(newPage, 10, search);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            total={totalPages}
            color="blue"
            radius="md"
            size="sm"
          />
        </Center>

      {/* Modal Konfirmasi Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleDelete}
        text="Apakah anda yakin ingin menghapus pendapatan ini?"
      />
    </Box>
  );
}

export default Pendapatan;