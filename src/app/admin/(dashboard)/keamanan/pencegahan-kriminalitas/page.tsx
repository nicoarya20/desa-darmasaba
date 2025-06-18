'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from '@mantine/core';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import HeaderSearch from '../../_com/header';
import JudulList from '../../_com/judulList';
import { useRouter } from 'next/navigation';

function PencegahanKriminalitas() {
  return (
    <Box>
      <HeaderSearch
        title='Pencegahan Kriminalitas'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
      />
      <ListPencegahanKriminalitas/>
    </Box>
  );
}

function ListPencegahanKriminalitas() {
  const router = useRouter();
  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <JudulList
          title='List Pencegahan Kriminalitas'
          href='/admin/keamanan/pencegahan-kriminalitas/create'
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Nama Pencegahan Kriminalitas</TableTh>
              <TableTh>Nomor Pencegahan Kriminalitas</TableTh>
              <TableTh>Deskripsi</TableTh>
              <TableTh>Detail</TableTh>
              </TableTr>
          </TableThead>
          <TableTbody>
            <TableTr>
              <TableTd>Pencegahan Kriminalitas 1</TableTd>
              <TableTd>0896232831883</TableTd>
              <TableTd>Pencegahan Kriminalitas 1</TableTd>
              <TableTd>
                <Button onClick={() => router.push('/admin/keamanan/pencegahan-kriminalitas/detail')}>
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

export default PencegahanKriminalitas;
