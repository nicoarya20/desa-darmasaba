'use client'
import colors from '@/con/colors';
import { Box, Button, Grid, GridCol, Image, Paper, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { IconCircleDashedPlus, IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import HeaderSearch from '../../_com/header';


function Page() {
  return (
    <Box>
      <HeaderSearch
        title='Pengumuman'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
      />
      <PengumumanList />
    </Box>
  );
}

function PengumumanList() {
  // const pengumumanState = useProxy(stateDashboardPengumuman)
  // const [modalHapus, setModalHapus] = useState(false)
  // const [selectedId, setSelectedId] = useState<string | null>(null)

  // useShallowEffect(() => {
  //   pengumumanState.pengumuman.findMany.load()
  // }, [])

  const router = useRouter()

  // const handleHapus = () => {
  //   if (selectedId) {
  //     pengumumanState.pengumuman.delete.byId(selectedId)
  //     setModalHapus(false)
  //     setSelectedId(null)
  //   }
  // }

  // if (!pengumumanState.pengumuman.findMany.data) {
  //   return (
  //     <Stack py={10}>
  //       <Skeleton h={500} />
  //     </Stack>
  //   )
  // }

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
                  <TableTh w={250}>Image</TableTh>
                  <TableTh w={200}>Detail</TableTh>

                </TableTr>
              </TableThead>
              <TableTbody >

                <TableTr>
                  <TableTd >
                    <Box w={100}>
                      <Text truncate="end" fz={"sm"}>Judul</Text>
                    </Box>
                  </TableTd>
                  <TableTd >Kesehatan</TableTd>
                  <TableTd>
                    <Image w={100} src={"/"} alt="gambar" />
                  </TableTd>
                  <TableTd>
                    <Button bg={"green"} onClick={() => router.push(`/admin/desa/pengumuman/detail`)}>
                      <IconDeviceImacCog size={25} />
                    </Button>
                  </TableTd>
                </TableTr>
              </TableTbody>
            </Table>
          </Box>
        </Stack>
      </Paper>

      {/* Modal Konfirmasi Hapus
      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text='Apakah anda yakin ingin menghapus berita ini?'
      /> */}
    </Box>
  )
}

export default Page;
