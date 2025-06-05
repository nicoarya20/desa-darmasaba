'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from '@mantine/core';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import HeaderSearch from '../../_com/header';
import JudulList from '../../_com/judulList';
import { useRouter } from 'next/navigation';

function LayananOnlineDesa() {
  return (
    <Box>
      <HeaderSearch
        title='Layanan Online Desa'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
      />
      <ListLayananOnlineDesa/>
    </Box>
  );
}

function ListLayananOnlineDesa() {
  const router = useRouter();
  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <JudulList
          title='List Layanan Online Desa'
          href='/admin/inovasi/layanan-online-desa/create'
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Nama Layanan</TableTh>
              <TableTh>Deskripsi</TableTh>
              <TableTh>Detail</TableTh>
              </TableTr>
          </TableThead>
          <TableTbody>
            <TableTr>
              <TableTd>Layanan Online Desa 1</TableTd>
              <TableTd>Deskripsi Layanan Online Desa 1</TableTd>
              <TableTd>
                <Button onClick={() => router.push('/admin/inovasi/layanan-online-desa/detail')}>
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

export default LayananOnlineDesa;
