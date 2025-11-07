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
      load(page, 10, search);
    }
  };

  useShallowEffect(() => {
    load(page, 10, search);
  }, [page, search]);

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    );
  }

  const filteredData = data || [];

  return (
    <Box py={10}>
      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={4}>Daftar Pembiayaan</Title>
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

        <Box style={{ overflowX: 'auto' }}>
          <Table highlightOnHover striped withTableBorder withRowBorders>
            <TableThead>
              <TableTr>
                <TableTh>Nama</TableTh>
                <TableTh>Nilai</TableTh>
                <TableTh>Persentase</TableTh>
                <TableTh style={{ width: '20%' }}>Aksi</TableTh>
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
                        {totalPembiayaan > 0
                          ? ((item.value / totalPembiayaan) * 100).toFixed(0) + '%'
                          : '0%'}
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
                      <Text fw="bold">Total</Text>
                    </TableTd>
                    <TableTd colSpan={2}>{formatRupiah(totalPembiayaan)}</TableTd>
                  </TableTr>
                </>
              ) : (
                <TableTr>
                  <TableTd colSpan={4}>
                    <Center py={20}>
                      <Text c="dimmed">Tidak ada data pembiayaan yang cocok</Text>
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
        text="Apakah anda yakin ingin menghapus pembiayaan ini?"
      />
    </Box>
  );
}

export default Pembiayaan;
