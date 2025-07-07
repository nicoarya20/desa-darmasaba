'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import JudulList from '../../_com/judulList';
import polsekTerdekat from '../../_state/keamanan/polsek-terdekat';
import { useState } from 'react';

function PolsekTerdekat() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Polsek Terdekat'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListPolsekTerdekat search={search}/>
    </Box>
  );
}

function ListPolsekTerdekat({ search }: { search: string }) {
  const polsekState = useProxy(polsekTerdekat)
  const router = useRouter();

  useShallowEffect(() => {
    polsekState.findMany.load()
  }, [])

  const filteredData = (polsekState.findMany.data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.nama.toLowerCase().includes(keyword) ||
      item.jarakKeDesa.toLowerCase().includes(keyword) ||
      item.alamat.toLowerCase().includes(keyword)
    );
  });

  if (!polsekState.findMany.data) {
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
          title='List Polsek Terdekat'
          href='/admin/keamanan/polsek-terdekat/create'
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Nama Polsek Terdekat</TableTh>
              <TableTh>Jarak Polsek</TableTh>
              <TableTh>Alamat</TableTh>
              <TableTh>Detail</TableTh>
              </TableTr>
          </TableThead>
          <TableTbody>
            {filteredData.map((item) => (
              <TableTr key={item.id}>
                <TableTd>{item.nama}</TableTd>
                <TableTd>{item.jarakKeDesa}</TableTd>
                <TableTd>{item.alamat}</TableTd>
                <TableTd>
                  <Button onClick={() => router.push(`/admin/keamanan/polsek-terdekat/${item.id}`)}>
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

export default PolsekTerdekat;
