'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Title } from '@mantine/core';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import JudulListTab from '../../../_com/jusulListTab';

function PengangguranBerdasarkanUsia() {
  const router = useRouter();
  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
       <Stack gap={"xs"}>
       <JudulListTab
          title='Pengangguran Berdasarkan Usia'
          href='/admin/ekonomi/jumlah-penduduk-usia-kerja-yang-menganggur/pengangguran_berdasarkan_usia/create'
          placeholder='pencarian'
          searchIcon={<IconSearch size={20} />}
        />
        <Title order={4}>List Pengangguran Berdasarkan Usia</Title>
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Usia 18 - 25</TableTh>
              <TableTh>Usia 26 - 35</TableTh>
              <TableTh>Usia 36 - 45</TableTh>
              <TableTh>Detail</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            <TableTr>
              <TableTd>80</TableTd>
              <TableTd>40</TableTd>
              <TableTd>20</TableTd>
              <TableTd>
                <Button onClick={() => router.push('/admin/ekonomi/jumlah-penduduk-usia-kerja-yang-menganggur/pengangguran_berdasarkan_usia/detail')}>
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

export default PengangguranBerdasarkanUsia;
