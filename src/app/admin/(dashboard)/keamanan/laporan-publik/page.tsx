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
import { IconDeviceImac, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import laporanPublikState from '../../_state/keamanan/laporan-publik';

function LaporanPublik() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Laporan Publik'
        placeholder='Cari laporan publik...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListLaporanPublik search={search} />
    </Box>
  );
}

function ListLaporanPublik({ search }: { search: string }) {
  const stateLaporan = useProxy(laporanPublikState);
  const router = useRouter();
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = stateLaporan.findMany;

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

  return (
    <Box py={{ base: 'sm', md: 'md' }}>
      <Paper withBorder bg={colors['white-1']} p={{ base: 'md', md: 'lg' }} shadow="md" radius="md">
        <Group justify="space-between" mb={{ base: 'sm', md: 'md' }}>
          <Title order={4} lh={1.2}>
            Daftar Laporan Publik
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() => router.push('/admin/keamanan/laporan-publik/create')}
            visibleFrom="md"
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
                <TableTh style={{ width: '25%' }}><Text fz="sm" fw={600} lh={1.4}>Judul Laporan Publik</Text></TableTh>
                <TableTh style={{ width: '20%' }}><Text fz="sm" fw={600} lh={1.4}>Tanggal</Text></TableTh>
                <TableTh style={{ width: '15%' }}><Text fz="sm" fw={600} lh={1.4}>Status</Text></TableTh>
                <TableTh style={{ width: '25%' }}><Text fz="sm" fw={600} lh={1.4}>Deskripsi</Text></TableTh>
                <TableTh style={{ width: '15%' }}><Text fz="sm" fw={600} lh={1.4}>Aksi</Text></TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fw={500} fz="md" lh={1.5} truncate="end" lineClamp={1}>
                        {item.judul}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="sm" c="gray.7" lh={1.5}>
                        {new Date(item.tanggalWaktu).toLocaleDateString('id-ID')}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Box
                        style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          borderRadius: '16px',
                          backgroundColor:
                            item.status === 'Selesai' ? '#94EF95FF' :
                              item.status === 'Proses' ? '#F1D295FF' :
                                '#F38E8EFF',
                          color:
                            item.status === 'Selesai' ? '#01BA01FF' :
                              item.status === 'Proses' ? '#B67A00FF' :
                                '#AE1700FF',
                          fontWeight: 900,
                          fontSize: '0.75rem',
                          textAlign: 'center',
                          minWidth: '80px',
                        }}
                      >
                        {item.status}
                      </Box>
                    </TableTd>
                    <TableTd>
                      <Text truncate fz="sm" c="gray.7" lineClamp={1} dangerouslySetInnerHTML={{ __html: item.kronologi || '' }} />
                    </TableTd>
                    <TableTd>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() =>
                          router.push(`/admin/keamanan/laporan-publik/${item.id}`)
                        }
                      >
                        <IconDeviceImac size={20} />
                        <Text ml={5} fz="sm" fw={500}>Detail</Text>
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={5}>
                    <Center py={20}>
                      <Text c="gray.6" fz="sm" lh={1.5}>
                        Tidak ada data laporan publik yang cocok
                      </Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>

        {/* Mobile Cards */}
        <Stack hiddenFrom="md" gap="xs">
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <Paper key={item.id} withBorder p="sm" radius="md">
                <Stack gap={'xs'}>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>Judul Laporan Publik</Text>
                    <Text fz="sm" fw={500} lh={1.5}>{item.judul}</Text>
                  </Box>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>Tanggal</Text>
                    <Text fz="sm" fw={500} lh={1.5} c="gray.7">
                      {new Date(item.tanggalWaktu).toLocaleDateString('id-ID')}
                    </Text>
                  </Box>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>Status</Text>
                    <Box
                      style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '16px',
                        backgroundColor:
                          item.status === 'Selesai' ? '#94EF95FF' :
                            item.status === 'Proses' ? '#F1D295FF' :
                              '#F38E8EFF',
                        color:
                          item.status === 'Selesai' ? '#01BA01FF' :
                            item.status === 'Proses' ? '#B67A00FF' :
                              '#AE1700FF',
                        fontWeight: 900,
                        fontSize: '0.75rem',
                        textAlign: 'center',
                        minWidth: '80px',
                      }}
                    >
                      {item.status}
                    </Box>
                  </Box>
                  <Box>
                    <Text fz="xs" fw={600} lh={1.4}>Deskripsi</Text>
                    <Text fz="sm" fw={500} lh={1.5} c="gray.7" lineClamp={2} dangerouslySetInnerHTML={{ __html: item.kronologi || '' }} />
                  </Box>
                  <Button
                    variant="light"
                    color="blue"
                    fullWidth
                    onClick={() =>
                      router.push(`/admin/keamanan/laporan-publik/${item.id}`)
                    }
                  >
                    <IconDeviceImac size={20} />
                    <Text ml={5} fz="sm" fw={500}>Detail</Text>
                  </Button>
                </Stack>
              </Paper>
            ))
          ) : (
            <Center py={20}>
              <Text c="gray.6" fz="sm" lh={1.5}>
                Tidak ada data laporan publik yang cocok
              </Text>
            </Center>
          )}
        </Stack>

        {/* Tambah Baru (Mobile only) */}
        <Button
          leftSection={<IconPlus size={18} />}
          color="blue"
          variant="light"
          onClick={() => router.push('/admin/keamanan/laporan-publik/create')}
          hiddenFrom="md"
          fullWidth
          mt="sm"
        >
          Tambah Baru
        </Button>
      </Paper>

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
    </Box>
  );
}

export default LaporanPublik;