'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import JudulList from '../../_com/judulList';
import infoTeknoState from '../../_state/inovasi/info-tekno';

function InfoTeknologiTepatGuna() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Info Teknologi Tepat Guna'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListInfoTeknologiTepatGuna search={search} />
    </Box>
  );
}

function ListInfoTeknologiTepatGuna({ search }: { search: string }) {
  const state = useProxy(infoTeknoState)
  const router = useRouter()
  useShallowEffect(() => {
    state.findMany.load()
  }, [])

  const filteredData = (state.findMany.data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(keyword) ||
      item.deskripsi.toLowerCase().includes(keyword)
    );
  });

  if (!state.findMany.data) {
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
          title='List Info Teknologi Tepat Guna'
          href='/admin/inovasi/info-teknologi-tepat-guna/create'
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Nama Info Teknologi Tepat Guna</TableTh>
              <TableTh>Deskripsi Singkat Info Teknologi Tepat Guna</TableTh>
              <TableTh>Detail</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {filteredData.map((item) => (
              <TableTr key={item.id}>
                <TableTd>{item.name}</TableTd>
                <TableTd>
                  <Text truncate="end" fz={"sm"} dangerouslySetInnerHTML={{ __html: item.deskripsi }} />
                </TableTd>
              <TableTd>
                <Button onClick={() => router.push(`/admin/inovasi/info-teknologi-tepat-guna/${item.id}`)}>
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

export default InfoTeknologiTepatGuna;
