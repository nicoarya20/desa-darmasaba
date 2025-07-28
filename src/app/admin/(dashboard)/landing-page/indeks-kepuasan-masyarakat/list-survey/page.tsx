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



function ListSurveyLandingPage() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title='List Survey'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListSurvey search={search} />
    </Box>
  );
}

function ListSurvey({ search }: { search: string }) {
  const listState = useProxy(indeksKepuasanState.surveyState)
  const router = useRouter();
  useEffect(() => {
    listState.findMany.load()
  }, [])

  const filteredData = (listState.findMany.data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.title.toLowerCase().includes(keyword) ||
      item.totalRespondents.toString().includes(keyword) ||
      item.averageScore.toString().includes(keyword)
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
            title='List Survey'
            href='/admin/landing-page/indeks-kepuasan-masyarakat/list-survey/create'
          />
          <Box style={{ overflowX: 'auto' }}>
            <Table striped withRowBorders withTableBorder style={{ minWidth: '700px' }}>
              <TableThead>
                <TableTr>
                  <TableTh>Judul</TableTh>
                  <TableTh>Total Responden</TableTh>
                  <TableTh>Skor Rata-rata</TableTh>
                  <TableTh>Detail</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Box w={100}>
                        <Text truncate="end" fz={"sm"}>{item.title}</Text>
                      </Box>
                    </TableTd>
                    <TableTd>
                      <Text truncate="end" fz={"sm"}>{item.totalRespondents}</Text>
                    </TableTd>
                    <TableTd>
                      <Text truncate="end" fz={"sm"}>{item.averageScore}</Text>
                    </TableTd>
                    <TableTd>
                      <Button onClick={() => router.push(`/admin/landing-page/indeks-kepuasan-masyarakat/list-survey/${item.id}`)}>
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

export default ListSurveyLandingPage;
