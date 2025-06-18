'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from '@mantine/core';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import HeaderSearch from '../../_com/header';
import JudulList from '../../_com/judulList';
import { useRouter } from 'next/navigation';

function JumlahPendudukMiskin() {
  return (
    <Box>
      <HeaderSearch
        title='Jumlah Penduduk Miskin'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
      />
      <ListJumlahPendudukMiskin/>
    </Box>
  );
}

function ListJumlahPendudukMiskin() {
  const router = useRouter();
  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <JudulList
          title='List Jumlah Penduduk Miskin'
          href='/admin/ekonomi/jumlah-penduduk-miskin-2024-2025/create'
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Tahun</TableTh>
              <TableTh>Jumlah Penduduk Miskin</TableTh>
              <TableTh>Detail</TableTh>
              </TableTr>
          </TableThead>
          <TableTbody>
            <TableTr>
              <TableTd>2024</TableTd>
              <TableTd>100</TableTd>
              <TableTd>
                <Button onClick={() => router.push('/admin/ekonomi/jumlah-penduduk-miskin-2024-2025/detail')}>
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

export default JumlahPendudukMiskin;
