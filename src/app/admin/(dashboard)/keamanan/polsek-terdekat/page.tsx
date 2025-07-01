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

function PolsekTerdekat() {
  return (
    <Box>
      <HeaderSearch
        title='Polsek Terdekat'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
      />
      <ListPolsekTerdekat/>
    </Box>
  );
}

function ListPolsekTerdekat() {
  const polsekState = useProxy(polsekTerdekat)
  const router = useRouter();

  useShallowEffect(() => {
    polsekState.findMany.load()
  }, [])

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
            {polsekState.findMany.data?.map((item) => (
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
