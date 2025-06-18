'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from '@mantine/core';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import HeaderSearch from '../../_com/header';
import JudulList from '../../_com/judulList';
import { useRouter } from 'next/navigation';

function DemografiPekerjaan() {
  return (
    <Box>
      <HeaderSearch
        title='Demografi Pekerjaan'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
      />
      <ListDemografiPekerjaan/>
    </Box>
  );
}

function ListDemografiPekerjaan() {
  const router = useRouter();
  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <JudulList
          title='List Demografi Pekerjaan'
          href='/admin/ekonomi/demografi-pekerjaan/create'
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Pekerjaan</TableTh>
              <TableTh>Jumlah Pekerja Laki - Laki</TableTh>
              <TableTh>Jumlah Pekerja Perempuan</TableTh>
              <TableTh>Detail</TableTh>
              </TableTr>
          </TableThead>
          <TableTbody>
            <TableTr>
              <TableTd>Karyawan</TableTd>
              <TableTd>200</TableTd>
              <TableTd>100</TableTd>
              <TableTd>
                <Button onClick={() => router.push('/admin/ekonomi/demografi-pekerjaan/detail')}>
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

export default DemografiPekerjaan;
