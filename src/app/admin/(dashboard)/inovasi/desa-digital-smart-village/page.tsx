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
import desaDigitalState from '../../_state/ekonomi/desa-digital';

function DesaDigitalSmartVillage() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Desa Digital Smart Village'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListDesaDigitalSmartVillage search={search} />
    </Box>
  );
}

function ListDesaDigitalSmartVillage({ search }: { search: string }) {
  const state = useProxy(desaDigitalState)
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
          title='List Desa Digital Smart Village'
          href='/admin/inovasi/desa-digital-smart-village/create'
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Nama Inovasi</TableTh>
              <TableTh>Deskripsi Singkat Inovasi</TableTh>
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
                <Button onClick={() => router.push(`/admin/inovasi/desa-digital-smart-village/${item.id}`)}>
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

export default DesaDigitalSmartVillage;
