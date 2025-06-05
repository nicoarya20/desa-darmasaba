'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from '@mantine/core';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import HeaderSearch from '../../_com/header';
import JudulList from '../../_com/judulList';
import { useRouter } from 'next/navigation';

function KolaborasiInovasi() {
  return (
    <Box>
      <HeaderSearch
        title='Kolaborasi Inovasi'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
      />
      <ListKolaborasiInovasi/>
    </Box>
  );
}

function ListKolaborasiInovasi() {
  const router = useRouter();
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
              <TableTh>Nama Kolaborasi Inovasi</TableTh>
              <TableTh>Image</TableTh>
              <TableTh>Deskripsi Singkat</TableTh>
              <TableTh>Detail</TableTh>
              </TableTr>
          </TableThead>
          <TableTbody>
            <TableTr>
              <TableTd>Kolaborasi Inovasi 1</TableTd>
              <TableTd>Image</TableTd>
              <TableTd>Deskripsi Singkat</TableTd>
              <TableTd>
                <Button onClick={() => router.push('/admin/inovasi/kolaborasi-inovasi/detail')}>
                  <IconDeviceImac size={20} />
                </Button>
              </TableTd>
            </TableTr>
          </TableTbody>
        </Table>  
      </Paper>
    </Box>
  );
}

export default KolaborasiInovasi;
