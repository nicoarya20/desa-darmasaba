/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import HeaderSearch from '../../_com/header';
import JudulList from '../../_com/judulList';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import kolaborasiInovasiState from '../../_state/inovasi/kolaborasi-inovasi';
import { useProxy } from 'valtio/utils';

function KolaborasiInovasi() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title='Kolaborasi Inovasi'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListKolaborasiInovasi search={search} />
    </Box>
  );
}

function ListKolaborasiInovasi({ search }: { search: string }) {
  const listState = useProxy(kolaborasiInovasiState)
  const { data, loading, page, totalPages, load } = listState.findMany
  const router = useRouter();

  useEffect(() => {
    load(page, 10)
  }, [page])

  const filteredData = (data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(keyword) ||
      item.deskripsi.toLowerCase().includes(keyword) ||
      item.slug.toLowerCase().includes(keyword) ||
      item.kolaborator.toLowerCase().includes(keyword)
    );
  });

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={650} />
      </Stack>
    );
  }
  if (data.length === 0) {
    return (
      <Box py={10}>
        <Paper p="md" >
          <Stack>
            <JudulList
              title='List Kolaborasi Inovasi'
              href='/admin/inovasi/kolaborasi-inovasi/create'
            />
            <Table striped withTableBorder withRowBorders>
              <TableThead>
                <TableTr>
                  <TableTh style={{ width: '2%', textAlign: 'center' }}>No</TableTh>
                  <TableTh style={{ width: '15%' }}>Nama Kolaborasi Inovasi</TableTh>
                  <TableTh style={{ width: '15%', textAlign: 'center' }}>Tahun</TableTh>
                  <TableTh style={{ width: '20%' }}>Deskripsi Singkat</TableTh>
                  <TableTh style={{ width: '5%', textAlign: 'center' }}>Detail</TableTh>
                </TableTr>
              </TableThead>
            </Table>
            <Text ta="center">Tidak ada data kolaborasi inovasi yang tersedia</Text>
          </Stack>
        </Paper>
      </Box >
    );
  }

  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <JudulList
          title='List Kolaborasi Inovasi'
          href='/admin/inovasi/kolaborasi-inovasi/create'
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh style={{ width: '1%', textAlign: 'center' }}>No</TableTh>
              <TableTh style={{ width: '15%' }}>Nama Kolaborasi Inovasi</TableTh>
              <TableTh style={{ width: '5%', textAlign: 'center' }}>Tahun</TableTh>
              <TableTh style={{ width: '20%' }}>Deskripsi Singkat</TableTh>
              <TableTh style={{ width: '5%', textAlign: 'center' }}>Detail</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {filteredData.map((item, index) => (
              <TableTr key={item.id}>
                <TableTd style={{ width: '1%', textAlign: 'center' }}>{index + 1}</TableTd>
                <TableTd style={{ width: '15%' }}>{item.name}</TableTd>
                <TableTd style={{ width: '5%', textAlign: 'center' }}>{item.tahun}</TableTd>
                <TableTd style={{ width: '20%' }}>{item.slug}</TableTd>
                <TableTd style={{ width: '5%', textAlign: 'center' }}>
                  <Button onClick={() => router.push(`/admin/inovasi/kolaborasi-inovasi/${item.id}`)}>
                    <IconDeviceImac size={20} />
                  </Button>
                </TableTd>
              </TableTr>
            ))}
          </TableTbody>
        </Table>
      </Paper>
      <Center>
        <Pagination
          value={page}
          onChange={(newPage) => {
            load(newPage, 10);
            window.scrollTo(0, 0);
          }}
          total={totalPages}
          mt="md"
          mb="md"
        />
      </Center>

    </Box>
  );
}

export default KolaborasiInovasi;
