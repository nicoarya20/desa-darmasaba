'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from '@mantine/core';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import HeaderSearch from '../../_com/header';
import JudulList from '../../_com/judulList';
import { useRouter } from 'next/navigation';

function JumlahPengangguran() {
  return (
    <Box>
      <HeaderSearch
        title='Jumlah Pengangguran 2024-2025'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
      />
      <ListJumlahPengangguran/>
    </Box>
  );
}

function ListJumlahPengangguran() {
  const router = useRouter();
  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <JudulList
          title='List Jumlah Pengangguran 2024-2025'
          href='/admin/ekonomi/jumlah-pengangguran-2024-2025/create'
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Pengangguran Terdidik</TableTh>
              <TableTh>Usia Produktif</TableTh>
              <TableTh>Sedang Mencari Kerja</TableTh>
              <TableTh>Detail</TableTh>
              </TableTr>
          </TableThead>
          <TableTbody>
            <TableTr>
              <TableTd>100</TableTd>
              <TableTd>200</TableTd>
              <TableTd>300</TableTd>
              <TableTd>
                <Button onClick={() => router.push('/admin/ekonomi/jumlah-pengangguran-2024-2025/detail')}>
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

export default JumlahPengangguran;
