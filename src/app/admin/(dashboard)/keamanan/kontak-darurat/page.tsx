'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from '@mantine/core';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import HeaderSearch from '../../_com/header';
import JudulList from '../../_com/judulList';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import kontakDaruratKeamananState from '../../_state/keamanan/kontak-darurat-keamanan';
import { useShallowEffect } from '@mantine/hooks';
import { useState } from 'react';

function KontakDaurat() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Kontak Darurat'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListKontakDaurat search={search}/>
    </Box>
  );
}

function ListKontakDaurat({ search }: { search: string }) {
  const kontakState = useProxy(kontakDaruratKeamananState)
  const router = useRouter();

  useShallowEffect(() => {
    kontakState.findMany.load()
  }, [])

  const filteredData = (kontakState.findMany.data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.nama.toLowerCase().includes(keyword) ||
      item.kontakItems[0].nama.toLowerCase().includes(keyword) ||
      item.kontakItems[0].nomorTelepon.toLowerCase().includes(keyword)
    );
  });

  if (!kontakState.findMany.data) {
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
          title='List Kontak Darurat'
          href='/admin/keamanan/kontak-darurat/create'
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Nama Kategori Darurat</TableTh>
              <TableTh>Nama Kontak</TableTh>
              <TableTh>Nomor Kontak</TableTh>
              <TableTh>Detail</TableTh>
              </TableTr>
          </TableThead>
          <TableTbody>
            {filteredData.map((item) => (
              <TableTr key={item.id}>
                <TableTd>{item.nama}</TableTd>
                <TableTd>{item.kontakItems[0].nama}</TableTd>
                <TableTd>{item.kontakItems[0].nomorTelepon}</TableTd>
                <TableTd>
                  <Button onClick={() => router.push(`/admin/keamanan/kontak-darurat/${item.id}`)}>
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

export default KontakDaurat;
