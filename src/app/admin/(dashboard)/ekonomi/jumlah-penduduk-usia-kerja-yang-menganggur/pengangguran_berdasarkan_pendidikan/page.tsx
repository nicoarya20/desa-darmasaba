'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Title } from '@mantine/core';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import JudulListTab from '../../../_com/jusulListTab';

function PengangguranBerdasarkanPendidikan() {
  const router = useRouter();
  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
       <Stack gap={"xs"}>
       <JudulListTab
          title='Pengangguran Berdasarkan Pendidikan'
          href='/admin/ekonomi/jumlah-penduduk-usia-kerja-yang-menganggur/pengangguran_berdasarkan_pendidikan/create'
          placeholder='pencarian'
          searchIcon={<IconSearch size={20} />}
        />
        <Title order={4}>List Pengangguran Berdasarkan Pendidikan</Title>
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Pendidikan SD</TableTh>
              <TableTh>Pendidikan SMP</TableTh>
              <TableTh>Pendidikan SMA</TableTh>
              <TableTh>Detail</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            <TableTr>
              <TableTd>80</TableTd>
              <TableTd>40</TableTd>
              <TableTd>20</TableTd>
              <TableTd>
                <Button onClick={() => router.push('/admin/ekonomi/jumlah-penduduk-usia-kerja-yang-menganggur/pengangguran_berdasarkan_pendidikan/detail')}>
                  <IconDeviceImac size={20} />
                </Button>
              </TableTd>
            </TableTr>
          </TableTbody>
        </Table>
       </Stack>
      </Paper>
    </Box>
  );
}

export default PengangguranBerdasarkanPendidikan;
