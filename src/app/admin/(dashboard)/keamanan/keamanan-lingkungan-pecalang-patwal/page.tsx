'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import HeaderSearch from '../../_com/header';
import JudulList from '../../_com/judulList';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import keamananLingkunganState from '../../_state/keamanan/keamanan-lingkungan';
import { useShallowEffect } from '@mantine/hooks';
import { useState } from 'react';

function KeamananLingkungan() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Keamanan Lingkungan'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListKeamananLingkungan search={search}/>
    </Box>
  );
}

function ListKeamananLingkungan({ search }: { search: string }) {
  const keamananState = useProxy(keamananLingkunganState)
  const router = useRouter();

  useShallowEffect(() => {
    keamananState.findMany.load()
  }, [])

  const filteredData = (keamananState.findMany.data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(keyword) ||
      item.deskripsi.toLowerCase().includes(keyword)
    );
  });

  if (!keamananState.findMany.data) {
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
          title='List Keamanan Lingkungan'
          href='/admin/keamanan/keamanan-lingkungan-pecalang-patwal/create'
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Nama Keamanan Lingkungan</TableTh>
              <TableTh>Deskripsi</TableTh>
              <TableTh>Detail</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {filteredData.map((item) => (
              <TableTr key={item.id}>
                <TableTd>{item.name}</TableTd>
                <TableTd>
                  <Text fz={"md"} dangerouslySetInnerHTML={{ __html: item.deskripsi }} />
                </TableTd>
                <TableTd>
                  <Button onClick={() => router.push(`/admin/keamanan/keamanan-lingkungan-pecalang-patwal/${item.id}`)}>
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

export default KeamananLingkungan;
