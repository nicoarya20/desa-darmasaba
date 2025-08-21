/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import JudulList from '../../../_com/judulList';
import prestasiState from '../../../_state/landing-page/prestasi-desa';


function ListPrestasiDesa() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title='List Prestasi Desa'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListPrestasi search={search} />
    </Box>
  );
}

function ListPrestasi({ search }: { search: string }) {
  const listState = useProxy(prestasiState.prestasiDesa)
  const router = useRouter();

  const{
    data,
    page,
    totalPages,
    loading,
    load,
  } = listState.findMany

  useEffect(() => {
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
        <Stack>
          <JudulList
            title='List Prestasi Desa'
            href='/admin/landing-page/prestasi-desa/list-prestasi-desa/create'
          />
          <Box style={{ overflowX: 'auto' }}>
            <Table striped withRowBorders withTableBorder style={{ minWidth: '700px' }}>
              <TableThead>
                <TableTr>
                  <TableTh>Nama Prestasi Desa</TableTh>
                  <TableTh>Deskripsi Prestasi Desa</TableTh>
                  <TableTh>Kategori Prestasi Desa</TableTh>
                  <TableTh>Detail</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Box w={100}>
                        <Text truncate="end" fz={"sm"}>{item.name}</Text>
                      </Box>
                    </TableTd>
                    <TableTd >
                      <Box w={150}>
                        <Text truncate="end" fz={"sm"} dangerouslySetInnerHTML={{ __html: item.deskripsi }} />
                      </Box>
                    </TableTd>
                    <TableTd>{item.kategori?.name}</TableTd>
                    <TableTd>
                      <Button onClick={() => router.push(`/admin/landing-page/prestasi-desa/list-prestasi-desa/${item.id}`)}>
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
      <Center>
        <Pagination
          value={page}
          onChange={(newPage) => load(newPage)}
          total={totalPages}
          my={"md"}
        />
      </Center>
    </Box>
  )
}

export default ListPrestasiDesa;
