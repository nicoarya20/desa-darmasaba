'use client'
import colors from '@/con/colors';
import {
  Box,
  Button,
  Center,
  Group,
  Paper,
  Pagination,
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
  Tooltip,
} from '@mantine/core';
import { IconDeviceImac, IconPlus, IconSearch } from '@tabler/icons-react';
import HeaderSearch from '../../_com/header';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import laporanPublikState from '../../_state/keamanan/laporan-publik';
import { useShallowEffect } from '@mantine/hooks';
import { useState } from 'react';

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

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = stateLaporan.findMany;

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
          <Title order={4}>Daftar Laporan Publik</Title>
          <Tooltip label="Tambah Laporan Publik" withArrow>
            <Button
              leftSection={<IconPlus size={18} />}
              color="blue"
              variant="light"
              onClick={() => router.push('/admin/keamanan/laporan-publik/create')}
            >
              Tambah Baru
            </Button>
          </Tooltip>
        </Group>
        <Box style={{ overflowX: "auto" }}>
          <Table highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '25%' }}>Judul Laporan Publik</TableTh>
                <TableTh style={{ width: '20%' }}>Tanggal</TableTh>
                <TableTh style={{ width: '15%' }}>Status</TableTh>
                <TableTh style={{ width: '25%' }}>Deskripsi</TableTh>
                <TableTh style={{ width: '15%' }}>Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fw={500} truncate="end" lineClamp={1}>
                        {item.judul}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="sm" c="dimmed">
                        {new Date(item.tanggalWaktu).toLocaleDateString('id-ID')}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="sm">{item.status}</Text>
                    </TableTd>
                    <TableTd>
                      <Text truncate fz="sm" c="dimmed" lineClamp={1}>
                        {item.kronologi}
                      </Text>
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
                        <Text ml={5}>Detail</Text>
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={5}>
                    <Center py={20}>
                      <Text color="dimmed">
                        Tidak ada data laporan publik yang cocok
                      </Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>
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
