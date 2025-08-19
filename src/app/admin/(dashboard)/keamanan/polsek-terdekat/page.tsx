'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import JudulList from '../../_com/judulList';
import polsekTerdekat from '../../_state/keamanan/polsek-terdekat';
import { useState } from 'react';

function PolsekTerdekat() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Polsek Terdekat'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListPolsekTerdekat search={search} />
    </Box>
  );
}

function ListPolsekTerdekat({ search }: { search: string }) {
  const polsekState = useProxy(polsekTerdekat)
  const router = useRouter();

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = polsekState.findMany;

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
          title='List Polsek Terdekat'
          href='/admin/keamanan/polsek-terdekat/create'
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Nama Polsek Terdekat</TableTh>
              <TableTh>Jarak Polsek</TableTh>
              <TableTh>Alamat</TableTh>
              <TableTh>Detail</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {filteredData.map((item) => (
              <TableTr key={item.id}>
                <TableTd>
                  <Box w={180}>
                    <Text fz='md' truncate={"end"} lineClamp={1}>{item.nama}</Text>
                  </Box>
                </TableTd>
                <TableTd>
                  <Box w={180}>
                    <Text fz='md' truncate={"end"} lineClamp={1}>{item.jarakKeDesa}</Text>
                  </Box>
                </TableTd>
                <TableTd>
                  <Box w={250}>
                    <Text fz='md' truncate={"end"} lineClamp={1}>{item.alamat}</Text>
                  </Box>
                </TableTd>
                <TableTd>
                  <Button onClick={() => router.push(`/admin/keamanan/polsek-terdekat/${item.id}`)}>
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

export default PolsekTerdekat;
