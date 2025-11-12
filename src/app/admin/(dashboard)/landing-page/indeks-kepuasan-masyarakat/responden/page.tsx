'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import { useShallowEffect } from '@mantine/hooks';
import {
  Box,
  Button,
  Center,
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
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import HeaderSearch from '../../../_com/header';
import indeksKepuasanState from '../../../_state/landing-page/indeks-kepuasan';

function Responden() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title="Data Responden"
        placeholder="Cari nama responden..."
        searchIcon={<IconSearch size={18} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListResponden search={search} />
    </Box>
  );
}

interface ListRespondenProps {
  search: string;
}

function ListResponden({ search }: ListRespondenProps) {
  const state = useProxy(indeksKepuasanState.responden);
  const router = useRouter();
  const { data, page, totalPages, loading, load } = state.findMany;

  useShallowEffect(() => {
    load(page, 10);
  }, [page]);

  const filteredData = (data || []).filter((item) => {
    const keyword = search.toLowerCase();
    return item.name.toLowerCase().includes(keyword);
  });

  if (loading || !data) {
    return (
      <Stack py="md">
        <Skeleton height={650} radius="lg" />
      </Stack>
    );
  }

  if (data.length === 0) {
    return (
      <Box py="md">
        <Paper p="lg" radius="lg" shadow="md" withBorder>
          <Stack align="center" gap="sm">
            <Title order={4}>Data Responden</Title>
            <Text c="dimmed" ta="center">
              Belum ada data responden yang tersedia
            </Text>
          </Stack>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Stack gap="md">
        <Paper p="lg" radius="lg" shadow="md" withBorder>
          <Title order={4} mb="sm">
            Daftar Responden
          </Title>
          <Box style={{ overflowX: 'auto' }}>
            <Table
              striped
              highlightOnHover
              withRowBorders
              verticalSpacing="sm"
            >
              <TableThead>
                <TableTr>
                  <TableTh style={{ width: '5%' }}>No</TableTh>
                  <TableTh style={{ width: '25%' }}>Nama</TableTh>
                  <TableTh style={{ width: '20%' }}>Tanggal</TableTh>
                  <TableTh style={{ width: '20%' }}>Jenis Kelamin</TableTh>
                  <TableTh style={{ width: '15%' }}>Aksi</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {filteredData.length === 0 ? (
                  <TableTr>
                    <TableTd colSpan={5}>
                      <Text ta="center" c="dimmed">
                        Tidak ditemukan data dengan kata kunci pencarian
                      </Text>
                    </TableTd>
                  </TableTr>
                ) : (
                  filteredData.map((item, index) => (
                    <TableTr key={item.id}>
                      <TableTd>{index + 1}</TableTd>
                      <TableTd>{item.name}</TableTd>
                      <TableTd>
                        <Box w={150}>
                        {item.tanggal
                          ? new Date(item.tanggal).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })
                          : '-'}
                        </Box>
                      </TableTd>
                      <TableTd>
                        <Box w={100}>
                        {item.jenisKelamin.name}
                        </Box>
                      </TableTd>
                      <TableTd>
                        <Button
                          size="xs"
                          radius="md"
                          variant="light"
                          color="blue"
                          leftSection={<IconDeviceImac size={16} />}
                          onClick={() =>
                            router.push(
                              `/admin/landing-page/indeks-kepuasan-masyarakat/responden/${item.id}`
                            )
                          }
                        >
                          Detail
                        </Button>
                      </TableTd>
                    </TableTr>
                  ))
                )}
              </TableTbody>
            </Table>
          </Box>
        </Paper>
        <Center>
          <Pagination
            value={page}
            total={totalPages}
            onChange={(newPage) => {
              load(newPage, 10);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            size="md"
            radius="md"
            mt="md"
          />
        </Center>
      </Stack>
    </Box>
  );
}

export default Responden;
