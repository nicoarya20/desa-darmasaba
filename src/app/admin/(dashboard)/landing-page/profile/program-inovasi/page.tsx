'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import JudulList from '../../../_com/judulList';
import profileLandingPageState from '../../../_state/landing-page/profile';

function ProgramInovasi() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Program Inovasi'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListProgramInovasi search={search} />
    </Box>
  );
}

function ListProgramInovasi({ search }: { search: string }) {
  const stateProgramInovasi = useProxy(profileLandingPageState.programInovasi)
  const router = useRouter();

  useShallowEffect(() => {
    stateProgramInovasi.findMany.load()
  }, [])

  const filteredData = (stateProgramInovasi.findMany.data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(keyword) ||
      item.description?.toLowerCase().includes(keyword) ||
      item.link?.toLowerCase().includes(keyword)
    );
  });

  if (!stateProgramInovasi.findMany.data) {
    return (
      <Stack py={10}>
        <Skeleton h={500} />
      </Stack>
    )
  }

  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <JudulList
          title='List Program Inovasi'
          href='/admin/landing-page/profile/program-inovasi/create'
        />
        <Box style={{ overflowY: "auto" }}>
          <Table striped withTableBorder withRowBorders>
            <TableThead>
              <TableTr>
                <TableTh>Nama Program</TableTh>
                <TableTh>Deskripsi</TableTh>
                <TableTh>Link</TableTh>
                <TableTh>Detail</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.map((item) => (
                <TableTr key={item.id}>
                  <TableTd>{item.name}</TableTd>
                  <TableTd>{item.description}</TableTd>
                  <TableTd>{item.link}</TableTd>
                  <TableTd>
                    <Button onClick={() => router.push(`/admin/landing-page/profile/program-inovasi/${item.id}`)}>
                      <IconDeviceImac size={20} />
                    </Button>
                  </TableTd>
                </TableTr>
              ))}
            </TableTbody>
          </Table>
        </Box>
      </Paper>
    </Box>
  );
}

export default ProgramInovasi;
