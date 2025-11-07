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
import { useShallowEffect } from '@mantine/hooks';
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
      load(page, 10, search);
    }
  };

  useShallowEffect(() => {
    load(page, 10, search);
  }, [page, search]);

  const filteredData = data || [];

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  const totalValue = filteredData.reduce((total, item) => total + item.value, 0);

  return (
    <Box py={10}>
      <Paper withBorder bg={colors['white-1']} p={'lg'} shadow="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={4}>Daftar Pendapatan</Title>
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

        <Box style={{ overflowX: 'auto' }}>
          <Table highlightOnHover striped withTableBorder withRowBorders>
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '40%' }}>Nama</TableTh>
                <TableTh style={{ width: '25%' }}>Nilai</TableTh>
                <TableTh style={{ width: '15%' }}>Edit</TableTh>
                <TableTh style={{ width: '15%' }}>Delete</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                <>
                  {filteredData.map((item) => (
                    <TableTr key={item.id}>
                      <TableTd>
                        <Text fw={500} truncate="end" lineClamp={1}>
                          {item.name}
                        </Text>
                      </TableTd>
                      <TableTd>{formatRupiah(item.value)}</TableTd>
                      <TableTd>
                        <Button
                          variant="light"
                          color="green"
                          onClick={() =>
                            router.push(`/admin/ekonomi/PADesa-pendapatan-asli-desa/pendapatan/${item.id}`)
                          }
                        >
                          <IconEdit size={18} />
                          <Text ml={5}>Edit</Text>
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
                        >
                          <IconTrash size={18} />
                          <Text ml={5}>Hapus</Text>
                        </Button>
                      </TableTd>
                    </TableTr>
                  ))}

                  {/* Row total */}
                  <TableTr>
                    <TableTd colSpan={1}>
                      <Text fw={'bold'}>Total</Text>
                    </TableTd>
                    <TableTd colSpan={3}>
                      <Text fw={'bold'}>{formatRupiah(totalValue)}</Text>
                    </TableTd>
                  </TableTr>
                </>
              ) : (
                <TableTr>
                  <TableTd colSpan={4}>
                    <Center py={20}>
                      <Text color="dimmed">Tidak ada data pendapatan yang cocok</Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
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
        text="Apakah anda yakin ingin menghapus pendapatan ini?"
      />
    </Box>
  );
}

export default Pendapatan;
