/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import HeaderSearch from '../../../_com/header';
import JudulList from '../../../_com/judulList';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import gotongRoyongState from '../../../_state/lingkungan/gotong-royong';

function KegiatanDesa() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title='Kegiatan Desa'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListKegiatanDesa search={search} />
    </Box>
  );
}

function ListKegiatanDesa({ search }: { search: string }) {
  const listState = useProxy(gotongRoyongState.kegiatanDesa)
  const router = useRouter();
  useEffect(() => {
    listState.findMany.load()
  }, [])

  const filteredData = (listState.findMany.data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.judul.toLowerCase().includes(keyword) ||
      item.lokasi.toLowerCase().includes(keyword) || 
      item.kategoriKegiatan?.nama?.toLowerCase().includes(keyword)
    );
  });

  if (!listState.findMany.data) {
    return (
      <Stack py={10}>
        <Skeleton h={500} />
      </Stack>
    )
  }

  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <Stack>
          <JudulList
            title='List Kegiatan Desa'
            href='/admin/lingkungan/gotong-royong/kegiatan-desa/create'
          />
          <Box style={{ overflowX: 'auto' }}>
            <Table striped withRowBorders withTableBorder style={{ minWidth: '700px' }}>
              <TableThead>
                <TableTr>
                  <TableTh>Judul Kegiatan Desa</TableTh>
                  <TableTh>Kategori Kegiatan Desa</TableTh>
                  <TableTh>Lokasi Kegiatan Desa</TableTh>
                  <TableTh>Detail</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Box w={100}>
                        <Text truncate="end" fz={"sm"}>{item.judul}</Text>
                      </Box>
                    </TableTd>
                    <TableTd>{item.kategoriKegiatan?.nama}</TableTd>
                    <TableTd>{item.lokasi}</TableTd>
                    <TableTd>
                      <Button onClick={() => router.push(`/admin/lingkungan/gotong-royong/kegiatan-desa/${item.id}`)}>
                        <IconDeviceImacCog size={25} />
                      </Button>
                    </TableTd>
                  </TableTr>
                ))}
              </TableTbody>
            </Table>
          </Box>
        </Stack>
      </Paper>
    </Box>
  )
}

export default KegiatanDesa;
