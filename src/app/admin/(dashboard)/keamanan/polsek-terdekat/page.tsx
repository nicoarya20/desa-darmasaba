'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from '@mantine/core';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import HeaderSearch from '../../_com/header';
import JudulList from '../../_com/judulList';
import { useRouter } from 'next/navigation';

function PolsekTerdekat() {
  return (
    <Box>
      <HeaderSearch
        title='Polsek Terdekat'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
      />
      <ListPolsekTerdekat/>
    </Box>
  );
}

function ListPolsekTerdekat() {
  const router = useRouter();
  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <JudulList
          title='List Polsek Terdekat'
          href='/admin/keamanan/polsek-terdekat/create'
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Nama Polsek Terdekat</TableTh>
              <TableTh>Nomor Polsek Terdekat</TableTh>
              <TableTh>Deskripsi</TableTh>
              <TableTh>Detail</TableTh>
              </TableTr>
          </TableThead>
          <TableTbody>
            <TableTr>
              <TableTd>Polsek Terdekat 1</TableTd>
              <TableTd>0896232831883</TableTd>
              <TableTd>Polsek Terdekat 1</TableTd>
              <TableTd>
                <Button onClick={() => router.push('/admin/keamanan/polsek-terdekat/detail')}>
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

export default PolsekTerdekat;
