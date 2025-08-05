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
import potensiDesaState from '../../../_state/desa/potensi';



function Potensi() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Posisi Organisasi'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListPotensi search={search} />
    </Box>
  );
}

function ListPotensi({ search }: { search: string }) {
  const potensiState = useProxy(potensiDesaState)
  const router = useRouter()

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = potensiState.potensiDesa.findMany;

  useEffect(() => {
    potensiState.kategoriPotensi.findMany.load()
    load(page, 10)
  }, [])

  const filteredData = (potensiState.potensiDesa.findMany.data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(keyword) ||
      item.kategori?.nama.toLowerCase().includes(keyword) ||
      item.deskripsi.toLowerCase().includes(keyword)
    );
  });

  // Handle loading state
  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={300} />
      </Stack>
    );
  }

  if (data.length === 0) {
    return (
      <Box py={10}>
        <Paper bg={colors['white-1']} p={'md'}>
          <Stack>
            <JudulList
              title='List Potensi'
              href='/admin/desa/potensi/list-potensi/create'
            />
            <Box style={{ overflowX: "auto" }}>
              <Table striped withRowBorders withTableBorder style={{ minWidth: '700px' }}>
                <TableThead>
                  <TableTr>
                    <TableTh>Judul</TableTh>
                    <TableTh>Kategori</TableTh>
                    <TableTh>Deskripsi</TableTh>
                    <TableTh>Detail</TableTh>
                  </TableTr>
                </TableThead>
                <TableTbody>
                  <TableTr>
                    <TableTd colSpan={4}>Tidak Ada Data</TableTd>
                  </TableTr>
                </TableTbody>
              </Table>
            </Box>
          </Stack>
        </Paper>
      </Box>
    )
  }

  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <Stack>
          <JudulList
            title='List Potensi'
            href='/admin/desa/potensi/list-potensi/create'
          />
          <Box style={{ overflowX: "auto" }}>
            <Table striped withRowBorders withTableBorder style={{ minWidth: '700px' }}>
              <TableThead>
                <TableTr>
                  <TableTh>Judul</TableTh>
                  <TableTh>Kategori</TableTh>
                  <TableTh>Deskripsi</TableTh>
                  <TableTh>Detail</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Box w={100}>
                        <Text truncate="end" fz={"sm"}>{item.name}</Text>
                      </Box></TableTd>
                    <TableTd>{item.kategori?.nama}</TableTd>
                    <TableTd>
                      <Box w={300}>
                        <Text truncate="end" fz={"sm"} dangerouslySetInnerHTML={{ __html: item.deskripsi }} />
                      </Box>
                    </TableTd>
                    <TableTd>
                      <Button onClick={() => router.push(`/admin/desa/potensi/list-potensi/${item.id}`)}>
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
          onChange={(newPage) => {
            load(newPage, 10);
            window.scrollTo(0, 0);
          }}
          total={totalPages}
          mt="md"
          mb="md"
        />
      </Center>
    </Box>
  )
}

export default Potensi;
