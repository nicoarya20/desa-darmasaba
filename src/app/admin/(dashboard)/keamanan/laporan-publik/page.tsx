'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from '@mantine/core';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import HeaderSearch from '../../_com/header';
import JudulList from '../../_com/judulList';
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
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListLaporanPublik search={search}/>
    </Box>
  );
}

function ListLaporanPublik({ search }: { search: string }) {
  const stateLaporan = useProxy(laporanPublikState)
  const router = useRouter();

  useShallowEffect(() => {
    stateLaporan.findMany.load()
  }, [])

  const filteredData = (stateLaporan.findMany.data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.judul.toLowerCase().includes(keyword) ||
      item.status.toLowerCase().includes(keyword) ||
      item.kronologi?.toLowerCase().includes(keyword)
    );
  });

  if (!stateLaporan.findMany.data) {
    return (
      <Stack py={10}>
        <Skeleton h={500} />
      </Stack>
    )
  }
  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <JudulList
          title='List Laporan Publik'
          href='/admin/keamanan/laporan-publik/create'
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Judul Laporan Publik</TableTh>
              <TableTh>Tanggal Laporan Publik</TableTh>
              <TableTh>Status</TableTh>
              <TableTh>Deskripsi</TableTh>
              <TableTh>Detail</TableTh>
              </TableTr>
          </TableThead>
          <TableTbody>
            {filteredData.map((item) => (
              <TableTr key={item.id}>
                <TableTd>{item.judul}</TableTd>
                <TableTd>{new Date(item.tanggalWaktu).toLocaleDateString('id-ID')}</TableTd>
                <TableTd>{item.status}</TableTd>
                <TableTd>{item.kronologi}</TableTd>
                <TableTd>
                  <Button onClick={() => router.push(`/admin/keamanan/laporan-publik/${item.id}`)}>
                  <IconDeviceImac size={20} />
                </Button>
              </TableTd>
            </TableTr>
          ))}
          </TableTbody>
        </Table>  
      </Paper>
    </Box>
  );
}

export default LaporanPublik;
