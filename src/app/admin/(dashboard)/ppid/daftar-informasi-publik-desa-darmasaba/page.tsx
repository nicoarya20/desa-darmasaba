'use client'
import colors from '@/con/colors';
import { Box, Button, Grid, GridCol, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconCircleDashedPlus, IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import daftarInformasiPublik from '../../_state/ppid/daftar_informasi_publik/daftarInformasiPublik';

function DaftarInformasiPublik() {
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
      <ListDaftarInformasi search={search} />
    </Box>
  );
}

function ListDaftarInformasi({ search }: { search: string }) {
  const listData = useProxy(daftarInformasiPublik)
  const router = useRouter()

  useShallowEffect(() => {
    listData.findMany.load()
  }, [])


  const filteredData = (listData.findMany.data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.jenisInformasi.toLowerCase().includes(keyword) ||
      item.deskripsi.toLowerCase().includes(keyword)
    );
  });

  if (!listData.findMany.data) {
    return (
      <Stack>
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
              <Text fz={"xl"} fw={"bold"}>List Daftar Informasi Publik Desa Darmasaba</Text>
            </GridCol>
            <GridCol span={{ base: 12, md: 1 }}>
              <Button onClick={() => router.push("/admin/ppid/daftar-informasi-publik-desa-darmasaba/create")} bg={colors['blue-button']}>
                <IconCircleDashedPlus size={25} />
              </Button>
            </GridCol>
          </Grid>
          <Box style={{ overflowX: "auto" }}>
            <Table
              striped
              withTableBorder
              withRowBorders
              bg={colors['white-1']}
              style={{ minWidth: '700px' }}
            >
              <TableThead>
                <TableTr>
                  <TableTh>No</TableTh>
                  <TableTh>Jenis Informasi</TableTh>
                  <TableTh>Deskripsi</TableTh>
                  <TableTh>Detail</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {filteredData.map((item, index) => (
                  <TableTr key={item.id}>
                    <TableTd>{index + 1}</TableTd>
                    <TableTd>{item.jenisInformasi}</TableTd>
                    <TableTd dangerouslySetInnerHTML={{ __html: item.deskripsi }}></TableTd>
                    <TableTd>
                      <Button bg={"green"} onClick={() => router.push(`/admin/ppid/daftar-informasi-publik-desa-darmasaba/${item.id}`)}>
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

export default DaftarInformasiPublik;
