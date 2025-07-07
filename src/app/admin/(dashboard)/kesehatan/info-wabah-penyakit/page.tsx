'use client'
import colors from '@/con/colors';
import { Box, Button, Image, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import JudulList from '../../_com/judulList';
import HeaderSearch from '../../_com/header';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import infoWabahPenyakit from '../../_state/kesehatan/info-wabah-penyakit/infoWabahPenyakit';
import { useShallowEffect } from '@mantine/hooks';
import { useState } from 'react';

function InfoWabahPenyakit() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Info Wabah Penyakit'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListInfoWabahPenyakit search={search}/>
    </Box>
  );
}

function ListInfoWabahPenyakit({ search }: { search: string }) {
  const infoWabahPenyakitState = useProxy(infoWabahPenyakit)
  const router = useRouter()

  useShallowEffect(() => {
    infoWabahPenyakitState.findMany.load()
  }, [])

  const filteredData = (infoWabahPenyakitState.findMany.data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(keyword) ||
      item.deskripsiSingkat.toLowerCase().includes(keyword)
    );
  });

  if (!infoWabahPenyakitState.findMany.data) {
    return (
      <Box py={10}>
        <Skeleton h={500} />
      </Box>
    )
  }
  return (
    <Box py={10}>
    <Paper bg={colors['white-1']} p={'md'}>
      <Stack>
        <JudulList
          title='List Info Wabah Penyakit'
          href='/admin/kesehatan/info-wabah-penyakit/create'
        />
        <Box style={{ overflowX: "auto" }}>
          <Table striped withRowBorders withTableBorder style={{ minWidth: '700px' }}>
            <TableThead>
              <TableTr>
                <TableTh>Judul</TableTh>
                <TableTh>Deskripsi Singkat</TableTh>
                <TableTh>Image</TableTh>
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
                  <TableTd>
                    <Text truncate="end" fz={"sm"}>{item.deskripsiSingkat}</Text>
                  </TableTd>
                  <TableTd>
                    <Image w={100} src={item.image?.link} alt="image" />
                  </TableTd>
                  <TableTd>
                    <Button onClick={() => router.push(`/admin/kesehatan/info-wabah-penyakit/${item.id}`)}>
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

export default InfoWabahPenyakit;
