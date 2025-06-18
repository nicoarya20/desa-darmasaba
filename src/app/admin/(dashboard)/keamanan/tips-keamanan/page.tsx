'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from '@mantine/core';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import HeaderSearch from '../../_com/header';
import JudulList from '../../_com/judulList';
import { useRouter } from 'next/navigation';

function TipsKeamanan() {
  return (
    <Box>
      <HeaderSearch
        title='Tips Keamanan'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
      />
      <ListTipsKeamanan/>
    </Box>
  );
}

function ListTipsKeamanan() {
  const router = useRouter();
  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <JudulList
          title='List Tips Keamanan'
          href='/admin/keamanan/tips-keamanan/create'
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Nama Tips Keamanan</TableTh>
              <TableTh>Nomor Tips Keamanan</TableTh>
              <TableTh>Deskripsi</TableTh>
              <TableTh>Detail</TableTh>
              </TableTr>
          </TableThead>
          <TableTbody>
            <TableTr>
              <TableTd>Tips Keamanan 1</TableTd>
              <TableTd>0896232831883</TableTd>
              <TableTd>Tips Keamanan 1</TableTd>
              <TableTd>
                <Button onClick={() => router.push('/admin/keamanan/tips-keamanan/detail')}>
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

export default TipsKeamanan;
