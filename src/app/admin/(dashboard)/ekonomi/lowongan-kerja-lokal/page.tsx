'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from '@mantine/core';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import HeaderSearch from '../../_com/header';
import JudulList from '../../_com/judulList';
import { useRouter } from 'next/navigation';
import lowonganKerjaState from '../../_state/ekonomi/lowongan-kerja';
import { useProxy } from 'valtio/utils';
import { useShallowEffect } from '@mantine/hooks';
import { useState } from 'react';

function LowonganKerjaLokal() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Lowongan Kerja Lokal'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListLowonganKerjaLokal search={search} />
    </Box>
  );
}

function ListLowonganKerjaLokal({ search }: { search: string }) {
  const lowonganState = useProxy(lowonganKerjaState)
  const router = useRouter();

  useShallowEffect(() => {
    lowonganState.findMany.load();
  }, [])

  const filteredData = (lowonganState.findMany.data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.posisi.toLowerCase().includes(keyword) ||
      item.namaPerusahaan.toLowerCase().includes(keyword) ||
      item.lokasi.toLowerCase().includes(keyword)
    );
  });

  if (!lowonganState.findMany.data) {
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
          title='List Lowongan Kerja Lokal'
          href='/admin/ekonomi/lowongan-kerja-lokal/create'
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Bekerja Sebagai</TableTh>
              <TableTh>Nama Usaha</TableTh>
              <TableTh>Alamat Usaha</TableTh>
              <TableTh>Detail</TableTh>
              </TableTr>
          </TableThead>
          <TableTbody>
            {filteredData.map((item) => (
              <TableTr key={item.id}>
                <TableTd>{item.posisi}</TableTd>
                <TableTd>{item.namaPerusahaan}</TableTd>
                <TableTd>{item.lokasi}</TableTd>
                <TableTd>
                  <Button onClick={() => router.push(`/admin/ekonomi/lowongan-kerja-lokal/${item.id}`)}>
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

export default LowonganKerjaLokal;
