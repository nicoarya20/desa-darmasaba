'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from '@mantine/core';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import HeaderSearch from '../../_com/header';
import JudulList from '../../_com/judulList';
import { useRouter } from 'next/navigation';

function InfoTeknologiTepatGuna() {
  return (
    <Box>
      <HeaderSearch
        title='Info Teknologi Tepat Guna'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
      />
      <ListInfoTeknologiTepatGuna/>
    </Box>
  );
}

function ListInfoTeknologiTepatGuna() {
  const router = useRouter();
  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <JudulList
          title='List Info Teknologi Tepat Guna'
          href='/admin/inovasi/info-teknologi-tepat-guna/create'
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Nama Info Teknologi Tepat Guna</TableTh>
              <TableTh>Image</TableTh>
              <TableTh>Deskripsi</TableTh>
              <TableTh>Detail</TableTh>
              </TableTr>
          </TableThead>
          <TableTbody>
            <TableTr>
              <TableTd>Info Teknologi Tepat Guna 1</TableTd>
              <TableTd>Image</TableTd>
              <TableTd>Deskripsi</TableTd>
              <TableTd>
                <Button onClick={() => router.push('/admin/inovasi/info-teknologi-tepat-guna/detail')}>
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

export default InfoTeknologiTepatGuna;
