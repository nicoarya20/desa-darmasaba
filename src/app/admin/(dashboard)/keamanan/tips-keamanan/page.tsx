'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import HeaderSearch from '../../_com/header';
import JudulList from '../../_com/judulList';
import { useRouter } from 'next/navigation';
import tipsKeamananState from '../../_state/keamanan/tips-keamanan';
import { useProxy } from 'valtio/utils';
import { useShallowEffect } from '@mantine/hooks';
import { useState } from 'react';

function TipsKeamanan() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Tips Keamanan'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListTipsKeamanan search={search}/>
    </Box>
  );
}

function ListTipsKeamanan({ search }: { search: string }) {
  const stateKeamanan = useProxy(tipsKeamananState)
  const router = useRouter();

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = stateKeamanan.findMany

  useShallowEffect(() => {
    load(page, 10, search)
  }, [page, search])

  const filteredData = data || []

  if (loading || !data) {
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
          title='List Tips Keamanan'
          href='/admin/keamanan/tips-keamanan/create'
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Nama Tips Keamanan</TableTh>
              <TableTh>Deskripsi</TableTh>
              <TableTh>Detail</TableTh>
              </TableTr>
          </TableThead>
          <TableTbody>
            {filteredData.map((item) => (
              <TableTr key={item.id}>
                <TableTd>
                  <Box w={150}>
                    <Text fz={"md"} truncate={"end"} lineClamp={1}>{item.judul}</Text>
                  </Box>
                </TableTd>
                <TableTd>
                  <Box w={250}>
                    <Text fz={"md"} truncate={"end"} lineClamp={1} dangerouslySetInnerHTML={{__html: item.deskripsi}} />
                  </Box>
                </TableTd>
                <TableTd>
                  <Button onClick={() => router.push(`/admin/keamanan/tips-keamanan/${item.id}`)}>
                    <IconDeviceImac size={20} />
                </Button>
              </TableTd>
            </TableTr>
          ))}
          </TableTbody>
        </Table>  
      </Paper>
      <Center>
        <Pagination
          value={page}
          onChange={(newPage) => load(newPage)}
          total={totalPages}
          my="md"
        />
      </Center>
    </Box>
  );
}

export default TipsKeamanan;
