/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import JudulList from '../../../_com/judulList';
import indeksKepuasanState from '../../../_state/landing-page/indeks-kepuasan-masyarakat';



function ListGenderStat() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title='Gender Stat'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListGender search={search} />
    </Box>
  );
}

function ListGender({ search }: { search: string }) {
  const listState = useProxy(indeksKepuasanState.genderStatState)
  const router = useRouter();
  useEffect(() => {
    listState.findMany.load()
  }, [])

  const filteredData = (listState.findMany.data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.laki.toString().includes(keyword) ||
      item.perempuan.toString().includes(keyword)
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
            title='List Gender Stat'
            href='/admin/landing-page/indeks-kepuasan-masyarakat/list-gender-stat/create'
          />
          <Box style={{ overflowX: 'auto' }}>
            <Table striped withRowBorders withTableBorder style={{ minWidth: '700px' }}>
              <TableThead>
                <TableTr>
                  <TableTh>Laki Laki</TableTh>
                  <TableTh>Perempuan</TableTh>
                  <TableTh>Persentase Laki Laki</TableTh>
                  <TableTh>Persentase Perempuan</TableTh>
                  <TableTh>Detail</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Box w={100}>
                        <Text truncate="end" fz={"sm"}>{item.laki}</Text>
                      </Box>
                    </TableTd>
                    <TableTd>
                      <Text truncate="end" fz={"sm"}>{item.perempuan}</Text>
                    </TableTd>
                    <TableTd>
                      <Text truncate="end" fz={"sm"}>{item.percentLaki}%</Text>
                    </TableTd>
                    <TableTd>
                      <Text truncate="end" fz={"sm"}>{item.percentPerempuan}%</Text>
                    </TableTd>
                    <TableTd>
                      <Button onClick={() => router.push(`/admin/landing-page/indeks-kepuasan-masyarakat/list-gender-stat/${item.id}`)}>
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

export default ListGenderStat;
