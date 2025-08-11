'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Grid, GridCol, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconCircleDashedPlus, IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import stateDesaPengumuman from '../../../_state/desa/pengumuman';


function Pengumuman() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='List Pengumuman'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListPengumuman search={search} />
    </Box>
  );
}

function ListPengumuman({ search }: { search: string }) {
  const pengumumanState = useProxy(stateDesaPengumuman)
  const router = useRouter()
  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = pengumumanState.pengumuman.findMany;

  useShallowEffect(() => {
    load(page, 10, search)
  }, [page, search])

  const filteredData = (data || [])

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
          <Grid>
            <GridCol span={{ base: 12, md: 11 }}>
              <Text fz={"xl"} fw={"bold"}>List Pengumuman</Text>
            </GridCol>
            <GridCol span={{ base: 12, md: 1 }}>
              <Button onClick={() => router.push("/admin/desa/pengumuman/list-pengumuman/create")} bg={colors['blue-button']}>
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
                  <TableTd >{item.CategoryPengumuman?.name}</TableTd>
                  <TableTd>
                    <Button bg={"green"} onClick={() => router.push(`/admin/desa/pengumuman/list-pengumuman/${item.id}`)}>
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
          mt="md"
          mb="md"
        />
      </Center>
    </Box>
  )
}

export default Pengumuman;
