'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Pagination } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import JudulList from '../../_com/judulList';
import desaDigitalState from '../../_state/inovasi/desa-digital';

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

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = state.findMany

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
                  <Text lineClamp={1} truncate="end" fz={"sm"} dangerouslySetInnerHTML={{ __html: item.deskripsi }} />
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
      <Center>
        <Pagination
          value={page}
          onChange={(newPage) => load(newPage)} // ini penting!
          total={totalPages}
          mt="md"
          mb="md"
        />
      </Center>
    </Box>
  );
}

export default DesaDigitalSmartVillage;
