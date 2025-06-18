'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from '@mantine/core';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import HeaderSearch from '../../_com/header';
import JudulList from '../../_com/judulList';
import { useRouter } from 'next/navigation';

function LaporanPublik() {
  return (
    <Box>
      <HeaderSearch
        title='Laporan Publik'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
      />
      <ListLaporanPublik/>
    </Box>
  );
}

function ListLaporanPublik() {
  const router = useRouter();
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
              <TableTh>Deskripsi</TableTh>
              <TableTh>Detail</TableTh>
              </TableTr>
          </TableThead>
          <TableTbody>
            <TableTr>
              <TableTd>Laporan Publik 1</TableTd>
              <TableTd>0896232831883</TableTd>
              <TableTd>Laporan Publik 1</TableTd>
              <TableTd>
                <Button onClick={() => router.push('/admin/keamanan/laporan-publik/detail')}>
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

export default LaporanPublik;
