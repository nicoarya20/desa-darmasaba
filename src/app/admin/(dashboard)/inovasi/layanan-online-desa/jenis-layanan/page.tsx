'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import JudulList from '../../../_com/judulList';
import layananonlineDesa from '../../../_state/inovasi/layanan-online-desa';


function JenisLayanan() {
  const [search, setSearch] = useState("")
  return (
    <Box>
      <HeaderSearch
        title='Jenis Layanan'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListJenisLayanan search={search} />
    </Box>
  );
}

function ListJenisLayanan({ search }: { search: string }) {
  const stateList = useProxy(layananonlineDesa.jenisLayanan)
  const router = useRouter()

  useShallowEffect(() => {
    stateList.findMany.load()
  }, [])


  const filteredData = (stateList.findMany.data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.nama.toLowerCase().includes(keyword)
    );
  });

  if (!stateList.findMany.data) {
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
          title='List Jenis Layanan'
          href='/admin/inovasi/layanan-online-desa/jenis-layanan/create'
        />
        <Table striped withTableBorder withRowBorders>
          <TableThead>
            <TableTr>
              <TableTh>Nama Jenis Layanan</TableTh>
              <TableTh>Deskripsi</TableTh>
              <TableTh>Detail</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {filteredData.map((item) => (
              <TableTr key={item.id}>
                <TableTd>{item.nama}</TableTd>
                <TableTd>{item.deskripsi}</TableTd>
                <TableTd>
                  <Button color="green" onClick={() => router.push(`/admin/inovasi/layanan-online-desa/jenis-layanan/${item.id}`)}>
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

export default JenisLayanan;
