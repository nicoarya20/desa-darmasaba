'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import ajukanIdeInovatifState from '../../_state/inovasi/ajukan-ide-inovatif';

function AjukanIdeInovatif() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Ajukan Ide Inovatif'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListAjukanIdeInovatif search={search} />
    </Box>
  );
}

function ListAjukanIdeInovatif({ search }: { search: string }) {
  const state = useProxy(ajukanIdeInovatifState)
  const router = useRouter()
  useShallowEffect(() => {
    state.findMany.load()
  }, [])

  const filteredData = (state.findMany.data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(keyword) ||
      item.deskripsi.toLowerCase().includes(keyword) ||
      item.alamat.toLowerCase().includes(keyword) ||
      item.namaIde.toLowerCase().includes(keyword) ||
      item.masalah.toLowerCase().includes(keyword) ||
      item.benefit.toLowerCase().includes(keyword)
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
        <Title mb={10} order={3}>List Ajukan Ide Inovatif</Title>
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Nama</TableTh>
              <TableTh>Alamat</TableTh>
              <TableTh>Nama Ide Inovatif</TableTh>
              <TableTh>Detail</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {filteredData.map((item) => (
              <TableTr key={item.id}>
                <TableTd>{item.name}</TableTd>
                <TableTd>
                  <Text truncate="end" fz={"sm"} dangerouslySetInnerHTML={{ __html: item.alamat }} />
                </TableTd>
                <TableTd>
                  <Text truncate="end" fz={"sm"} dangerouslySetInnerHTML={{ __html: item.namaIde }} />
                </TableTd>
              <TableTd>
                <Button onClick={() => router.push(`/admin/inovasi/ajukan-ide-inovatif/${item.id}`)}>
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

export default AjukanIdeInovatif;
