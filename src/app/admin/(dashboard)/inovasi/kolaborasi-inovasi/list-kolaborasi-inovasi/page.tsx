/* eslint-disable react-hooks/exhaustive-deps */
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
  Tooltip,
} from '@mantine/core';
import { IconDeviceImac, IconPlus, IconSearch } from '@tabler/icons-react';
import HeaderSearch from '../../../_com/header';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import kolaborasiInovasiState from '../../../_state/inovasi/kolaborasi-inovasi';
import { useProxy } from 'valtio/utils';

function KolaborasiInovasi() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title="Kolaborasi Inovasi"
        placeholder="Cari kolaborasi inovasi..."
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListKolaborasiInovasi search={search} />
    </Box>
  );
}

function ListKolaborasiInovasi({ search }: { search: string }) {
  const listState = useProxy(kolaborasiInovasiState);
  const router = useRouter();

  const { data, loading, page, totalPages, load } = listState.findMany;

  useEffect(() => {
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
          <Title order={4}>Daftar Kolaborasi Inovasi</Title>
          <Tooltip label="Tambah Kolaborasi Inovasi" withArrow>
            <Button
              leftSection={<IconPlus size={18} />}
              color="blue"
              variant="light"
              onClick={() => router.push('/admin/inovasi/kolaborasi-inovasi/list-kolaborasi-inovasi/create')}
            >
              Tambah Baru
            </Button>
          </Tooltip>
        </Group>
        <Box style={{ overflowX: 'auto' }}>
          <Table highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '5%' }}>No</TableTh>
                <TableTh style={{ width: '25%' }}>Nama Kolaborasi Inovasi</TableTh>
                <TableTh style={{ width: '15%' }}>Tahun</TableTh>
                <TableTh style={{ width: '35%' }}>Deskripsi Singkat</TableTh>
                <TableTh style={{ width: '10%' }}>Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <TableTr key={item.id}>
                    <TableTd>{index + 1}</TableTd>
                    <TableTd>
                      <Text fw={500} truncate="end" lineClamp={1}>
                        {item.name}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="sm" c="dimmed">
                        {item.tahun}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="sm" truncate="end" lineClamp={1} c="dimmed">
                        {item.slug}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Button
                        size="xs"
                        radius="md"
                        variant="light"
                        color="blue"
                        leftSection={<IconDeviceImac size={16} />}
                        onClick={() =>
                          router.push(`/admin/inovasi/kolaborasi-inovasi/list-kolaborasi-inovasi/${item.id}`)
                        }
                      >
                        Detail
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={5}>
                    <Center py={20}>
                      <Text color="dimmed">Tidak ada data kolaborasi inovasi yang tersedia</Text>
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
            load(newPage, 10);
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

export default KolaborasiInovasi;
