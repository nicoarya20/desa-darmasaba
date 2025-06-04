'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from '@mantine/core';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import JudulListTab from '../../../_com/jusulListTab';

function Foto() {
  const router = useRouter();
  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <JudulListTab
          title='List Foto'
          href='/admin/desa/gallery/foto/create'
          placeholder='pencarian'
          searchIcon={<IconSearch size={16} />}
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Judul Foto</TableTh>
              <TableTh>Tanggal Foto</TableTh>
              <TableTh>Deskripsi Foto</TableTh>
              <TableTh>Detail</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            <TableTr>
              <TableTd>Foto 1</TableTd>
              <TableTd>2022-01-01</TableTd>
              <TableTd>Deskripsi Foto 1</TableTd>
              <TableTd>
                <Button onClick={() => router.push('/admin/desa/gallery/foto/detail')}>
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

export default Foto;
