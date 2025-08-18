'use client'
import colors from '@/con/colors';
import { Box, Button, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import JudulList from '../../../_com/judulList';
import fasilitasKesehatanState from '../../../_state/kesehatan/data_kesehatan_warga/fasilitasKesehatan';


function FasilitasKesehatan() {
  const [search, setSearch] = useState("");
  // const router = useRouter();
  return (
    <Box>
      {/* <Grid>
        <GridCol span={12}>
          <HeaderSearch
            title='Fasilitas Kesehatan'
            placeholder='pencarian'
            searchIcon={<IconSearch size={20} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
          />
        </GridCol>
        <GridCol span={12}>
          <Flex gap={"xs"}>
            <Button color={colors['blue-button']} onClick={() => router.push(`/admin/kesehatan/data-kesehatan-warga/fasilitas_kesehatan/dokter-tenaga-medis`)}>
              <IconList size={20} /> List Dokter
            </Button>
            <Button color={colors['blue-button']} onClick={() => router.push(`/admin/kesehatan/data-kesehatan-warga/fasilitas_kesehatan/tarif-layanan`)}>
              <IconList size={20} /> List Layanan
            </Button>
          </Flex>
        </GridCol>
      </Grid> */}
      <HeaderSearch
        title='Fasilitas Kesehatan'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListFasilitasKesehatan search={search} />
    </Box>
  );
}

function ListFasilitasKesehatan({ search }: { search: string }) {
  const stateFasilitasKesehatan = useProxy(fasilitasKesehatanState.fasilitasKesehatan)
  const router = useRouter();

  useShallowEffect(() => {
    stateFasilitasKesehatan.findMany.load()
  }, [])

  const filteredData = (stateFasilitasKesehatan.findMany.data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(keyword) ||
      item.informasiumum.alamat.toLowerCase().includes(keyword) ||
      item.informasiumum.jamOperasional.toLowerCase().includes(keyword)
    );
  });

  if (!stateFasilitasKesehatan.findMany.data) {
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
            title='List Fasilitas Kesehatan'
            href='/admin/kesehatan/data-kesehatan-warga/fasilitas_kesehatan/create'
          />
          <Box style={{ overflowX: "auto" }}>
            <Table striped withRowBorders withTableBorder style={{ minWidth: '700px' }}>
              <TableThead>
                <TableTr>
                  <TableTh>Fasilitas Kesehatan</TableTh>
                  <TableTh>Dokter</TableTh>
                  <TableTh>Layanan</TableTh>
                  <TableTh>Detail</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>{item.name}</TableTd>
                    <TableTd>{item.dokterdantenagamedis.name}</TableTd>
                    <TableTd>{item.tarifdanlayanan.layanan}</TableTd>
                    <TableTd>
                      <Button onClick={() => router.push(`/admin/kesehatan/data-kesehatan-warga/fasilitas_kesehatan/${item.id}`)}>
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

export default FasilitasKesehatan;
