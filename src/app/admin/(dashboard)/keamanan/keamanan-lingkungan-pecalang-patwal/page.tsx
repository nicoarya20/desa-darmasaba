'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from '@mantine/core';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import HeaderSearch from '../../_com/header';
import JudulList from '../../_com/judulList';
import { useRouter } from 'next/navigation';

function KeamananLingkungan() {
  return (
    <Box>
      <HeaderSearch
        title='Keamanan Lingkungan'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
      />
      <ListKeamananLingkungan/>
    </Box>
  );
}

function ListKeamananLingkungan() {
  const router = useRouter();
  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <JudulList
          title='List Keamanan Lingkungan'
          href='/admin/keamanan/keamanan-lingkungan-pecalang-patwal/create'
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Nama Keamanan Lingkungan</TableTh>
              <TableTh>Nomor Keamanan Lingkungan</TableTh>
              <TableTh>Deskripsi</TableTh>
              <TableTh>Detail</TableTh>
              </TableTr>
          </TableThead>
          <TableTbody>
            <TableTr>
              <TableTd>Keamanan Lingkungan 1</TableTd>
              <TableTd>0896232831883</TableTd>
              <TableTd>Keamanan Lingkungan 1</TableTd>
              <TableTd>
                <Button onClick={() => router.push('/admin/keamanan/keamanan-lingkungan-pecalang-patwal/detail')}>
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

export default KeamananLingkungan;
