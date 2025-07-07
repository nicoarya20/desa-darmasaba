'use client'
import colors from '@/con/colors';
import { Box, Button, Grid, GridCol, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconCircleDashedPlus, IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import stateDesaPengumuman from '../../_state/desa/pengumuman';
import { ModalKonfirmasiHapus } from '../../_com/modalKonfirmasiHapus';
import { useState } from 'react';


function Pengumuman() {
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
      <ListPengumuman search={search} />
    </Box>
  );
}

function ListPengumuman({ search }: { search: string }) {
  const pengumumanState = useProxy(stateDesaPengumuman)
  const router = useRouter()
  const [modalHapus, setModalHapus] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useShallowEffect(() => {
    pengumumanState.pengumuman.findMany.load()
  }, [])


  const handleHapus = () => {
    if (selectedId) {
      pengumumanState.pengumuman.delete.byId(selectedId)
      setModalHapus(false)
      setSelectedId(null)
    }
  }

  const filteredData = (pengumumanState.pengumuman.findMany.data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.judul.toLowerCase().includes(keyword) ||
      item.CategoryPengumuman?.name.toLowerCase().includes(keyword)
    );
  });

  if (!pengumumanState.pengumuman.findMany.data) {
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
              <Button onClick={() => router.push("/admin/desa/pengumuman/create")} bg={colors['blue-button']}>
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
                    <Button bg={"green"} onClick={() => router.push(`/admin/desa/pengumuman/detail`)}>
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

      {/* Modal Konfirmasi Hapus */}
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text='Apakah anda yakin ingin menghapus berita ini?'
      />
    </Box>
  )
}

export default Pengumuman;
