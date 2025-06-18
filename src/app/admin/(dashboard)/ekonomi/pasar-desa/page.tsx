'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from '@mantine/core';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import HeaderSearch from '../../_com/header';
import JudulList from '../../_com/judulList';
import { useRouter } from 'next/navigation';

function PasarDesa() {
  return (
    <Box>
      <HeaderSearch
        title='Pasar Desa'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
      />
      <ListPasarDesa/>
    </Box>
  );
}

function ListPasarDesa() {
  const router = useRouter();
  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <JudulList
          title='List Pasar Desa'
          href='/admin/ekonomi/pasar-desa/create'
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Nama Produk</TableTh>
              <TableTh>Harga Produk</TableTh>
              <TableTh>Rating Produk</TableTh>
              <TableTh>Alamat Usaha</TableTh>
              <TableTh>Detail</TableTh>
              </TableTr>
          </TableThead>
          <TableTbody>
            <TableTr>
              <TableTd>Produk 1</TableTd>
              <TableTd>Harga Rp. 20.000</TableTd>
              <TableTd>Rating 5</TableTd>
              <TableTd>Jalan In Aja</TableTd>
              <TableTd>
                <Button onClick={() => router.push('/admin/ekonomi/pasar-desa/detail')}>
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

export default PasarDesa;
