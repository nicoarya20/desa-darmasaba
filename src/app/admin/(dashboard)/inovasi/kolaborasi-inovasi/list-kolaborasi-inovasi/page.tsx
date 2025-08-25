/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import HeaderSearch from '../../../_com/header';
import JudulList from '../../../_com/judulList';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import kolaborasiInovasiState from '../../../_state/inovasi/kolaborasi-inovasi';
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
  const router = useRouter();

  const {
    data,
    loading,
    page,
    totalPages,
    load,
  } = listState.findMany

  useEffect(() => {
    load(page, 10, search)
  }, [page, search])

  const filteredData = data || []

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
                  <TableTh>No</TableTh>
                  <TableTh>Nama Kolaborasi Inovasi</TableTh>
                  <TableTh>Tahun</TableTh>
                  <TableTh>Deskripsi Singkat</TableTh>
                  <TableTh>Detail</TableTh>
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
              <TableTh>No</TableTh>
              <TableTh>Nama Kolaborasi Inovasi</TableTh>
              <TableTh>Tahun</TableTh>
              <TableTh>Deskripsi Singkat</TableTh>
              <TableTh>Detail</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {filteredData.map((item, index) => (
              <TableTr key={item.id}>
                <TableTd>{index + 1}</TableTd>
                <TableTd>{item.name}</TableTd>
                <TableTd>{item.tahun}</TableTd>
                <TableTd>{item.slug}</TableTd>
                <TableTd>
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
          onChange={(newPage) => load(newPage)} // ini penting!
          total={totalPages}
          mt="md"
          mb="md"
        />
      </Center>
    </Box >
  );
}

export default KolaborasiInovasi;
