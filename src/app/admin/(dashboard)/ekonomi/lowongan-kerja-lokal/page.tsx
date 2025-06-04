'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from '@mantine/core';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import HeaderSearch from '../../_com/header';
import JudulList from '../../_com/judulList';
import { useRouter } from 'next/navigation';

function LowonganKerjaLokal() {
  return (
    <Box>
      <HeaderSearch
        title='Lowongan Kerja Lokal'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
      />
      <ListLowonganKerjaLokal/>
    </Box>
  );
}

function ListLowonganKerjaLokal() {
  const router = useRouter();
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
            <TableTr>
              <TableTd>Karyawan</TableTd>
              <TableTd>BIBD</TableTd>
              <TableTd>Jalan In Aja</TableTd>
              <TableTd>
                <Button onClick={() => router.push('/admin/ekonomi/lowongan-kerja-lokal/detail')}>
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

export default LowonganKerjaLokal;
