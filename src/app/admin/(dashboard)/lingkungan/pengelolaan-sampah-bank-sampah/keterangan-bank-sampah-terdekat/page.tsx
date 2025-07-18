/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from '@mantine/core';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';

import { useEffect, useState } from 'react';
import HeaderSearch from '../../../_com/header';
import JudulList from '../../../_com/judulList';
import pengelolaanSampahState from '../../../_state/lingkungan/pengelolaan-sampah';

function KeteranganBankSampahTerdekat() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Keterangan Bank Sampah Terdekat'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListKeteranganBankSampahTerdekat search={search}/>
    </Box>
  );
}

function ListKeteranganBankSampahTerdekat({ search }: { search: string }) {
  const keteranganState = useProxy(pengelolaanSampahState.keteranganSampah)
  const router = useRouter();

  useEffect(() => {
    keteranganState.findMany.load()
  }, [])

  const filteredData = (keteranganState.findMany.data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(keyword) ||
      item.alamat.toLowerCase().includes(keyword) || 
      item.namaTempatMaps.toLowerCase().includes(keyword)
    );
  });

  if (!keteranganState.findMany.data) {
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
          title='List Keterangan Bank Sampah Terdekat'
          href='/admin/lingkungan/pengelolaan-sampah-bank-sampah/keterangan-bank-sampah-terdekat/create'
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Nama Bank Sampah Terdekat</TableTh>
              <TableTh>Alamat</TableTh>
              <TableTh>Nama Tempat Maps</TableTh>
              <TableTh>Detail</TableTh>
              </TableTr>
          </TableThead>
          <TableTbody>
            {filteredData.map((item) => (
              <TableTr key={item.id}>
                <TableTd>{item.name}</TableTd>
                <TableTd>{item.alamat}</TableTd>
                <TableTd>{item.namaTempatMaps}</TableTd>
                <TableTd>
                  <Button onClick={() => router.push(`/admin/lingkungan/pengelolaan-sampah-bank-sampah/keterangan-bank-sampah-terdekat/${item.id}`)}>
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

export default KeteranganBankSampahTerdekat;
