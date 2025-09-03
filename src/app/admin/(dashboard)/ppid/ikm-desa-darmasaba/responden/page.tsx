'use client';
import { Box, Button, Center, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import indeksKepuasanState from '../../../_state/landing-page/indeks-kepuasan';

function Responden() {
  const [search, setSearch] = useState("");
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
    load(page, 10)
  }, [page]);


  const filteredData = (data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(keyword)
    );
  });

  if (loading || !data) {
    return (
      <Stack py="xl">
        <Skeleton height={750} radius="lg" />
      </Stack>
    );
  }

  if (data.length === 0) {
    return (
      <Paper withBorder bg="white" p="lg" radius="md" shadow="sm">
        <Stack gap="md">
          <Title order={3}>Data Responden</Title>
          <Table striped withRowBorders>
            <TableThead>
              <TableTr>
                <TableTh style={{ textAlign: 'center' }}>No</TableTh>
                <TableTh>Nama</TableTh>
                <TableTh>Tanggal</TableTh>
                <TableTh>Jenis Kelamin</TableTh>
                <TableTh style={{ textAlign: 'center' }}>Aksi</TableTh>
              </TableTr>
            </TableThead>
          </Table>
          <Text c="dimmed" ta="center" py="md">
            Belum ada data responden yang tersedia
          </Text>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper withBorder bg="white" p="lg" radius="md" shadow="sm">
      <Stack gap="md">
        <Title order={3}>Data Responden</Title>
        <Table striped withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh style={{ width: '5%', textAlign: 'center' }}>No</TableTh>
              <TableTh style={{ width: '25%' }}>Nama</TableTh>
              <TableTh style={{ width: '25%' }}>Tanggal</TableTh>
              <TableTh style={{ width: '20%' }}>Jenis Kelamin</TableTh>
              <TableTh style={{ width: '15%', textAlign: 'center' }}>Aksi</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {filteredData.length === 0 ? (
              <TableTr>
                <TableTd colSpan={5}>
                  <Text c="dimmed" ta="center" py="md">
                    Tidak ada data yang cocok dengan pencarian
                  </Text>
                </TableTd>
              </TableTr>
            ) : (
              filteredData.map((item, index) => (
                <TableTr key={item.id}>
                  <TableTd style={{ width: '5%', textAlign: 'center' }}>{index + 1}</TableTd>
                  <TableTd style={{ width: '25%' }}>{item.name}</TableTd>
                  <TableTd style={{ width: '25%' }}>
                    {item.tanggal ? new Date(item.tanggal).toLocaleDateString('id-ID') : '-'}
                  </TableTd>
                  <TableTd style={{ width: '20%' }}>{item.jenisKelamin.name}</TableTd>
                  <TableTd style={{ width: '15%', textAlign: 'center' }}>
                    <Button
                      variant="light"
                      size="xs"
                      onClick={() => router.push(`/admin/ppid/ikm-desa-darmasaba/responden/${item.id}`)}
                    >
                      <IconDeviceImac size={20} />
                    </Button>
                  </TableTd>
                </TableTr>
              ))
            )}
          </TableTbody>
        </Table>
        {filteredData.length > 0 && (
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
        )}
      </Stack>
    </Paper>
  );
}

export default Responden;


