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

function Belanja() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title="Belanja"
        placeholder="Cari belanja berdasarkan nama atau nilai..."
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListBelanja search={search} />
    </Box>
  );
}

function ListBelanja({ search }: { search: string }) {
  const belanjaState = useProxy(PendapatanAsliDesa.belanja);
  const router = useRouter();
  const [modalHapus, setModalHapus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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

  return (
    <Box py={10}>
      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={4}>Daftar Belanja</Title>
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

        <Box style={{ overflowX: 'auto' }}>
          <Table highlightOnHover striped withTableBorder withRowBorders>
            <TableThead>
              <TableTr>
                <TableTh>Nama</TableTh>
                <TableTh>Nilai</TableTh>
                <TableTh>Persentase</TableTh>
                <TableTh>Aksi</TableTh>
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
                        {totalBelanja > 0
                          ? ((item.value / totalBelanja) * 100).toFixed(0) + '%'
                          : '0%'}
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
                      <Text fw="bold">Total</Text>
                    </TableTd>
                    <TableTd colSpan={2}>
                      <Text fw="bold">{formatRupiah(totalBelanja)}</Text>
                    </TableTd>
                  </TableTr>
                </>
              ) : (
                <TableTr>
                  <TableTd colSpan={4}>
                    <Center py={20}>
                      <Text c="dimmed">Tidak ada data belanja yang cocok</Text>
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
        text="Apakah anda yakin ingin menghapus belanja ini?"
      />
    </Box>
  );
}

export default Belanja;
