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
import { YearFilter } from '../_components/YearFilter';
import HeaderSearch from '../../_com/header';
import { ModalKonfirmasiHapus } from '../../_com/modalKonfirmasiHapus';
import migrasiPenduduk from '../../_state/kependudukan/migrasi-penduduk';

function MigrasiPendudukAdmin() {
  const [search, setSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  return (
    <Box>
      <HeaderSearch
        title='Migrasi Penduduk'
        placeholder='Cari nama...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.currentTarget.value)}
      />
      <Box mt="md">
        <YearFilter value={selectedYear} onChange={(year) => {
          setSelectedYear(year);
          migrasiPenduduk.findMany.page = 1;
        }} />
      </Box>
      <ListMigrasiPenduduk search={search} year={selectedYear} />
    </Box>
  );
}

function ListMigrasiPenduduk({ search, year }: { search: string; year?: number }) {
  type MigrasiPendudukType = {
    id: string;
    jenis: string;
    nama: string;
    tanggal: string;
    asal: string | null;
    tujuan: string | null;
    alasan: string | null;
  };

  const router = useRouter();
  const stateMigrasiPenduduk = useProxy(migrasiPenduduk);
  const [modalHapus, setModalHapus] = useState(false);
  const [debouncedSearch] = useDebouncedValue(search, 1000);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = stateMigrasiPenduduk.findMany;

  const handleDelete = () => {
    if (selectedId) {
      stateMigrasiPenduduk.delete.byId(selectedId);
      setModalHapus(false);
      setSelectedId(null);
    }
  };

  useShallowEffect(() => {
    load(page, 10, debouncedSearch, year);
  }, [page, debouncedSearch, year]);

  const filteredData = (data as MigrasiPendudukType[]) || [];

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  const formatTanggal = (tanggal: string) => {
    try {
      return new Date(tanggal).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return tanggal;
    }
  };

  return (
    <Box py={{ base: 'sm', md: 'md' }}>
      <Paper withBorder bg={colors['white-1']} p={{ base: 'md', md: 'lg' }} shadow="md" radius="md">
        <Group justify="space-between" mb={{ base: 'sm', md: 'md' }}>
          <Title order={4} lh={{ base: 1.2, md: 1.15 }}>
            List Migrasi Penduduk
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() => router.push('/admin/kependudukan/migrasi-penduduk/create')}
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
                <TableTh style={{ width: '10%' }}>Jenis</TableTh>
                <TableTh style={{ width: '20%' }}>Nama</TableTh>
                <TableTh style={{ width: '15%' }}>Tanggal</TableTh>
                <TableTh style={{ width: '25%' }}>Asal/Tujuan</TableTh>
                <TableTh style={{ width: '10%' }}>Edit</TableTh>
                <TableTh style={{ width: '10%' }}>Hapus</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => {
                  const asalTujuan = item.jenis === 'MASUK' ? (item.asal || '-') : (item.tujuan || '-');
                  return (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text
                        fz="sm"
                        fw={500}
                        c={item.jenis === 'MASUK' ? 'green' : 'red'}
                      >
                        {item.jenis}
                      </Text>
                    </TableTd>
                    <TableTd>{item.nama}</TableTd>
                    <TableTd>{formatTanggal(item.tanggal)}</TableTd>
                    <TableTd>{asalTujuan}</TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="green"
                        onClick={() =>
                          router.push(`/admin/kependudukan/migrasi-penduduk/${item.id}`)
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
                        disabled={stateMigrasiPenduduk.delete.loading}
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
                );
                })
              ) : (
                <TableTr>
                  <TableTd colSpan={6}>
                    <Center py={20}>
                      <Text c="dimmed" fz="sm" lh={1.4}>
                        Tidak ada data migrasi penduduk yang cocok
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
              filteredData.map((item) => {
                const asalTujuan = item.jenis === 'MASUK' ? (item.asal || '-') : (item.tujuan || '-');
                return (
                <Paper key={item.id} withBorder p="sm" radius="sm">
                  <Stack gap={"xs"}>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>
                        Jenis Migrasi
                      </Text>
                      <Text
                        fz="sm"
                        fw={500}
                        c={item.jenis === 'MASUK' ? 'green' : 'red'}
                      >
                        {item.jenis}
                      </Text>
                    </Box>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>
                        Nama
                      </Text>
                      <Text fz="sm" fw={500} lh={1.4}>
                        {item.nama}
                      </Text>
                    </Box>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>
                        Tanggal
                      </Text>
                      <Text fz="sm" fw={500} lh={1.4}>
                        {formatTanggal(item.tanggal)}
                      </Text>
                    </Box>
                    <Box>
                      <Text fz="sm" fw={600} lh={1.4}>
                        {item.jenis === 'MASUK' ? 'Asal' : 'Tujuan'}
                      </Text>
                      <Text fz="sm" fw={500} lh={1.4}>
                        {asalTujuan}
                      </Text>
                    </Box>
                    {item.alasan && (
                      <Box>
                        <Text fz="sm" fw={600} lh={1.4}>
                          Alasan
                        </Text>
                        <Text fz="sm" fw={500} lh={1.4}>
                          {item.alasan}
                        </Text>
                      </Box>
                    )}
                    <Group justify="flex-end" gap="xs">
                      <Button
                        variant="light"
                        color="green"
                        onClick={() =>
                          router.push(`/admin/kependudukan/migrasi-penduduk/${item.id}`)
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
                        disabled={stateMigrasiPenduduk.delete.loading}
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
              );
              })
            ) : (
              <Center py={20}>
                <Text c="dimmed" fz="sm" lh={1.4}>
                  Tidak ada data migrasi penduduk yang cocok
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
        text="Apakah anda yakin ingin menghapus data migrasi penduduk ini?"
      />
    </Box>
  );
}

export default MigrasiPendudukAdmin;
