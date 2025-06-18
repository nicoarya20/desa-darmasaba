'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from '@mantine/core';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import HeaderSearch from '../../_com/header';
import JudulList from '../../_com/judulList';
import { useRouter } from 'next/navigation';

function KontakDaurat() {
  return (
    <Box>
      <HeaderSearch
        title='Kontak Darurat'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
      />
      <ListKontakDaurat/>
    </Box>
  );
}

function ListKontakDaurat() {
  const router = useRouter();
  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <JudulList
          title='List Kontak Darurat'
          href='/admin/keamanan/kontak-darurat/create'
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Nama Kontak Darurat</TableTh>
              <TableTh>Nomor Kontak Darurat</TableTh>
              <TableTh>Deskripsi</TableTh>
              <TableTh>Detail</TableTh>
              </TableTr>
          </TableThead>
          <TableTbody>
            <TableTr>
              <TableTd>Kontak Darurat 1</TableTd>
              <TableTd>0896232831883</TableTd>
              <TableTd>Kontak Darurat 1</TableTd>
              <TableTd>
                <Button onClick={() => router.push('/admin/keamanan/kontak-darurat/detail')}>
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

export default KontakDaurat;
