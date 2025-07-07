'use client'
import colors from '@/con/colors';
import { Box, Button, Grid, GridCol, Image, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconCircleDashedPlus, IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import stateDashboardBerita from '../../_state/desa/berita';


function Berita() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Berita'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListBerita search={search} />
    </Box>
  );
}

function ListBerita({ search }: { search: string }) {
  const beritaState = useProxy(stateDashboardBerita)
  const router = useRouter()

  useShallowEffect(() => {
    beritaState.berita.findMany.load()
  }, [])

  const filteredData = (beritaState.berita.findMany.data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.judul.toLowerCase().includes(keyword) ||
      item.kategoriBerita?.name.toLowerCase().includes(keyword)
    );
  });


  if (!beritaState.berita.findMany.data) {
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
          <Grid>
            <GridCol span={{ base: 12, md: 11 }}>
              <Text fz={"xl"} fw={"bold"}>List Berita</Text>
            </GridCol>
            <GridCol span={{ base: 12, md: 1 }}>
              <Button onClick={() => router.push("/admin/desa/berita/create")} bg={colors['blue-button']}>
                <IconCircleDashedPlus size={25} />
              </Button>
            </GridCol>
          </Grid>
          <Box style={{ overflowX: "auto" }}>
            <Table striped withRowBorders withTableBorder style={{ minWidth: '700px' }}>
              <TableThead>
                <TableTr>
                  <TableTh w={250}>Judul</TableTh>
                  <TableTh w={250}>Kategori</TableTh>
                  <TableTh w={250}>Image</TableTh>
                  <TableTh w={200}>Detail</TableTh>

                </TableTr>
              </TableThead>
              <TableTbody >
                {filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd >
                      <Box w={100}>
                        <Text truncate="end" fz={"sm"}>{item.judul}</Text>
                      </Box>
                    </TableTd>
                    <TableTd >{item.kategoriBerita?.name}</TableTd>
                    <TableTd>
                      <Image w={100} src={item.image?.link} alt="gambar" />
                    </TableTd>
                    <TableTd>
                      <Button bg={"green"} onClick={() => router.push(`/admin/desa/berita/${item.id}`)}>
                        <IconDeviceImacCog size={25} />
                      </Button>
                    </TableTd>

                  </TableTr>
                ))}
              </TableTbody>
            </Table> </Box>
        </Stack>
      </Paper>

    </Box>
  )
}

export default Berita;
