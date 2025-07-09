'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import JudulListTab from '../../../_com/jusulListTab';
import jumlahPengangguranState from '../../../_state/ekonomi/jumlah-pengangguran';

function DetailDataPengangguran() {
  return (
    <Box>
      <Stack gap={"xs"}>
        <Title order={3}>Detail Data Pengangguran</Title>
        <ListDetailDataPengangguran/>
      </Stack>
    </Box>
  );
}

function ListDetailDataPengangguran() {
  const stateDetail = useProxy(jumlahPengangguranState.jumlahPengangguran)
  const router = useRouter();
  const [search, setSearch] = useState("")

  useShallowEffect(() => {
    stateDetail.findMany.load()
  }, [])

  const filteredData = (stateDetail.findMany.data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.month.toLowerCase().includes(keyword) ||
      item.year.toString().toLowerCase().includes(keyword)
    );
  });

  if (!stateDetail.findMany.data) {
    return (
      <Box>
        <Skeleton h={500} />
      </Box>
    )
  }
  return (
    <Box>
      <Paper bg={colors['white-1']} p={'md'}>
        <JudulListTab
          title='List Detail Data Pengangguran'
          href='/admin/ekonomi/jumlah-pengangguran/detail-data-pengangguran/create'
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          placeholder='pencarian'
          searchIcon={<IconSearch size={16} />}
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Bulan</TableTh>
              <TableTh>Terdidik</TableTh>
              <TableTh>Tidak Terdidik</TableTh>
              <TableTh>Detail</TableTh>
              </TableTr>
          </TableThead>
          <TableTbody>
            {filteredData.map((item) => (
              <TableTr key={item.id}>
                <TableTd>{item.month}</TableTd>
                <TableTd>{item.educatedUnemployment}</TableTd>
                <TableTd>{item.uneducatedUnemployment}</TableTd>
                <TableTd>
                  <Button onClick={() => router.push(`/admin/ekonomi/jumlah-pengangguran/detail-data-pengangguran/${item.id}`)}>
                  <IconDeviceImac size={20} />
                </Button>
              </TableTd>
            </TableTr>
          ))}
          </TableTbody>
        </Table>  
      </Paper>
    </Box>
  );
}

export default DetailDataPengangguran;
