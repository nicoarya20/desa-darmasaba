/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import penghargaanState from '@/app/admin/(dashboard)/_state/desa/penghargaan';
import colors from '@/con/colors';
import { Box, Button, Center, Image, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import JudulList from '../../_com/judulList';

function Penghargaan() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Penghargaan'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListPenghargaan search={search} />
    </Box>
  );
}

function ListPenghargaan({ search }: { search: string }) {
  const state = useProxy(penghargaanState)
  const router = useRouter()

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = state.findMany;

  useEffect(() => {
    load(page, 10)
  }, [])

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter(item => {
      const keyword = search.toLowerCase();
      return (
        item.name?.toLowerCase().includes(keyword) ||
        item.deskripsi?.toLowerCase().includes(keyword)
      );
    })
  }, [data, search]);

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
          <JudulList
            title='List Penghargaan'
            href='/admin/desa/penghargaan/create'
          />
          <Table striped withTableBorder withRowBorders>
            <TableThead>
              <TableTr>
                <TableTh>Nama</TableTh>
                <TableTh>Deskripsi</TableTh>
                <TableTh>Image</TableTh>
                <TableTh>Detail</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              <TableTr>
                <TableTd colSpan={4}>
                  <Text ta="center">Tidak ada data</Text>
                </TableTd>
              </TableTr>
            </TableTbody>
          </Table>
        </Paper>
      </Box>
    )
  }

  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'}>
        <JudulList
          title='List Penghargaan'
          href='/admin/desa/penghargaan/create'
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Nama</TableTh>
              <TableTh>Deskripsi</TableTh>
              <TableTh>Image</TableTh>
              <TableTh>Detail</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {filteredData.map((item) => (
              <TableTr key={item.id}>
                <TableTd>
                  <Box w={100}>
                    <Text lineClamp={1} truncate="end" fz={"sm"}>{item.name}</Text>
                  </Box>
                </TableTd>
                <TableTd>
                  <Box w={100}>
                    <Text lineClamp={1} truncate="end" fz={"sm"} dangerouslySetInnerHTML={{ __html: item.deskripsi }} />
                  </Box>
                </TableTd>
                <TableTd>
                  <Image w={100} src={item.image?.link} alt="gambar" />
                </TableTd>
                <TableTd>
                  <Text>
                    <Button onClick={() => router.push(`/admin/desa/penghargaan/${item.id}`)}>
                      <IconDeviceImac size={20} />
                    </Button>
                  </Text>
                </TableTd>
              </TableTr>
            ))}
          </TableTbody>
        </Table>
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
  );
}

export default Penghargaan;
