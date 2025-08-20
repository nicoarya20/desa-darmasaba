'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import HeaderSearch from '../../_com/header';
import JudulList from '../../_com/judulList';
import { useRouter } from 'next/navigation';
import lowonganKerjaState from '../../_state/ekonomi/lowongan-kerja';
import { useProxy } from 'valtio/utils';
import { useShallowEffect } from '@mantine/hooks';
import { useState } from 'react';

function LowonganKerjaLokal() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Lowongan Kerja Lokal'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListLowonganKerjaLokal search={search} />
    </Box>
  );
}

function ListLowonganKerjaLokal({ search }: { search: string }) {
  const lowonganState = useProxy(lowonganKerjaState)
  const router = useRouter();

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = lowonganState.findMany

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
          title='List Lowongan Kerja Lokal'
          href='/admin/ekonomi/lowongan-kerja-lokal/create'
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Pekerjaan</TableTh>
              <TableTh>Nama Perusahaan</TableTh>
              <TableTh>Lokasi</TableTh>
              <TableTh>Detail</TableTh>
              </TableTr>
          </TableThead>
          <TableTbody>
            {filteredData.map((item) => (
              <TableTr key={item.id}>
                <TableTd>
                  <Text fz={"md"}>{item.posisi}</Text>
                </TableTd>
                <TableTd>
                  <Text fz={"md"}>{item.namaPerusahaan}</Text>
                </TableTd>
                <TableTd>
                  <Text fz={"md"}>{item.lokasi}</Text>
                </TableTd>
                <TableTd>
                  <Button onClick={() => router.push(`/admin/ekonomi/lowongan-kerja-lokal/${item.id}`)}>
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

export default LowonganKerjaLokal;
