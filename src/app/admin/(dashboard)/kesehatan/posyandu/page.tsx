'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from '@mantine/core';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import HeaderSearch from '../../_com/header';
import JudulList from '../../_com/judulList';
import { useRouter } from 'next/navigation';

function Posyandu() {
  return (
    <Box>
      <HeaderSearch
        title='Posyandu'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
      />
      <ListPosyandu/>
    </Box>
  );
}

function ListPosyandu() {
  const router = useRouter();
  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <JudulList
          title='List Posyandu'
          href='/admin/kesehatan/posyandu/create'
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Nama Posyandu</TableTh>
              <TableTh>Nomor Posyandu</TableTh>
              <TableTh>Deskripsi</TableTh>
              <TableTh>Detail</TableTh>
              </TableTr>
          </TableThead>
          <TableTbody>
            <TableTr>
              <TableTd>Posyandu 1</TableTd>
              <TableTd>0896232831883</TableTd>
              <TableTd>Posyandu 1</TableTd>
              <TableTd>
                <Button onClick={() => router.push('/admin/kesehatan/posyandu/detail')}>
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

export default Posyandu;
