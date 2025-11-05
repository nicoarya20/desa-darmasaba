/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Group, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title } from '@mantine/core';
import { IconDeviceImacCog, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import prestasiState from '../../../_state/landing-page/prestasi-desa';

function ListPrestasiDesa() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title='Prestasi Desa'
        placeholder='Cari nama prestasi...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListPrestasi search={search} />
    </Box>
  );
}

function ListPrestasi({ search }: { search: string }) {
  const listState = useProxy(prestasiState.prestasiDesa)
  const router = useRouter();

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = listState.findMany

  // Debug log
  console.log('ListPrestasi state:', {
    loading,
    data: data?.length,
    page,
    totalPages,
    search
  });

  useEffect(() => {
    console.log('Loading data...', { page, search });
    load(page, 10, search).then(() => {
      console.log('Data loaded:', listState.findMany.data);
    }).catch(error => {
      console.error('Error loading data:', error);
    });
  }, [page, search])

  const filteredData = data || []

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
          <Title order={4}>Daftar Prestasi Desa</Title>
            <Button
              leftSection={<IconPlus size={18} />}
              color="blue"
              variant="light"
              onClick={() => router.push('/admin/landing-page/prestasi-desa/list-prestasi-desa/create')}
            >
              Tambah Baru
            </Button>
        </Group>
        <Box style={{ overflowX: 'auto' }}>
          <Table highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '25%' }}>Nama Prestasi</TableTh>
                <TableTh style={{ width: '25%' }}>Deskripsi</TableTh>
                <TableTh style={{ width: '25%' }}>Kategori</TableTh>
                <TableTh style={{ width: '25%', textAlign: 'center' }}>Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd style={{ width: '25%' }}>
                      <Box w={100}>
                        <Text truncate="end" fz={"sm"}>{item.name}</Text>
                      </Box>
                    </TableTd>
                    <TableTd style={{ width: '25%' }}>
                      <Text lineClamp={1} fz="sm" c="dimmed" dangerouslySetInnerHTML={{ __html: item.deskripsi }} />
                    </TableTd>
                    <TableTd style={{ width: '25%' }}>
                      <Box w={150}>
                        <Text truncate="end" fz={"sm"}>{item.kategori?.name || 'Tidak ada kategori'}</Text>
                      </Box>
                    </TableTd>
                    <TableTd style={{ width: '25%', textAlign: 'center' }}>
                        <Button
                          size="xs"
                          radius="md"
                          variant="light"
                          color="blue"
                          leftSection={<IconDeviceImacCog size={16} />}
                          onClick={() => router.push(`/admin/landing-page/prestasi-desa/list-prestasi-desa/${item.id}`)}
                        >
                          Detail
                        </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={4} style={{ textAlign: 'center' }}>
                    <Text c="dimmed" py="md">Tidak ada data prestasi</Text>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>
      </Paper>
      {totalPages > 1 && (
        <Center mt="lg">
          <Pagination
            value={page}
            onChange={load}
            total={totalPages}
            withEdges
            size="sm"
          />
        </Center>
      )}
    </Box>
  )
}

export default ListPrestasiDesa;
