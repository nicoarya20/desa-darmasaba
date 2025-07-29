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
import perpustakaanDigitalState from '../../../_state/pendidikan/perpustakaan-digital';



function DataPerpustakaan() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title='Data Perpustakaan'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListDataPerpustakaan search={search} />
    </Box>
  );
}

function ListDataPerpustakaan({ search }: { search: string }) {
  const listDataState = useProxy(perpustakaanDigitalState.dataPerpustakaan)
  const router = useRouter();

  useEffect(() => {
    perpustakaanDigitalState.dataPerpustakaan.findMany.load()
    listDataState.findMany.load()
  }, [])

  const filteredData = (listDataState.findMany.data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.judul.toLowerCase().includes(keyword) ||
      item.deskripsi.toLowerCase().includes(keyword) ||
      item.kategori.name.toLowerCase().includes(keyword)
    );
  });

  if (!listDataState.findMany.data) {
    return (
      <Stack py={10}>
        <Skeleton h={500} />
      </Stack>
    )
  }
  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p="md">
        <Stack>
        <JudulList
          title='List Data Perpustakaan'
          href='/admin/pendidikan/perpustakaan-digital/data-perpustakaan/create'
        />
          <Box style={{ overflowX: 'auto' }}>
            <Table striped withRowBorders withTableBorder style={{ minWidth: '700px' }}>
              <TableThead>
                <TableTr>
                  <TableTh>No</TableTh>
                  <TableTh>Judul</TableTh>
                  <TableTh>Kategori</TableTh>
                  <TableTh>Detail</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {filteredData.map((item, index) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Box w={100}>
                        <Text truncate="end" fz={"sm"}>{index + 1}</Text>
                      </Box>
                    </TableTd>
                    <TableTd>
                      <Text truncate="end" fz={"sm"}>{item.judul}</Text>
                    </TableTd>
                    <TableTd>
                      <Text truncate="end" fz={"sm"}>{item.kategori.name}</Text>
                    </TableTd>
                    <TableTd>
                      <Button onClick={() => router.push(`/admin/pendidikan/perpustakaan-digital/data-perpustakaan/${item.id}`)}>
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

export default DataPerpustakaan;
