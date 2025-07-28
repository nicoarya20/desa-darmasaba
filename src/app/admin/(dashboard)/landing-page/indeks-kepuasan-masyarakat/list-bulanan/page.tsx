/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import indeksKepuasanState from '../../../_state/landing-page/indeks-kepuasan-masyarakat';
import JudulList from '../../../_com/judulList';



function ListBulananLandingPage() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title='List Bulanan'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListBUlanan search={search} />
    </Box>
  );
}

function ListBUlanan({ search }: { search: string }) {
  const listState = useProxy(indeksKepuasanState.monthlyStatState)
  const router = useRouter();
  useEffect(() => {
    listState.findMany.load()
  }, [])

  const filteredData = (listState.findMany.data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.month.toLowerCase().includes(keyword) ||
      item.respondentsCount.toString().includes(keyword)
    );
  });

  if (!listState.findMany.data) {
    return (
      <Stack py={10}>
        <Skeleton h={500} />
      </Stack>
    )
  }

  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <Stack>
          <JudulList
            title='List Bulanan'
            href='/admin/landing-page/indeks-kepuasan-masyarakat/list-bulanan/create'
          />
          <Box style={{ overflowX: 'auto' }}>
            <Table striped withRowBorders withTableBorder style={{ minWidth: '700px' }}>
              <TableThead>
                <TableTr>
                  <TableTh>Bulan</TableTh>
                  <TableTh>Total Responden</TableTh>
                  <TableTh>Detail</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Box w={100}>
                        <Text truncate="end" fz={"sm"}>{item.month}</Text>
                      </Box>
                    </TableTd>
                    <TableTd>
                      <Text truncate="end" fz={"sm"}>{item.respondentsCount}</Text>
                    </TableTd>
                    <TableTd>
                      <Button onClick={() => router.push(`/admin/landing-page/indeks-kepuasan-masyarakat/list-bulanan/${item.id}`)}>
                        <IconDeviceImacCog size={25} />
                      </Button>
                    </TableTd>
                  </TableTr>
                ))}
              </TableTbody>
            </Table>
          </Box>
        </Stack>
      </Paper>
    </Box>
  )
}

export default ListBulananLandingPage;
